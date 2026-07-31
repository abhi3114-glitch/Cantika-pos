import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { AuditService } from '../../services/audit.service';
import { NotificationService } from '../../services/notification.service';
import { RestockService } from '../../services/restock.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Product } from '../../models/product.model';
import { RestockItem } from '../../models/restock.model';

@Component({
  selector: 'app-restock-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-rose-100 dark:border-slate-800 relative space-y-5 max-h-[92vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-amber-500/30">
            🚚
          </div>
          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white font-heading">{{ 'restockModalTitle' | translate }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ 'receiverLabel' | translate }} <strong class="text-rose-700 dark:text-rose-400">{{ getCurrentUser()?.name }}</strong></p>
          </div>
        </div>

        <form (ngSubmit)="handleSaveRestock()" class="space-y-4 text-xs">
          
          <!-- Top Metadata Grid: Bill Code, Supplier, Deadline -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-amber-50/60 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60">
            <div>
              <label class="font-extrabold text-amber-950 dark:text-amber-300 block mb-1">{{ 'billCodeLabel' | translate }}</label>
              <input
                type="text"
                required
                [(ngModel)]="billCode"
                name="billCode"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-xl font-mono font-black text-rose-900 dark:text-rose-400"
              />
            </div>

            <div>
              <label class="font-extrabold text-amber-950 dark:text-amber-300 block mb-1">{{ 'supplierBrandLabel' | translate }}</label>
              <input
                type="text"
                required
                [(ngModel)]="supplierName"
                name="supplierName"
                placeholder="CV. ANUGRAH SEKAWAN"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label class="font-extrabold text-amber-950 dark:text-amber-300 block mb-1">{{ 'deadlineLabel' | translate }}</label>
              <input
                type="date"
                required
                [(ngModel)]="deadline"
                name="deadline"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <!-- Product Picker Section -->
          <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 class="font-black text-slate-900 dark:text-white font-heading text-xs">{{ 'addProductSectionTitle' | translate }}</h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              
              <!-- Product Search Selector -->
              <div class="sm:col-span-2">
                <input
                  type="text"
                  [(ngModel)]="productSearchTerm"
                  (ngModelChange)="filterProductsForRestock()"
                  name="productSearchTerm"
                  [placeholder]="'searchProductPlaceholder' | translate"
                  class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white mb-1"
                />

                <select
                  [(ngModel)]="selectedProductId"
                  (ngModelChange)="onSelectProduct()"
                  name="selectedProductId"
                  class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                >
                  <option *ngFor="let p of filteredProductsForSelect" [value]="p.id">
                    {{ p.name }} ({{ (langService.currentLang$ | async) === 'en' ? 'Stock' : 'Stok' }}: {{ p.stock }} {{ p.unit }} | {{ (langService.currentLang$ | async) === 'en' ? 'Cost' : 'Modal' }}: Rp {{ p.buyingPrice.toLocaleString('id-ID') }})
                  </option>
                </select>
              </div>

              <!-- Quantity Input & Add Button -->
              <div class="flex items-end gap-2">
                <div class="flex-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ 'qtyLabel' | translate }}</label>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="itemQtyInput"
                    name="itemQtyInput"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-center text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  (click)="addItemToBasket()"
                  class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs shadow-xs cursor-pointer"
                >
                  {{ 'btnAdd' | translate }}
                </button>
              </div>

            </div>
          </div>

          <!-- Multi-Item Restock Basket Table -->
          <div class="space-y-2">
            <div class="flex items-center justify-between font-black text-slate-900 dark:text-white font-heading">
              <span>{{ 'restockListTitle' | translate }} ({{ restockItems.length }} Item):</span>
              <span class="text-rose-700 dark:text-rose-400 font-mono text-sm">{{ 'totalInvoiceLabel' | translate }} {{ formatIDR(getTotalBillAmount()) }}</span>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-900 dark:bg-slate-950 text-white uppercase text-[10px] font-black">
                  <tr>
                    <th class="p-2.5">{{ 'colProduct' | translate }}</th>
                    <th class="p-2.5 text-center">{{ 'colQty' | translate }}</th>
                    <th class="p-2.5 text-right">{{ 'colBuyingCost' | translate }}</th>
                    <th class="p-2.5 text-right">{{ 'colSubtotal' | translate }}</th>
                    <th class="p-2.5 text-center">{{ 'colAction' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr *ngFor="let item of restockItems; let idx = index" class="hover:bg-rose-50/40 dark:hover:bg-rose-950/40">
                    <td class="p-2.5">
                      <div class="font-bold text-slate-900 dark:text-white">{{ item.productName }}</div>
                      <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">SKU: {{ item.sku }}</div>
                    </td>
                    <td class="p-2.5 text-center font-mono font-bold text-rose-700 dark:text-rose-400">{{ item.quantityAdded }} pcs</td>
                    <td class="p-2.5 text-right font-mono text-slate-600 dark:text-slate-300">{{ formatIDR(item.buyingPriceUnit) }}</td>
                    <td class="p-2.5 text-right font-mono font-black text-slate-900 dark:text-white">{{ formatIDR(item.totalCost) }}</td>
                    <td class="p-2.5 text-center">
                      <button
                        type="button"
                        (click)="removeItemFromBasket(idx)"
                        class="p-1 text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 font-bold cursor-pointer"
                        title="Hapus Item"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>

                  <tr *ngIf="restockItems.length === 0">
                    <td colspan="5" class="p-6 text-center text-slate-400 dark:text-slate-500 font-bold italic">
                      {{ 'emptyBasketText' | translate }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bottom Action Controls -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {{ 'autoNotifNote' | translate }}
            </div>

            <div class="flex items-center gap-2">
              <button type="button" (click)="close.emit()" class="btn-secondary py-2.5 px-4 font-bold">{{ 'btnCancel' | translate }}</button>
              <button
                type="submit"
                [disabled]="restockItems.length === 0"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold shadow-md shadow-rose-600/20 disabled:opacity-40 cursor-pointer"
              >
                {{ 'btnSaveRestockSubmit' | translate }}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  `
})
export class RestockModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() preselectedProduct: Product | null = null;
  @Output() close = new EventEmitter<void>();

  public allProducts: Product[] = [];
  public filteredProductsForSelect: Product[] = [];
  public productSearchTerm = '';
  public selectedProductId = '';
  public itemQtyInput = 20;

  public billCode = `BILL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  public supplierName = 'CV. ANUGRAH SEKAWAN ABADI JABAR';
  public deadline = '2026-08-20';

  public restockItems: RestockItem[] = [];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private auditService: AuditService,
    private notificationService: NotificationService,
    private restockService: RestockService,
    public langService: LanguageService
  ) {}

  ngOnInit() {
    this.productService.products$.subscribe(prods => {
      this.allProducts = prods;
      this.filterProductsForRestock();
      this.checkPreselectedProduct();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue || changes['preselectedProduct']) {
      this.checkPreselectedProduct();
    }
  }

  private checkPreselectedProduct() {
    if (this.isOpen && this.preselectedProduct) {
      this.selectedProductId = this.preselectedProduct.id;
      const existing = this.restockItems.find(item => item.productId === this.preselectedProduct!.id);
      if (!existing) {
        this.addItemToBasket();
      }
    }
  }

  public filterProductsForRestock() {
    if (!this.productSearchTerm.trim()) {
      this.filteredProductsForSelect = this.allProducts.slice(0, 100);
    } else {
      const q = this.productSearchTerm.toLowerCase().trim();
      this.filteredProductsForSelect = this.allProducts.filter(p =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      ).slice(0, 100);
    }

    if (this.filteredProductsForSelect.length > 0 && !this.selectedProductId) {
      this.selectedProductId = this.filteredProductsForSelect[0].id;
    }
  }

  public onSelectProduct() {
    // Keep selection intact
  }

  public addItemToBasket() {
    const prod = this.allProducts.find(p => p.id === this.selectedProductId);
    if (!prod) return;

    const qty = Number(this.itemQtyInput) || 1;
    const subtotal = prod.buyingPrice * qty;

    const existingIdx = this.restockItems.findIndex(item => item.productId === prod.id);
    if (existingIdx >= 0) {
      this.restockItems[existingIdx].quantityAdded += qty;
      this.restockItems[existingIdx].totalCost += subtotal;
    } else {
      this.restockItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantityAdded: qty,
        buyingPriceUnit: prod.buyingPrice,
        totalCost: subtotal
      });
    }
  }

  public removeItemFromBasket(index: number) {
    this.restockItems.splice(index, 1);
  }

  public getTotalBillAmount(): number {
    return this.restockItems.reduce((sum, item) => sum + item.totalCost, 0);
  }

  public getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  public formatIDR(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  public handleSaveRestock() {
    if (this.restockItems.length === 0) return;

    const user = this.getCurrentUser();
    const timestampStr = new Date().toLocaleString('id-ID') + ' WIB';
    const totalBill = this.getTotalBillAmount();

    // 1. Update Inventory Stock for each item
    this.restockItems.forEach(item => {
      const prod = this.allProducts.find(p => p.id === item.productId);
      if (prod) {
        this.productService.updateProduct({
          ...prod,
          stock: prod.stock + item.quantityAdded
        });

        // Audit log per item
        this.auditService.addLog({
          id: `log_${Date.now()}_${item.productId}`,
          timestamp: timestampStr,
          userId: user?.id || 'usr_staff',
          userName: user?.name || 'Staff Kasir',
          userRole: user?.role || 'employee',
          productId: item.productId,
          productName: item.productName,
          productSku: item.sku,
          fieldChanged: `Restok Masuk [Bill: ${this.billCode}]`,
          oldValue: `${prod.stock} pcs`,
          newValue: `${prod.stock + item.quantityAdded} pcs (+${item.quantityAdded})`
        });
      }
    });

    // 2. Save Multi-Item Restock Order to RestockService
    this.restockService.addOrder({
      id: `restock_${Date.now()}`,
      billCode: this.billCode,
      timestamp: timestampStr,
      receivedByUserId: user?.id || 'usr_staff',
      receivedByUserName: user?.name || 'Staff Kasir',
      supplierName: this.supplierName,
      totalAmountToPay: totalBill,
      paymentDeadline: this.deadline,
      isPaid: false,
      items: [...this.restockItems]
    });

    // Upgraded Rich Notification for Restock Shipment
    const itemLines = this.restockItems.map(i => `  • ${i.productName} (x${i.quantityAdded} pcs) = ${this.formatIDR(i.totalCost)}`).join('\n');
    
    const restockMsg = 
      `🆔 No. Faktur / Bill Code: #${this.billCode}\n` +
      `🏢 Supplier / Vendor: ${this.supplierName}\n` +
      `📅 Jatuh Tempo: ${this.deadline || 'Biasa'}\n\n` +
      `📦 Rincian Barang Restok (${this.restockItems.length} Jenis):\n${itemLines}\n` +
      `----------------------------------------\n` +
      `💵 TOTAL HUTANG SUPPLIER: ${this.formatIDR(totalBill)}\n` +
      `📄 Status Bayar: ⏳ BELUM DIBAYAR (HUTANG RESTOCK)`;

    this.notificationService.sendNotification({
      id: `notif_${Date.now()}`,
      type: 'new_product',
      title: `🚚 RESTOK & INVOICE SUPPLIER DITERIMA`,
      message: restockMsg,
      timestamp: timestampStr,
      read: false,
      actorName: user?.name ? `${user.name} (${user.role === 'owner' ? 'Owner' : 'Kasir'})` : 'Staff Kasir',
      productName: `Bill #${this.billCode}`
    });

    // Reset Form
    this.restockItems = [];
    this.billCode = `BILL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.close.emit();
  }
}
