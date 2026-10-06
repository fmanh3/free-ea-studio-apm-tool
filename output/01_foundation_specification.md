# Enterprise Architecture Management Tool - Foundation Specification

## 1. Executive Summary & Objective
As a Chief Architect, the goal is to build a purpose-built Enterprise Architecture (EA) tool from scratch. This tool supports Enterprise and Chief Architects in structuring, analyzing, and governing the IT landscape of the enterprise. 

A core tenet of this system is that **AI Agents are first-class citizens**, working alongside humans in a highly structured, semantic data environment. The tool embraces a **Question-Driven Paradigm**, moving away from static tables and list views to dynamic, graph-based answers (inspired by modern EA tools like Ardoq).

A key learning from the Apm-Lens implementation is that **System is not the sole navet (hub) of EAM**. To prevent semantic drift and duplication, the tool decouples technical, commercial, and business dimensions:
*   **Verksamhetsprodukt (Business Product):** The primary logical layer mapping to business capabilities.
*   **Applikation (Application):** The concrete deployable technical asset (code, services, integrations).
*   **Produkt (Commercial Product):** Comprises ITAM/SAM assets (vendors, licenses, SLAs).
*   **System (SystemEntity):** Reduced to a voluntary technical grouping/view where complex technical decomposition is needed.

## 2. Architectural Paradigm & Inspiration (Ardoq-Inspired)
Instead of forcing users to browse massive lists, the UI and API are designed around **Perspectives and Questions**. The data is heavily abstracted using **Capabilities** to decouple the *What* (Business Need) from the *How* (IT Implementation). 

### 2.1 Capability-Led Abstraction
The system utilizes a dual capability model:
1. **Verksamhetsförmågor (Business Capabilities):** Hierarchical mapping of what the business does, modeled as **Verksamhetsprodukter** to provide clear ownership and roadmaps.
2. **IT-Plattformsförmågor (Platform Capabilities):** The underlying foundational technology capabilities that applications rely upon.

### 2.2 Question-Driven Views
The user interface presents "Dashboards of Questions", categorizing insights into six primary domains:
*   **Livscykel och portfölj (Lifecycle & Portfolio):** E.g., "Vilka system har hög teknisk skuld och hög verksamhetsrelevans?" (Cross-view of TechDebt vs. Criticality). Using the TIME model (Tolerate, Invest, Migrate, Eliminate).
*   **Transitioner & Scenarier (Transitions & Parallel Alternatives):** E.g., "Vilka parallella lösningsförslag (scenarier) har vi under utredning?" Enabling side-by-side comparison of different candidates (branches of a tree) before committing to a target architecture.
*   **Beroenden och spridning (Dependencies & Blast Radius):** E.g., "Vad går sönder om jag rör det här?" (Impact analysis across the polymorph integration graph).
*   **Förmåga och nytta (Capability & Value):** E.g., "Finns redundans, dvs. finns fler lösningar som stödjer samma förmåga?" (Overlap analysis).
*   **Information och klassning (Information & Data Security):** E.g., "Vilket system är master för denna information, och hanterar den personuppgifter?"
*   **Ägarskap och ansvar (Ownership & Responsibility):** E.g., "Vem bär den tekniska skulden? Vilka system saknar en tilldelad ägare?"

## 3. Parallel Transition Alternatives (Scenarioplanering)
One of the most critical requirements for enterprise architects is the ability to evaluate **multiple parallel options simultaneously** during the planning phase.
In standard CMDBs like Jira Assets, the transition target (TransitionTarget) is a static 1:1 relationship ("System A is replaced by System B"). This is too restrictive when deciding *how* to replace a system (e.g., "Should we upgrade to S/4, migrate to multiple microservices, or buy an external SaaS?").

The free-apm-tool incorporates a first-class **Scenario Planning** (Transitionsförslag) engine:
*   **Scenario (Omställning):** Represents a migration campaign or project (e.g., "SAP Replacement Campaign").
*   **Decision (Beslut / ADR):** Represents an architectural choice within the scenario.
*   **Alternative (Alternativ):** Multiple parallel candidates living simultaneously ("branches of a tree").
*   **Assessment (Bedömning):** Multi-criteria evaluations of each alternative (scoring 1-5, motivering) against criteria (such as Business Capabilities, GDPR compliance, development cost, and operational complexity) before deciding on the final path.

Once an alternative is selected ("Beslutat"), the tool automatically propagates the changes into the live target architecture graph, setting the TransitionTarget and setting states to Target or Transition accordingly.

## 4. Target Architecture (GCP-Native, Graph-First)
To support deep dependency mapping and blast radius calculations across these questions, we employ a **Graph-First Architecture**.

### 4.1 Backend & Infrastructure
*   **Compute:** **Google Cloud Run** for stateless microservices (API layer).
*   **Database (Primary):** A Graph Database (e.g., **Neo4j AuraDB on GCP** or **Apache TinkerPop on Cloud Bigtable**). Graph structure inherently maps EA relationships.
*   **Database (Document/Search):** **GCP Firestore** for fast UI document retrieval and full-text search.
*   **Event Bus:** **Google Cloud Pub/Sub** for asynchronous events (triggering background agents and rule engines upon data mutation).

## 5. Automation & AI Agent Patterns (Hybrid Model)
*   **Deterministic Rule Engine (Heuristics):** Calculates basic "Tech Debt" scores, flags missing owners (placeholders), and enforces data validation rules upon data mutation (event-driven).
*   **Background / Asynchronous AI Agents:** Analyzes Git repos to infer Applikation relationships, generate architectural transition summaries, and identify overlapping capabilities across silos.
*   **Real-time Architect Copilot:** Assists in querying the graph via Natural Language. Translates business questions (e.g., "Vilka integrationer påverkas om System X tas ur drift?") into deep graph traversal queries (Cypher/Gremlin).

## 6. Next Steps (Implementation Phase)
1. Initialize the project repository and export this specification to output/.
2. Model the exact Graph Schema (incorporating Scenario, Decision, Alternative, and Assessment nodes).
3. Draft the API structure optimized for dynamic "Question" execution (Graph traversals).
4. Build the core backend stub and GCP CI/CD deployment pipelines.
5. Scaffold the React Frontend centered around the "Question-Driven View" and Scenario Comparison matrix.
