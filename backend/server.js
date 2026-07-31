const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

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
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data and backup directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function extractBrandName(name, rawVendor) {
  if (rawVendor && rawVendor.trim()) return rawVendor.trim();
  if (!name || !name.trim()) return 'BEAUTY';
  const clean = name.trim().replace(/^CV\.\s*/i, '');
  const firstWord = clean.split(/[\s\-_\/:]+/)[0];
  return firstWord ? firstWord.toUpperCase() : 'BEAUTY';
}

// --- MONGOOSE SCHEMAS & MODELS ---
const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  sku: { type: String, required: true, index: true },
  barcode: { type: String, index: true },
  name: { type: String, required: true, index: true },
  vendor: { type: String, index: true },
  type: { type: String },
  buyingPrice: { type: Number, default: 0 },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  unit: { type: String, default: 'pcs' },
  weight: { type: Number, default: 0 },
  weightUnit: { type: String, default: 'kg' },
  collectionName: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const EmployeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  createdAt: { type: String }
}, { timestamps: true });

const RestockSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  billCode: { type: String },
  timestamp: { type: String },
  supplierName: { type: String },
  items: { type: Array, default: [] },
  totalAmountToPay: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  deadlineDate: { type: String }
}, { timestamps: true });

const AuditSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String },
  userId: { type: String },
  userName: { type: String },
  userRole: { type: String },
  productId: { type: String },
  productName: { type: String },
  productSku: { type: String },
  fieldChanged: { type: String },
  oldValue: { type: String },
  newValue: { type: String }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String },
  title: { type: String },
  message: { type: String },
  timestamp: { type: String },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const MarginSchema = new mongoose.Schema({
  key: { type: String, default: 'global_margin', unique: true },
  margin: { type: Number, default: 20 }
});

const ProductModel = mongoose.model('Product', ProductSchema);
const EmployeeModel = mongoose.model('Employee', EmployeeSchema);
const RestockModel = mongoose.model('Restock', RestockSchema);
const AuditModel = mongoose.model('Audit', AuditSchema);
const NotificationModel = mongoose.model('Notification', NotificationSchema);
const MarginModel = mongoose.model('Margin', MarginSchema);

let isMongoConnected = false;

// Initialize Database (MongoDB Atlas or Fallback File)
async function connectAndSeedDatabase() {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      isMongoConnected = true;
      console.log('🍃 CONNECTED TO MONGODB ATLAS CLOUD DATABASE!');

      // Seed 5,182 products if MongoDB is empty or has invalid duplicates
      const count = await ProductModel.countDocuments();
      if (count < 1000) {
        console.log('Seeding MongoDB Atlas with 5,182 products from assets...');
        const seedJsonPath = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'products.json');
        if (fs.existsSync(seedJsonPath)) {
          const raw = fs.readFileSync(seedJsonPath, 'utf8');
          const products = JSON.parse(raw);
          const seenIds = new Set();
          const cleanProducts = [];

          products.forEach((p, idx) => {
            if (!p.vendor || !p.vendor.trim()) {
              p.vendor = extractBrandName(p.name, p.vendor);
            }
            let cleanId = p.id;
            if (!cleanId || cleanId === 'prod__' || seenIds.has(cleanId)) {
              cleanId = `prod_${p.sku || p.barcode || idx}_${idx}`;
            }
            seenIds.add(cleanId);
            p.id = cleanId;
            cleanProducts.push(p);
          });

          try {
            await ProductModel.deleteMany({});
            await ProductModel.insertMany(cleanProducts, { ordered: false });
            console.log(`✅ Successfully seeded ${cleanProducts.length} products to MongoDB Atlas!`);
          } catch (seedErr) {
            console.warn('MongoDB partial seed warning (proceeding with seeded items):', seedErr.message);
          }
        }
      } else {
        console.log(`🍃 MongoDB Atlas active with ${count} registered products.`);
      }
    } catch (err) {
      console.error('⚠️ MongoDB Connection Error, falling back to db.json:', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('ℹ️ MONGODB_URI environment variable not set. Running on file database (db.json).');
  }

  // Always ensure fallback file db.json exists
  initializeLocalFileDB();
}

// Fallback JSON DB Functions
function initializeLocalFileDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        let updated = false;
        data.products.forEach(p => {
          if (!p.vendor || !p.vendor.trim()) {
            p.vendor = extractBrandName(p.name, p.vendor);
            updated = true;
          }
        });
        if (updated) saveDB(data);
        return data;
      }
    } catch (e) {}
  }

  let initialProducts = [];
  const seedJsonPath = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'products.json');
  if (fs.existsSync(seedJsonPath)) {
    try {
      initialProducts = JSON.parse(fs.readFileSync(seedJsonPath, 'utf8'));
      initialProducts.forEach(p => {
        if (!p.vendor || !p.vendor.trim()) {
          p.vendor = extractBrandName(p.name, p.vendor);
        }
      });
    } catch (err) {}
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

function getLocalDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return initializeLocalFileDB();
  }
}

function saveDB(dbData) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    const jsonStr = JSON.stringify(dbData, null, 2);
    fs.writeFileSync(tempFile, jsonStr, 'utf8');
    fs.renameSync(tempFile, DB_FILE);

    const latestBackup = path.join(BACKUP_DIR, 'db_snapshot_latest.json');
    fs.writeFileSync(latestBackup, jsonStr, 'utf8');
  } catch (e) {}
}

// --- REST API ENDPOINTS ---

// Health Check
app.get('/api/health', async (req, res) => {
  let count = 5182;
  if (isMongoConnected) {
    try {
      count = await ProductModel.countDocuments();
    } catch (e) {}
  } else {
    count = getLocalDB().products.length;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    databaseMode: isMongoConnected ? 'MongoDB Atlas Cloud' : 'Local File DB',
    totalProducts: count
  });
});

// Backup Export
app.get('/api/backup/export', async (req, res) => {
  try {
    let exportData = {};
    if (isMongoConnected) {
      const prods = await ProductModel.find().lean();
      const emps = await EmployeeModel.find().lean();
      const restock = await RestockModel.find().lean();
      const audit = await AuditModel.find().lean();
      const notifs = await NotificationModel.find().lean();
      const marginDoc = await MarginModel.findOne({ key: 'global_margin' });

      exportData = {
        products: prods,
        employees: emps,
        restockOrders: restock,
        auditLogs: audit,
        notifications: notifs,
        globalProfitMargin: marginDoc ? marginDoc.margin : 20
      };
    } else {
      exportData = getLocalDB();
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="cantika_db_backup_${new Date().toISOString().slice(0, 10)}.json"`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export database' });
  }
});

// Backup Restore
app.post('/api/backup/restore', async (req, res) => {
  try {
    const newDb = req.body;
    if (!newDb || !Array.isArray(newDb.products)) {
      return res.status(400).json({ error: 'Invalid backup format' });
    }

    if (isMongoConnected) {
      await ProductModel.deleteMany({});
      await ProductModel.insertMany(newDb.products, { ordered: false });
      if (Array.isArray(newDb.employees)) {
        await EmployeeModel.deleteMany({});
        await EmployeeModel.insertMany(newDb.employees, { ordered: false });
      }
      if (Array.isArray(newDb.restockOrders)) {
        await RestockModel.deleteMany({});
        await RestockModel.insertMany(newDb.restockOrders, { ordered: false });
      }
      if (Array.isArray(newDb.auditLogs)) {
        await AuditModel.deleteMany({});
        await AuditModel.insertMany(newDb.auditLogs, { ordered: false });
      }
      res.json({ success: true, totalProducts: newDb.products.length });
    } else {
      saveDB({
        products: newDb.products || [],
        employees: newDb.employees || [],
        restockOrders: newDb.restockOrders || [],
        auditLogs: newDb.auditLogs || [],
        notifications: newDb.notifications || [],
        globalProfitMargin: Number(newDb.globalProfitMargin) || 20
      });
      res.json({ success: true, totalProducts: newDb.products.length });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore database' });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  if (isMongoConnected) {
    try {
      const products = await ProductModel.find().lean();
      return res.json(products);
    } catch (err) {}
  }
  const db = getLocalDB();
  res.json(db.products);
});

app.post('/api/products', async (req, res) => {
  const newProduct = req.body;
  if (!newProduct || !newProduct.name) {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (!newProduct.vendor || !newProduct.vendor.trim()) {
    newProduct.vendor = extractBrandName(newProduct.name, newProduct.vendor);
  }
  if (!newProduct.id || newProduct.id === 'prod__') {
    newProduct.id = `prod_${newProduct.sku || Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  if (isMongoConnected) {
    try {
      const created = await ProductModel.create(newProduct);
      return res.status(201).json(created);
    } catch (err) {}
  }

  const db = getLocalDB();
  db.products.unshift(newProduct);
  saveDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/batch', async (req, res) => {
  const updatedItems = req.body;
  if (!Array.isArray(updatedItems)) {
    return res.status(400).json({ error: 'Expected array' });
  }

  if (isMongoConnected) {
    try {
      const operations = updatedItems.map(p => ({
        updateOne: {
          filter: { id: p.id },
          update: { $set: p }
        }
      }));
      await ProductModel.bulkWrite(operations);
      return res.json({ success: true, count: updatedItems.length });
    } catch (err) {}
  }

  const db = getLocalDB();
  updatedItems.forEach(updated => {
    const idx = db.products.findIndex(p => p.id === updated.id);
    if (idx !== -1) db.products[idx] = updated;
  });
  saveDB(db);
  res.json({ success: true, count: updatedItems.length });
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;

  if (isMongoConnected) {
    try {
      const updated = await ProductModel.findOneAndUpdate({ id }, updatedProduct, { new: true });
      return res.json(updated);
    } catch (err) {}
  }

  const db = getLocalDB();
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.products[idx] = { ...db.products[idx], ...updatedProduct };
  saveDB(db);
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      await ProductModel.deleteOne({ id });
      console.log(`[MONGO DB] DELETED PRODUCT ID: ${id}`);
      return res.json({ success: true, id });
    } catch (err) {}
  }

  const db = getLocalDB();
  db.products = db.products.filter(p => p.id !== id);
  saveDB(db);
  console.log(`[RENDER DB] DELETED PRODUCT ID: ${id}`);
  res.json({ success: true, id });
});

// Employees API
app.get('/api/employees', async (req, res) => {
  if (isMongoConnected) {
    try {
      const emps = await EmployeeModel.find().lean();
      return res.json(emps);
    } catch (e) {}
  }
  res.json(getLocalDB().employees || []);
});

app.post('/api/employees', async (req, res) => {
  const newEmp = req.body;
  if (isMongoConnected) {
    try {
      const created = await EmployeeModel.create(newEmp);
      return res.status(201).json(created);
    } catch (e) {}
  }
  const db = getLocalDB();
  db.employees.unshift(newEmp);
  saveDB(db);
  res.status(201).json(newEmp);
});

app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  if (isMongoConnected) {
    try {
      await EmployeeModel.deleteOne({ id });
      return res.json({ success: true, id });
    } catch (e) {}
  }
  const db = getLocalDB();
  db.employees = (db.employees || []).filter(e => e.id !== id);
  saveDB(db);
  res.json({ success: true, id });
});

// Restock API
app.get('/api/restock', async (req, res) => {
  if (isMongoConnected) {
    try {
      const orders = await RestockModel.find().lean();
      return res.json(orders);
    } catch (e) {}
  }
  res.json(getLocalDB().restockOrders || []);
});

app.post('/api/restock', async (req, res) => {
  const newOrder = req.body;
  if (isMongoConnected) {
    try {
      const created = await RestockModel.create(newOrder);
      return res.status(201).json(created);
    } catch (e) {}
  }
  const db = getLocalDB();
  db.restockOrders.unshift(newOrder);
  saveDB(db);
  res.status(201).json(newOrder);
});

// Audit Logs API
app.get('/api/audit', async (req, res) => {
  if (isMongoConnected) {
    try {
      const logs = await AuditModel.find().lean();
      return res.json(logs);
    } catch (e) {}
  }
  res.json(getLocalDB().auditLogs || []);
});

app.post('/api/audit', async (req, res) => {
  const newLog = req.body;
  if (isMongoConnected) {
    try {
      const created = await AuditModel.create(newLog);
      return res.status(201).json(created);
    } catch (e) {}
  }
  const db = getLocalDB();
  db.auditLogs.unshift(newLog);
  saveDB(db);
  res.status(201).json(newLog);
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

// Connect to MongoDB and Start Server
connectAndSeedDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===================================================`);
    console.log(`Cantika POS Enterprise Server is running!`);
    console.log(`Database Mode: ${isMongoConnected ? '🍃 MongoDB Atlas Cloud' : '📁 Local db.json File'}`);
    console.log(`Local Access: http://localhost:${PORT}`);
    console.log(`Mobile Access: http://${localIP}:${PORT}`);
    console.log(`===================================================`);
  });
});
