# Enterprise Architecture Graph Metamodel Specification

This document details the Graph Metamodel (Nodes, Edges, Properties) for our Enterprise Architecture Management Tool. The metamodel is designed to answer our **Question-Driven Views** while mirroring the semantics of the source Jira Asset sandbox data model and our advanced local planning capabilities.

---

## 1. Core Principles of the Graph Metamodel
1. **Directional Semantics:** All relationships (edges) are strongly typed and directional. Traversal can be done in both directions to calculate blast radius, overlaps, and redundancy.
2. **Metadata Wrapper (for AI & Trust):** Every single node and edge has auditability metadata.
   * `source_of_truth` (Enum: Pipeline, Manual, Import, Discovery)
   * `evidence_level` (Enum: Observed, Declared, Inferred)
   * `confidence` (Integer: 0-100)
   * `last_verified_at` (DateTime)
3. **Hierarchy Representation:** Self-referential edges (e.g., `PARENT_OF`) represent hierarchical breakdowns (e.g., Capability L1 -> L2 -> L3, Information Overdomain -> Subdomain, Verksamhetsprodukt Overproduct -> Subproduct).

---

## 2. Node Types (Labels)

### 2.1 Verksamhetsprodukt (Business Product)
Represents the primary logical layer of business functionality and capabilities.
*   **Attributes:**
    *   `id`: Unique Identifier
    *   `key`: Human-readable key (e.g., `VP-1.1`)
    *   `name`: String
    *   `description`: Text
    *   `product_owner`: String (Email or Name)
    *   `business_criticality`: Enum (Low, Medium, High, Critical)
    *   `delivery_role`: Enum (Core, Support, Enabler, Governance)
    *   `lifecycle_state`: Enum (Candidate, Active, Consolidating, Retired)

### 2.2 Förmåga (Capability)
Represents the IT-plattform capabilities (ITP) and auxiliary capability structures.
*   **Attributes:**
    *   `id`: Unique Identifier
    *   `key`: Short key (e.g., `CAP-01`)
    *   `name`: String
    *   `capability_type`: Enum (Business, Platform)
    *   `level`: Integer (1, 2, 3)
    *   `maturity_now`: Integer (1-5)
    *   `maturity_target_2028`: Integer (1-5)

### 2.3 System
Represents a technical grouping/view under a commercial Product.
*   **Attributes:**
    *   `id`: Unique Identifier
    *   `key`: Short key (e.g., `SYS-101`)
    *   `name`: String
    *   `description`: Text
    *   `architecture_state`: Enum (AsIs, Transition, Target)
    *   `operational_state`: Enum (Active, Inactive, Closed)
    *   `portfolio_action`: Enum (Tolerate, Invest, Migrate, Eliminate) [TIME model]
    *   `tech_debt_level`: Enum (Low, Medium, High, Critical)
    *   `security_classification`: Enum (Public, Internal, Confidential, Restricted)
    *   `target_date`: DateTime

### 2.4 Applikation (Application)
Represents the deployable, runtime software entity.
*   **Attributes:**
    *   `id`: Unique Identifier
    *   `key`: String
    *   `name`: String
    *   `description`: Text
    *   `application_type`: Enum (API, Worker, Frontend, Batch, Function, ContainerApp, Other)
    *   `runtime`: String
    *   `deploy_model`: Enum (AppService, Functions, ContainerApp, VM, SaaS, Other)
    *   `environment_scope`: List of Enums (dev, test, prod)

### 2.5 Produkt (Commercial Product)
Tracks commercial contracts, licensing models, and supplier relationships.
*   **Attributes:**
    *   `id`: Unique Identifier
    *   `name`: String
    *   `lifecycle_state`: Enum (Planned, Live, Sunset, Retired)
    *   `business_owner`: String (Jira User AccountId)
    *   `contract_ref`: URL
    *   `sla_availability`: String (e.g., "99.9%")
    *   `sla_support_hours`: Enum (24/7, OfficeHours, BestEffort)

### 2.6 Scenario (Omställning)
Logical workspace representing a migration, transition, or campaign.
*   **Attributes:**
    *   `id`: Unique Identifier
    *   `name`: String
    *   `background`: Text
    *   `status`: Enum (Identifierad, UnderUtredning, Beslutad, Paende, Genomford, Avbruten)
    *   `start_date`: DateTime
    *   `target_date`: DateTime

### 2.7 Decision (Beslut / ADR)
Architectural decision registry node associated with a Scenario.
*   **Attributes:**
    *   `id`: Unique Identifier
    *   `title`: String
    *   `question`: Text
    *   `background`: Text
    *   `status`: Enum (Förslag, UnderUtredning, Beslutat, Genomfört, Avbrutet)

### 2.8 Alternative (Alternativ)
A proposed transition alternative ("branch of a tree") under a Decision.
*   **Attributes:**
    *   `id`: Unique Identifier
    *   `name`: String
    *   `description`: Text
    *   `is_recommended`: Boolean

### 2.9 Team, Information, Integration, Service, Leverantör, Repo, Process
These nodes carry standard metadata, and map to organizational, data, integration, and code boundaries as detailed in our primary specification.

---

## 3. Relationships (Edges)

| Source Node | Edge (Relationship) | Target Node | Description |
| :--- | :--- | :--- | :--- |
| `Verksamhetsprodukt` | `PARENT_OF` | `Verksamhetsprodukt` | Self-referential tree hierarchy |
| `System` | `REALISES` | `Verksamhetsprodukt` | Connects physical IT systems to business products |
| `Applikation` | `REALISES` | `Verksamhetsprodukt` | Connects applications to business products |
| `Applikation` | `BELONGS_TO` | `System` | Inner technical decomposition |
| `Applikation` | `COMMERCIALIZED_AS` | `Produkt` | Connects deployable app to commercial license/SLA |
| `System` | `OWNED_BY` | `Team` | Direct IT ownership |
| `Verksamhetsprodukt` | `OWNED_BY` | `Team` | Business/product ownership |
| `Scenario` | `AFFECTS_SYSTEM` | `System` | The systems slated for decommission/avveckling |
| `Scenario` | `HAS_DECISION` | `Decision` | Ties decisions (ADR) to transition scenarios |
| `Decision` | `CONSIDERS_ALTERNATIVE` | `Alternative` | Connects options to decisions |
| `Alternative` | `EVALUATED_AGAINST` | `Förmåga` / `Information` | Evaluation criterion edge (carries properties: `score` (1-5), `motivering` (text)) |
| `Alternative` | `APPROVED_DECISION` | `Decision` | Highlights the chosen vinnande alternativ |
| `System` | `TRANSITION_TARGET` | `System` | Set once `Alternative` is approved (committed path) |

---

## 4. Scenario Planning Graph Traversal (Cypher Example)

### 4.1 Side-by-Side Alternative Comparison
How to fetch and display all parallel alternatives for a decision, alongside their criteria scores:
```cypher
MATCH (d:Decision {id: "D-101"})-[:CONSIDERS_ALTERNATIVE]->(a:Alternative)
OPTIONAL MATCH (a)-[e:EVALUATED_AGAINST]->(criterion)
RETURN a.name AS AlternativeName, a.is_recommended AS Recommended, 
       criterion.name AS Criterion, e.score AS Score, e.motivering AS Motivering
ORDER BY AlternativeName, Score DESC
```

### 4.2 Activating the Chosen Path
When a decision is approved, the `TRANSITION_TARGET` and `PortfolioAction` properties are propagated across the graph:
```cypher
MATCH (d:Decision {id: "D-101"})-[:HAS_ALTERNATIVE]->(a:Alternative {id: "ALT-2"})
SET d.status = "Beslutat"
SET a.is_approved = true
WITH a
MATCH (s:System)-[:PART_OF_SCENARIO]->(sc:Scenario)<-[:HAS_DECISION]-(d)
MATCH (target:System {name: "CloudPay (Mål)"})
CREATE (s)-[:TRANSITION_TARGET {target_date: date("2027-03-01")}]->(target)
SET s.portfolio_action = "Migrate"
RETURN s.name, s.portfolio_action, target.name
```
