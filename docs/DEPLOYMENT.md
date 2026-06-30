# Deployment Guide

This guide details how to deploy the **Olympic Analytics Dashboard** backend to **Render** and the React frontend to **Vercel**.

---

## 1. Backend Deployment (Render)

Render is ideal for hosting our FastAPI server. Since the backend processes data in-memory on startup, choose a service tier with sufficient memory allocation (Starter plan recommended for dataset dumps exceeding 100MB; the Free tier suffices for smaller mock data files).

### Steps:
1. Sign in to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `olympic-analytics-backend`
   - **Root Directory**: `backend` (Ensure Render points specifically to the backend folder).
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Advanced** to add **Environment Variables**:
   - `CORS_ORIGINS`: `["https://your-frontend-subdomain.vercel.app"]` (Add your Vercel URL once the frontend is set up).
   - `DATA_DIR`: `../dataset` (Or `./app/data` if you choose to store the CSV files inside the repository itself).
   - *Note on Large Datasets*: If your CSV files exceed GitHub's file limit (e.g. `Olympic_Athlete_Biography.csv` is ~55MB), they will push to GitHub fine. If they exceed 100MB, ensure you track them using Git LFS (Large File Storage) or upload them dynamically during your build scripts.
6. Click **Create Web Service**. Render will install dependencies and start Uvicorn. Once active, note the backend URL (e.g. `https://olympic-analytics-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

Vercel is the recommended environment for compiling and serving Vite + React single-page applications.

### Steps:
1. Sign in to your **[Vercel Dashboard](https://vercel.com/)**.
2. Click **Add New** and select **Project**.
3. Connect and import your GitHub repository.
4. Configure the Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Ensure Vercel compiles from the frontend folder).
   - **Build and Output Settings**: Keep default settings (`npm run build` and `dist` output).
5. Open **Environment Variables** and add:
   - `VITE_API_BASE_URL`: `https://olympic-analytics-backend.onrender.com` (Set this to the Render URL you copied in the previous step).
6. Click **Deploy**. Vercel will compile the asset bundles and serve them.
7. Test the live site. Verify refreshing paths like `/countries/IND` load correctly (our custom `vercel.json` will redirect SPA routes back to `index.html` to prevent 404 errors).
