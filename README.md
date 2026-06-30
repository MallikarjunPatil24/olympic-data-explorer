# Olympic Analytics Dashboard (1896 – 2022)

A production-grade, full-stack data analytics application that cleans, optimizes, and visualizes historical Olympic records spanning over a century (1896 – 2022). 

The platform features high-level KPI cards, 8 custom visual panels, dynamic global queries, country/sport detailed profiles, debounced competitor search, dark mode toggles, and printing/spreadsheet exports.

---

##  Live Demo & API Documentation
* **Frontend Demo (Vercel)**: `https://olympic-analytics-dashboard.vercel.app` *(Placeholder)*
* **API Documentation (Render / Swagger)**: `https://olympic-analytics-backend.onrender.com/docs` *(Placeholder)*

---

##  Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, React Router DOM | SPA view composition and bundle compilation |
| **Styling** | Vanilla CSS Modules | Theme-aware, highly structured panel styling |
| **Data Tables**| TanStack Table (v8) | Client-side sorted and paginated results directories |
| **Charts** | Recharts (SVG) | Visual trend charts, gender splits, and distributions |
| **Backend** | FastAPI (Python) | High-performance asynchronous REST API routing |
| **Data Processing**| Pandas, NumPy | Dynamic startup ingestion, cleaning, and downcasting |
| **Export Engines**| SheetJS (`xlsx`), `jsPDF`, `html2canvas` | Spreadsheet generation and high-res canvas exports |

---

##  Key Features
* **Interactive KPIs**: 6 core indicators measuring competitors, sports, countries, events, medals, and games.
* **8 Data Visualizations**: Custom Tooltip-enabled Recharts tracking medal timelines, age divisions, gender split donuts, country tallies, and host distributions.
* **Global Query Controls**: Compact query bar (year, season, NOC, sport, gender, medals) that updates the entire dashboard simultaneously.
* **Country & Sport Profiles**: Scoped statistical blocks, derived insights (e.g., strongest Olympic sport), historical medal area timelines, and competitor listings.
* **Athlete Explorer**: Debounced search query indexing athlete physical profiles and game chronicles.
* **Theming Toggles**: Persistence-aware theme switches (charcoal dark mode `#121212` vs light mode `#fafaf8`).
* **Utility Exporting**: Download tables to CSV or formatted Excel files. Generate high-quality dashboard PDFs, or use standard printing layouts.

---

##  Repository Overview
The codebase is structured logically with separate directory layers:
```text
olympic-analytics-dashboard/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # Endpoint routers (dashboard, countries, sports, athletes)
│   │   ├── core/config.py   # Pydantic CORS and path settings
│   │   ├── services/        # Ingestion loader, cleaner, and memory optimizer
│   │   ├── models/          # Pydantic request/response models
│   │   └── utils/           # Filtering helpers
│   ├── Procfile             # Render start command
│   └── requirements.txt     # Python libraries
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios clients
│   │   ├── components/      # Tables, filters, charts, app layouts
│   │   ├── context/         # React Theme & Filter Context providers
│   │   ├── hooks/           # Custom Recharts data hooks
│   │   ├── pages/           # Dashboard explorer and detail profiles
│   │   ├── styles/          # Global styles and printing CSS
│   │   └── utils/           # CSV, Excel, and PDF export scripts
│   └── vercel.json          # Vercel routing rewrites
└── dataset/                 # Folder where raw dataset CSVs live
```

---

##  Local Setup & Execution

### 1. Backend API Server Setup
Initialize a Python virtual environment, install the dependencies, and start the FastAPI server:
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install package dependencies
pip install -r requirements.txt

# Start the local server
uvicorn app.main:app --reload
```
The local API documentation will be available at `http://localhost:8000/docs` (Swagger UI).
*Note*: Ensure you place your Olympic CSV files inside the root `dataset/` directory. The service will load, join, and optimize them automatically on startup.

### 2. Frontend React Client Setup
Install the npm dependencies and run the Vite client:
```bash
# Navigate to frontend
cd ../frontend

# Install package dependencies
npm install

# Start the Vite local server
npm run dev
```
The React SPA client will be active at `http://localhost:5173`.

---

##  Dataset Attribution
This project processes historical Olympic results derived from [olympedia.org](https://www.olympedia.org) datasets. All credits belong to the original contributors for aggregating these historical records.
