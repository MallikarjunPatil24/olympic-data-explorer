# Project Portfolio Writeup: Olympic Analytics Dashboard

I built the **Olympic Analytics Dashboard**, a production-grade full-stack data analytics application designed to clean, optimize, and visualize historical data covering over 120 years of Olympic history (1896 – 2022). The primary challenge was translating large, unstructured relational CSV datasets (over 300,000 athlete and event records) into instantaneous, interactive client-side charts and search tables, while avoiding heavy database hosting infrastructure.

### Technical Architecture & Decisions

* **Optimized In-Memory Data Pipeline (FastAPI + Pandas)**: To avoid the overhead of provisioning external relational databases, I designed an ingestion pipeline in FastAPI. On application startup, a singleton service loads, joins, and cleans the datasets in memory. To reduce the memory footprint by over **60%**, I downcast numeric precisions and converted high-cardinality strings to Pandas `category` types. To achieve sub-millisecond query responses, I implemented in-memory dictionaries that cache filtered aggregation sets.
* **Component Performance Tuning (React + TanStack + Recharts)**: On the frontend, I developed a dense, data-dense interface inspired by Linear and Vercel. I constructed global filter states in React Context, allowing users to update the entire dashboard (8 Recharts visualizations and KPI summaries) simultaneously. I wrapped charts and the paginated TanStack table component in `React.memo` and compiled route components lazily using `React.lazy()` and `Suspense`, preventing re-renders and reducing initial bundle download times.
* **Production Utilities**: I built custom export utilities allowing users to download tabular data to CSV and formatted Excel files using SheetJS. Additionally, I implemented print layouts (`print.css`) and high-resolution PDF generation utilizing `html2canvas` and `jsPDF`.

### Key Takeaways & Scaled Improvements

For a dataset of this size (~300k rows), the in-memory Pandas strategy proved highly effective, keeping hosting simple and query latency at zero. If the application scales to larger data scopes (e.g. tens of millions of rows), my recommended path would involve migrating the ingestion service into an offline ETL pipeline feeding a PostgreSQL database, coupled with a Redis instance for server-side cache replication.
