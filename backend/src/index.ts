import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import neo4j from "neo4j-driver";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { Firestore } from "@google-cloud/firestore";
import { WebSocketServer } from "ws";

const { setupWSConnection } = require("y-websocket/bin/utils");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

let db: any;
if (process.env.NODE_ENV === "production") {
  try {
    db = new Firestore();
    console.log("Google Cloud Firestore active (Production).");
  } catch (err) {
    console.error("Failed to initialize Google Cloud Firestore:", err);
  }
} else {
  console.log("Local development active: Using In-Memory fallback database.");
}

// In-Memory fallback database for Folders and Boards (Test & Local dev)
let foldersDb = [
  { id: "fold-1", name: "Domän: Kund & Marknad", parentId: null },
  { id: "fold-2", name: "Domän: Ekonomi & Finans", parentId: null }
];

let boardsDb = [
  {
    id: "board-1",
    name: "Kundcenter Onboarding-flow",
    folderId: "fold-1",
    pages: [
      {
        id: "page-1",
        name: "Strategi & Förmågor",
        nodes: [
          {
            id: "node-1",
            type: "actorNode",
            position: { x: 340, y: 75 },
            data: { label: "Kundcenter-medarbetare", description: "Hanterar kundregistrering via telefon och kontor." }
          },
          {
            id: "node-2",
            type: "processNode",
            position: { x: 340, y: 195 },
            data: { label: "Skapa onboarding-ärende", description: "Medarbetare registrerar nytt onboarding-ärende i CRM." }
          },
          {
            id: "node-3",
            type: "apmRefNode",
            position: { x: 335, y: 345 },
            data: { label: "CRM Core", tempo: 12, criticality: "Medium" }
          }
        ],
        edges: [
          { id: "e1-2", source: "node-1", target: "node-2", animated: true },
          { id: "e2-3", source: "node-2", target: "node-3" }
        ]
      },
      {
        id: "page-2",
        name: "System & Dataflöden",
        nodes: [],
        edges: []
      }
    ]
  }
];

// Active Sessions Map (keeps track of who is logged in and their profile details)
interface UserSession {
  name: string;
  email: string;
  picture?: string;
}

const ACTIVE_SESSIONS = new Map<string, UserSession>();

const APP_SHARED_PASSWORD = process.env.APP_SHARED_PASSWORD || "labb-ea-2026";
const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS || "forefront.se").split(",").map(d => d.trim().toLowerCase());

// Pre-seed the team-password token session so standard logins work
const expectedPasswordToken = crypto.createHash("sha256").update(APP_SHARED_PASSWORD).digest("hex");
ACTIVE_SESSIONS.set(expectedPasswordToken, { name: "Team Medlem", email: "labb@forefront.se" });

// 1. Password Login Route (Fallback)
app.post("/api/auth/login", (req, res) => {
  const { password } = req.body;
  if (password === APP_SHARED_PASSWORD) {
    res.json({ 
      success: true, 
      token: expectedPasswordToken,
      user: { name: "Team Medlem", email: "labb@forefront.se" }
    });
  } else {
    res.status(401).json({ success: false, error: "Felaktigt lösenord." });
  }
});

// 2. Google OAuth SSO Login Route (Primary)
app.post("/api/auth/google", async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) {
    return res.status(400).json({ success: false, error: "id_token saknas." });
  }

  try {
    // Statelessly verify the JWT token directly against Google's public endpoint
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
    if (!googleRes.ok) {
      return res.status(401).json({ success: false, error: "Ogiltig Google-autentisering." });
    }

    const payload: any = await googleRes.json();
    const email = payload.email || "";
    const domain = email.substring(email.lastIndexOf("@") + 1).toLowerCase();

    // Enforce that the user belongs to forefront.se or other configured domains
    const isDomainAllowed = ALLOWED_DOMAINS.some(d => domain === d);
    if (!isDomainAllowed) {
      return res.status(403).json({ 
        success: false, 
        error: `Inloggning misslyckades. Endast e-postadresser som tillhör följande domäner tillåts: ${ALLOWED_DOMAINS.join(", ")}` 
      });
    }

    // Generate a secure session token for this specific user
    const sessionToken = crypto.randomUUID();
    const userSession: UserSession = {
      name: payload.name || "Namnlös användare",
      email: email,
      picture: payload.picture
    };

    ACTIVE_SESSIONS.set(sessionToken, userSession);

    res.json({ 
      success: true, 
      token: sessionToken, 
      user: userSession 
    });
  } catch (err: any) {
    console.error("Google verify error:", err);
    res.status(500).json({ success: false, error: "Internt fel vid verifiering mot Google." });
  }
});

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Allow healthcheck, logins, config and static frontend assets freely
  if (
    req.path === "/healthz" || 
    req.path === "/api/auth/login" || 
    req.path === "/api/auth/google" || 
    req.path === "/api/config" ||
    !req.path.startsWith("/api/")
  ) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  if (token && ACTIVE_SESSIONS.has(token)) {
    // Inject user details into request context
    (req as any).user = ACTIVE_SESSIONS.get(token);
    next();
  } else {
    console.warn(`[AUTH FAIL] Path: ${req.path}, Token: ${token ? token.substring(0, 10) + "..." : "none"}`);
    res.status(401).json({ success: false, error: "Oauktoriserad. Vänligen logga in." });
  }
};

app.use(authMiddleware);

// Public Config Endpoint (exposes Google Client ID to frontend dynamically)
app.get("/api/config", (req, res) => {
  res.json({ 
    googleClientId: process.env.GOOGLE_CLIENT_ID || "" 
  });
});

// Initialize Neo4j Driver (Primary Graph Database)
const neo4jUri = process.env.NEO4J_URI || "bolt://localhost:7687";
const neo4jUser = process.env.NEO4J_USER || "neo4j";
const neo4jPassword = process.env.NEO4J_PASSWORD || "password";

let driver: any;
try {
  driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
} catch (err) {
  console.log("Could not initialize Neo4j driver, running in hybrid/mock fallback mode.");
}

// Healthcheck Route
app.get("/healthz", async (req, res) => {
  try {
    if (driver) {
      const session = driver.session();
      await session.run("RETURN 1");
      await session.close();
      res.status(200).json({ status: "OK", database: "Connected to Graph DB" });
    } else {
      res.status(200).json({ status: "OK", database: "Mock Fallback (Offline)" });
    }
  } catch (error: any) {
    res.status(500).json({ status: "Error", message: error.message });
  }
});

// Mock Systems State for Backend Logic (representing an anonymous baseline)
let mockSystems = [
  { id: "sys-1", name: "Kundportal", tempo: 1, tempoBehov: 1, criticality: "High", security: "Internal" },
  { id: "sys-2", name: "Betalningsmotor", tempo: 24, tempoBehov: 2, criticality: "Critical", security: "Restricted" },
  { id: "sys-3", name: "Gamla Reskontran", tempo: 60, tempoBehov: 60, criticality: "High", security: "Confidential" },
  { id: "sys-4", name: "CRM Core", tempo: 12, tempoBehov: 12, criticality: "Medium", security: "Internal" },
  { id: "sys-5", name: "Identity Service", tempo: 12, tempoBehov: 12, criticality: "Critical", security: "Restricted" },
  { id: "sys-6", name: "CloudPay v2 (Mål)", tempo: 2, tempoBehov: 2, criticality: "Critical", security: "Restricted" }
];

// Mock Seams representing coupling and tempo gap between systems
let mockSeams = [
  {
    id: "seam-1",
    sourceId: "sys-1", // Kundportal (tempo 1)
    targetId: "sys-2", // Betalningsmotor (tempo 24)
    coupling: 0.65, // high change coupling
    drag: "Ingen",
    kontrakt: "Saknas"
  },
  {
    id: "seam-2",
    sourceId: "sys-2", // Betalningsmotor (tempo 24)
    targetId: "sys-3", // Gamla Reskontran (tempo 60)
    coupling: 0.40,
    drag: "Ingen",
    kontrakt: "Saknas"
  },
  {
    id: "seam-3",
    sourceId: "sys-5", // Identity Service (tempo 12)
    targetId: "sys-1", // Kundportal (tempo 1)
    coupling: 0.20,
    drag: "Ingen",
    kontrakt: "OAuth2"
  }
];

// Mock Scenarios (Omställningar)
let mockScenarios = [
  {
    id: "sc-1",
    name: "Betalningskonsolidering (Avveckling av Betalningsmotor)",
    background: "Betalningsmotorn bär kritisk betalningshantering men har kritisk teknisk skuld. Vi måste hitta ett alternativ för att ersätta den innan 2027.",
    status: "Under utredning",
    affectedSystems: ["Betalningsmotor", "Gamla Reskontran"],
    decisions: [
      {
        id: "dec-1",
        title: "Val av ny betalningsplattform",
        question: "Hur bör vi ersätta den gamla Betalningsmotorn för att säkra prestanda och minimera den tekniska skulden?",
        status: "Under utredning",
        criteria: [
          { key: "crit-1", name: "Mognadsgrad & Framtidssäkring" },
          { key: "crit-2", name: "Integrationskomplexitet (Blast Radius)" },
          { key: "crit-3", name: "GDPR & Personuppgiftssäkerhet" },
          { key: "crit-4", name: "Löpande driftskostnad" },
          { key: "crit-5", name: "Förmågestöd (Verksamhetsprodukt)" }
        ],
        alternatives: [
          {
            id: "alt-1",
            name: "Alt A: Egenutvecklad mikrotjänst i Azure (CloudPay v2)",
            description: "Vi bygger en modern, egenutvecklad API-baserad betalningstjänst i Azure Container Apps. Ger full kontroll.",
            isRecommended: true,
            isApproved: false,
            bedomningar: [
              { criterionKey: "crit-1", score: 5, motivering: "Mycket framtidssäkert, helt på vår egen molnarkitektur." },
              { criterionKey: "crit-2", score: 3, motivering: "Hög initial integrationskostnad eftersom vi måste återskapa alla gamla kopplingar." },
              { criterionKey: "crit-3", score: 5, motivering: "Full kontroll över dataflöden, lätt att kryptera PII." },
              { criterionKey: "crit-4", score: 4, motivering: "Låga löpande licenskostnader, men viss underhållsskuld." },
              { criterionKey: "crit-5", score: 5, motivering: "Stödjer till 100% organisationens specifika utbetalningsprocesser." }
            ]
          },
          {
            id: "alt-2",
            name: "Alt B: Gå helt över till extern SaaS (SaaS-Pay)",
            description: "Vi köper in en marknadsledande SaaS-lösning. Minimal utveckling men låg teknisk insyn.",
            isRecommended: false,
            isApproved: false,
            bedomningar: [
              { criterionKey: "crit-1", score: 4, motivering: "Stabil leverantör, men vi blir inlåsta i deras roadmap." },
              { criterionKey: "crit-2", score: 4, motivering: "Färdiga API-connectorer finns, men begränsad flexibilitet." },
              { criterionKey: "crit-3", score: 3, motivering: "Externa personuppgifter, kräver noggrant DPA-avtal." },
              { criterionKey: "crit-4", score: 2, motivering: "Höga årliga licensavgifter som ökar med transaktionsvolym." },
              { criterionKey: "crit-5", score: 3, motivering: "Vi måste anpassa organisationens arbetssätt efter deras standardschema." }
            ]
          },
          {
            id: "alt-3",
            name: "Alt C: Minimal ombyggnad av Gamla Reskontran",
            description: "Vi lappar och lagar det befintliga systemet för att slippa nyinvestering.",
            isRecommended: false,
            isApproved: false,
            bedomningar: [
              { criterionKey: "crit-1", score: 1, motivering: "Gammal arkitektur, försvårar rekrytering av utvecklare." },
              { criterionKey: "crit-2", score: 2, motivering: "Behåller en spagetti av point-to-point integrationer." },
              { criterionKey: "crit-3", score: 3, motivering: "Svårt att garantera GDPR-radering i gamla tabeller." },
              { criterionKey: "crit-4", score: 5, motivering: "Ingen initial investeringskostnad." },
              { criterionKey: "crit-5", score: 2, motivering: "Stödjer dagens processer, men kan inte utvecklas för nya behov." }
            ]
          }
        ]
      }
    ]
  }
];

// Endpoint: Hämta alla sömmar och beräkna skjuvning (S = K * Delta)
app.get("/api/seams", (req, res) => {
  const result = mockSeams.map(seam => {
    const src = mockSystems.find(s => s.id === seam.sourceId);
    const tgt = mockSystems.find(s => s.id === seam.targetId);
    
    if (!src || !tgt) return { ...seam, delta: 0, shear: 0, srcName: "Okänt", tgtName: "Okänt" };
    
    // Calculate Delta = |log10(tau_a) - log10(tau_b)|
    const delta = Math.abs(Math.log10(src.tempo) - Math.log10(tgt.tempo));
    const shear = seam.coupling * delta;
    
    return {
      ...seam,
      srcName: src.name,
      srcTempo: src.tempo,
      tgtName: tgt.name,
      tgtTempo: tgt.tempo,
      delta: Number(delta.toFixed(2)),
      shear: Number(shear.toFixed(2))
    };
  });
  
  res.json({ seams: result, S_max: 0.35 });
});

// Endpoint: Genomför ett av de fyra dragen på en söm (Isolera, Synkronisera, Klyv, Sammanfoga)
app.post("/api/seams/:seamId/action", (req, res) => {
  const { seamId } = req.params;
  const { action } = req.body; // "Isolera" | "Synkronisera" | "Klyva" | "Sammanfoga"
  
  const seamIdx = mockSeams.findIndex(s => s.id === seamId);
  if (seamIdx === -1) {
    return res.status(404).json({ error: "Sömmen hittades inte." });
  }
  
  const seam = mockSeams[seamIdx];
  const src = mockSystems.find(s => s.id === seam.sourceId);
  const tgt = mockSystems.find(s => s.id === seam.targetId);
  
  if (!src || !tgt) {
    return res.status(400).json({ error: "Kopplade system saknas." });
  }

  if (action === "Isolera") {
    // Lower coupling to 0.15
    seam.coupling = 0.15;
    seam.drag = "Isolera";
    seam.kontrakt = "Anti-Corruption API / Event Queue";
  } else if (action === "Synkronisera") {
    // Synchronize tempo by bringing slower node closer
    tgt.tempo = 3; // Accelerated to 3 months (embedded delivery/legal)
    seam.drag = "Synkronisera";
    seam.kontrakt = "Embedded Team Agreement";
  } else if (action === "Klyva") {
    // Split the target node (e.g. split Betalningsmotor)
    // Remove old seam, insert split nodes
    if (tgt.name === "Betalningsmotor") {
      // Create new split noder in our systems
      const splitNode1 = { id: "sys-2a", name: "Betalningsdialog (Snabb)", tempo: 1, tempoBehov: 1, criticality: "High", security: "Internal" };
      const splitNode2 = { id: "sys-2b", name: "Betalningskärna (Långsam)", tempo: 60, tempoBehov: 60, criticality: "Critical", security: "Restricted" };
      
      mockSystems = mockSystems.filter(s => s.id !== "sys-2");
      mockSystems.push(splitNode1, splitNode2);
      
      // Replace old seam with two new seams
      mockSeams = mockSeams.filter(s => s.id !== "seam-1" && s.id !== "seam-2");
      
      // Seam A: Kundportal (1) -> Betalningsdialog (1) [Delta = 0, no shear]
      mockSeams.push({
        id: "seam-1a",
        sourceId: "sys-1",
        targetId: "sys-2a",
        coupling: 0.50,
        drag: "Klyvd",
        kontrakt: "Direct UI Integration"
      });
      // Seam B: Betalningsdialog (1) -> Betalningskärna (60) [Isolated internal seam]
      mockSeams.push({
        id: "seam-1b",
        sourceId: "sys-2a",
        targetId: "sys-2b",
        coupling: 0.10, // isolated out-of-box
        drag: "Klyvd",
        kontrakt: "Out-of-Process API Contract"
      });
    }
  } else if (action === "Sammanfoga") {
    // Merges old converged seam
    mockSeams = mockSeams.filter(s => s.id !== seamId);
  }
  
  res.json({ success: true, message: `Åtgärd ${action} slutförd.` });
});

// Endpoint: Hämta transitionsscenarier och förslag
app.get("/api/scenarios", async (req, res) => {
  res.json(mockScenarios);
});

// Endpoint: Fatta beslut (Välj vinnande alternativ)
app.post("/api/scenarios/:scenarioId/decide", async (req, res) => {
  const { scenarioId } = req.params;
  const { decisionId, alternativeId, deciderName } = req.body;
  
  const scenario = mockScenarios.find(s => s.id === scenarioId);
  if (!scenario) {
    return res.status(404).json({ error: "Scenario hittades inte." });
  }

  const decision = scenario.decisions.find(d => d.id === decisionId);
  if (!decision) {
    return res.status(404).json({ error: "Beslut hittades inte." });
  }

  // Update mock state
  decision.status = "Beslutat";
  decision.alternatives.forEach(alt => {
    alt.isApproved = alt.id === alternativeId;
  });

  res.json({ 
    success: true, 
    message: `Beslut fattat! Det vinnande alternativet var: ${decision.alternatives.find(a => a.isApproved)?.name}`,
    scenario 
  });
});

// ==================== WORKSPACE CATALOG ENDPOINTS ====================

// 1. Folders Endpoints
app.get("/api/folders", async (req, res) => {
  console.log(`[GET /api/folders] Request received. User: ${(req as any).user?.name}. Firestore active: ${!!db}`);
  try {
    if (db) {
      const snapshot = await db.collection("folders").get();
      const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      console.log(`[GET /api/folders] Firestore returned ${list.length} folders.`);
      return res.json(list);
    }
    console.log(`[GET /api/folders] Fallback returned ${foldersDb.length} folders.`);
    res.json(foldersDb);
  } catch (err: any) {
    console.error("[GET /api/folders] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/folders", async (req, res) => {
  const { id, name, parentId } = req.body;
  console.log("[POST /api/folders] Request body:", req.body);
  if (!name) return res.status(400).json({ error: "Namn saknas." });
  
  const folderId = id || `fold-${Date.now()}`;
  const payload = {
    name,
    parentId: parentId || null
  };
  
  try {
    if (db) {
      await db.collection("folders").doc(folderId).set(payload, { merge: true });
      console.log(`[POST /api/folders] Saved to Firestore. Doc ID: ${folderId}`);
      return res.json({ id: folderId, ...payload });
    }
    
    const idx = foldersDb.findIndex(f => f.id === folderId);
    if (idx !== -1) {
      foldersDb[idx] = { ...foldersDb[idx], ...payload };
    } else {
      foldersDb.push({ id: folderId, ...payload });
    }
    
    console.log("[POST /api/folders] Saved to In-Memory fallback.");
    res.json({ id: folderId, ...payload });
  } catch (err: any) {
    console.error("[POST /api/folders] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/folders/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE /api/folders/${id}] Request received.`);
  try {
    if (db) {
      await db.collection("folders").doc(id).delete();
      return res.json({ success: true });
    }
    foldersDb = foldersDb.filter(f => f.id !== id);
    res.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/folders] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Boards Endpoints (with Smart Graph Element search & Auto-Seeding)
app.get("/api/boards", async (req, res) => {
  const { searchElement } = req.query;
  try {
    let listToProcess: any[] = [];
    if (db) {
      let snapshot = await db.collection("boards").get();
      
      // Auto-Seeding: If Firestore is completely empty, seed the default catalog persistent!
      if (snapshot.empty) {
        console.log("[SEEDING] Firestore is empty. Seeding default EA catalog persistent...");
        
        // Seed default folders
        await db.collection("folders").doc("fold-1").set({ name: "Domän: Kund & Marknad", parentId: null });
        await db.collection("folders").doc("fold-2").set({ name: "Domän: Ekonomi & Finans", parentId: null });
        
        // Seed default board-1
        const defaultBoard = {
          name: "Kundcenter Onboarding-flow",
          folderId: "fold-1",
          pages: [
            {
              id: "page-1",
              name: "Strategi & Förmågor",
              nodes: [
                { id: "node-1", type: "actorNode", position: { x: 340, y: 75 }, data: { label: "Kundcenter-medarbetare", description: "Hanterar kundregistrering via telefon och kontor." } },
                { id: "node-2", type: "processNode", position: { x: 340, y: 195 }, data: { label: "Skapa onboarding-ärende", description: "Medarbetare registrerar nytt onboarding-ärende i CRM." } },
                { id: "node-3", type: "apmRefNode", position: { x: 335, y: 345 }, data: { label: "CRM Core", tempo: 12, criticality: "Medium" } }
              ],
              edges: [
                { id: "e1-2", source: "node-1", target: "node-2", animated: true },
                { id: "e2-3", source: "node-2", target: "node-3" }
              ]
            },
            {
              id: "page-2",
              name: "System & Dataflöden",
              nodes: [],
              edges: []
            }
          ]
        };
        await db.collection("boards").doc("board-1").set(defaultBoard);
        
        // Re-read snapshot
        snapshot = await db.collection("boards").get();
      }
      
      listToProcess = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } else {
      listToProcess = boardsDb;
    }

    let filtered = listToProcess;
    if (searchElement) {
      const query = (searchElement as string).toLowerCase();
      filtered = listToProcess.filter((b: any) => {
        // Search through all nodes on all pages
        return b.pages?.some((p: any) => 
          p.nodes?.some((n: any) => 
            n.data?.label?.toLowerCase().includes(query)
          )
        );
      });
    }

    // Return metadata list
    const result = filtered.map((b: any) => ({
      id: b.id,
      name: b.name,
      folderId: b.folderId,
      pageCount: b.pages ? b.pages.length : 0
    }));
    
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/boards/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (db) {
      const doc = await db.collection("boards").doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: "Board hittades inte." });
      return res.json({ id: doc.id, ...doc.data() });
    }
    
    const board = boardsDb.find(b => b.id === id);
    if (!board) return res.status(404).json({ error: "Board hittades inte." });
    res.json(board);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/boards", async (req, res) => {
  const { id, name, folderId, pages } = req.body;
  if (!name) return res.status(400).json({ error: "Namn saknas." });
  
  const boardId = id || `board-${Date.now()}`;
  const savePayload = {
    name,
    folderId: folderId || null,
    pages: pages || []
  };

  try {
    if (db) {
      await db.collection("boards").doc(boardId).set(savePayload, { merge: true });
      return res.json({ id: boardId, ...savePayload });
    }
    
    const idx = boardsDb.findIndex(b => b.id === boardId);
    if (idx !== -1) {
      boardsDb[idx] = { id: boardId, ...savePayload };
    } else {
      boardsDb.push({ id: boardId, ...savePayload });
    }
    
    res.json({ id: boardId, ...savePayload });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/boards/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (db) {
      await db.collection("boards").doc(id).delete();
      return res.json({ success: true });
    }
    boardsDb = boardsDb.filter(b => b.id !== id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serving built production static assets
if (process.env.NODE_ENV === "production") {
  const localFrontendPath = path.join(__dirname, "../../frontend/dist");
  const dockerFrontendPath = path.join(__dirname, "../frontend/dist");
  const frontendPath = fs.existsSync(localFrontendPath) ? localFrontendPath : dockerFrontendPath;

  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    // Exclude /api paths from static routing fallback
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(frontendPath, "index.html"));
    } else {
      res.status(404).json({ error: "API-endpoint hittades inte." });
    }
  });
}

// 1. Start the HTTP Server instance
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// 2. Setup the WebSocketServer for Yjs Realtime Collaboration
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, req) => {
  // Sync state and presence/awareness automatically over Yjs WebSockets
  setupWSConnection(ws, req, { gc: true });
});

// 3. Handle HTTP Connection Upgrade to WebSockets
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
  
  if (pathname.startsWith("/ws/")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});
