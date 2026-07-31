const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Vercel and all external clients
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['*'] }));
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));

// Request Logger Middleware (Visible in Render Dashboard Logs)
app.use((req, res, next) => {
  console.log(`[RENDER API LOG] ${req.method} ${req.url}`);
  next();
});

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize Database from CSV or JSON assets if empty
function initializeDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return data;
      }
    } catch (e) {
      console.error('Failed to read db.json, reinitializing:', e);
    }
  }

  console.log('Seeding database with 5,182 products from product assets...');
  let initialProducts = [];

  const seedJsonPath = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'products.json');
  if (fs.existsSync(seedJsonPath)) {
    try {
      initialProducts = JSON.parse(fs.readFileSync(seedJsonPath, 'utf8'));
    } catch (err) {
      console.error('Error reading products.json:', err);
    }
  }

  const initialDB = {
    products: initialProducts,
    employees: [],
    restockOrders: [],
    auditLogs: [],
    notifications: [],
    globalProfitMargin: 20
  };

  saveDB(initialDB);
  return initialDB;
}

function saveDB(dbData) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbData, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (e) {
    console.error('Error saving db.json:', e);
  }
}

// Initial DB Check
let db = initializeDB();

// --- REST API ENDPOINTS ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), totalProducts: db.products.length });
});

// Products API
app.get('/api/products', (req, res) => {
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const newProduct = req.body;
  if (!newProduct || !newProduct.name) {
    return res.status(400).json({ error: 'Product name is required' });
  }
  db.products.unshift(newProduct);
  saveDB(db);
  console.log(`[RENDER DB] Product Added: ${newProduct.name} (SKU: ${newProduct.sku})`);
  res.status(201).json(newProduct);
});

app.put('/api/products/batch', (req, res) => {
  const updatedItems = req.body;
  if (!Array.isArray(updatedItems)) {
    return res.status(400).json({ error: 'Expected array of products' });
  }

  updatedItems.forEach(updated => {
    const idx = db.products.findIndex(p => p.id === updated.id);
    if (idx !== -1) {
      db.products[idx] = updated;
    }
  });

  saveDB(db);
  console.log(`[RENDER DB] Batch updated ${updatedItems.length} products`);
  res.json({ success: true, count: updatedItems.length });
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  db.products[idx] = { ...db.products[idx], ...updatedProduct };
  saveDB(db);
  console.log(`[RENDER DB] Product Updated: ${db.products[idx].name}`);
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = db.products.length;
  const deletedProd = db.products.find(p => p.id === id);
  db.products = db.products.filter(p => p.id !== id);
  if (db.products.length === initialLen) {
    return res.status(404).json({ error: 'Product not found' });
  }
  saveDB(db);
  console.log(`[RENDER DB] PRODUCT DELETED: ${deletedProd ? deletedProd.name : id} (Remaining: ${db.products.length})`);
  res.json({ success: true, id });
});

// Employees API
app.get('/api/employees', (req, res) => {
  res.json(db.employees || []);
});

app.post('/api/employees', (req, res) => {
  const newEmp = req.body;
  if (!newEmp || !newEmp.name || !newEmp.phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  db.employees.unshift(newEmp);
  saveDB(db);
  console.log(`[RENDER DB] Employee Created: ${newEmp.name} (${newEmp.phone})`);
  res.status(201).json(newEmp);
});

app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  db.employees = (db.employees || []).filter(e => e.id !== id);
  saveDB(db);
  console.log(`[RENDER DB] Employee Deleted: ${id}`);
  res.json({ success: true, id });
});

// Restock API
app.get('/api/restock', (req, res) => {
  res.json(db.restockOrders || []);
});

app.post('/api/restock', (req, res) => {
  const newOrder = req.body;
  db.restockOrders.unshift(newOrder);
  saveDB(db);
  console.log(`[RENDER DB] Restock Order Created: ${newOrder.id}`);
  res.status(201).json(newOrder);
});

app.put('/api/restock/:id/toggle-paid', (req, res) => {
  const { id } = req.params;
  db.restockOrders = (db.restockOrders || []).map(o =>
    o.id === id ? { ...o, isPaid: !o.isPaid } : o
  );
  saveDB(db);
  console.log(`[RENDER DB] Restock Order Paid Toggled: ${id}`);
  res.json({ success: true, id });
});

// Audit Logs API
app.get('/api/audit', (req, res) => {
  res.json(db.auditLogs || []);
});

app.post('/api/audit', (req, res) => {
  const newLog = req.body;
  db.auditLogs.unshift(newLog);
  saveDB(db);
  console.log(`[RENDER DB] AUDIT LOG ADDED: ${newLog.userName} - ${newLog.fieldChanged} (${newLog.productName})`);
  res.status(201).json(newLog);
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  res.json(db.notifications || []);
});

app.post('/api/notifications', (req, res) => {
  const notification = req.body;
  db.notifications.unshift(notification);
  if (db.notifications.length > 200) {
    db.notifications = db.notifications.slice(0, 200);
  }
  saveDB(db);
  res.status(201).json(notification);
});

// Profit Margin API
app.get('/api/margin', (req, res) => {
  res.json({ margin: db.globalProfitMargin || 20 });
});

app.post('/api/margin', (req, res) => {
  const { margin } = req.body;
  db.globalProfitMargin = Number(margin) || 20;
  saveDB(db);
  console.log(`[RENDER DB] Global Profit Margin Updated: ${db.globalProfitMargin}%`);
  res.json({ success: true, margin: db.globalProfitMargin });
});

// Helper to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

// Server Listen on 0.0.0.0 for Mobile Phone Access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`Cantika POS Central Backend Server is running!`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`Mobile Access: http://${localIP}:${PORT}`);
  console.log(`Database File: ${DB_FILE}`);
  console.log(`Total Active Products: ${db.products.length}`);
  console.log(`===================================================`);
});
