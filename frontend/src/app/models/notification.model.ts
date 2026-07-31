export type NotificationType = 'new_product' | 'price_change' | 'stock_alert' | 'low_stock' | 'system';

export interface OwnerNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actorName?: string;
  productName?: string;
}
