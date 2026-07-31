# Cantika Beauty Store POS Enterprise (Frontend & Backend)

An enterprise-grade Point of Sale (POS) and Inventory Management System with full multi-device cloud synchronization across mobile phones, laptops, and desktop computers.

---

## Architecture Overview

The repository is structured as a full-stack Enterprise Monorepo:

```text
Cantika-pos/
├── frontend/             # Angular 19 Client Web Application
│   ├── src/              # Standalone Components, Models, Services, Assets
│   ├── angular.json      # Angular CLI Configuration
│   ├── vercel.json       # Vercel Production Routing
│   └── netlify.toml      # Netlify Production Routing
│
└── backend/              # Node.js & Express Central API Database Server
    ├── server.js         # Central REST API & Cloud Database Engine
    ├── package.json      # Backend Dependencies
    └── data/
        └── db.json       # Central Database File (5,182 Products + Data)
```

---

## Why Central Backend API Synchronization?

With the Central Backend API:
- Multi-Device Sync: Owner and staff can access the POS from any device (Mobile Phone, Tablet, Laptop, or PC) and see the exact same real-time data.
- Cloud Backup & Safety: Data is stored centrally in `backend/data/db.json` (or cloud database). If a laptop crashes, is lost, or browser cache is cleared, all store data, sales, stock levels, and staff logins remain 100% safe on the backend.
- Offline Fallback: If network connection drops temporarily, the frontend falls back to secure local vault caching without crashing.

---

## Data Included

- 5,182 Real Beauty Products imported directly from the owner's master CSV export.
- Pre-configured Owner Account (`081910195353` / `bunny1234`).
- Clean staff list (Owner creates real employee logins dynamically).

---

## Local Development Setup

### 1. Start the Backend API Server

```bash
cd backend
npm install
npm start
```
The Central Backend Server will start on `http://localhost:3000`.

### 2. Start the Frontend Angular Application

In a new terminal window:

```bash
cd frontend
npm install
npx ng serve --port 4200
```
Open your browser at `http://localhost:4200/`.

---

## Production Deployment & Hosting Guide

### Deploying the Backend API (Server / Database)

You can host the `backend/` on free cloud server providers like Render, Railway, Fly.io, or any Linux VPS:

#### Option A: Render / Railway / Heroku
1. Create a new Web Service pointing to your GitHub repo.
2. Set Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Note your live backend URL (e.g. `https://cantika-pos-backend.onrender.com`).

---

### Deploying the Frontend Web Application

Host the `frontend/` on Vercel, Netlify, or Cloudflare Pages:

#### Option A: Vercel Deployment
1. Import repository on https://vercel.com.
2. Set Root Directory: `frontend`
3. Framework Preset: `Angular`
4. Build Command: `npx ng build --configuration production`
5. Output Directory: `dist/indonesian-beauty-angular/browser`
6. Click Deploy.

---

## Default Credentials

Owner Login (Pre-configured):
- Phone: `081910195353`
- Password: `bunny1234`

Employee Accounts:
- Created dynamically by the Owner from the Staff Management panel.

---

## License

Copyright 2026 Cantika Beauty Store. All rights reserved.
