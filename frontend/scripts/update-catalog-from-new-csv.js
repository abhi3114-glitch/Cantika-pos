const fs = require('fs');
const path = require('path');

const NEW_CSV_PATH = 'c:\\devjess\\product-5a93157eacab41d28ed08b45576d34ba.csv';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function extractBrandName(name, rawType, rawVendor) {
  if (rawType && rawType.trim() && !/^PT\b/i.test(rawType.trim()) && !/^CV\b/i.test(rawType.trim())) {
    return rawType.trim().toUpperCase();
  }
  if (name && name.trim()) {
    const clean = name.trim().replace(/^CV\.\s*/i, '').replace(/^PT\.\s*/i, '');
    const parts = clean.split(/\s+-\s+/);
    if (parts.length >= 2 && parts[0].trim().length > 1) {
      const b = parts[0].trim().toUpperCase();
      if (!/^PT\b/i.test(b) && !/^CV\b/i.test(b)) {
        return b;
      }
    }
    const firstWord = clean.split(/[\s\-_\/:]+/)[0];
    if (firstWord && !/^PT\b/i.test(firstWord) && !/^CV\b/i.test(firstWord)) {
      return firstWord.toUpperCase();
    }
  }
  if (rawVendor && rawVendor.trim()) {
    return rawVendor.trim();
  }
  return 'BEAUTY';
}

console.log('Reading new CSV from:', NEW_CSV_PATH);
const raw = fs.readFileSync(NEW_CSV_PATH, 'utf-8');
const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);

const headers = parseCSVLine(lines[0]);
const idx = {};
headers.forEach((h, i) => { idx[h] = i; });

const products = [];
const seenSKU = new Set();
const seenIds = new Set();

for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  if (cols.length < 5) continue;

  const sku = cols[idx['SKU']] || '';
  if (!sku || seenSKU.has(sku)) continue;
  seenSKU.add(sku);

  const name = cols[idx['Name']] || '';
  if (!name) continue;

  const buyingPriceRaw = cols[idx['BuyingPrice']] || '0';
  const priceRaw = cols[idx['Price']] || '0';
  const stockRaw = cols[idx['Inventory Beauty Store']] || '0';
  const weightRaw = cols[idx['ShippingWeight']] || '0';

  const buyingPrice = Math.round(parseFloat(buyingPriceRaw) || 0);
  const price = Math.round(parseFloat(priceRaw) || 0);
  const stock = Math.round(parseFloat(stockRaw) || 0);
  const weight = parseFloat(weightRaw) || 0;

  const barcode = cols[idx['Barcode']] || sku;
  const rawVendor = cols[idx['Vendor']] || '';
  const rawType = cols[idx['Type']] || '';
  const vendor = extractBrandName(name, rawType, rawVendor);
  const type = rawType || vendor;
  const collection = cols[idx['Collections']] || type || '';
  const unit = cols[idx['UnitOfMeasurement']] || 'pcs';
  const weightUnit = cols[idx['ShippingUnit']] || 'kg';
  const description = cols[idx['Description']] || '';
  const images = cols[idx['Images']] || '';
  const tags = cols[idx['Tags']] || '';
  const isActiveStr = cols[idx['IsActive']] || 'True';
  const isActive = isActiveStr.toLowerCase() !== 'false';
  const option1Name = cols[idx['Option 1 Name']] || '';
  const option1Value = cols[idx['Option 1 Value']] || '';
  const option2Name = cols[idx['Option 2 Name']] || '';
  const option2Value = cols[idx['Option 2 Value']] || '';
  const createdAt = cols[idx['CreatedAt']] || '';
  const handle = cols[idx['Handle']] || '';
  const deliveryPrice = Math.round(parseFloat(cols[idx['DeliveryPrice']]) || price);
  const pickUpPrice = Math.round(parseFloat(cols[idx['PickUpPrice']]) || price);

  let cleanId = `prod_${sku.replace(/[^a-zA-Z0-9]/g, '_')}`;
  if (seenIds.has(cleanId)) {
    cleanId = `${cleanId}_${i}`;
  }
  seenIds.add(cleanId);

  const product = {
    id: cleanId,
    sku,
    barcode,
    name,
    vendor,
    type,
    buyingPrice,
    price,
    stock,
    unit,
    weight,
    weightUnit,
    collection,
    collectionName: collection,
    isActive
  };

  if (createdAt) product.createdAt = createdAt;
  if (handle) product.handle = handle;
  if (description) product.description = description;
  if (images) product.images = images;
  if (tags) product.tags = tags;
  if (option1Name) product.option1Name = option1Name;
  if (option1Value) product.option1Value = option1Value;
  if (option2Name) product.option2Name = option2Name;
  if (option2Value) product.option2Value = option2Value;
  if (deliveryPrice) product.deliveryPrice = deliveryPrice;
  if (pickUpPrice) product.pickUpPrice = pickUpPrice;

  products.push(product);
}

console.log(`Parsed ${products.length} unique products from new CSV.`);

// Target output paths
const targets = [
  path.join(__dirname, '..', 'src', 'assets', 'products.json'),
  path.join(__dirname, '..', 'dist', 'indonesian-beauty-angular', 'browser', 'assets', 'products.json'),
  path.join(__dirname, '..', '..', 'desktop', 'www', 'assets', 'products.json'),
  path.join(__dirname, '..', '..', 'Cantika-POS-1Click-Standalone', 'resources', 'app', 'www', 'assets', 'products.json'),
  'C:\\Users\\admin\\Downloads\\Cantika-POS-1Click-Standalone-Client\\resources\\app\\www\\assets\\products.json'
];

const jsonString = JSON.stringify(products, null, 0);

targets.forEach(targetPath => {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, jsonString, 'utf-8');
  console.log(`Saved to ${targetPath} (${(fs.statSync(targetPath).size / (1024 * 1024)).toFixed(2)} MB)`);
});

// Now sync to central MongoDB Atlas Cloud backend
async function syncToRenderCloud() {
  const apiUrl = 'https://cantika-pos.onrender.com/api';
  console.log(`Syncing ${products.length} products to Render Cloud at ${apiUrl}...`);

  try {
    // 1. Fetch current backup to preserve employees, restock, audit logs, margin
    let backupData = {
      products: [],
      employees: [],
      restockOrders: [],
      auditLogs: [],
      notifications: [],
      globalProfitMargin: 20
    };

    try {
      const expRes = await fetch(`${apiUrl}/backup/export`);
      if (expRes.ok) {
        backupData = await expRes.json();
        console.log(`Retrieved existing cloud backup (preserving ${backupData.employees?.length || 0} employees, ${backupData.restockOrders?.length || 0} restock orders).`);
      }
    } catch (e) {
      console.warn('Could not fetch existing backup export, using default non-product entities.');
    }

    // Replace products with new dataset
    backupData.products = products;

    const restoreRes = await fetch(`${apiUrl}/backup/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData)
    });

    if (restoreRes.ok) {
      const result = await restoreRes.json();
      console.log('✅ Successfully updated Render Cloud MongoDB Atlas:', result);
    } else {
      console.error('❌ Render Cloud restore returned HTTP status:', restoreRes.status, await restoreRes.text());
    }
  } catch (err) {
    console.error('⚠️ Could not sync to Render Cloud directly:', err.message);
  }
}

syncToRenderCloud().then(() => {
  console.log('Update process complete!');
});
