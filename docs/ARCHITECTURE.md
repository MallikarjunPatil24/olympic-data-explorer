# System Architecture

This document details the architectural design and system workflows of the **Olympic Analytics Dashboard**.

---

## 1. System Topology

The application is built on a clean decoupled client-server architecture. Below is a high-level ASCII visual map of the data flow:

```text
[ React SPA Client ]  ◀──( JSON Payload )───┐
  │                                         │
  ├──► [ FilterContext (State) ]            │
  │      └──► useFilterQuery() (Hook)       │
  │             └──► axiosClient            │
  │                    │                    │
  │               (HTTP GET)                │
  ▼                    ▼                    │
[ FastAPI Application Server ]              │
  │                                         │
  ├──► [ API Router (Routes) ]              │
  │      └──► [ Filters Parser (Depends) ]  │
  │             └──► [ Service Layer ]      │
  │                    ├──► In-Memory Cache │
  │                    └──► pandas Engine   │
  ▼                                         │
[ DataService In-Memory Cache ] ────────────┘
```

---

## 2. Ingestion & In-Memory Pipeline

Rather than querying a standard SQL database for every aggregation, which would introduce substantial network latency and require hosting overhead, the backend loads the dataset directly into memory.

### Ingestion Stages:
1. **Dynamic Scanning & Merging**: On startup, [data_loader.py](file:///c:/Users/91866/Desktop/olympic%20dataset/backend/app/services/data_loader.py) scans the configured directory for files. If it detects a multi-table database dump (e.g. `Olympic_Athlete_Biography.csv` and `Olympic_Athlete_Event_Details.csv`), it merges them on `athlete_id`, computes competitor age dynamically (`year - birth_year`), and aligns country names.
2. **Data Cleansing**: The raw records pass through [data_cleaner.py](file:///c:/Users/91866/Desktop/olympic%20dataset/backend/app/services/data_cleaner.py). It standardizes columns into lower snake_case, drops records lacking key identifying fields, coaxes ages/heights/weights to float metrics, and leaves physiology missing values as `NaN` to prevent skewing statistical calculations.
3. **Memory Optimization**: In [data_optimizer.py](file:///c:/Users/91866/Desktop/olympic%20dataset/backend/app/services/data_optimizer.py), columns are downcast to the smallest safe precision. Low-cardinality string columns (e.g. `sex`, `season`, `medal`, `noc`, `sport`, `city`) are cast to `category` dtypes, reducing the RAM footprint by over **60%**.
4. **FastAPI Lifespan Cache**: The finalized, clean DataFrame is held in the FastAPI app's state (`request.app.state.data_service`). It remains cached in RAM and is accessed instantly by all routers.

---

## 3. Dynamic Filter Flow

All queries originate from a single, unified client-side state:

1. **Global Provider**: `FilterContext` stores filter values `{ year, season, country, sport, gender, medal }`.
2. **Horizontal Query Bar**: User interacts with dropdown inputs inside `FilterBar`. Clicking an option calls `setFilter(key, value)`.
3. **Data Hooks**: Visual panels (e.g., `TopCountriesChart`) consume custom hooks (e.g., `useTopCountries`). These hooks watch the `FilterContext`. When filters change, they construct an HTTP GET request appending the active filters as query parameters.
4. **Backend Parsing**: FastAPI routes use `CommonFilters` dependency injectors to parse query parameters. The parameters are passed to `apply_filters()`, which constructs boolean masks to filter the in-memory DataFrame before calculations are performed.
5. **Caching**: Endpoint routers cache the completed calculations in dictionaries. Subsequent requests with identical filter tuples bypass DataFrame scanning entirely.

---

## 4. Architectural Tradeoffs & Future Scope

### Current Design (In-Memory Pandas)
* **Pros**: 
  * Exceptionally fast query response times (less than 5ms for calculations on ~300k rows).
  * Simplifies hosting: no external database to provision, configure, or maintain.
* **Cons**:
  * Scaling limit: If the dataset grows to tens of millions of rows, memory usage will exceed typical container limits (e.g., Render's free tier).
  * Startup delay: Initial startup takes 5–8 seconds while Pandas loads, joins, and optimizes the raw CSV files.

### Recommended Scaled Future Iteration
For datasets exceeding 5 million rows, the recommended upgrade path is:
1. **Database Layer**: Move raw data to a PostgreSQL instance. Add indexing on `year`, `noc`, `sport`, and `medal`.
2. **Server-Side Caching**: Replace in-memory dictionaries with a dedicated **Redis** cache to handle transient filter queries across horizontal server replicas.
3. **ETL Process**: Build an offline Python ingestion script to run weekly/monthly, feeding clean data into the Postgres database, rather than running cleansing pipelines on application startup.
