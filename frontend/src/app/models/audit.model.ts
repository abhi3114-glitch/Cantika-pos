export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  productId: string;
  productName: string;
  productSku: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
}
