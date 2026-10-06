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
