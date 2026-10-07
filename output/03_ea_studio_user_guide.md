# EA Studio: Struktur & Användarguide (EAM)

Denna guide beskriver hur **EA Studio** är strukturerat och hur du använder dess tredelade hierarki för att effektivt driva, strukturera och persistera arkitektur-workshops i en stor organisation.

---

## 🗂️ 1. Den Tredelade Hierarkin

För att erbjuda både storskalig ordning och maximal flexibilitet under workshops är EA Studio uppbyggt kring en **tredelad hierarki**:

```text
[ WORKSPACE DIRECTORY ]  <--- (Vänster sidomeny: Ditt centrala arkiv i Firestore)
  │
  ├── 📁 Domän: Kundvård (Topp-mapp)
  │     │
  │     ├── 📁 Underdomän: Onboarding (Nästlad undermapp / subfolder)
  │     │     │
  │     │     └── 📄 Board: Kundcenter Onboarding-flow (En specifik rittavla)
  │     │           │
  │     │           { HORISONTELLA FLIKAR } <--- (Direkt ovanpå ritytan)
  │     │           ├── 📑 Flik 1: Strategi & Förmågor (Lila/gula noder)
  │     │           ├── 📑 Flik 2: System & Dataflöden (Blå/gröna noder & streckade pilar)
  │     │           └── 📑 Flik 3: Mötesanteckningar (Sticky Notes/Post-its)
  │     │
  │     └── 📄 Board: Kundportal Release 2027
  │
  └── 📁 Domän: Ekonomi & Finans
```

### 📁 Domäner & Mappar (Folder Directory)
*   **Syfte:** Att dela upp hela organisationens arkitekturlandskap i logiska domäner (t.ex. affärsområden, systemdomäner, eller strategiska initiativ).
*   **Användning:** Mappar kan skapas och flyttas inuti andra mappar i oändliga nivåer (subfolders) för att visualisera underdomäner. Detta styrs enkelt via dra-och-släpp direkt i trädet till vänster eller via dropdown-väljaren i Inspektören till höger.

### 📄 Rittavlor (Boards)
*   **Syfte:** En specifik, samlad whiteboard-yta som motsvarar ett projekt, ett arkitektur-initiativ eller ett workshop-tillfälle (t.ex. *"ERP-Migreringen"*).
*   **Användning:** Skapas inuti mappar och laddas/sparas persistent direkt mot Google Cloud Firestore.

### 📑 Flikar (Sidor / Vyer)
*   **Syfte:** Att dela upp en och samma rittavla (board) i olika perspektiv eller arkitekturlager så att rit-canvasen inte blir överbelastad och svårläst.
*   **Användning:** Ligger direkt ovanpå ritytan. En arkitekt kan dela upp en board i t.ex. flikarna: *1. Strategi (Förmågor)*, *2. Systemintegration* och *3. Datamodell*. Alla flikar sparas och paketeras tillsammans under föräldra-boarden när du klickar på **"Spara tavla"**.

---

## 🎨 2. Rit- & Modelleringsverktyg

### 🛠️ Den Flytande Verktygslådan (Quick Toolbox)
På vänster sida ovanpå rit-canvasen finns färgkodade snabbknappar. Klicka på en ikon för att omedelbart placera elementet mitt på skärmen och skriva dess namn:
*   🟣 **STRAT (Lila):** Förmåga (Capability), Resurs (Resource), Handlingslinje (Action), Värdeström (Value Stream), Drivkraft (Driver), Mål (Goal).
*   🟡 **BA (Gula):** Verksamhetsprocess, Aktör / Roll, Verksamhetstjänst, Gränssnitt / Kanal, Event, Verksamhetsobjekt.
*   🔵 **APP (Blå):** Applikationskomponent, Informationsobjekt.
*   🟢 **TECH (Gröna):** Tekniknod / Server, Infrastrukturtjänst, Databas / Lagring.
*   📝 **SKISS (Gula/Grå):** Sticky Note (Post-it), Grupperingsbox (dashed frame).

### 🔄 Universell Färgkodning (Tints)
Klicka på valfri nod på canvasen. I **Inspektören** till höger kan du välja färg-accent (Gul, Rosa, Blå, Grön, Lila, Neutral) för att visualisera smärtpunkter, flaskhalsar eller framtida mål-strukturer.

### 🔌 Smarta Kopplingar & Pilar (Connectors)
Dra en linje från botten (source) av en nod till toppen (target) på en annan. Klicka på pilen för att öppna **Kopplingsdetaljer** i Inspektören:
*   **Etikett:** Skriv text direkt på pilen (t.ex. *"REST API"*, *"Kafka"*).
*   **Linjestil:** Välj *Heldragen* (synkron), *Streckad* (asynkron) eller *Tjock* (batch/ETL).
*   **Linjefärg:** Sätt färgkodning på anropet (Slate, Lila, Grön, Röd).
*   **Riktning:** Välj Envägs, Omvänd, Dubbelriktad eller Bara streck.

---

## 🔍 3. Semantisk Sökning & Graf-traversering (Smart Graph Search)

Vår datamodell sparar dina noder som semantiska objekt. Detta gör att du kan utföra avancerade arkitektursökningar:
1.  Skriv in namnet på ett system (t.ex. **`CRM Core`**) i den lila sökrutan i sidomenyn till vänster och klicka på Sök.
2.  Systemet söker omedelbart igenom alla dina sparade boards och visar **endast de boards där detta system är inritat** just nu!
3.  Detta ger dig ett omedelbart svar på förändringsanalyser (Blast Radius) på bråkdelen av en sekund!

---

## 📈 4. APM Lens: Tidslinje & Simulering (Fas 6)

I APM Lens-appen kan du under fliken **"Livscykel & Portfölj"** (fråga `A1-02` (TIME)) växla över från Kanban-vyn till **"TIME-Tidslinje"**.

### 🎮 Hur du kör tidslinje-spelaren:
1.  **Kontrollpanelen:** Överst på tidslinjen finns en integrerad tids-scrubber.
2.  **Spela / Pausa:** Klicka på den lila **"Spela"**-knappen för att påbörja simuleringen. Årtalet stegar då automatiskt från 2026 till 2029 var 1.5:e sekund.
3.  **Manuellt sökreglage:** Dra i slider-reglaget för att manuellt frysa tiden vid ett specifikt år och inspektera landskapets status.
4.  **Reaktiva fas-skiftningar under spelningen:**
    *   **2026:** Befintligt bestånd visas. Planerade målsystem är svaga/streckade.
    *   **2027 (Övergångsår):** Avvecklingssystem (`Eliminate`) blir röda och blinkar (*Avveckling pågår*). Flytt-system (`Migrate`) blir gula. Målsystem (`Target`) visar *Implementation pågår*.
    *   **2028-2029:** Avvecklade system försvinner/blir svaga (*Retired*). Målsystemen lyser starkt gröna och markeras som *MÅLARKITEKTUR AKTIV*.

---

## 📦 5. APM Lens: Storskalig Data-Import (Fas 7)

Verktyget stöder storskalig, additiv import av hela ditt arkitektur-register (noder och relationer) via kalkylblad (Excel/ODS).

### 📝 Kalkylbladets struktur:
*   **Noder (Flikar per objekttyp):** Skapa flikar som matchar dina svenska objekttyper (ex: `Applikationer`, `Produkter`, `System`). Kolumner som läses av är: `ID`, `Namn`, `Beskrivning`, `Kritikalitet`, `Tempo (Månader)` och `Teknisk Skuld`.
*   **Relationer (Relations-flik):** Skapa en flik namngiven **`Relationer`** eller **`Edges`** för att länka samman dina noder. Kolumner: `Källa (Source ID)`, `Mål (Target ID)`, `Typ (Type)` (ex. *INTEGRATES*, *REALISES*), `Koppling (Coupling)` (0.05 - 1.0) samt `Kontrakt (Contract)`.

### 🧠 Intelligenta Heuristiker (Automatisk klassning):
Om kalkylbladet saknar metadata fyller importören automatiskt i säkra standardvärden:
*   *Saknat tempo:* Klassas till standarden **`12`** månader.
*   *Saknad kritikalitet:* Klassas till standarden **`Medium`**.
*   *Saknad teknisk skuld:* Klassas till standarden **`Low`**.

### 🔁 Additiv synkronisering (Merge):
När du laddar upp filen skickas datan till vår bulk-import endpoint. Befintliga noder/relationer skrivs över och nya läggs till. **Ingen existerande data raderas**, vilket gör det helt säkert att rita vidare.

---

## 🤖 6. AI-Copilot Chat via Vertex AI (Fas 5)

Vår inbyggda arkitekt-Copilot **AURA** hjälper dig att ställa frågor i fritext direkt mot ditt arkitekturlandskap.

### 🔒 Enterprise-Säkerhet (ADC):
*   Tjänsten använder **Application Default Credentials (ADC)** och körs under det dedikerade service-kontot `free-apm-sa` i Google Cloud. Inga API-nycklar lagras i källkoden.
*   **Lokal utveckling:** Kör `gcloud auth application-default login` lokalt på din maskin för att ansluta säkert mot Vertex AI.

### 💡 Exempel på frågor du kan ställa till AURA:
*   *"Vilka system har det högsta Blast Indexet i vår organisation?"*
*   *"Vilka system bär personuppgifter och påverkas av GDPR?"*
*   *"Kan du hitta kritiska skjuvsömmar i vårt integrationsmönster?"*
*   *"Vad händer om vi avvecklar Gamla Reskontran?"* (Kör en omedelbar Blast Radius-traversering under huven).

