export interface Product {
  id: string;
  createdAt?: string;
  handle?: string;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  vendor: string;
  type: string;
  tags?: string;
  buyingPrice: number;
  price: number;
  stock: number;
  unit: string;
  weight: number;
  weightUnit: string;
  collection: string;
  isActive?: boolean;
  expiryDate?: string;
  batchNumber?: string;
  images?: string;
  option1Name?: string;
  option1Value?: string;
  option2Name?: string;
  option2Value?: string;
  trackInventory?: boolean;
  continueSellingWhenSoldOut?: boolean;
  deliveryPrice?: number;
  pickUpPrice?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleTransaction {
  id: string;
  transactionNumber: string;
  timestamp: string;
  cashierName: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'Tunai' | 'QRIS' | 'Transfer Bank' | 'COD';
  cashPaid: number;
  cashChange: number;
  pointsEarned: number;
}

export interface FilterState {
  searchQuery: string;
  selectedVendor: string;
  selectedType: string;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'name-asc' | 'stock-desc';
}

export type ViewMode = 'customer' | 'admin';
