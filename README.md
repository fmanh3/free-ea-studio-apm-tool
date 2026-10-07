# free-apm-tool (v0.1-Prod)

> **Free Enterprise Architecture (EA) & Application Portfolio Management (APM) Tool**
> An advanced, modern, high-fidelity collaborative whiteboard (EA Studio) and a dynamic portfolio lifecycle planner (APM Lens). Powered by a unified Node.js/Express backend, GCP Cloud Run, Firestore, Neo4j, and Yjs WebSockets.

---

## 🚀 System Roadmap (Vår TODO-lista)

- [ ] 🤖 **Fas 5: Gemini LLM RAG-Säkring i Produktion**
  * *Mål:* Ansluta en skarp `GEMINI_API_KEY` miljövariabel i GCP Cloud Run för att aktivera den fulla, oinskränkta generativa AI-analysen. Detta låter chefsarkitekter ställa komplexa, djupt förankrade arkitekturfrågor direkt mot den faktiska Neo4j-grafen.
- [ ] 📈 **Fas 6: Interaktiv Tidslinje-Roadmap-Spelare**
  * *Mål:* Skapa en interaktiv "Play"-knapp på TIME-tidslinjen i APM Lens. Denna ska animera hur system avvecklas, ersätts och flyttas asynkront under åren 2026–2029 baserat på de beslut och ADR:er som fattats i Scenariomatrisen.
- [ ] 📦 **Fas 7: Storskalig Data-Import & Excel Ingestion**
  * *Mål:* Utöka Excel-importören så att den tillåter storskalig synkronisering av befintliga systemregister (hundratals noder och relationer) direkt in i Neo4j-databasen, komplett med automatisk tempo- och kritikalitetsklassning.

---

## 🤖 Meddelande till framtida AI-agenter (Developer & Agent Guardrails)

Om du är en AI-agent (t.ex. Gemini CLI, Claude Engineer, GitHub Copilot) som har fått i uppdrag att vidareutveckla eller refaktorera denna kodbas, **måste** du strikt hålla dig till följande källkodsregler och tekniska mönster:

1. **Bimodal / Hybrid Safety:**
   * Alla API-endpoints för grafer (noder/edges), whiteboards (tavlor) och mappar (folders) **måste** ha en robust in-memory-fallback integrerad direkt i källkoden. Om GCP Firestore eller Neo4j AuraDB kastar permission- eller anslutningsfel, ska appen logga en varning och **automatiskt failover-växla till in-memory-mocken** istället för att krascha eller returnera HTTP 500.
2. **Yjs State Synchronization & Circular References:**
   * React Flow-noder innehåller dolda, cirkulära DOM-referenser när de renderas eller markeras. Att serialisera dem direkt till Yjs kastar kraschande TypeErrors. Du **måste** alltid använda `sanitizeNodeForYjs` och `sanitizeEdgeForYjs` innan du skriver något till Y.Map (`ynodes`/`yedges`).
3. **Yjs API limiteringar:**
   * Yjs `Y.Map`-objekt har inget stöd för ES6-metoden `.has()`. Medlemskontroller **måste** ske via `.get(key) === undefined` eller genom att läsa av nyckel-arrayer.
4. **Isolering per sida/flik:**
   * Whiteboardens flikar på rittavlan synkas i **sid-isolerade realtidsrum** i WebSocket-skiktet. Rumsnamnet bildas genom `${activeBoardId}-${activePageId}`. Förändringar i flikar får aldrig blöda över till andra flikar.
5. **Filtrering av lokala transaktioner (Preventing Loops):**
   * Yjs-lyssnare i React (`ynodes.observe`) **måste** alltid ignorera lokala transaktioner: `if (event.transaction.local) return;`. Detta förhindrar oändliga beräknings- och ommätningsloopar mellan React Flows inbyggda måttberäknare och Yjs-servern.

---

## 🛠️ Lokal utvecklingsmiljö (Local Development Setup)

### 📦 Förutsättningar
* **Node.js** (v20+ rekommenderas)
* **Docker Desktop** (för container-paketering)
* **Google Chrome** (för headless Puppeteer-tester)

### ⚙️ Steg-för-steg-installation

1. **Klona och ställ dig i katalogen:**
   ```bash
   cd free-apm-tool
   ```

2. **Installera beroenden i backend & frontend:**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

3. **Konfigurera miljövariabler:**
   Skapa en `.env`-fil i `backend/` och lägg in dina anslutningssträngar. Om du vill köra helt offline, lämnar du bara filen tom eller utelämnar den; backenden kommer då automatiskt att växla över till de in-memory-baserade fallback-databaserna!
   ```env
   PORT=8080
   # Valfritt: GCP-anslutning
   GOOGLE_APPLICATION_CREDENTIALS="path/to/gcp-sa-key.json"
   # Valfritt: Neo4j-anslutning
   NEO4J_URI="neo4j+s://<your-auradb-id>.databases.neo4j.io"
   NEO4J_USER="neo4j"
   NEO4J_PASSWORD="<your-password>"
   # Valfritt: Gemini-anslutning
   GEMINI_API_KEY="<your-gemini-api-key>"
   ```

4. **Kompilera frontend:**
   För att Express-servern ska kunna tjäna ut gränssnittet i produktionsläge, måste du bygga frontenden:
   ```bash
   cd frontend
   npm run build
   ```

5. **Starta applikationen lokalt:**
   För att tvinga Express att tjäna ut de färskbyggda frontend-filerna på `http://localhost:8080`, startar du backenden med `NODE_ENV=production`:
   ```bash
   cd ../backend
   NODE_ENV=production npm run start
   ```

---

## 🧪 Automatiserad verifiering (E2E Testing)

Projektet innehåller en fullskalig, automatiserad verifieringssekvens skriven i Puppeteer som loggar in, testar Asset-katalogen, kör en live Blast Radius-traversering, utvärderar scenarios i matrisen och ritar Whiteboard-noder i EA Studio.

För att köra denna automatiska testsekvens:
1. Säkerställ att den lokala Express-servern körs (`http://localhost:8080`).
2. Kör följande kommando i projektets rotkatalog:
   ```bash
   node test_reproduce.js
   ```
3. Testet kommer att spara tre skärmdumpar i din rotkatalog för visuell bekräftelse:
   * `screenshot_blast_radius.png`
   * `screenshot_scenarios_dropdown.png`
   * `screenshot_ea_studio_no_wipe.png`

---

## 🤝 Bidra till projektet (Contribution Guidelines)

1. **Branching:** Skapa alltid en ny branch från `main` för alla nya funktioner eller buggfixar: `git checkout -b feature/ny-funktion`.
2. **Källkodsstandard:** Följ befintliga mönster gällande typ-säkerhet och inline SVG-ikoner för att bypassa OneDrive-synk-problem.
3. **Licensiering:** All källkod bidragits under villkoren för GNU General Public License v3.0 (GPL-3.0).

---

## ⚖️ Licens (License)

Detta projekt är licensierat under **GNU General Public License v3.0** (GPL-3.0). Se bifogad `LICENSE`-fil för fullständiga villkor.
