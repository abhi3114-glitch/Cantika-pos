import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RestockOrder } from '../models/restock.model';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class RestockService {
  private get apiUrl(): string {
    return this.securityService.getApiUrl();
  }

  private restockOrdersSubject = new BehaviorSubject<RestockOrder[]>([]);
  public restockOrders$ = this.restockOrdersSubject.asObservable();

  constructor(private securityService: SecurityService) {
    this.loadRestockOrders();
  }

  public loadRestockOrders() {
    fetch(`${this.apiUrl}/restock`)
      .then(res => res.json())
      .then((data: RestockOrder[]) => {
        if (Array.isArray(data)) {
          this.restockOrdersSubject.next(data);
          this.securityService.setSecureStorage('cantika_restock_vault', data);
          return;
        }
        this.fallbackLoad();
      })
      .catch(() => this.fallbackLoad());
  }

  private fallbackLoad() {
    const cached = this.securityService.getSecureStorage('cantika_restock_vault', []);
    this.restockOrdersSubject.next(Array.isArray(cached) ? cached : []);
  }

  public addOrder(order: RestockOrder) {
    const updated = [order, ...this.restockOrdersSubject.value];
    this.restockOrdersSubject.next(updated);
    this.securityService.setSecureStorage('cantika_restock_vault', updated);

    fetch(`${this.apiUrl}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    }).catch(err => console.warn('Restock sync warning:', err));
  }

  public togglePaymentStatus(orderId: string) {
    const updated = this.restockOrdersSubject.value.map(o =>
      o.id === orderId ? { ...o, isPaid: !o.isPaid } : o
    );
    this.restockOrdersSubject.next(updated);
    this.securityService.setSecureStorage('cantika_restock_vault', updated);

    fetch(`${this.apiUrl}/restock/${orderId}/toggle-paid`, {
      method: 'PUT'
    }).catch(err => console.warn('Restock status sync warning:', err));
  }
}
