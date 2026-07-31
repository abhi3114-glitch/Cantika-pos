export interface RestockItem {
  productId: string;
  productName: string;
  sku: string;
  quantityAdded: number;
  buyingPriceUnit: number;
  totalCost: number;
}

export interface RestockOrder {
  id: string;
  billCode: string;
  timestamp: string;
  receivedByUserId: string;
  receivedByUserName: string;
  supplierName: string;
  totalAmountToPay: number;
  paymentDeadline: string;
  isPaid: boolean;
  notes?: string;
  items: RestockItem[];
}
