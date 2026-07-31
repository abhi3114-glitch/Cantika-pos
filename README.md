# Cantika Beauty Store POS Enterprise

An enterprise-grade Point of Sale (POS) and Inventory Management System built with Angular 19, Tailwind CSS 4, RxJS reactive state management, and encrypted local data persistence.

---

## Technical Stack

- Core Framework: Angular 19 (Standalone Component Architecture)
- Styling: Tailwind CSS 4 and Custom Vanilla CSS Design System
- State Management: RxJS BehaviorSubjects with LocalStorage Encrypted Auto-Sync
- Security: XOR-based Vault Encryption and SHA-256 Data Integrity Checksums
- Build Tooling: Angular CLI and Node.js

---

## Key Enterprise Features

1. POS Counter Checkout
   - Rapid item search by SKU, Barcode, Product Name, and Vendor.
   - Automatic Barcode Scanner detection and cart addition.
   - Cart auto-persistence across browser tab navigation and page reloads.
   - Interactive cash received calculation with exact return/change display.
   - Itemized discount calculations (Percentage and Nominal IDR).

2. Full Data Persistence
   - All product data, employee accounts, restock orders, audit logs, sale
     notifications, and session state persist in encrypted localStorage.
   - Data survives page refreshes, tab switching, and browser restarts.
   - Owner login session is restored automatically on reload.
   - Product catalog seeded from 5,182 real products on first load.

3. Dual Profit Margin System
   - Global Store Default Margin: Centralized store baseline percentage.
   - Custom Item Overrides: Per-product profit margin customization.
   - One-click global default baseline synchronization.

4. Role-Based Access Control (RBAC)
   - Owner Persona: Full system access including Analytics, Profit Margins,
     Audit Logs, Security Vault, Financial Valuations, and Employee Management.
   - Cashier Staff Persona: Dedicated cashier checkout interface with masked
     financial turnover and restricted administrative menus.
   - Owner can create and delete employee accounts at runtime.

5. Stock Catalog and Restock Workflows
   - Real-time catalog filtering, multi-brand categorization, and pagination.
   - One-click item restock workflow with automatic product pre-selection.
   - Restock supplier payables tracking and invoice status management.

6. Modern UX Standards
   - Zero native browser alert and confirm popups.
   - Custom inline validation banners and non-blocking toast notifications.
   - Native dark mode and light mode segmented switcher.
   - Telegram and WhatsApp notification dispatch for every transaction.

---

## Local Development Setup

### Prerequisites

Ensure the following tools are installed on your machine:
- Node.js version 18.x or 20.x
- npm version 9.x or higher

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/abhi3114-glitch/Cantika-pos.git
   cd Cantika-pos
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npx ng serve --port 4200
   ```

4. Open your web browser and navigate to:
   ```text
   http://localhost:4200/
   ```

---

## Production Build

To compile the application for production deployment:

```bash
npx ng build --configuration production
```

The production output bundle will be generated in the `dist/indonesian-beauty-angular` directory.

---

## Default Owner Login

Only the Owner account is pre-configured. The Owner can create additional
employee/cashier accounts from within the application.

- Phone: 081910195353
- Password: bunny1234

---

## Step-by-Step Production Hosting Guide

### Option 1: Vercel Deployment (Recommended)

Vercel provides zero-configuration static hosting with global CDN delivery.

#### Via GitHub Integration (Easiest)
1. Log in to https://vercel.com with your GitHub account.
2. Click "Add New Project" and import the Cantika-pos repository.
3. Configure Build Settings:
   - Framework Preset: Angular
   - Build Command: npx ng build --configuration production
   - Output Directory: dist/indonesian-beauty-angular/browser
4. The included vercel.json file handles SPA routing automatically.
5. Click "Deploy".
6. Your site will be live at a .vercel.app URL within 60 seconds.

#### Via Vercel CLI
```bash
npm install -g vercel
npx ng build --configuration production
vercel --prod
```

---

### Option 2: Netlify Deployment

#### Via Netlify Web Interface
1. Log in to https://netlify.com.
2. Create a new site from GitHub and select the Cantika-pos repository.
3. Set Build Settings:
   - Build Command: npx ng build --configuration production
   - Publish Directory: dist/indonesian-beauty-angular/browser
4. The included _redirects file handles SPA routing automatically.
5. Click "Deploy site".

#### Via Netlify CLI
```bash
npm install -g netlify-cli
npx ng build --configuration production
netlify deploy --prod --dir=dist/indonesian-beauty-angular/browser
```

---

### Option 3: Cloudflare Pages

1. Log in to Cloudflare Dashboard and navigate to Pages.
2. Select "Connect to Git" and choose the Cantika-pos repository.
3. Set Framework Preset to Angular.
4. Build Command: npx ng build --configuration production
5. Build output directory: dist/indonesian-beauty-angular/browser
6. Save and Deploy.

---

### Option 4: Nginx / Ubuntu VPS Server Deployment

For self-hosted Linux VPS environments:

1. Build the production package:
   ```bash
   npx ng build --configuration production
   ```

2. Copy the contents of dist/indonesian-beauty-angular/browser/ to your
   server web root (for example /var/www/cantika-pos/).

3. Configure your Nginx server block:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       root /var/www/cantika-pos;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```

4. Test and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Data Persistence Architecture

All application data is stored in the browser localStorage with encrypted
vault storage. This means:

- Product catalog changes (add, edit, delete) persist permanently.
- Employee accounts created by the Owner persist permanently.
- Restock orders and supplier payables persist permanently.
- Audit logs persist permanently.
- Notification history persists permanently (last 200 entries).
- POS cart state persists across page refreshes.
- Login session persists across page refreshes (until explicit logout).

On first load (when no local data exists), the application seeds itself with
the complete product catalog from assets/products.json (5,182 products).
After that, all changes are stored locally and the seed file is never used
again unless localStorage is cleared.

---

## Product Data Import

The product catalog was imported from the owner's complete CSV export
(all product.csv, 5,186 rows). The conversion script is located at
scripts/csv-to-json.js and can be re-run if the CSV is updated:

```bash
node scripts/csv-to-json.js
```

---

## License

Copyright 2026 Cantika Beauty Store. All rights reserved.
