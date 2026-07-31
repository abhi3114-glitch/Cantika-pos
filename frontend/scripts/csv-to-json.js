/**
 * CSV-to-JSON Converter for Cantika POS Product Catalog
 * Reads the owner's complete product CSV export and produces assets/products.json
 */
const fs = require('fs');
const path = require('path');

const CSV_PATH = 'c:\\devjess\\all product.csv';
const OUT_PATH = path.join(__dirname, '..', 'src', 'assets', 'products.json');

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

function extractBrandName(name, rawVendor) {
  if (rawVendor && rawVendor.trim()) return rawVendor.trim();
  if (!name || !name.trim()) return 'BEAUTY';
  const clean = name.trim().replace(/^CV\.\s*/i, '');
  const firstWord = clean.split(/[\s\-_\/:]+/)[0];
  return firstWord ? firstWord.toUpperCase() : 'BEAUTY';
}

const raw = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);

const headers = parseCSVLine(lines[0]);

// Map CSV header indices
const idx = {};
headers.forEach((h, i) => { idx[h] = i; });

const products = [];
const seenSKU = new Set();

for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  if (cols.length < 10) continue;

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
  const vendor = extractBrandName(name, rawVendor);
  const type = cols[idx['Type']] || vendor;
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

  // Skip products with zero price
  if (price <= 0) continue;

  const product = {
    id: `prod_${sku.replace(/[^a-zA-Z0-9]/g, '_')}`,
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
    isActive
  };

  if (description) product.description = description;
  if (images) product.images = images;
  if (tags) product.tags = tags;
  if (option1Name) product.option1Name = option1Name;
  if (option1Value) product.option1Value = option1Value;
  if (option2Name) product.option2Name = option2Name;
  if (option2Value) product.option2Value = option2Value;

  products.push(product);
}

fs.writeFileSync(OUT_PATH, JSON.stringify(products, null, 0), 'utf-8');
console.log(`Converted ${products.length} unique products from ${lines.length - 1} CSV rows.`);
console.log(`Output: ${OUT_PATH}`);
console.log(`File size: ${(fs.statSync(OUT_PATH).size / 1024).toFixed(1)} KB`);
