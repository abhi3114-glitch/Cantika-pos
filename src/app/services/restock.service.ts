import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RestockOrder } from '../models/restock.model';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class RestockService {
  private restockOrdersSubject = new BehaviorSubject<RestockOrder[]>([]);
  public restockOrders$ = this.restockOrdersSubject.asObservable();

  constructor(private securityService: SecurityService) {
    this.loadRestockOrders();
  }

  private loadRestockOrders() {
    const cached = this.securityService.getSecureStorage('cantika_restock_vault', []);
    this.restockOrdersSubject.next(cached);
  }

  public addOrder(order: RestockOrder) {
    const updated = [order, ...this.restockOrdersSubject.value];
    this.restockOrdersSubject.next(updated);
    this.securityService.setSecureStorage('cantika_restock_vault', updated);
  }

  public togglePaymentStatus(orderId: string) {
    const updated = this.restockOrdersSubject.value.map(o =>
      o.id === orderId ? { ...o, isPaid: !o.isPaid } : o
    );
    this.restockOrdersSubject.next(updated);
    this.securityService.setSecureStorage('cantika_restock_vault', updated);
  }
}
