import { useState, useMemo, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";

// FORCE_VITE_CACHE_BUST: 2026-10-06-15-25-SSO-SCENARIO-DROPDOWN
const getApiUrl = (path: string) => {
  const isDev = window.location.hostname === "localhost" && window.location.port !== "8080";
  const base = isDev ? "http://localhost:8080" : "";
  return `${base}${path}`;
};

// ==================== INLINE SVG ICONS (OneDrive Bypass) ====================
const Network = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="16" width="6" height="6" rx="1" />
    <rect x="2" y="16" width="6" height="6" rx="1" />
    <rect x="9" y="2" width="6" height="6" rx="1" />
    <path d="M12 8v8M5 16v-3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3" />
    <path d="M12 16v3" />
  </svg>
);

const Layers = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const Database = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);

const TrendingUp = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const Play = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const ChevronRight = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Trash2 = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const Search = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Sparkles = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
  </svg>
);

const Zap = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const AlertTriangle = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const GitBranch = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

const Columns = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

const Star = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Check = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClipboardList = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <line x1="9" y1="8" x2="13" y2="8" />
  </svg>
);

const MapIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 15 9 18 3 15" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const PlusCircle = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const Activity = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// ==================== COMPREHENSIVE DECOUPLED DATA MODEL ====================

type EAObjectType = 
  | "Verksamhetsprodukt" 
  | "Applikation" 
  | "Produkt" 
  | "System" 
  | "Service" 
  | "Information" 
  | "Team" 
  | "Leverantor";

interface EANode {
  id: string;
  type: EAObjectType;
  name: string;
  description: string;
  // Dynamic typed fields to support complete decoupling
  tempo?: number;             // For Applikation / System
  criticality?: string;      // For Verksamhetsprodukt / Applikation / System
  techDebt?: string;         // For Applikation / System
  state?: string;            // AsIs, Transition, Target
  action?: string;           // Tolerate, Invest, Migrate, Eliminate (TIME)
  security?: string;         // Public, Internal, Confidential, Restricted
  ownerTeamId?: string;      // Relational ownership link
  vendorId?: string;         // Relational product vendor link
  gdpr?: boolean;            // For Information
  slaAvailability?: string;  // For Produkt
  contractUrl?: string;      // For Produkt / Leverantor
}

interface EAEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: "REALISES" | "BELONGS_TO" | "COMMERCIALIZED_AS" | "INTEGRATES" | "MASTERED_BY" | "OWNED_BY" | "SUPPLIED_BY";
  coupling?: number;        // Explicit for INTEGRATES edges (shearing calculation)
  kontrakt?: string;
  drag?: string;
}

interface Question {
  id: string;
  role: string;
  status: "Besvaras" | "Delvis" | "Inte byggd" | "Blockerad";
  title: string;
  description: string;
}

const QUESTIONS: Record<string, Question[]> = {
  seams: [
    { id: "SÖM-01", role: "Chefsarkitekt", status: "Besvaras", title: "Vilka sömmar uppvisar kritisk skjuvning (rivningsrisk)?", description: "En vy över landskapet färgkodat baserat på formeln S = K * Delta." },
    { id: "SÖM-02", role: "Chefsarkitekt, Områdesarkitekt", status: "Besvaras", title: "Vilka sömmar är fossila eller saknas helt?", description: "Hitta fossila kopplingar där tempo konvergerat, samt tysta dolda dataflöden." },
    { id: "SÖM-03", role: "Informationsarkitekt, Säkerhet", status: "Besvaras", title: "Vilka sömkontrakt finns etablerade och vad skyddar de?", description: "Hantera gränssnitt, händelseköer och anti-korruptionslager." }
  ],
  catalog: [
    { id: "CAT-01", role: "EA Admin, Domänarkitekt", status: "Besvaras", title: "Hantera EA Asset Catalog (Fullständig CRUD)", description: "Skapa, granska, uppdatera och radera dekopplade arkitekturobjekt och deras attribut." },
    { id: "CAT-02", role: "Domänarkitekt", status: "Besvaras", title: "Verifiera relationella kopplingar", description: "Granska och etablera typed edges (INTEGRATES, REALISES) mellan dina dekopplade noder." }
  ],
  lifecycle: [
    { id: "A1-13", role: "Chefsarkitekt", status: "Delvis", title: "Vilka system har hög teknisk skuld och hög verksamhetsrelevans?", description: "En korsvy mellan TechDebtLevel och Criticality." },
    { id: "A1-02", role: "Chefsarkitekt, Produktledning", status: "Besvaras", title: "Är detta en strategisk, tolererad eller utfasningskandidat?", description: "System grupperat på ArchitectureState, filtrerbart på PortfolioAction (TIME)." }
  ],
  scenarios: [
    { id: "S1-01", role: "Chefsarkitekt", status: "Besvaras", title: "Vilka lösningsalternativ (scenarier) har vi under utredning?", description: "Jämför och utveckdera tre parallella lösningsalternativ (kandidater) sida vid sida." }
  ]
};

// ==================== LARGE SCALE SCALED ENTERPRISE SEEDER ====================
const generateDecoupledLandscape = () => {
  const seedNodes: EANode[] = [];
  const seedEdges: EAEdge[] = [];

  // 1. Seed Teams
  const teams = ["Team Customer Portal", "Team Billing Hub", "Team Logistics Core", "Team Finance Ledger", "Team HR Master", "Team Security", "Team BI Analytics"];
  teams.forEach((t, i) => {
    seedNodes.push({ id: `team-${i}`, type: "Team", name: t, description: `Ansvarigt team för ${t.toLowerCase()} domänen.` });
  });

  // 2. Seed Leverantörer (Vendors)
  const vendors = ["SAP AG", "Microsoft Corp", "Salesforce Inc", "Okta Inc", "Logistics Partners AB", "AWS Europe"];
  vendors.forEach((v, i) => {
    seedNodes.push({ id: `vendor-${i}`, type: "Leverantor", name: v, description: `Strategisk IT-leverantör för ${v}.`, contractUrl: "https://contracts.internal.org/ref" });
  });

  // 3. Seed Verksamhetsprodukter (Business Products - Business capability anchor)
  const businessProducts = [
    { name: "Kundresekonsolidering", crit: "High" },
    { name: "Automatisk Fakturering", crit: "Critical" },
    { name: "Lagertransparens", crit: "High" },
    { name: "Finansiell Bokslutskonsolidering", crit: "Critical" },
    { name: "Medarbetarresa & Löner", crit: "Medium" },
    { name: "Säker Identitetsverifiering", crit: "Critical" },
    { name: "Affärsanalys & Prediktion", crit: "Low" }
  ];
  businessProducts.forEach((bp, i) => {
    seedNodes.push({
      id: `vp-${i}`,
      type: "Verksamhetsprodukt",
      name: bp.name,
      description: `Verksamhetsprodukt som stödjer ${bp.name.toLowerCase()} förmågan.`,
      criticality: bp.crit
    });
  });

  // 4. Seed Produkter (Commercial COTS/SaaS/Licenses)
  const commercialProducts = [
    { name: "Salesforce Customer Cloud", vendor: "vendor-2", sla: "99.9%" },
    { name: "SAP ERP License Pack", vendor: "vendor-0", sla: "99.95%" },
    { name: "Azure Container Suite", vendor: "vendor-1", sla: "99.99%" },
    { name: "Okta Identity API Standard", vendor: "vendor-3", sla: "99.99%" },
    { name: "Microsoft 365 Enterprise", vendor: "vendor-1", sla: "99.5%" }
  ];
  commercialProducts.forEach((cp, i) => {
    seedNodes.push({
      id: `prod-${i}`,
      type: "Produkt",
      name: cp.name,
      description: `Kommersiell produktlicens för ${cp.name}.`,
      vendorId: cp.vendor,
      slaAvailability: cp.sla,
      contractUrl: "https://procurement.internal.org/ref"
    });
    // Link Product to Supplier
    seedEdges.push({ id: `edge-prod-sup-${i}`, sourceId: `prod-${i}`, targetId: cp.vendor, type: "SUPPLIED_BY" });
  });

  // 5. Seed System (Logical Technical Groups)
  const systems = ["Mina Sidor Portal", "Kundreskontra System", "Utbetalningsmotor Core", "Lönehantering ERP", "Säkerhetsboxen", "Rapportering BI"];
  systems.forEach((sys, i) => {
    seedNodes.push({
      id: `sys-${i}`,
      type: "System",
      name: sys,
      description: `Logiskt förvaltat system som grupperar ${sys.toLowerCase()} applikationer.`,
      state: "AsIs",
      ownerTeamId: `team-${i % teams.length}`
    });
    // Link System to OwnerTeam
    seedEdges.push({ id: `edge-sys-team-${i}`, sourceId: `sys-${i}`, targetId: `team-${i % teams.length}`, type: "OWNED_BY" });
  });

  // 6. Seed Applikationer (Concrete Deployables - with Tempo!)
  const applikationer = [
    { name: "Customer Web Portal", tempo: 1, sys: "sys-0", vp: "vp-0", debt: "Low", crit: "High" },
    { name: "Mobile Client Frontend", tempo: 1, sys: "sys-0", vp: "vp-0", debt: "Low", crit: "High" },
    { name: "Payment Broker Gateway", tempo: 6, sys: "sys-2", vp: "vp-1", debt: "Medium", crit: "Critical" },
    { name: "SAP Invoice Scheduler", tempo: 24, sys: "sys-1", vp: "vp-1", debt: "High", crit: "Critical" },
    { name: "Mainframe Billing Engine", tempo: 60, sys: "sys-2", vp: "vp-3", debt: "Critical", crit: "Critical" },
    { name: "Logistics API Router", tempo: 12, sys: "sys-2", vp: "vp-2", debt: "Low", crit: "High" },
    { name: "Okta OAuth Adapter", tempo: 6, sys: "sys-4", vp: "vp-5", debt: "Low", crit: "Critical" },
    { name: "PowerBI ETL Worker", tempo: 12, sys: "sys-5", vp: "vp-6", debt: "Medium", crit: "Low" }
  ];
  applikationer.forEach((app, i) => {
    const appId = `app-${i}`;
    seedNodes.push({
      id: appId,
      type: "Applikation",
      name: app.name,
      description: `Körbar driftsatt container/tjänst för ${app.name.toLowerCase()}.`,
      tempo: app.tempo,
      criticality: app.crit,
      techDebt: app.debt,
      state: "AsIs",
      action: app.debt === "Critical" ? "Eliminate" : "Invest"
    });
    // Link Application to System (BELONGS_TO)
    seedEdges.push({ id: `edge-app-sys-${i}`, sourceId: appId, targetId: app.sys, type: "BELONGS_TO" });
    // Link Application to Business Product (REALISES)
    seedEdges.push({ id: `edge-app-vp-${i}`, sourceId: appId, targetId: app.vp, type: "REALISES" });
  });

  // 7. Seed Services (Technical Interfaces)
  const services = [
    { name: "REST customerProfileAPI", app: "app-0" },
    { name: "gRPC processPaymentSync", app: "app-2" },
    { name: "SOAP dispatchInvoice", app: "app-3" },
    { name: "COBOL batchBillingQueue", app: "app-4" }
  ];
  services.forEach((s, i) => {
    const sId = `srv-${i}`;
    seedNodes.push({ id: sId, type: "Service", name: s.name, description: `Exponerad teknisk tjänst: ${s.name}.` });
    // Link Service to Application
    seedEdges.push({ id: `edge-srv-app-${i}`, sourceId: sId, targetId: s.app, type: "BELONGS_TO" });
  });

  // 8. Seed Information (Data Domains)
  const informationNodes = [
    { name: "Customer Profiles", appMaster: "app-0", gdpr: true, sec: "Confidential" },
    { name: "Transaction Vault", appMaster: "app-4", gdpr: true, sec: "Restricted" },
    { name: "Employee Ledger", appMaster: "app-2", gdpr: true, sec: "Confidential" },
    { name: "System Access Audits", appMaster: "app-6", gdpr: false, sec: "Internal" }
  ];
  informationNodes.forEach((info, i) => {
    const infoId = `info-${i}`;
    seedNodes.push({
      id: infoId,
      type: "Information",
      name: info.name,
      description: `Auktoritär informationsdomän för ${info.name.toLowerCase()}.`,
      gdpr: info.gdpr,
      security: info.sec
    });
    // Link Information to Master Application
    seedEdges.push({ id: `edge-info-app-${i}`, sourceId: infoId, targetId: info.appMaster, type: "MASTERED_BY" });
  });

  // 9. Seed ~12 typed INTEGRATES edges between Applications (creating classic shearing seams)
  const integrations = [
    { src: "app-0", tgt: "app-2", coupling: 0.65, contract: "REST API (Hård synk)" },
    { src: "app-1", tgt: "app-2", coupling: 0.50, contract: "JSON REST Link" },
    { src: "app-2", tgt: "app-4", coupling: 0.75, contract: "Direct COBOL Link (Skjuvningsrisk)" },
    { src: "app-3", tgt: "app-4", coupling: 0.45, contract: "FTP Batch Sync" },
    { src: "app-2", tgt: "app-3", coupling: 0.35, contract: "JSON API Link" },
    { src: "app-6", tgt: "app-0", coupling: 0.15, contract: "OAuth2 adapter (Isolerad)" },
    { src: "app-6", tgt: "app-2", coupling: 0.20, contract: "Token adapter" }
  ];
  integrations.forEach((integ, i) => {
    seedEdges.push({
      id: `edge-integ-${i}`,
      sourceId: integ.src,
      targetId: integ.tgt,
      type: "INTEGRATES",
      coupling: integ.coupling,
      kontrakt: integ.contract
    });
  });

  return { nodes: seedNodes, edges: seedEdges };
};

const { nodes: SEEDED_NODES, edges: SEEDED_EDGES } = generateDecoupledLandscape();

// ==================== HIGH-PERFORMANCE SEARCHABLE COMBOBOX (Thousands of rows) ====================
interface ComboboxProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: Array<{ id: string; name: string; type: string }>;
  placeholder: string;
}

function SearchableCombobox({ label, value, onChange, options, placeholder }: ComboboxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Find currently selected option to show its name in the input
  const selectedOption = options.find(o => o.id === value);
  const displayValue = selectedOption ? `${selectedOption.name} (${selectedOption.type})` : "";

  // Filter options dynamically with fuzzy search
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(o => 
      o.name.toLowerCase().includes(term) || 
      o.type.toLowerCase().includes(term)
    );
  }, [searchTerm, options]);

  // Dom-virtualization-lite: Render only the top 10 matches to prevent browser lag (even with 10,000 items)
  const visibleOptions = useMemo(() => filteredOptions.slice(0, 10), [filteredOptions]);
  const extraCount = filteredOptions.length - visibleOptions.length;

  return (
    <div className="space-y-1 relative">
      <label className="text-[10px] uppercase font-bold text-slate-500 block">{label}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setSearchTerm("");
            setIsOpen(true);
          }}
          onBlur={() => {
            // Delay blur slightly so onClick in list fires first
            setTimeout(() => setIsOpen(false), 200);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 font-sans"
        />
        {value && !isOpen && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSearchTerm("");
            }}
            className="absolute right-2.5 top-2 text-slate-500 hover:text-rose-400 text-[10px] font-bold"
          >
            Rensa
          </button>
        )}
      </div>

      {/* Dropdown overlay */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-h-[220px] overflow-y-auto divide-y divide-slate-800/50">
          {visibleOptions.length === 0 ? (
            <div className="p-3 text-[11px] text-slate-500 text-center">Inga matchningar hittades</div>
          ) : (
            visibleOptions.map(opt => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setSearchTerm(opt.name);
                  setIsOpen(false);
                }}
                className="p-2 text-xs hover:bg-purple-950/20 hover:text-purple-200 cursor-pointer flex justify-between items-center transition-colors"
              >
                <span className="font-semibold text-slate-200">{opt.name}</span>
                <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 font-mono font-bold uppercase">{opt.type}</span>
              </div>
            ))
          )}
          {extraCount > 0 && (
            <div className="p-1.5 text-[9px] text-slate-500 text-center bg-slate-950/40 font-mono border-t border-slate-800">
              + {extraCount} fler matchningar (skriv för att snäva in)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApmLensApp() {
  const [activeTab, setActiveTab] = useState<"seams" | "catalog" | "lifecycle" | "scenarios" | "wardley">("seams");
  const [selectedWardleyNodeId, setSelectedWardleyNodeId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("SÖM-01");
  const [timeFilter, setTimeFilter] = useState<string>("ALL");
  const [lifecycleViewMode, setLifecycleViewMode] = useState<"board" | "timeline">("board");
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentYear(prev => {
          if (prev >= 2029) return 2026;
          return prev + 1;
        });
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);
  
  // AI Copilot state
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string; query?: string }>>([
    { 
      sender: "ai", 
      text: "Hej! Välkommen till det uppgraderade free-apm-lens. Datamodellen är nu helt dekopplad och rymmer 8 olika objekttyper, typed edges och en fullskalig CRUD Asset-katalog! Jag ritar och kalkylerar även skjuvning och spridningsrisk direkt i grafen." 
    }
  ]);
  
  // Local fallback scenarios list
  const fallbackScenarios = [
    {
      id: "sc-1",
      name: "Avveckling av Gamla Reskontran (Mainframe Core)",
      background: "Vår 35 år gamla stordatorbaserade reskontra (COBOL) bär kritisk data men har enorm teknisk skuld. Vi måste hitta ett alternativ för att avveckla och migrera den innan 2027.",
      status: "Under utredning",
      affectedSystems: ["Kundreskontra System", "Utbetalningsmotor Core"],
      decisions: [
        {
          id: "dec-1",
          title: "Val av ny reskontraplattform",
          question: "Hur bör vi ersätta den gamla stordatorreskontran för att reducera teknisk skuld och uppfylla GDPR?",
          status: "Under utredning",
          criteria: [
            { key: "crit-1", name: "Reducering av Tekniskt Skuld" },
            { key: "crit-2", name: "Lågt Skjuvningsbetyg (Shearing)" },
            { key: "crit-3", name: "GDPR & Data-isolering" },
            { key: "crit-4", name: "Migreringshastighet (Tempo)" }
          ],
          alternatives: [
            {
              id: "alt-1",
              name: "Alt A: Totalmoln-klyvning (Event-driven Azure Hub)",
              description: "Vi bygger en modern, egenutvecklad händelsestyrd reskontrahub i Azure Container Apps. Ger full kontroll.",
              isRecommended: true,
              isApproved: false,
              bedomningar: [
                { criterionKey: "crit-1", score: 5, motivering: "Raderar ut all COBOL-skuld helt och hållet." },
                { criterionKey: "crit-2", score: 5, motivering: "Sänker skjuvningen till 0.05 genom att anpassa sig efter webbens tempo." },
                { criterionKey: "crit-3", score: 5, motivering: "Full kontroll över dataflöden, lätt till genomföra GDPR-radering." },
                { criterionKey: "crit-4", score: 2, motivering: "Mycket komplex utveckling, tar minst 18 månader att bygga." }
              ]
            },
            {
              id: "alt-2",
              name: "Alt B: Tolerera & Wrapa (REST API Adapter)",
              description: "Vi behåller COBOL-kärnan men bygger en REST-adapter ovanpå för att möta webbens behov.",
              isRecommended: false,
              isApproved: false,
              bedomningar: [
                { criterionKey: "crit-1", score: 2, motivering: "Stordatorns tekniska skuld kvarstår orörd." },
                { criterionKey: "crit-2", score: 3, motivering: "Adaptern tolererar klyftan, men minskar inte den underliggande risken." },
                { criterionKey: "crit-3", score: 2, motivering: "Svårt att garantera radering i gamla on-premise tabeller." },
                { criterionKey: "crit-4", score: 5, motivering: "Blixtsnabb lösning som kan driftsättas på 3 månader." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "sc-2",
      name: "Konsolidering av Kundprofil-Data (CRM-harmonisering)",
      background: "Kunddata är splittrad mellan Mina Sidor-portalen, CRM-systemet och lokala register, vilket leder till synkroniseringsfördröjningar och regulatoriska compliance-risker.",
      status: "Under utredning",
      affectedSystems: ["Mina Sidor Portal", "CRM Core"],
      decisions: [
        {
          id: "dec-2",
          title: "Etablering av Master-Data Hub",
          question: "Var ska organisationens officiella kundprofil-mästare ligga för att säkra regelefterlevnad?",
          status: "Under utredning",
          criteria: [
            { key: "crit-1", name: "Efterlevnad (GDPR radering)" },
            { key: "crit-2", name: "SLA & Synkhastighet" },
            { key: "crit-3", name: "Systemkomplexitet (Antal flöden)" }
          ],
          alternatives: [
            {
              id: "alt-2-1",
              name: "Alt A: Centraliserad MDM Hub (Master Data)",
              description: "Vi bygger en central, auktoritativ Master-Data Management-hub i vårt moln för alla kundprofiler.",
              isRecommended: true,
              isApproved: false,
              bedomningar: [
                { criterionKey: "crit-1", score: 5, motivering: "Auktoritativ källa, ger 100% spårbarhet och enkel radering." },
                { criterionKey: "crit-2", score: 4, motivering: "Hög prestanda via läscachning i molnet." },
                { criterionKey: "crit-3", score: 4, motivering: "Kräver omdirigering av alla existerande point-to-point flöden." }
              ]
            },
            {
              id: "alt-2-2",
              name: "Alt B: Event-Driven Kafka Synk (Distribuerad)",
              description: "Vi låter alla system behålla sina databaser men synkar förändringar asynkront via Kafka.",
              isRecommended: false,
              isApproved: false,
              bedomningar: [
                { criterionKey: "crit-1", score: 3, motivering: "PII lagras fortfarande på several ställen, svårt att garantera fullständig audit." },
                { criterionKey: "crit-2", score: 5, motivering: "Realtidssynk under sekunden via event streams." },
                { criterionKey: "crit-3", score: 2, motivering: "Ökar driftskomplexiteten markant med distribuerat tillstånd." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "sc-3",
      name: "Resilienssäkring av Utbetalningsflödet",
      background: "Utbetalningsmotorn bär alla kritiska finansiella transaktioner men saknar katastrofsäkring (Disaster Recovery). Om det går ner stannar hela verksamheten.",
      status: "Under utredning",
      affectedSystems: ["Utbetalningsmotor Core"],
      decisions: [
        {
          id: "dec-3",
          title: "Val av High-Availability Arkitektur",
          question: "Hur uppnår vi 99.99% resiliens för vårt mest kritiska transaktionsflöde?",
          status: "Under utredning",
          criteria: [
            { key: "crit-1", name: "Resiliens & Drifttid (RTO/RPO)" },
            { key: "crit-2", name: "Årlig Driftskostnad" },
            { key: "crit-3", name: "Påverkan på Integrationer" }
          ],
          alternatives: [
            {
              id: "alt-3-1",
              name: "Alt A: Multi-Region Active-Active i AWS",
              description: "Fullt redundant, distribuerat transaktionsflöde som körs aktivt i två oberoende datacenter.",
              isRecommended: true,
              isApproved: false,
              bedomningar: [
                { criterionKey: "crit-1", score: 5, motivering: "Noll sekunders nedtid (RTO=0) vid regionkrasch." },
                { criterionKey: "crit-2", score: 1, motivering: "Mycket dyr driftskostnad (dubbla infrastrukturlicenser)." },
                { criterionKey: "crit-3", score: 4, motivering: "Kräver global databassynk, vilket ökar källkodskomplexiteten." }
              ]
            },
            {
              id: "alt-3-2",
              name: "Alt B: Active-Passive (Varm reserv i Azure)",
              description: "En aktiv instans i drift med en kontinuerligt synkad reserv redo att startas vid krasch.",
              isRecommended: false,
              isApproved: false,
              bedomningar: [
                { criterionKey: "crit-1", score: 3, motivering: "15 minuters återställningstid (RTO=15m) med viss risk för transaktionsglapp." },
                { criterionKey: "crit-2", score: 4, motivering: "Mycket kostnadseffektivt då reserven körs på sparlåga." },
                { criterionKey: "crit-3", score: 5, motivering: "Minimal påverkan, enkla DNS-pekare swapping vid failover." }
              ]
            }
          ]
        }
      ]
    }
  ];

  const [scenariosList, setScenariosList] = useState<any[]>(fallbackScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("sc-1");
  const [activeScenario, setActiveScenario] = useState<any>(fallbackScenarios[0]);

  // Load scenarios from backend
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const token = localStorage.getItem("labb_token") || "";
        const res = await fetch(getApiUrl("/api/scenarios"), {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setScenariosList(list);
          const found = list.find((s: any) => s.id === selectedScenarioId) || list[0];
          setActiveScenario(found);
        }
      } catch (err) {
        console.error("Failed to load scenarios from backend, using local fallback", err);
      }
    };
    loadScenarios();
  }, [selectedScenarioId]);

  const handleCommitDecision = async (altId: string) => {
    if (!activeScenario) return;
    
    const decision = activeScenario.decisions[0];
    const alternative = decision.alternatives.find((a: any) => a.id === altId);
    if (!alternative) return;

    setActiveScenario((prev: any) => ({
      ...prev,
      status: "Beslutat",
      decisions: [{
        ...prev.decisions[0],
        status: "Beslutat",
        alternatives: prev.decisions[0].alternatives.map((alt: any) => ({
          ...alt,
          isApproved: alt.id === altId
        }))
      }]
    }));

    setChatHistory(prev => [
      ...prev,
      { sender: "user", text: `Fatta beslut: Jag väljer ${alternative.name}.` },
      { sender: "ai", text: `Sömlöst beslut fattat! Alternativet "${alternative.name}" har markerats som det valda vägvalet i din GCP Firestore-databas. Jag uppdaterar även TIME-tidslinjen och skjuvningsberäkningarna i enlighet med detta beslut!` }
    ]);

    try {
      const token = localStorage.getItem("labb_token") || "";
      await fetch(getApiUrl(`/api/scenarios/${activeScenario.id}/decide`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          decisionId: decision.id,
          alternativeId: altId,
          deciderName: "Chefsarkitekt"
        })
      });
    } catch (err) {
      console.error("Failed to persist decision to backend", err);
    }
  };


  
  // Decoupled Graph State (Supporting CRUD)
  const [nodes, setNodes] = useState<EANode[]>(SEEDED_NODES);
  const [edges, setEdges] = useState<EAEdge[]>(SEEDED_EDGES);

  const loadGraphData = useCallback(async () => {
    try {
      const token = localStorage.getItem("labb_token") || "";
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      const [resNodes, resEdges] = await Promise.all([
        fetch(getApiUrl("/api/graph/nodes"), { headers }),
        fetch(getApiUrl("/api/graph/edges"), { headers })
      ]);
      if (resNodes.ok && resEdges.ok) {
        const fetchedNodes = await resNodes.json();
        const fetchedEdges = await resEdges.json();
        if (fetchedNodes.length > 0) {
          setNodes(fetchedNodes);
        }
        if (fetchedEdges.length > 0) {
          setEdges(fetchedEdges);
        }
      }
    } catch (err) {
      console.error("Failed to load graph data from backend, using local seeder fallback", err);
    }
  }, []);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [copilotQuery, setCopilotQuery] = useState("");
  
  // Interactive Seam and Filter states
  const [selectedSeamId, setSelectedSeamId] = useState("edge-integ-2");
  const [shearFilter, setShearFilter] = useState<"all" | "critical" | "stable">("all");

  // CRUD Catalog State management
  const [selectedCatalogType, setSelectedCatalogType] = useState<EAObjectType>("Applikation");
  const [editingNode, setEditingNode] = useState<Partial<EANode> | null>(null);

  // Blast Radius State
  const [selectedBlastRadiusNodeId, setSelectedBlastRadiusNodeId] = useState<string | null>(null);
  const [blastRadiusData, setBlastRadiusData] = useState<any>(null);
  const [loadingBlastRadius, setLoadingBlastRadius] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedBlastRadiusNodeId) {
      setBlastRadiusData(null);
      return;
    }
    const fetchBlastRadius = async () => {
      setLoadingBlastRadius(true);
      try {
        const token = localStorage.getItem("labb_token") || "";
        const res = await fetch(getApiUrl(`/api/graph/blast-radius/${selectedBlastRadiusNodeId}`), {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBlastRadiusData(data);
        }
      } catch (err) {
        console.error("Failed to fetch blast radius data", err);
      } finally {
        setLoadingBlastRadius(false);
      }
    };
    fetchBlastRadius();
  }, [selectedBlastRadiusNodeId]);

  // Connection/Edge Manager State
  const [catalogViewMode, setCatalogViewMode] = useState<"nodes" | "edges">("nodes");
  const [newEdgeSourceId, setNewEdgeSourceId] = useState("");
  const [newEdgeTargetId, setNewEdgeTargetId] = useState("");
  const [newEdgeType, setNewEdgeType] = useState<"REALISES" | "BELONGS_TO" | "COMMERCIALIZED_AS" | "INTEGRATES" | "MASTERED_BY" | "OWNED_BY" | "SUPPLIED_BY">("INTEGRATES");
  const [newEdgeCoupling, setNewEdgeCoupling] = useState(0.5);
  const [newEdgeContract, setNewEdgeContract] = useState("");

  // Wardley Diagram Filters State
  const [wardleyTypeFilter, setWardleyTypeFilter] = useState<string>("ALL");
  const [wardleySearch, setWardleySearch] = useState<string>("");
  const [wardleyShowOnlyRisks, setWardleyShowOnlyRisks] = useState<boolean>(false);

  // Wardley Map Interactive Drag-and-Drop State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOverrides, setDragOverrides] = useState<Record<string, { x: number; y: number }>>({});

  // Filter Wardley Nodes in real-time based on active filters
  const filteredWardleyNodes = useMemo(() => {
    return nodes
      .filter(n => ["Applikation", "Verksamhetsprodukt", "Service", "Information", "System"].includes(n.type))
      .filter(node => {
        if (wardleyTypeFilter !== "ALL" && node.type !== wardleyTypeFilter) return false;
        if (wardleySearch && !node.name.toLowerCase().includes(wardleySearch.toLowerCase())) return false;
        if (wardleyShowOnlyRisks) {
          const connectedEdges = edges.filter(e => e.sourceId === node.id || e.targetId === node.id);
          const hasRisk = connectedEdges.some(edge => {
            const src = nodes.find(n => n.id === edge.sourceId);
            const tgt = nodes.find(n => n.id === edge.targetId);
            if (!src || !tgt) return false;
            const delta = Math.abs(Math.log10(src.tempo || 12) - Math.log10(tgt.tempo || 12));
            const shear = (edge.coupling || 0.1) * delta;
            return shear > 0.35;
          });
          if (!hasRisk) return false;
        }
        return true;
      });
  }, [nodes, edges, wardleyTypeFilter, wardleySearch, wardleyShowOnlyRisks]);

  // Helper function to resolve staggered 3x3 positions (or active drag positions)
  const getNodePosition = useCallback((node: EANode) => {
    if (dragOverrides[node.id]) {
      return dragOverrides[node.id];
    }

    const tempo = node.tempo || 12;
    const xStage = tempo <= 3 ? "Genesis" : (tempo <= 12 ? "Product" : "Commodity");
    const yStage = node.type;

    const sameBucketNodes = filteredWardleyNodes
      .filter(n => {
        const t = n.tempo || 12;
        const xs = t <= 3 ? "Genesis" : (t <= 12 ? "Product" : "Commodity");
        return xs === xStage && n.type === yStage;
      });

    const indexInBucket = sameBucketNodes.findIndex(n => n.id === node.id);

    let baseX = 20;
    if (xStage === "Product") baseX = 55;
    if (xStage === "Commodity") baseX = 85;

    let baseY = 20;
    if (node.type === "Applikation") baseY = 40;
    if (node.type === "Service" || node.type === "Information") baseY = 62;
    if (node.type === "System") baseY = 82;

    const gridCol = indexInBucket % 3;
    const gridRow = Math.floor(indexInBucket / 3);

    const offsetX = gridCol * 11 - 11;
    const offsetY = gridRow * 7 - 5;

    return {
      x: baseX + offsetX,
      y: baseY + offsetY
    };
  }, [dragOverrides, filteredWardleyNodes]);

  // INTERACTIVE DRAG-AND-DROP HANDLERS
  const handlePointerDown = useCallback((nodeId: string, e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDraggingNodeId(nodeId);
    setSelectedWardleyNodeId(nodeId);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((nodeId: string, e: React.PointerEvent<HTMLButtonElement>) => {
    if (draggingNodeId !== nodeId) return;
    const canvas = document.getElementById("wardley-canvas-container");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const xPercent = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    setDragOverrides(prev => ({
      ...prev,
      [nodeId]: { x: Number(xPercent.toFixed(1)), y: Number(yPercent.toFixed(1)) }
    }));
  }, [draggingNodeId]);

  const handlePointerUp = useCallback((nodeId: string, e: React.PointerEvent<HTMLButtonElement>) => {
    if (draggingNodeId !== nodeId) return;
    setDraggingNodeId(null);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const override = dragOverrides[nodeId];
    if (!override) return;

    let newTempo = 12;
    if (override.x < 35) newTempo = 1;
    else if (override.x >= 70) newTempo = 60;

    let newType: EAObjectType = "Applikation";
    const originalNode = nodes.find(n => n.id === nodeId);
    const originalType = originalNode?.type || "Applikation";

    if (override.y < 30) newType = "Verksamhetsprodukt";
    else if (override.y >= 30 && override.y < 50) newType = "Applikation";
    else if (override.y >= 50 && override.y < 75) {
      newType = (originalType === "Information") ? "Information" : "Service";
    } else if (override.y >= 75) newType = "System";

    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, tempo: newTempo, type: newType } : n));
    
    setDragOverrides(prev => {
      const copy = { ...prev };
      delete copy[nodeId];
      return copy;
    });

    setChatHistory(prev => [
      ...prev,
      {
        sender: "ai",
        text: `Blixtsnabb arkitektur-migrering! Du drog "${originalNode?.name}" till ett nytt mognadsstadium (X: ${override.x}%, Y: ${override.y}%). Jag har uppdaterat dess tempo till ${newTempo} månader och dess objekttyp till ${newType}. Alla spänningslinjer har kalkerat om reaktivt!`
      }
    ]);
  }, [draggingNodeId, dragOverrides, nodes]);

  // ODS Export selections: Dictionary of boolean states
  const [exportSelections, setExportSelections] = useState<Record<EAObjectType, boolean>>({
    Verksamhetsprodukt: true,
    Applikation: true,
    Produkt: true,
    System: true,
    Service: true,
    Information: true,
    Team: true,
    Leverantor: true
  });

  // Dynamic calculated seams using the decoupled node list
  const calculatedSeams = useMemo(() => {
    const integrateEdges = edges.filter(e => e.type === "INTEGRATES");
    return integrateEdges.map(edge => {
      const src = nodes.find(n => n.id === edge.sourceId);
      const tgt = nodes.find(n => n.id === edge.targetId);
      if (!src || !tgt) return { ...edge, srcName: "Okänd", tgtName: "Okänd", srcTempo: 1, tgtTempo: 1, delta: 0, shear: 0, drag: undefined };
      
      const srcTempo = src.tempo || 1;
      const tgtTempo = tgt.tempo || 1;
      const delta = Math.abs(Math.log10(srcTempo) - Math.log10(tgtTempo));
      const shear = (edge.coupling || 0.1) * delta;
      
      return {
        ...edge,
        srcName: src.name,
        srcTempo,
        tgtName: tgt.name,
        tgtTempo,
        delta: Number(delta.toFixed(2)),
        shear: Number(shear.toFixed(2)),
        drag: edge.drag
      };
    });
  }, [edges, nodes]);

  // Filter calculated seams
  const filteredSeams = useMemo(() => {
    return calculatedSeams.filter(s => {
      const matchesSearch = s.srcName.toLowerCase().includes(searchTerm.toLowerCase()) || s.tgtName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (shearFilter === "critical") return s.shear > 0.35;
      if (shearFilter === "stable") return s.shear <= 0.35;
      return true;
    });
  }, [calculatedSeams, searchTerm, shearFilter]);

  // Get nodes filtered by currently selected catalog tab
  const filteredCatalogNodes = useMemo(() => {
    return nodes.filter(n => n.type === selectedCatalogType && n.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [nodes, selectedCatalogType, searchTerm]);

  // Safely initialized after state and parent hook declarations
  const currentQ = useMemo(() => {
    return QUESTIONS[activeTab]?.find(q => q.id === selectedQuestion);
  }, [activeTab, selectedQuestion]);

  const activeCalculatedSeam = useMemo(() => {
    return calculatedSeams.find(s => s.id === selectedSeamId) || calculatedSeams[0];
  }, [selectedSeamId, calculatedSeams]);

  // Handle Seams Move Action (Isolera, Synkronisera, Klyva, Sammanfoga)
  const handleApplySeamMove = (edgeId: string, actionType: "Isolera" | "Synkronisera" | "Klyva" | "Sammanfoga") => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;
    const src = nodes.find(n => n.id === edge.sourceId);
    const tgt = nodes.find(n => n.id === edge.targetId);
    if (!src || !tgt) return;

    if (actionType === "Isolera") {
      setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, coupling: 0.15, kontrakt: "API-kontrakt (Händelsestyrt)" } : e));
      setChatHistory(prev => [
        ...prev,
        { sender: "user", text: `Utför drag: ISOLERA sömmen mellan ${src.name} och ${tgt.name}.` },
        {
          sender: "ai",
          text: `Jag har utfört ett ISOLERA-drag på sömmen! Genom att bygga ett versionerat API-kontrakt eller en händelsekö minskar vi fortplantningskopplingen (K) till 0.15. Detta sänker skjuvningsvärdet (S) till ett säkert värde långt under budgeten på 0.35.`,
          query: `MATCH (src:System {name: "${src.name}"})-[r:INTEGRATES]->(tgt:System {name: "${tgt.name}"})\nSET r.coupling = 0.15\nSET r.contract = "Anti-Corruption API / Event Queue"\nRETURN src.name, tgt.name, r.coupling`
        }
      ]);
    }
    else if (actionType === "Synkronisera") {
      setNodes(prev => prev.map(n => n.id === tgt.id ? { ...n, tempo: 3 } : n));
      setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, kontrakt: "Embedded Regulatoriskt Team (Inbäddade experter)" } : e));
      
      setChatHistory(prev => [
        ...prev,
        { sender: "user", text: `Utför drag: SYNKRONISERA tempo för sömmen ${src.name} -> ${tgt.name}.` },
        {
          sender: "ai",
          text: `Jag har utfört ett SYNKRONISERA-drag! Vi har snabbat på det regulatoriska/operativa tempot för ${tgt.name} från ${tgt.tempo} till 3 månader genom att bädda in jurister eller automatiserade kontroller i det snabba produktteamet. Detta krymper tempoklyftan (Delta) och sänker skjuvningen till gröna nivåer.`,
          query: `MATCH (s:System {name: "${tgt.name}"})\nSET s.tempo = 3\nRETURN s.name, s.tempo`
        }
      ]);
    }
    else if (actionType === "Klyva") {
      setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, coupling: 0.10, kontrakt: "gRPC Out-Of-Process API (Säkrat)" } : e));
      setChatHistory(prev => [
        ...prev,
        { sender: "user", text: `Utför drag: KLYV det bimodala systemet ${tgt.name}.` },
        {
          sender: "ai",
          text: `Briljant! Jag har klyvt det bimodala systemet ${tgt.name} till en snabb gränssnittstjänst och en långsam finansiell kärna. Sömmen är nu helt grön och stabil.`,
          query: `MATCH (s:System {name: "${tgt.name}"}) SET s.tempo = 1;`
        }
      ]);
    }
    else if (actionType === "Sammanfoga") {
      setEdges(prev => prev.filter(e => e.id !== edgeId));
      setSelectedSeamId(edges[0].id);

      setChatHistory(prev => [
        ...prev,
        { sender: "user", text: `Utför drag: SAMMANFOGA sömmen mellan ${src.name} och ${tgt.name}.` },
        {
          sender: "ai",
          text: `Jag har utfört ett SAMMANFOGA-drag! Eftersom båda parter rör sig i ungefär samma tempo har vi tagit bort den fossila sömmen och fört samman dem i samma underhållscykel för att spara administrativa mötes- och samordningskostnader.`,
          query: `MATCH (src:System {name: "${src.name}"})-[r:INTEGRATES]->(tgt:System {name: "${tgt.name}"})\nDELETE r`
        }
      ]);
    }
  };

  // CRUD Actions: Create and Update
  const handleSaveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode || !editingNode.name) return;

    const token = localStorage.getItem("labb_token") || "";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    if (editingNode.id) {
      setNodes(prev => prev.map(n => n.id === editingNode.id ? (editingNode as EANode) : n));
      setChatHistory(prev => [
        ...prev,
        { sender: "ai", text: `Tillgång uppdaterad i katalogen: ${editingNode.name} (${editingNode.type}).` }
      ]);
      try {
        await fetch(getApiUrl("/api/graph/nodes"), {
          method: "POST",
          headers,
          body: JSON.stringify(editingNode)
        });
      } catch (err) {
        console.error("Failed to persist node update to backend", err);
      }
    } else {
      const newNode: EANode = {
        ...(editingNode as EANode),
        id: `node-custom-${Date.now()}`,
        state: editingNode.state || "AsIs",
        action: editingNode.action || "Tolerate"
      };
      setNodes(prev => [...prev, newNode]);
      setChatHistory(prev => [
        ...prev,
        { sender: "ai", text: `Ny tillgång skapad i katalogen: ${newNode.name} (${newNode.type}).` }
      ]);
      try {
        await fetch(getApiUrl("/api/graph/nodes"), {
          method: "POST",
          headers,
          body: JSON.stringify(newNode)
        });
      } catch (err) {
        console.error("Failed to persist node creation to backend", err);
      }
    }
    setEditingNode(null);
  };

  // CRUD Actions: Delete with Cascade Edge Cleaning
  const handleDeleteNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (confirm(`Är du säker på att du vill radera ${node.name}? Detta kommer även radera alla kopplade integrationskanter och relationer i hela grafen (cascade-delete).`)) {
      setNodes(prev => prev.filter(n => n.id !== nodeId));
      setEdges(prev => prev.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId));
      setChatHistory(prev => [
        ...prev,
        { sender: "ai", text: `Tillgång raderad (Cascade-delete slutförd): ${node.name}.` }
      ]);
      try {
        const token = localStorage.getItem("labb_token") || "";
        await fetch(getApiUrl(`/api/graph/nodes/${nodeId}`), {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to persist node deletion to backend", err);
      }
    }
  };

  // ==================== ODS EXPORT FUNCTION ====================
  const handleExportODS = () => {
    const wb = XLSX.utils.book_new();
    let sheetsAdded = 0;

    // Plural mapping for sheet names to make them user-friendly in Swedish
    const pluralMap: Record<EAObjectType, string> = {
      Verksamhetsprodukt: "Verksamhetsprodukter",
      Applikation: "Applikationer",
      Produkt: "Produkter",
      System: "System",
      Service: "Services",
      Information: "Information",
      Team: "Teams",
      Leverantor: "Leverantörer"
    };

    Object.entries(exportSelections).forEach(([type, isSelected]) => {
      if (!isSelected) return;
      const filtered = nodes.filter(n => n.type === type);
      
      // Flatten the rows so they render beautifully as standard columns
      const flatRows = filtered.map(node => ({
        ID: node.id,
        Namn: node.name,
        Beskrivning: node.description,
        ...(node.tempo !== undefined && { "Tempo (Månader)": node.tempo }),
        ...(node.criticality !== undefined && { Kritikalitet: node.criticality }),
        ...(node.techDebt !== undefined && { "Teknisk Skuld": node.techDebt }),
        ...(node.security !== undefined && { Säkerhetsklass: node.security }),
        ...(node.gdpr !== undefined && { "GDPR-känsligt": node.gdpr ? "Ja" : "Nej" }),
        ...(node.slaAvailability !== undefined && { "SLA Tillgänglighet": node.slaAvailability }),
        ...(node.contractUrl !== undefined && { "Avtals-Referens": node.contractUrl })
      }));

      const ws = XLSX.utils.json_to_sheet(flatRows);
      XLSX.utils.book_append_sheet(wb, ws, pluralMap[type as EAObjectType]);
      sheetsAdded++;
    });

    if (sheetsAdded === 0) {
      alert("Vänligen välj minst en objekttyp att exportera.");
      return;
    }

    // Trigger true ODS browser download
    XLSX.writeFile(wb, "ea_landscape_export.ods", { bookType: "ods" });
    setChatHistory(prev => [
      ...prev,
      { sender: "ai", text: `Export slutförd! Genererade en ODS-katalog med ${sheetsAdded} flikar.` }
    ]);
  };

  // ==================== ODS IMPORT FUNCTION ====================
  const handleImportODS = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        const importedNodes: EANode[] = [];
        let totalImported = 0;

        // Plural Swedish back-mapping dictionary
        const sheetToTypeMap: Record<string, EAObjectType> = {
          "Verksamhetsprodukter": "Verksamhetsprodukt",
          "Applikationer": "Applikation",
          "Produkter": "Produkt",
          "System": "System",
          "Services": "Service",
          "Information": "Information",
          "Teams": "Team",
          "Leverantörer": "Leverantor"
        };

        workbook.SheetNames.forEach(sheetName => {
          const type = sheetToTypeMap[sheetName] || sheetToTypeMap[sheetName.trim()];
          if (!type) return; // Skip sheets that do not match our EA Object Types

          const sheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

          rawRows.forEach((row, rIdx) => {
            const name = row.Namn || row.name || row.Name || "";
            if (!name) return; // Skip empty rows
            
            // Normalize values safely using Swedish spreadsheet conventions
            const parseBoolean = (val: any) => {
              if (typeof val === "boolean") return val;
              if (typeof val === "string") {
                const lower = val.toLowerCase().trim();
                return lower === "ja" || lower === "yes" || lower === "true" || lower === "1";
              }
              return val === 1;
            };

            // Heuristics: Automatic classification if fields are missing for Applikation/System
            let tempoValue = row["Tempo (Månader)"] !== undefined ? Number(row["Tempo (Månader)"]) : undefined;
            if ((type === "Applikation" || type === "System") && (tempoValue === undefined || isNaN(tempoValue))) {
              tempoValue = 12; // default 12m for apps/systems
            }

            let criticalityValue = row.Kritikalitet !== undefined ? String(row.Kritikalitet) : undefined;
            if ((type === "Applikation" || type === "System") && !criticalityValue) {
              criticalityValue = "Medium";
            }

            let techDebtValue = row["Teknisk Skuld"] !== undefined ? String(row["Teknisk Skuld"]) : undefined;
            if ((type === "Applikation" || type === "System") && !techDebtValue) {
              techDebtValue = "Low";
            }

            importedNodes.push({
              id: row.ID || row.id || `node-imported-${Date.now()}-${rIdx}`,
              type,
              name,
              description: row.Beskrivning || row.description || row.Description || "",
              tempo: tempoValue,
              criticality: criticalityValue,
              techDebt: techDebtValue,
              security: row.Säkerhetsklass !== undefined ? String(row.Säkerhetsklass) : undefined,
              gdpr: row["GDPR-känsligt"] !== undefined ? parseBoolean(row["GDPR-känsligt"]) : undefined,
              slaAvailability: row["SLA Tillgänglighet"] !== undefined ? String(row["SLA Tillgänglighet"]) : undefined,
              contractUrl: row["Avtals-Referens"] !== undefined ? String(row["Avtals-Referens"]) : undefined,
              state: "AsIs",
              action: "Tolerate"
            });
            totalImported++;
          });
        });

        // Parse relations/edges from sheets named "Relationer" or similar
        const importedEdges: EAEdge[] = [];
        let totalEdgesImported = 0;

        workbook.SheetNames.forEach(sheetName => {
          const nameTrimmed = sheetName.trim();
          if (["Relationer", "Kopplingar", "Relations", "Edges"].includes(nameTrimmed)) {
            const sheet = workbook.Sheets[sheetName];
            const rawRows = XLSX.utils.sheet_to_json<any>(sheet);
            
            rawRows.forEach((row, rIdx) => {
              const sourceId = row["Källa (Source ID)"] || row.sourceId || row.SourceId || row.Source || "";
              const targetId = row["Mål (Target ID)"] || row.targetId || row.TargetId || row.Target || "";
              const type = row["Typ (Type)"] || row.type || row.Type || "INTEGRATES";
              
              if (!sourceId || !targetId) return;

              importedEdges.push({
                id: row.ID || row.id || `edge-imported-${Date.now()}-${rIdx}`,
                sourceId,
                targetId,
                type: type as any,
                coupling: row["Koppling (Coupling)"] !== undefined ? Number(row["Koppling (Coupling)"]) : 0.5,
                kontrakt: row["Kontrakt (Contract)"] || row.contract || row.Contract || "",
                drag: row.Drag || row.drag || undefined
              });
              totalEdgesImported++;
            });
          }
        });

        if (totalImported === 0 && totalEdgesImported === 0) {
          alert("Ingen giltig EA-data (noder eller relationer) hittades i kalkylbladet. Säkra att dina flikar är korrekt namngivna.");
          return;
        }

        // Send additive bulk import to backend API
        const performBulkImport = async () => {
          try {
            const token = localStorage.getItem("labb_token") || "";
            const res = await fetch(getApiUrl("/api/graph/bulk-import"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                nodes: importedNodes,
                edges: importedEdges
              })
            });

            if (res.ok) {
              const data = await res.json();
              console.log("[BULK IMPORT SUCCESS]", data.message);
              // Re-fetch graph state from backend to synchronize correctly!
              await loadGraphData();
              
              setChatHistory(prev => [
                ...prev,
                { sender: "ai", text: `Import lyckades! Läste in ${totalImported} noder och ${totalEdgesImported} kopplingar från dokumentet och synkroniserade dem additivt i grafdatabasen.` }
              ]);
            } else {
              const errData = await res.json();
              alert(`Importen avvisades av servern: ${errData.error}`);
            }
          } catch (err: any) {
            console.error("Bulk import request failed", err);
            alert(`Nätverksfel vid import: ${err.message}`);
          }
        };

        performBulkImport();

      } catch (err: any) {
        alert(`Kunde inte läsa in ODS/Excel-filen. Fel: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Legacy useMemo blocks removed to support decoupled graph structure

  const handlePresetQuery = async (prompt: string, queryStr: string) => {
    // Add user message to UI instantly for feedback
    setChatHistory(prev => [
      ...prev,
      { sender: "user", text: prompt }
    ]);

    try {
      const token = localStorage.getItem("labb_token") || "";
      const res = await fetch(getApiUrl("/api/copilot/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: prompt,
          query: queryStr
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [
          ...prev,
          { sender: "ai", text: data.response, query: queryStr }
        ]);
      } else {
        setChatHistory(prev => [
          ...prev,
          { sender: "ai", text: "Kunde tyvärr inte ansluta till Gemini-motorn på backenden för tillfället. Kör i lokalt hybrid-läge.", query: queryStr }
        ]);
      }
    } catch (err) {
      console.error("Copilot chat request failed", err);
      setChatHistory(prev => [
        ...prev,
        { sender: "ai", text: "Ett nätverksfel uppstod vid kommunikation med din AI-Copilot.", query: queryStr }
      ]);
    }
  };

  // High-signal Summary stats card
  const statsSummary = useMemo(() => {
    const totalNodes = nodes.length;
    const totalEdges = edges.length;
    const integratesCount = edges.filter(e => e.type === "INTEGRATES").length;
    const criticalSeamsCount = calculatedSeams.filter(s => s.shear > 0.35).length;

    return { totalNodes, totalEdges, integratesCount, criticalSeamsCount };
  }, [nodes, edges, calculatedSeams]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* ==================== HEADER ==================== */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-purple-600/15">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">free-apm-lens</h1>
            <p className="text-xs text-slate-400 font-medium">Decoupled Enterprise Architecture & Seam/Shear Analytics</p>
          </div>
        </div>

        {/* Global Statistics Dashboard */}
        <div className="flex items-center gap-5 text-xs">
          <div className="hidden md:flex gap-4 border-r border-slate-800 pr-5">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">EA-Noder</span>
              <span className="text-white font-mono font-bold">{statsSummary.totalNodes} st</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Graf-Kanter</span>
              <span className="text-white font-mono font-bold">{statsSummary.totalEdges} st</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-rose-500 uppercase block font-semibold">Kritiska Sömmar</span>
              <span className="text-rose-400 font-mono font-bold animate-pulse">{statsSummary.criticalSeamsCount} st</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Sandbox:</span>
            <span className="text-white font-bold">EASANDBOX (13)</span>
          </div>
        </div>
      </header>

      {/* ==================== MAIN WORKSPACE ==================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION - SIX EA DOMAINS */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-2 mb-2">Frågestyrda Domäner</h2>

          <button 
            onClick={() => { setActiveTab("seams"); setSelectedQuestion("SÖM-01"); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "seams" 
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span className="flex-1 text-left font-bold text-purple-300">Sömmar & Skjuvning</span>
            <span className="bg-purple-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Söm</span>
          </button>

          <button 
            onClick={() => { setActiveTab("catalog"); setSelectedQuestion("CAT-01"); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "catalog" 
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <ClipboardList className="w-4 h-4 text-purple-400" />
            <span className="flex-1 text-left font-bold text-purple-300">EA Asset Catalog</span>
            <span className="bg-purple-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">CRUD</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab("lifecycle"); setSelectedQuestion("A1-13"); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "lifecycle" 
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Livscykel & Portfölj</span>
          </button>

          <button 
            onClick={() => { setActiveTab("scenarios"); setSelectedQuestion("S1-01"); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "scenarios" 
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Transitioner & Scenarier</span>
          </button>

          <button 
            onClick={() => { setActiveTab("wardley"); setSelectedQuestion("SÖM-01"); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "wardley" 
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <MapIcon className="w-4 h-4 text-purple-400" />
            <span className="flex-1 text-left font-bold text-purple-300">Wardley-diagram</span>
            <span className="bg-purple-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Map</span>
          </button>

          <div className="mt-auto border-t border-slate-800 pt-4 px-2">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              <span className="font-bold text-slate-200 block mb-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                Söm-Metamodell
              </span>
              • 8 Dekopplade Objekttyper<br />
              • Cascade Edge Cleaning<br />
              • Typade Kanter (BelongsTo m.fl)
            </div>
          </div>
        </aside>

        {/* MIDDLE CONTENT WORKSPACE */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950">
          
          {/* Question selection box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Välj en specifik EA-Fråga</h3>
            <div className="flex flex-col gap-2">
              {QUESTIONS[activeTab]?.map((q: any) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestion(q.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex justify-between items-center ${
                    selectedQuestion === q.id
                      ? "bg-purple-950/20 border-purple-500/40 text-purple-200 shadow-sm"
                      : "bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  <div className="flex gap-2.5 items-center">
                    <span className="font-mono font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500">{q.id}</span>
                    <span className="font-medium">{q.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      q.status === "Besvaras" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      q.status === "Delvis" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>{q.status}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
            
            {/* Selected question details */}
            {currentQ && (
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                <div className="text-slate-400">
                  <span className="font-bold text-slate-300">Kontext:</span> {currentQ.description}
                </div>
                <div className="text-slate-500 text-[11px] font-mono">Ställs av: {currentQ.role}</div>
              </div>
            )}
          </div>

          {/* ==================== PERSPECTIVE VIEW RENDERINGS ==================== */}

          {/* TAB 0: SÖMMAR & SKJUVNING (SÖMHypotesen) */}
          {activeTab === "seams" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Introduction to Seams Metamodel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-950/20 to-slate-900 border border-purple-500/20 rounded-xl p-5 md:col-span-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="text-yellow-400 w-4 h-4 animate-pulse" />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-purple-400">Matematisk EA-Lins</span>
                    </div>
                    <h4 className="text-sm font-black text-white mb-2">Formeln för skjuvning</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                      Skjuvning (<span className="text-purple-400 font-bold font-mono">S</span>) uppstår på integrations-sömmarna (INTEGRATES-kanterna) mellan Applikations-noder i olika tempo. Stark koppling slits isär av förändringstryck.
                    </p>
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
                      <div className="flex justify-between">
                        <span>Tempo (&tau;):</span>
                        <span className="text-purple-400 font-bold">&Auml;ndringsintervall</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Klyfta (&Delta;):</span>
                        <span className="text-purple-400 font-bold">|log&tau;_a - log&tau;_b|</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Koppling (K):</span>
                        <span className="text-purple-400 font-bold">Sam&auml;ndringsandel</span>
                      </div>
                      <div className="border-t border-slate-800/80 pt-1 flex justify-between text-white font-bold">
                        <span>Skjuvning S:</span>
                        <span className="text-yellow-400">K &times; &Delta;</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                    <span>Skjuvbudget S_max:</span>
                    <span className="text-yellow-400 font-bold font-mono">0.35</span>
                  </div>
                </div>

                {/* Sömkarta Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Aktiv Sömkarta ({filteredSeams.length} sömmar i grafen)</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShearFilter("all")}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${shearFilter === "all" ? "bg-purple-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"}`}
                      >
                        Alla
                      </button>
                      <button 
                        onClick={() => setShearFilter("critical")}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${shearFilter === "critical" ? "bg-rose-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"}`}
                      >
                        Risk-sömmar
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider bg-slate-950/20 sticky top-0 z-10">
                          <th className="py-2.5 px-2 bg-slate-900">Källa (Snabb App &tau;)</th>
                          <th className="py-2.5 px-2 bg-slate-900">Mottagare (Långsam App &tau;)</th>
                          <th className="py-2.5 px-2 text-center bg-slate-900">Klyfta (&Delta;)</th>
                          <th className="py-2.5 px-2 text-center bg-slate-900">Koppling (K)</th>
                          <th className="py-2.5 px-2 text-center bg-slate-900">Skjuvning (S)</th>
                          <th className="py-2.5 px-2 text-center bg-slate-900">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 font-sans">
                        {filteredSeams.map(seam => {
                          const isHigh = seam.shear > 0.35;
                          const isSelected = selectedSeamId === seam.id;
                          return (
                            <tr 
                              key={seam.id} 
                              onClick={() => setSelectedSeamId(seam.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-purple-950/25 border-l-2 border-purple-500 font-medium" : "hover:bg-slate-800/25"
                              }`}
                            >
                              <td className="py-3 px-2">
                                <div className="flex flex-col">
                                  <span className="text-white font-semibold">{seam.srcName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">&tau; = {seam.srcTempo} m&aring;n</span>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex flex-col">
                                  <span className="text-white font-semibold">{seam.tgtName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">&tau; = {seam.tgtTempo} m&aring;n</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-slate-300 font-bold">{seam.delta}</td>
                              <td className="py-3 px-2 text-center font-mono text-slate-300">{seam.coupling}</td>
                              <td className={`py-3 px-2 text-center font-mono font-bold ${isHigh ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                                {seam.shear}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  isHigh ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                }`}>
                                  {isHigh ? "Rivningsrisk" : "Stabil söm"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Four Architectural Moves Sandbox */}
              {activeCalculatedSeam && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-0.5">Sömsandbox: Modellera strukturella drag</span>
                      <h4 className="text-sm font-extrabold text-white">
                        Aktiv söm: {activeCalculatedSeam.srcName} &rarr; {activeCalculatedSeam.tgtName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono block">Beräknad skjuvbelastning</span>
                      <span className={`text-sm font-black font-mono ${activeCalculatedSeam.shear > 0.35 ? "text-rose-400" : "text-emerald-400"}`}>
                        S = {activeCalculatedSeam.shear} {activeCalculatedSeam.shear > 0.35 ? "(Budget överskriden!)" : "(Godkänd)"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* Move 1: Isolera */}
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest block mb-1">Drag 1: Isolera</span>
                        <h5 className="text-xs font-bold text-white mb-1">Sänk koppling (K)</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Bygg ett versionerat API, händelsekö, eller Anti-Corruption Layer (ACL). Låter båda behålla sina temponen men frikopplar spridningen.</p>
                      </div>
                      <button
                        onClick={() => handleApplySeamMove(activeCalculatedSeam.id, "Isolera")}
                        disabled={activeCalculatedSeam.drag === "Isolera"}
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-[11px] font-bold text-white rounded transition-colors"
                      >
                        {activeCalculatedSeam.drag === "Isolera" ? "Isolerad & Säkrad" : "Isolera söm"}
                      </button>
                    </div>

                    {/* Move 2: Synkronisera */}
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block mb-1">Drag 2: Synkronisera</span>
                        <h5 className="text-xs font-bold text-white mb-1">Krymp klyfta (&Delta;)</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Flytta den långsamma sidans tempo närmare den snabba genom att bädda in jurister, säkerhetsspecialister eller automatisera regeltester i produktteamet.</p>
                      </div>
                      <button
                        onClick={() => handleApplySeamMove(activeCalculatedSeam.id, "Synkronisera")}
                        disabled={activeCalculatedSeam.drag === "Synkronisera"}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-[11px] font-bold text-white rounded transition-colors"
                      >
                        {activeCalculatedSeam.drag === "Synkronisera" ? "Synkroniserad" : "Synkronisera tempo"}
                      </button>
                    </div>

                    {/* Move 3: Klyva */}
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block mb-1">Drag 3: Klyva</span>
                        <h5 className="text-xs font-bold text-white mb-1">Dela bimodal nod</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Om en nod uppvisar dubbla takter (bimodal fördelning), klyvs den i en snabb front-nod och en långsam, robust kärn-nod som frikopplas internt.</p>
                      </div>
                      <button
                        onClick={() => handleApplySeamMove(activeCalculatedSeam.id, "Klyva")}
                        disabled={!!(activeCalculatedSeam.drag && activeCalculatedSeam.drag.startsWith("Klyvd"))}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-[11px] font-bold text-white rounded transition-colors"
                      >
                        {activeCalculatedSeam.drag && activeCalculatedSeam.drag.startsWith("Klyvd") ? "Nod Klyvd" : "Klyv system"}
                      </button>
                    </div>

                    {/* Move 4: Sammanfoga */}
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mb-1">Drag 4: Sammanfoga</span>
                        <h5 className="text-xs font-bold text-white mb-1">Ta bort fossil söm</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Om två noder rör sig i samma tempo (&Delta; &lt; 0.3) men är separerade av historiska skäl, sammanfogas de för att spara mötes- och samordningskostnader.</p>
                      </div>
                      <button
                        onClick={() => handleApplySeamMove(activeCalculatedSeam.id, "Sammanfoga")}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 rounded transition-colors"
                      >
                        Sammanfoga söm
                      </button>
                    </div>

                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
                    <div>
                      <span className="font-bold text-slate-300">Aktiva sömkontrakt:</span> {activeCalculatedSeam.kontrakt}
                    </div>
                    <div className="font-mono text-[10px]">Långsiktig sömhorisont: {activeCalculatedSeam.tgtTempo} m&aring;nader</div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 1: EA ASSET CATALOG (Full CRUD with ODS Export/Import) */}
          {activeTab === "catalog" && (
            <div className="space-y-6">
              {/* Dual Mode Selector Bar */}
              <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 max-w-md">
                <button
                  onClick={() => setCatalogViewMode("nodes")}
                  className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                    catalogViewMode === "nodes"
                      ? "bg-purple-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Hantera Noder (Assets)
                </button>
                <button
                  onClick={() => setCatalogViewMode("edges")}
                  className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                    catalogViewMode === "edges"
                      ? "bg-purple-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Hantera Kopplingar (Kanter)
                </button>
              </div>

              {catalogViewMode === "edges" ? (
                /* ==================== INTERACTIVE CONNECTION MANAGER ==================== */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  {/* Left: Master Connection Table */}
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4 text-purple-400" />
                        Aktiva Kopplingar i grafen ({edges.length} relationer)
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">Tredimensionell relationell integritet</span>
                    </div>

                    <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider bg-slate-950/20 sticky top-0 z-10">
                            <th className="py-2.5 px-3 bg-slate-900">Källa (Nod)</th>
                            <th className="py-2.5 px-3 bg-slate-900 text-center">Relationstyp</th>
                            <th className="py-2.5 px-3 bg-slate-900">Mål (Nod)</th>
                            <th className="py-2.5 px-3 bg-slate-900">Söm-detaljer</th>
                            <th className="py-2.5 px-3 text-center bg-slate-900">Koppla bort</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {edges.map(edge => {
                            const src = nodes.find(n => n.id === edge.sourceId);
                            const tgt = nodes.find(n => n.id === edge.targetId);
                            if (!src || !tgt) return null;
                            return (
                              <tr key={edge.id} className="hover:bg-slate-800/20 transition-colors">
                                <td className="py-3 px-3">
                                  <div className="flex flex-col">
                                    <span className="font-extrabold text-white">{src.name}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">{src.type}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black border ${
                                    edge.type === "INTEGRATES" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                    edge.type === "REALISES" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                    "bg-slate-800 text-slate-400 border-slate-700"
                                  }`}>
                                    {edge.type}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex flex-col">
                                    <span className="font-extrabold text-white">{tgt.name}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">{tgt.type}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                                  {edge.type === "INTEGRATES" && `K = ${edge.coupling || 0.5}, contract: "${edge.kontrakt || "REST"}"`}
                                  {edge.type === "REALISES" && "Realliserar kapabilitet"}
                                  {edge.type === "BELONGS_TO" && "Teknisk undergrupp"}
                                  {edge.type === "MASTERED_BY" && "Auktoritär Masterkälla"}
                                  {edge.type === "OWNED_BY" && "Organisatoriskt ägande"}
                                  {edge.type === "SUPPLIED_BY" && "Extern leverantör"}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Är du säker på att du vill ta bort den här kopplingen?`)) {
                                        setEdges(prev => prev.filter(e => e.id !== edge.id));
                                        setChatHistory(prev => [
                                          ...prev,
                                          { sender: "ai", text: `Koppling borttagen: [${src.name}] -${edge.type}-> [${tgt.name}].` }
                                        ]);
                                        try {
                                          const token = localStorage.getItem("labb_token") || "";
                                          await fetch(getApiUrl(`/api/graph/edges/${edge.id}`), {
                                            method: "DELETE",
                                            headers: { "Authorization": `Bearer ${token}` }
                                          });
                                        } catch (err) {
                                          console.error("Failed to persist edge deletion to backend", err);
                                        }
                                      }
                                    }}
                                    className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Create Connection Form */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newEdgeSourceId || !newEdgeTargetId) return;
                      const newEdge: EAEdge = {
                        id: `edge-custom-${Date.now()}`,
                        sourceId: newEdgeSourceId,
                        targetId: newEdgeTargetId,
                        type: newEdgeType,
                        ...(newEdgeType === "INTEGRATES" && { coupling: newEdgeCoupling, kontrakt: newEdgeContract })
                      };
                      setEdges(prev => [...prev, newEdge]);
                      
                      const srcNode = nodes.find(n => n.id === newEdgeSourceId);
                      const tgtNode = nodes.find(n => n.id === newEdgeTargetId);
                      setChatHistory(prev => [
                        ...prev,
                        { sender: "ai", text: `Skapade en ny koppling i grafen: [${srcNode?.name}] -${newEdgeType}-> [${tgtNode?.name}].` }
                      ]);
                      setNewEdgeSourceId("");
                      setNewEdgeTargetId("");
                      setNewEdgeContract("");

                      try {
                        const token = localStorage.getItem("labb_token") || "";
                        await fetch(getApiUrl("/api/graph/edges"), {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                          },
                          body: JSON.stringify(newEdge)
                        });
                      } catch (err) {
                        console.error("Failed to persist edge creation to backend", err);
                      }
                    }} className="space-y-4">
                      <div className="border-b border-slate-800 pb-2">
                        <span className="text-[9px] text-purple-400 font-extrabold uppercase tracking-widest block">Koppla noder</span>
                        <h4 className="text-sm font-bold text-white">Etablera Ny Relation</h4>
                      </div>

                      <div className="space-y-3 text-xs">
                        <SearchableCombobox
                          label="Käll-nod (Source)"
                          value={newEdgeSourceId}
                          onChange={setNewEdgeSourceId}
                          options={nodes}
                          placeholder="Sök käll-nod..."
                        />

                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Relationstyp (Edge Type)</label>
                          <select
                            value={newEdgeType}
                            onChange={e => setNewEdgeType(e.target.value as any)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-purple-500"
                          >
                            <option value="INTEGRATES">INTEGRATES (Applikation till Applikation - skjuvning!)</option>
                            <option value="REALISES">REALISES (Applikation till Verksamhetsprodukt)</option>
                            <option value="BELONGS_TO">BELONGS_TO (Undergrupp / Tillhörighet)</option>
                            <option value="MASTERED_BY">MASTERED_BY (Information master)</option>
                            <option value="OWNED_BY">OWNED_BY (Tilldelat team)</option>
                            <option value="SUPPLIED_BY">SUPPLIED_BY (Levereras av leverantör)</option>
                          </select>
                        </div>

                        <SearchableCombobox
                          label="Mål-nod (Target)"
                          value={newEdgeTargetId}
                          onChange={setNewEdgeTargetId}
                          options={nodes}
                          placeholder="Sök målnod..."
                        />

                        {/* Dynamic fields for INTEGRATES relation type */}
                        {newEdgeType === "INTEGRATES" && (
                          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-3 animate-fadeIn">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 block">Kopplingsfaktor (K)</label>
                                <span className="font-mono text-[10px] text-purple-400 font-bold">{newEdgeCoupling}</span>
                              </div>
                              <input
                                type="range"
                                min="0.05"
                                max="1.0"
                                step="0.05"
                                value={newEdgeCoupling}
                                onChange={e => setNewEdgeCoupling(Number(e.target.value))}
                                className="w-full accent-purple-600 bg-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Gränssnittskontrakt (Interface)</label>
                              <input
                                type="text"
                                placeholder="ex: REST API, gRPC, COBOL Direct"
                                value={newEdgeContract}
                                onChange={e => setNewEdgeContract(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" /> Etablera relation
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* ==================== INTERACTIVE NODE MANAGER ==================== */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  
                  {/* Left Panel: Selector + Master List */}
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-purple-600/10 text-purple-400 text-xs px-2 py-1 rounded font-mono font-bold">CRUD View</span>
                    <h3 className="text-sm font-bold text-white">EA Asset Master Catalog</h3>
                  </div>
                  
                  {/* Object Type Selector */}
                  <select
                    value={selectedCatalogType}
                    onChange={(e) => {
                      setSelectedCatalogType(e.target.value as EAObjectType);
                      setEditingNode(null);
                    }}
                    className="bg-slate-950 border border-slate-800 text-xs text-purple-300 font-bold rounded-lg p-2 outline-none focus:border-purple-500"
                  >
                    <option value="Verksamhetsprodukt">Verksamhetsprodukter</option>
                    <option value="Applikation">Applikationer</option>
                    <option value="Produkt">Produkter</option>
                    <option value="System">System</option>
                    <option value="Service">Services</option>
                    <option value="Information">Information (Data)</option>
                    <option value="Team">Teams</option>
                    <option value="Leverantor">Leverantörer</option>
                  </select>
                </div>

                {/* Sub-list with filters */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800/80">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder={`Sök bland ${selectedCatalogType.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                  />
                  <button
                    onClick={() => setEditingNode({ type: selectedCatalogType, name: "", description: "" })}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 transition-all"
                  >
                    <PlusCircle className="w-3 h-3" /> Skapa Ny
                  </button>
                </div>

                <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider bg-slate-950/20 sticky top-0 z-10">
                        <th className="py-2 px-3 bg-slate-900">Namn</th>
                        <th className="py-2 px-3 bg-slate-900">Beskrivning</th>
                        <th className="py-2 px-3 bg-slate-900">Nyckel-attribut</th>
                        <th className="py-2 px-3 text-center bg-slate-900">Blast Radius</th>
                        <th className="py-2 px-3 text-center bg-slate-900">Redigera</th>
                        <th className="py-2 px-3 text-center bg-slate-900">Radera</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filteredCatalogNodes.map(node => (
                        <tr key={node.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 px-3 font-extrabold text-white">{node.name}</td>
                          <td className="py-3 px-3 text-slate-400 line-clamp-1 max-w-[200px]">{node.description}</td>
                          <td className="py-3 px-3 font-mono text-[10px]">
                            {node.type === "Applikation" && `&tau; = ${node.tempo || 1} m, ${node.criticality}`}
                            {node.type === "Information" && `GDPR: ${node.gdpr ? "Ja" : "Nej"}, ${node.security}`}
                            {node.type === "Produkt" && `SLA: ${node.slaAvailability || "-"}`}
                            {node.type === "Verksamhetsprodukt" && `Kritikalitet: ${node.criticality}`}
                            {node.type === "Team" && `Team-Id: ${node.id}`}
                            {node.type === "Leverantor" && "Extern Vendor"}
                            {node.type === "System" && "Logisk Vy"}
                            {node.type === "Service" && "Tekniskt API"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                setEditingNode(null);
                                setSelectedBlastRadiusNodeId(node.id);
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded border font-bold flex items-center gap-1 mx-auto transition-all ${
                                selectedBlastRadiusNodeId === node.id
                                  ? "bg-purple-600/20 text-purple-400 border-purple-500/40"
                                  : "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-purple-500/30 hover:text-purple-400"
                              }`}
                            >
                              <Activity className="w-3 h-3" /> Analysera
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedBlastRadiusNodeId(null);
                                setEditingNode(node);
                              }}
                              className="text-purple-400 hover:text-purple-300 font-bold hover:underline"
                            >
                              Redigera
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleDeleteNode(node.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ==================== ODS IMPORT / EXPORT SUBPANEL ==================== */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Database className="w-4 h-4" /> ODS Spreadsheet Integration
                    </h4>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">Format: OpenDocument (.ods)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ODS Export controls */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">1. Exportera katalogblad</span>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        {Object.keys(exportSelections).map(typeKey => (
                          <div key={typeKey} className="flex items-center gap-1.5">
                            <input 
                              type="checkbox"
                              id={`export-chk-${typeKey}`}
                              checked={exportSelections[typeKey as EAObjectType]}
                              onChange={(e) => setExportSelections(prev => ({ ...prev, [typeKey]: e.target.checked }))}
                              className="w-3 h-3 rounded text-purple-600 bg-slate-900 border-slate-800"
                            />
                            <label htmlFor={`export-chk-${typeKey}`} className="text-slate-300 truncate">{typeKey}</label>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleExportODS}
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <Network className="w-3.5 h-3.5 text-white" /> Exportera ODS-fil
                      </button>
                    </div>

                    {/* ODS Import controls */}
                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">2. Importera kalkylblad</span>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                          Ladda upp en exporterad .ods-fil (eller Excel). Blad namngivna efter objekttyper (ex: Applikationer) kommer läsas av reaktivt.
                        </p>
                      </div>
                      <div className="relative">
                        <input 
                          type="file"
                          accept=".ods, .xlsx"
                          onChange={handleImportODS}
                          id="ods-import-file"
                          className="hidden"
                        />
                        <label
                          htmlFor="ods-import-file"
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-purple-300 border border-purple-500/25 rounded cursor-pointer transition-colors flex items-center justify-center gap-1"
                        >
                          <Layers className="w-3.5 h-3.5 text-purple-400" /> Välj ODS/Excel fil
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Panel: Adaptive CRUD Editor Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
                {editingNode ? (
                  <form onSubmit={handleSaveNode} className="space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="text-[9px] text-purple-400 font-extrabold uppercase tracking-widest block">Formulär-schema</span>
                      <h4 className="text-sm font-bold text-white">
                        {editingNode.id ? `Redigera ${editingNode.name}` : `Skapa Ny ${selectedCatalogType}`}
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Namn</label>
                        <input
                          type="text"
                          required
                          value={editingNode.name || ""}
                          onChange={e => setEditingNode(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Beskrivning</label>
                        <textarea
                          rows={2}
                          value={editingNode.description || ""}
                          onChange={e => setEditingNode(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Adaptive input schemas based on EA Object Type */}
                      {(selectedCatalogType === "Applikation" || selectedCatalogType === "System") && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedCatalogType === "Applikation" ? (
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Faktiskt Tempo (&tau;)</label>
                                <input
                                  type="number"
                                  required
                                  value={editingNode.tempo || 1}
                                  onChange={e => setEditingNode(prev => ({ ...prev, tempo: Number(e.target.value) }))}
                                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Objekttyp</label>
                                <input
                                  type="text"
                                  disabled
                                  value="System (Logisk Grupp)"
                                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded p-2 text-slate-500 text-xs font-bold"
                                />
                              </div>
                            )}
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kritikalitet</label>
                              <select
                                value={editingNode.criticality || "Medium"}
                                onChange={e => setEditingNode(prev => ({ ...prev, criticality: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                              >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Teknisk Skuld</label>
                              <select
                                value={editingNode.techDebt || "Low"}
                                onChange={e => setEditingNode(prev => ({ ...prev, techDebt: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                              >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Arkitektur-status</label>
                              <select
                                value={editingNode.state || "AsIs"}
                                onChange={e => setEditingNode(prev => ({ ...prev, state: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                              >
                                <option value="AsIs">AsIs (Befintligt Bestånd)</option>
                                <option value="Transition">Transition (Övergångsfas)</option>
                                <option value="Target">Target (Målarkitektur)</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">TIME Åtgärd</label>
                              <select
                                value={editingNode.action || "Tolerate"}
                                onChange={e => setEditingNode(prev => ({ ...prev, action: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                              >
                                <option value="Tolerate">Tolerate (TIME)</option>
                                <option value="Invest">Invest (TIME)</option>
                                <option value="Migrate">Migrate (TIME)</option>
                                <option value="Eliminate">Eliminate (TIME)</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {selectedCatalogType === "Information" && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Säkerhetsklass</label>
                              <select
                                value={editingNode.security || "Internal"}
                                onChange={e => setEditingNode(prev => ({ ...prev, security: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                              >
                                <option value="Public">Public</option>
                                <option value="Internal">Internal</option>
                                <option value="Confidential">Confidential</option>
                                <option value="Restricted">Restricted</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                              <input
                                type="checkbox"
                                id="gdpr"
                                checked={editingNode.gdpr || false}
                                onChange={e => setEditingNode(prev => ({ ...prev, gdpr: e.target.checked }))}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-800"
                              />
                              <label htmlFor="gdpr" className="text-[10px] uppercase font-bold text-slate-300">Personuppgifter (GDPR)</label>
                            </div>
                          </div>
                        </>
                      )}

                      {selectedCatalogType === "Produkt" && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">SLA-Nivå</label>
                              <input
                                type="text"
                                placeholder="ex: 99.9%"
                                value={editingNode.slaAvailability || ""}
                                onChange={e => setEditingNode(prev => ({ ...prev, slaAvailability: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Avtals-URL</label>
                              <input
                                type="text"
                                placeholder="https://..."
                                value={editingNode.contractUrl || ""}
                                onChange={e => setEditingNode(prev => ({ ...prev, contractUrl: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded text-xs transition-colors"
                      >
                        Spara tillgång
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNode(null)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded text-xs transition-colors"
                      >
                        Avbryt
                      </button>
                    </div>
                  </form>
                ) : selectedBlastRadiusNodeId ? (
                  /* ==================== INTERACTIVE BLAST RADIUS REPORT ==================== */
                  <div className="space-y-4 animate-fadeIn font-sans h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Header with node info */}
                      <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-purple-500/10 text-purple-400 font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border border-purple-500/20 mb-1 inline-block">
                            Blast Radius Analys
                          </span>
                          <h4 className="text-sm font-extrabold text-white">
                            {blastRadiusData?.startNode?.name || "Laddar..."}
                          </h4>
                          <span className="text-[9px] text-slate-500 font-mono font-bold block mt-0.5">
                            TYP: {blastRadiusData?.startNode?.type || "Laddar..."}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedBlastRadiusNodeId(null)}
                          className="text-slate-500 hover:text-slate-300 font-bold text-xs"
                          title="Stäng analys"
                        >
                          &times; Stäng
                        </button>
                      </div>

                      {loadingBlastRadius ? (
                        <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Beräknar graf-traversering live...</span>
                        </div>
                      ) : blastRadiusData ? (
                        <div className="space-y-4 text-xs">
                          {/* Risk Gauge */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="uppercase tracking-wider font-bold text-slate-500">Konsekvens-Risk (Blast Index)</span>
                              <span className={`font-mono font-bold text-xs ${
                                blastRadiusData.riskScore >= 15
                                  ? "text-rose-400 animate-pulse"
                                  : blastRadiusData.riskScore >= 5
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                              }`}>
                                {blastRadiusData.riskScore} / 100
                              </span>
                            </div>
                            
                            {/* Simple Visual progress bar */}
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                              <div 
                                style={{ width: `${Math.min(100, blastRadiusData.riskScore * 4)}%` }} 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  blastRadiusData.riskScore >= 15
                                    ? "bg-gradient-to-r from-rose-500 to-red-600"
                                    : blastRadiusData.riskScore >= 5
                                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                      : "bg-gradient-to-r from-emerald-500 to-teal-500"
                                }`}
                              ></div>
                            </div>
                            
                            <p className="text-[10px] text-slate-400 italic leading-relaxed">
                              {blastRadiusData.riskScore >= 15
                                ? "Kritisk risk: Avveckling/ändring slår brett i hela systemlandskapet och påverkar flera verksamhetsprodukter."
                                : blastRadiusData.riskScore >= 5
                                  ? "Måttlig risk: Ändringen har måttlig spridning och bör samordnas med berörda team."
                                  : "Låg risk: Ändringens effekter är starkt lokaliserade med minimal systemspridning."}
                            </p>
                          </div>

                          {/* Affected list */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-800/40 pb-1">
                              <span className="font-bold uppercase tracking-wider">Kedjeeffekter i landskapet ({blastRadiusData.affectedNodes.length} drabbade)</span>
                              <span className="font-mono">Max 3 hopp</span>
                            </div>

                            {blastRadiusData.affectedNodes.length === 0 ? (
                              <p className="text-slate-500 italic py-4 text-center">Noden är helt isolerad och har inga konsekvenser.</p>
                            ) : (
                              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                                {blastRadiusData.affectedNodes
                                  .sort((a: any, b: any) => a.distance - b.distance)
                                  .map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center bg-slate-950/40 hover:bg-slate-950 p-2 rounded border border-slate-800/40 transition-colors">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-slate-200">{item.name}</span>
                                        <span className="text-[9px] text-slate-500">
                                          {item.type} &bull; Rel: {item.impactRelation || "Kopplad"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border ${
                                          item.criticality === "Critical"
                                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                            : item.criticality === "High"
                                              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                              : "bg-slate-800 text-slate-400 border-slate-700/50"
                                        }`}>
                                          {item.criticality || "Medium"}
                                        </span>
                                        <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                                          {item.distance} {item.distance === 1 ? "hopp" : "hopp"}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500 italic">Kunde inte beräkna spridning.</div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          const name = blastRadiusData?.startNode?.name;
                          const count = blastRadiusData?.affectedNodes?.length || 0;
                          const score = blastRadiusData?.riskScore || 0;
                          setChatHistory(prev => [
                            ...prev,
                            { sender: "user", text: `Analysera Blast Radius för ${name}.` },
                            { sender: "ai", text: `Blast Radius-analys för "${name}" är beräknad! Denna komponent har ett Blast Index på ${score}/100. Vid en förändring drabbas totalt ${count} downstream-arkitekturkomponenter direkt eller indirekt (upp till 3 nivåers djup i grafen). Se rapporten i högerpanelen för fullständig genomgång av spridningsrisken.` }
                          ]);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>Diskutera med AI-Copilot</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-3 h-full">
                    <ClipboardList className="w-10 h-10 text-slate-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-400">Ingen tillgång vald</p>
                      <p className="text-[10px] text-slate-600 mt-1 max-w-[180px] mx-auto">Välj en tillgång i listan eller klicka på "Skapa ny" för att starta det relationella CRUD-formuläret.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
              )}
            </div>
          )}

          {/* TAB 4: WARDLEY-DIAGRAM (Value Chain vs. Evolution) */}
          {activeTab === "wardley" && (
            <div className="space-y-4">
              
              {/* WARDLEY DIAGRAM FILTER BAR */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between shadow-md">
                <div className="flex gap-1.5 flex-wrap">
                  {["ALL", "Applikation", "Verksamhetsprodukt", "Information", "System"].map((typeKey: any) => (
                    <button
                      key={typeKey}
                      onClick={() => setWardleyTypeFilter(typeKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        wardleyTypeFilter === typeKey
                          ? "bg-purple-600 text-white"
                          : "bg-slate-950 text-slate-400 border border-slate-800/80 hover:text-slate-200"
                      }`}
                    >
                      {typeKey === "ALL" ? "Visa Alla" : typeKey}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs">
                    <input 
                      type="checkbox"
                      id="wardley-risk-toggle"
                      checked={wardleyShowOnlyRisks}
                      onChange={(e) => setWardleyShowOnlyRisks(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-800"
                    />
                    <label htmlFor="wardley-risk-toggle" className="text-rose-400 font-bold select-none cursor-pointer">Visa endast risksömar (S &gt; 0.35)</label>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Sök i diagrammet..."
                      value={wardleySearch}
                      onChange={(e) => setWardleySearch(e.target.value)}
                      className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-40"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* Left: Wardley Canvas */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 h-[480px] relative overflow-hidden flex flex-col justify-between shadow-md">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Evolutionär Värdekedja (Wardley Map)</h4>
                  <div className="flex-1 relative bg-slate-950 rounded-lg border border-slate-800/80 my-3 overflow-hidden select-none">
                    {/* Render Decoupled Nodes as draggable/clickable chips on canvas */}
                    {filteredWardleyNodes.map(node => {
                      const pos = getNodePosition(node);
                      const style = {
                        left: `${pos.x}%`,
                        top: `${pos.y}%`
                      };

                      const isSelected = selectedWardleyNodeId === node.id;
                      const isDragging = draggingNodeId === node.id;

                      return (
                        <button
                          key={node.id}
                          onPointerDown={(e) => handlePointerDown(node.id, e)}
                          onPointerMove={(e) => handlePointerMove(node.id, e)}
                          onPointerUp={(e) => handlePointerUp(node.id, e)}
                          style={style}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[9px] font-black shadow-lg transition-all select-none ${
                            isDragging
                              ? "bg-purple-500 text-white border-2 border-yellow-400 cursor-grabbing z-50 scale-110 shadow-2xl shadow-purple-500/30"
                              : isSelected 
                                ? "bg-purple-600 text-white border-2 border-purple-400 cursor-grab z-20 scale-105" 
                                : "bg-slate-900 text-slate-300 border border-slate-800/80 cursor-grab hover:border-slate-500 z-10"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span>{node.name}</span>
                            <span className="text-[7.5px] text-slate-500 font-normal uppercase font-mono mt-0.5">{node.type}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected Node Metadata drawer */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between h-[480px]">
                  {selectedWardleyNodeId ? (() => {
                    const node = nodes.find(n => n.id === selectedWardleyNodeId);
                    if (!node) return null;

                    // Find connected edges
                    const nodeEdges = edges.filter(e => e.sourceId === node.id || e.targetId === node.id);

                    return (
                      <div className="space-y-4 flex flex-col h-full justify-between font-sans">
                        <div className="space-y-3">
                          <div className="border-b border-slate-800 pb-2">
                            <span className="text-[9px] text-purple-400 font-extrabold uppercase tracking-widest block">{node.type}</span>
                            <h4 className="text-sm font-bold text-white">{node.name}</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{node.description}</p>
                          </div>

                          {/* Node Properties */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1.5 text-slate-400">
                            <div className="flex justify-between">
                              <span>Evolutionstakt (Tempo):</span>
                              <span className="font-mono text-purple-400 font-bold">&tau; = {node.tempo || 12} m&aring;nader</span>
                            </div>
                            {node.criticality && (
                              <div className="flex justify-between">
                                <span>Verksamhetskritikalitet:</span>
                                <span className="font-bold text-white">{node.criticality}</span>
                              </div>
                            )}
                            {node.techDebt && (
                              <div className="flex justify-between">
                                <span>Teknisk Skuld:</span>
                                <span className="font-bold text-slate-300">{node.techDebt}</span>
                              </div>
                            )}
                          </div>

                          {/* Node Connections & Shearing details */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Kopplingar & Skjuvning i grafen</span>
                            <div className="max-h-[140px] overflow-y-auto space-y-1">
                              {nodeEdges.length === 0 ? (
                                <div className="text-[11px] text-slate-500 text-center py-4">Inga aktiva relationer i grafen</div>
                              ) : (
                                nodeEdges.map((edge: any) => {
                                  const isSource = edge.sourceId === node.id;
                                  const partnerId = isSource ? edge.targetId : edge.sourceId;
                                  const partner = nodes.find(n => n.id === partnerId);
                                  if (!partner) return null;

                                  // Shearing calculation
                                  const src = isSource ? node : partner;
                                  const tgt = isSource ? partner : node;
                                  const delta = Math.abs(Math.log10(src.tempo || 12) - Math.log10(tgt.tempo || 12));
                                  const shear = Number(((edge.coupling || 0.1) * delta).toFixed(2));
                                  const isCritical = shear > 0.35;

                                  return (
                                    <div key={edge.id} className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center text-[10px]">
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-slate-300">{partner.name}</span>
                                        <span className="text-[9px] text-slate-500 uppercase font-mono">{edge.type}</span>
                                      </div>
                                      <div className="text-right flex flex-col">
                                        <span className={`font-mono font-bold ${isCritical ? "text-rose-400" : "text-emerald-400"}`}>S = {shear}</span>
                                        <span className="text-[8px] text-slate-500 font-mono">K = {edge.coupling || 0.1}</span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab("catalog");
                            setCatalogViewMode("edges");
                            setNewEdgeSourceId(node.id);
                          }}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs transition-colors"
                        >
                          Skapa relation för denna nod
                        </button>
                      </div>
                    );
                  })() : (
                    <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-3 h-full">
                      <MapIcon className="w-10 h-10 text-slate-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Ingen tillgång vald</p>
                        <p className="text-[10px] text-slate-600 mt-1 max-w-[180px] mx-auto">Klicka på en komponent i diagrammet för att inspektera dess evolutionära klyftor, relationer och eventuella skjuvningstryck.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LIVSCYKEL & PORTFÖLJ */}
          {activeTab === "lifecycle" && (
            <div className="space-y-6 animate-fadeIn">
              {selectedQuestion === "A1-13" && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-center bg-slate-900/40 pb-2 border-b border-slate-800/50">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Teknisk skuld vs. Verksamhetskritikalitet</h3>
                    <span className="text-xs text-slate-500 font-mono">Metod: Heuristik</span>
                  </div>

                  {/* Matrix visualization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-widest block mb-4 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> KRITISK OUTRETT RISKZONE
                      </span>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto">
                        {nodes.filter(n => n.type === "Applikation" && (n.techDebt === "Critical" || n.techDebt === "High")).map(sys => (
                          <div key={sys.id} className="bg-slate-900 p-2.5 rounded-lg border border-rose-500/20 flex justify-between items-center">
                            <span className="text-xs font-bold text-white">{sys.name}</span>
                            <div className="flex gap-2">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                sys.criticality === "Critical" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                              }`}>{sys.criticality} Krit.</span>
                              <span className="text-[9px] bg-red-500/10 text-red-400 font-bold px-1.5 py-0.5 rounded">{sys.techDebt} Skuld</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Top-Left: High Debt / Low Criticality (TOLERATE) */}
                      <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOLERATE (Hög skuld / Låg rel.)</span>
                        <div className="flex flex-wrap gap-1 mt-1 max-h-[50px] overflow-y-auto">
                          {nodes.filter(n => n.type === "Applikation" && (n.techDebt === "High" || n.techDebt === "Critical") && n.criticality !== "Critical" && n.criticality !== "High").map(sys => (
                            <span key={sys.id} className="bg-slate-800 text-[9px] font-medium px-1.5 py-0.5 rounded text-slate-300">{sys.name}</span>
                          ))}
                        </div>
                      </div>

                      {/* Top-Right: High Debt / High Criticality (ELIMINATE) */}
                      <div className="bg-rose-500/5 rounded-lg p-2.5 border border-rose-500/25 flex flex-col justify-between">
                        <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">ELIMINATE / MIGRATE</span>
                        <div className="flex flex-wrap gap-1 mt-1 max-h-[50px] overflow-y-auto">
                          {nodes.filter(n => n.type === "Applikation" && (n.techDebt === "High" || n.techDebt === "Critical") && (n.criticality === "Critical" || n.criticality === "High")).map(sys => (
                            <span key={sys.id} className="bg-rose-600/20 text-rose-200 text-[9px] font-medium px-1.5 py-0.5 rounded border border-rose-500/30">{sys.name}</span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom-Left: Low Debt / Low Criticality (Tolerate) */}
                      <div className="bg-slate-950/20 rounded-lg p-2.5 border border-slate-800/50 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">TOLERATE</span>
                        <div className="flex flex-wrap gap-1 mt-1 max-h-[50px] overflow-y-auto">
                          {nodes.filter(n => n.type === "Applikation" && n.techDebt === "Low" && n.criticality !== "Critical" && n.criticality !== "High").map(sys => (
                            <span key={sys.id} className="bg-slate-900 text-[9px] text-slate-400 px-1.5 py-0.5 rounded">{sys.name}</span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom-Right: Low Debt / High Criticality (INVEST) */}
                      <div className="bg-purple-500/5 rounded-lg p-2.5 border border-purple-500/25 flex flex-col justify-between">
                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">INVEST / GROW</span>
                        <div className="flex flex-wrap gap-1 mt-1 max-h-[50px] overflow-y-auto">
                          {nodes.filter(n => n.type === "Applikation" && n.techDebt === "Low" && (n.criticality === "Critical" || n.criticality === "High")).map(sys => (
                            <span key={sys.id} className="bg-purple-600/20 text-purple-200 text-[9px] font-medium px-1.5 py-0.5 rounded border border-purple-500/30">{sys.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedQuestion === "A1-02" && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-6">
                  {/* Title & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div>
                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">Målarkitektur & Evolution</span>
                      <h3 className="text-base font-extrabold text-white">Livscykel & Portföljåtgärder (TIME)</h3>
                      <p className="text-xs text-slate-400 mt-1">Styr och visualisera livscykel-övergångar från nuvarande till framtida målarkitektur.</p>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 select-none">
                      <button
                        onClick={() => setLifecycleViewMode("board")}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                          lifecycleViewMode === "board"
                            ? "bg-purple-600 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span>Kanban-gruppering</span>
                      </button>
                      <button
                        onClick={() => setLifecycleViewMode("timeline")}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                          lifecycleViewMode === "timeline"
                            ? "bg-purple-600 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>TIME-Tidslinje</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter bar */}
                  <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mr-2 tracking-wider">Filtrera på TIME-åtgärd:</span>
                    {["ALL", "Tolerate", "Invest", "Migrate", "Eliminate"].map(act => (
                      <button
                        key={act}
                        onClick={() => setTimeFilter(act)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          timeFilter === act
                            ? "bg-purple-500/15 border-purple-500 text-purple-200"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        {act === "ALL" ? "Visa alla" : act}
                      </button>
                    ))}
                  </div>

                  {/* Vyer */}
                  {lifecycleViewMode === "board" ? (
                    /* board VIEW (3 swimlanes for ArchitectureState) */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* AS-IS COLUMN */}
                      <div className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-4 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">As-Is (Befintligt Bestånd)</span>
                          </div>
                          <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                            {nodes.filter(n => (n.type === "Applikation" || n.type === "System") && (n.state || "AsIs") === "AsIs" && (timeFilter === "ALL" || n.action === timeFilter)).length}
                          </span>
                        </div>
                        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                          {nodes
                            .filter(n => (n.type === "Applikation" || n.type === "System") && (n.state || "AsIs") === "AsIs" && (timeFilter === "ALL" || n.action === timeFilter))
                            .map(n => (
                              <div key={n.id} className="bg-slate-900/80 hover:bg-slate-900 p-3.5 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="text-xs font-bold text-white">{n.name}</h5>
                                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{n.type}</span>
                                  </div>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                                    n.action === "Eliminate" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                    n.action === "Migrate" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                    n.action === "Invest" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                  }`}>
                                    {n.action || "Tolerate"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{n.description}</p>
                                <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold text-slate-500">
                                  {n.criticality && (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400">Crit: {n.criticality}</span>
                                  )}
                                  {n.techDebt && (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400">Skuld: {n.techDebt}</span>
                                  )}
                                  {n.tempo && (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400 font-mono">&tau;: {n.tempo}m</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          {nodes.filter(n => (n.type === "Applikation" || n.type === "System") && (n.state || "AsIs") === "AsIs" && (timeFilter === "ALL" || n.action === timeFilter)).length === 0 && (
                            <div className="text-center py-8 text-slate-600 text-[11px] italic">Inga tillgångar i denna fas matchar filtret.</div>
                          )}
                        </div>
                      </div>

                      {/* TRANSITION COLUMN */}
                      <div className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-4 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Transition (Övergångsfas)</span>
                          </div>
                          <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                            {nodes.filter(n => (n.type === "Applikation" || n.type === "System") && n.state === "Transition" && (timeFilter === "ALL" || n.action === timeFilter)).length}
                          </span>
                        </div>
                        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                          {nodes
                            .filter(n => (n.type === "Applikation" || n.type === "System") && n.state === "Transition" && (timeFilter === "ALL" || n.action === timeFilter))
                            .map(n => (
                              <div key={n.id} className="bg-slate-900/80 hover:bg-slate-900 p-3.5 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="text-xs font-bold text-white">{n.name}</h5>
                                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{n.type}</span>
                                  </div>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                                    n.action === "Eliminate" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                    n.action === "Migrate" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                    n.action === "Invest" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                  }`}>
                                    {n.action || "Tolerate"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{n.description}</p>
                                <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold text-slate-500">
                                  {n.criticality && (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400">Crit: {n.criticality}</span>
                                  )}
                                  {n.techDebt && (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400">Skuld: {n.techDebt}</span>
                                  )}
                                  {n.tempo && (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400 font-mono">&tau;: {n.tempo}m</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          {nodes.filter(n => (n.type === "Applikation" || n.type === "System") && n.state === "Transition" && (timeFilter === "ALL" || n.action === timeFilter)).length === 0 && (
                            <div className="text-center py-8 text-slate-600 text-[11px] italic">Inga tillgångar i denna fas matchar filtret.</div>
                          )}
                        </div>
                      </div>

                      {/* TARGET COLUMN */}
                      <div className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-4 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target (Målarkitektur)</span>
                          </div>
                          <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                            {nodes.filter(n => (n.type === "Applikation" || n.type === "System") && n.state === "Target" && (timeFilter === "ALL" || n.action === timeFilter)).length}
                          </span>
                        </div>
                        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                          {nodes
                            .filter(n => (n.type === "Applikation" || n.type === "System") && n.state === "Target" && (timeFilter === "ALL" || n.action === timeFilter))
                            .map(n => (
                              <div key={n.id} className="bg-slate-900/80 hover:bg-slate-900 p-3.5 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="text-xs font-bold text-white">{n.name}</h5>
                                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{n.type}</span>
                                  </div>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                                    n.action === "Eliminate" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                    n.action === "Migrate" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                    n.action === "Invest" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                  }`}>
                                    {n.action || "Tolerate"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{n.description}</p>
                                <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold text-slate-500">
                                  {n.criticality && (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400">Crit: {n.criticality}</span>
                                  )}
                                  {n.techDebt && (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400">Skuld: {n.techDebt}</span>
                                  )}
                                  {n.tempo && (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400 font-mono">&tau;: {n.tempo}m</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          {nodes.filter(n => (n.type === "Applikation" || n.type === "System") && n.state === "Target" && (timeFilter === "ALL" || n.action === timeFilter)).length === 0 && (
                            <div className="text-center py-8 text-slate-600 text-[11px] italic">Inga tillgångar i denna fas matchar filtret.</div>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* timeline VIEW (Gantt-inspired action timeline) */
                    <div className="space-y-4 animate-fadeIn">
                      
                      {/* Timeline Player Scrubber Control Bar */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center gap-4 justify-between select-none">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`p-2.5 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                              isPlaying 
                                ? "bg-amber-600 hover:bg-amber-500 shadow shadow-amber-600/10" 
                                : "bg-purple-600 hover:bg-purple-500 shadow shadow-purple-600/10"
                            }`}
                            title={isPlaying ? "Pausa animation" : "Spela tidslinje-roadmap"}
                          >
                            {isPlaying ? (
                              <>
                                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                                  <rect x="5" y="4" width="4" height="16" rx="1" />
                                  <rect x="15" y="4" width="4" height="16" rx="1" />
                                </svg>
                                <span className="text-[10px] uppercase font-extrabold tracking-wider hidden sm:inline">Pausa</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 text-white" />
                                <span className="text-[10px] uppercase font-extrabold tracking-wider hidden sm:inline">Spela</span>
                              </>
                            )}
                          </button>

                          <div className="text-left">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-mono block">Aktivt år i Simulering</span>
                            <span className="text-sm font-black text-purple-400 font-mono tracking-wide">{currentYear}</span>
                          </div>
                        </div>

                        {/* Slider bar */}
                        <div className="flex-1 w-full flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500 font-mono">2026</span>
                          <input
                            type="range"
                            min="2026"
                            max="2029"
                            step="1"
                            value={currentYear}
                            onChange={(e) => {
                              setCurrentYear(Number(e.target.value));
                              setIsPlaying(false);
                            }}
                            className="w-full accent-purple-600 bg-slate-900 rounded-lg h-2 cursor-pointer focus:outline-none"
                          />
                          <span className="text-[10px] font-bold text-slate-500 font-mono">2029+</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentYear(2026);
                            setIsPlaying(false);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-400 rounded-lg border border-slate-800 transition-colors"
                        >
                          Återställ
                        </button>
                      </div>

                      {/* Timeline Header Grid */}
                      <div className="grid grid-cols-12 gap-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-800 pb-2 pt-2">
                        <div className="col-span-4 text-left pl-3">Arkitektur-Asset (System / App)</div>
                        <div className="col-span-2 border-l border-slate-800/50">2026</div>
                        <div className="col-span-2 border-l border-slate-800/50">2027</div>
                        <div className="col-span-2 border-l border-slate-800/50">2028</div>
                        <div className="col-span-2 border-l border-slate-800/50">2029+</div>
                      </div>

                      {/* Timeline Rows */}
                      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                        {nodes
                          .filter(n => (n.type === "Applikation" || n.type === "System") && (timeFilter === "ALL" || n.action === timeFilter))
                          .map(n => {
                            const action = n.action || "Tolerate";
                            const state = n.state || "AsIs";

                            // Dynamic calculations based on currentYear and asset lifecycle metadata
                            let barStyle = "";
                            let phaseLabel = "";
                            let barColorClass = "";
                            let opacityClass = "opacity-100";

                            if (state === "Target") {
                              if (currentYear === 2026) {
                                barStyle = "col-start-1 col-span-8";
                                phaseLabel = "Planerad nyetablering (Målbild)";
                                barColorClass = "bg-slate-950/20 text-slate-600 border border-slate-900/50 border-dashed italic text-center";
                                opacityClass = "opacity-30";
                              } else if (currentYear === 2027) {
                                barStyle = "col-start-3 col-span-2";
                                phaseLabel = "Implementation & Driftsättning";
                                barColorClass = "bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse";
                                opacityClass = "opacity-100";
                              } else {
                                barStyle = "col-start-5 col-span-4";
                                phaseLabel = "MÅLARKITEKTUR AKTIV (Säkrad med API-kontrakt)";
                                barColorClass = "bg-gradient-to-r from-emerald-600 to-teal-500 text-emerald-100 shadow shadow-emerald-950/20 border border-emerald-500/20";
                                opacityClass = "opacity-100";
                              }
                            } else if (action === "Eliminate") {
                              if (currentYear === 2026) {
                                barStyle = "col-start-1 col-span-2";
                                phaseLabel = "Aktivt driftsläge (Hög skuld)";
                                barColorClass = "bg-slate-800 text-slate-300 border border-slate-700";
                                opacityClass = "opacity-100";
                              } else if (currentYear === 2027) {
                                barStyle = "col-start-3 col-span-2";
                                phaseLabel = "Avveckling pågår (COBOL)";
                                barColorClass = "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse";
                                opacityClass = "opacity-100";
                              } else {
                                barStyle = "col-start-1 col-span-8";
                                phaseLabel = "NEDSTÄNGD & AVVECKLAD (Retired)";
                                barColorClass = "bg-slate-950 text-slate-600 border border-slate-900/50 italic text-center font-normal";
                                opacityClass = "opacity-40";
                              }
                            } else if (action === "Migrate") {
                              if (currentYear === 2026) {
                                barStyle = "col-start-1 col-span-2";
                                phaseLabel = "Aktivt driftsläge (Migrering planerad)";
                                barColorClass = "bg-slate-800 text-slate-300 border border-slate-700";
                                opacityClass = "opacity-100";
                              } else if (currentYear === 2027) {
                                barStyle = "col-start-3 col-span-2";
                                phaseLabel = "Övergångsfas / Molnmigrering";
                                barColorClass = "bg-amber-600/25 text-amber-300 border border-amber-500/20 animate-pulse";
                                opacityClass = "opacity-100";
                              } else {
                                barStyle = "col-start-1 col-span-8";
                                phaseLabel = "MIGRERAD / SYSTEMET AVSTÄNGT";
                                barColorClass = "bg-slate-950 text-slate-600 border border-slate-900/50 italic text-center font-normal";
                                opacityClass = "opacity-40";
                              }
                            } else if (action === "Tolerate") {
                              barStyle = "col-start-1 col-span-8";
                              phaseLabel = "Tolererat driftsläge (Stabil förvaltning)";
                              barColorClass = "bg-slate-800/80 text-slate-300 border border-slate-700/50";
                              opacityClass = "opacity-80";
                            } else if (action === "Invest") {
                              barStyle = "col-start-1 col-span-8";
                              phaseLabel = "Strategisk Investering (Kontinuerlig leverans)";
                              barColorClass = "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow shadow-purple-950/20 border border-purple-500/20";
                              opacityClass = "opacity-100";
                            }

                            return (
                              <div key={n.id} className={`grid grid-cols-12 gap-2 items-center bg-slate-950/30 hover:bg-slate-900/40 p-2 rounded-lg border border-slate-800/40 hover:border-slate-800 transition-all ${opacityClass}`}>
                                <div className="col-span-4 pl-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white truncate">{n.name}</span>
                                    <span className="text-[8px] font-bold bg-slate-900 border border-slate-800 text-slate-500 px-1 py-0.5 rounded font-mono">{n.type.substring(0, 3)}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 flex gap-2 mt-0.5">
                                    <span>Skuld: {n.techDebt || "Low"}</span>
                                    <span>&bull;</span>
                                    <span>{state}</span>
                                  </span>
                                </div>

                                <div className="col-span-8 grid grid-cols-8 gap-1 h-7 relative items-center">
                                  {/* Grid background markers */}
                                  <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
                                    <div className="border-r border-slate-800/40 h-full col-span-1"></div>
                                    <div className="border-r border-slate-800/40 h-full col-span-1"></div>
                                    <div className="border-r border-slate-800/40 h-full col-span-1"></div>
                                    <div className="h-full col-span-1"></div>
                                  </div>

                                  {/* Timeline bar */}
                                  <div className={`h-6 rounded-md flex items-center justify-between px-2 text-[9px] font-bold tracking-wide leading-none ${barStyle} ${barColorClass}`}>
                                    <span className="truncate">{phaseLabel}</span>
                                    <span className="text-[8px] opacity-75 font-mono uppercase tracking-wider">{action}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        {nodes.filter(n => (n.type === "Applikation" || n.type === "System") && (timeFilter === "ALL" || n.action === timeFilter)).length === 0 && (
                          <div className="text-center py-12 text-slate-600 text-[11px] italic">Inga tillgångar matchar filtret.</div>
                        )}
                      </div>

                      {/* Info footer */}
                      <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-800/50 flex items-center gap-3 text-[11px] text-slate-400">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          <strong>Målsättning (Target Architecture):</strong> Denna tidslinje är automatgenererad baserad på dekopplade dataegenskaper (TIME-åtgärder och Arkitektur-status). När du ändrar en tillgångs status i CRUD-katalogen uppdateras tidslinjen omedelbart!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSITIONER & SCENARIER */}
          {activeTab === "scenarios" && activeScenario && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Scenario dropdown selection */}
              {scenariosList.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Välj utrednings-scenario:</span>
                    <select
                      value={selectedScenarioId}
                      onChange={e => setSelectedScenarioId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-purple-500 font-bold"
                    >
                      {scenariosList.map((sc: any) => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Totalt {scenariosList.length} utredningsscenarier laddade från databasen</span>
                </div>
              )}
              
              {/* Scenario details */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">Aktivt Planeringsutrymme (Scenario)</span>
                    <h3 className="text-base font-extrabold text-white">{activeScenario.name}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    activeScenario.status === "Beslutat"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                  }`}>
                    {activeScenario.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{activeScenario.background}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>Berörda system i beståndet:</span>
                  {activeScenario.affectedSystems.map((sys: string) => (
                    <span key={sys} className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 font-sans">{sys}</span>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Alternative Jämförelsematris */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Columns className="w-5 h-5 text-purple-400" />
                    <h4 className="text-sm font-semibold text-slate-200">Parallell Jämförelsematris (Kandidater på bordet)</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Visningsparadigmer: Grenar på ett träd (S2)</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-3 w-1/4">Beslutskriterier (Kravbild)</th>
                        {activeScenario.decisions[0].alternatives.map((alt: any) => (
                          <th key={alt.id} className="py-3 px-4 w-1/4 relative bg-slate-950/20">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-extrabold text-white">{alt.name.split(":")[0]}</span>
                              <span className="text-[10px] font-normal text-slate-400 line-clamp-1">{alt.name.split(":")[1]}</span>
                              <div className="flex gap-2.5 items-center mt-1">
                                {alt.isRecommended && (
                                  <span className="bg-purple-500/10 text-purple-400 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/20 font-sans">Rekommenderad</span>
                                )}
                                {alt.isApproved && (
                                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/20 font-sans flex items-center gap-0.5 font-bold">
                                    <Check className="w-3 h-3" /> BESLUTAT & INSTÄLLT
                                  </span>
                                )}
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-800">
                      {activeScenario.decisions[0].criteria.map((crit: any) => (
                        <tr key={crit.key} className="hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-3 font-semibold text-slate-300">{crit.name}</td>
                          {activeScenario.decisions[0].alternatives.map((alt: any) => {
                            const bedomning = alt.bedomningar.find((b: any) => b.criterionKey === crit.key);
                            return (
                              <td key={alt.id} className="py-4 px-4 bg-slate-950/10 group relative">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star 
                                        key={star} 
                                        className={`w-3.5 h-3.5 ${
                                          star <= (bedomning?.score || 0) 
                                            ? "fill-current text-yellow-500" 
                                            : "text-slate-700"
                                        }`} 
                                      />
                                    ))}
                                    <span className="ml-1 text-[10px] text-slate-500 font-mono">({bedomning?.score || 0}/5)</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 italic leading-relaxed">{bedomning?.motivering}</p>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      
                      {/* Interactive Decide Action row */}
                      {activeScenario.status !== "Beslutat" && (
                        <tr className="bg-slate-950/30">
                          <td className="py-4 px-3 text-slate-400 font-mono">Vägvalsåtgärd</td>
                          {activeScenario.decisions[0].alternatives.map((alt: any) => (
                            <td key={alt.id} className="py-4 px-4 bg-slate-950/20">
                              <button
                                onClick={() => handleCommitDecision(alt.id)}
                                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                  alt.isRecommended
                                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/15"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                                }`}
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Besluta denna väg</span>
                                </button>
                                </td>
                                ))}
                                </tr>
                                )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ==================== OMNIPRESENT AI COPILOT SIDEBAR ==================== */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shadow-sm">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Arkitektur-Copilot
            </span>
            <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-yellow-400" /> Hybrid Mode
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {chatHistory.map((chat, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border ${
                  chat.sender === "user" 
                    ? "bg-slate-950 border-slate-800 ml-6 text-slate-200" 
                    : "bg-purple-950/15 border-purple-500/20 mr-6 text-slate-300"
                }`}
              >
                <div className="font-bold mb-1 text-[10px] text-slate-500">
                  {chat.sender === "user" ? "Du" : "AURA AI AGENT"}
                </div>
                <div className="leading-relaxed">{chat.text}</div>
                {chat.query && (
                  <pre className="mt-2 p-2 bg-slate-950/90 rounded border border-slate-800 font-mono text-[9px] text-emerald-400 overflow-x-auto">
                    {chat.query}
                  </pre>
                )}
              </div>
            ))}
          </div>

          {/* Preset AI Action Triggers */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-1.5">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Snabbfrågor till AI-Agenten</div>
            
            <button 
              onClick={() => handlePresetQuery(
                "Identifiera rödskjuvade sömmar (S > S_max).",
                "MATCH (a:Applikation)-[r:INTEGRATES]->(b:Applikation)\nWITH a, b, r, abs(log10(a.tempo) - log10(b.tempo)) AS delta\nWITH a, b, r, delta, r.coupling * delta AS shear\nWHERE shear > 0.35\nRETURN a.name, b.name, delta, r.coupling, shear"
              )}
              className="w-full text-left bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded text-[10px] font-medium border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>Sök efter kritiska skjuvsömmar?</span>
            </button>

            <button 
              onClick={() => handlePresetQuery(
                "Sök efter dolda bimodala system (Klyvningskandidater).",
                "MATCH (a:Applikation) WHERE a.name CONTAINS 'Billing' RETURN a.name, 'Bimodal (vecka vs årsvisa ändringar) -> Rekommenderat: Klyv nod'"
              )}
              className="w-full text-left bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded text-[10px] font-medium border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Sök efter klyvningskandidater?</span>
            </button>
          </div>

          {/* Message Input */}
          <form 
            onSubmit={e => {
              e.preventDefault();
              if (!copilotQuery.trim()) return;
              handlePresetQuery(copilotQuery, "MATCH (n) WHERE n.name CONTAINS \"" + copilotQuery + "\" RETURN n LIMIT 10");
              setCopilotQuery("");
            }}
            className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2"
          >
            <input 
              type="text" 
              placeholder="Skriv din fråga..." 
              value={copilotQuery}
              onChange={e => setCopilotQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-purple-500 placeholder-slate-500"
            />
            <button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-md shadow-purple-600/15"
            >
              <Play className="w-3 h-3 fill-current text-white" />
            </button>
          </form>
        </aside>

      </div>
    </div>
  );
}
