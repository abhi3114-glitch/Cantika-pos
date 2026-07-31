import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Product } from '../../models/product.model';

export interface POItem {
  product: Product;
  orderQty: number;
}

@Component({
  selector: 'app-purchase-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-rose-100 dark:border-slate-800 relative space-y-5 max-h-[92vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>

        <!-- Top Header & Supplier Filter -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
              {{ 'poModalTitle' | translate }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ 'poModalSub' | translate }}</p>
          </div>
          <div class="text-left sm:text-right text-xs font-mono">
            <div class="font-extrabold text-rose-900 dark:text-rose-400">{{ 'poNumberLabel' | translate }} <span class="bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">{{ poNumber }}</span></div>
            <div class="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{{ 'poDateLabel' | translate }} {{ todayDate }}</div>
          </div>
        </div>

        <!-- Supplier Filter Toolbar -->
        <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="font-extrabold text-slate-700 dark:text-slate-300">{{ 'poFilterSupplier' | translate }}</span>
            <select
              [(ngModel)]="selectedSupplier"
              (ngModelChange)="filterLowStockItems()"
              class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ALL">{{ 'poAllSuppliers' | translate }}</option>
              <option *ngFor="let s of supplierList" [value]="s">{{ s }}</option>
            </select>
          </div>

          <div class="text-right font-bold text-slate-600 dark:text-slate-300">
            {{ 'poFoundProducts' | translate }} <span class="text-rose-600 dark:text-rose-400 font-black">{{ poItems.length }}</span> {{ 'poCriticalStock' | translate }}
          </div>
        </div>

        <!-- Dynamic Editable Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 dark:bg-slate-950 text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th class="p-3 font-mono">#</th>
                <th class="p-3">{{ 'colProductName' | translate }}</th>
                <th class="p-3">{{ 'poSupplierCol' | translate }}</th>
                <th class="p-3 text-center">{{ 'poRemainingStock' | translate }}</th>
                <th class="p-3 text-center">{{ 'poOrderQtyCol' | translate }}</th>
                <th class="p-3 text-right">{{ 'colUnitCost' | translate }}</th>
                <th class="p-3 text-right">{{ 'poSubtotalCost' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr *ngFor="let item of poItems; let idx = index" class="hover:bg-rose-50/40 dark:hover:bg-rose-950/40">
                <td class="p-3 text-slate-400 dark:text-slate-500 font-mono font-bold">{{ idx + 1 }}</td>
                <td class="p-3 font-extrabold text-slate-900 dark:text-white">
                  <div>{{ item.product.name }}</div>
                  <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">SKU: {{ item.product.sku }}</div>
                </td>
                <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[9px] font-black uppercase">{{ item.product.vendor }}</span></td>
                <td class="p-3 text-center">
                  <span class="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black font-mono text-[10px]">{{ item.product.stock }} pcs</span>
                </td>
                
                <!-- Editable Order Qty Input -->
                <td class="p-3 text-center">
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="item.orderQty"
                    class="w-20 px-2 py-1 bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 rounded-xl font-mono font-black text-rose-900 dark:text-rose-300 text-center text-xs"
                  />
                </td>

                <td class="p-3 text-right font-mono text-slate-600 dark:text-slate-300 font-bold">{{ formatIDR(item.product.buyingPrice) }}</td>
                <td class="p-3 text-right font-mono font-black text-slate-900 dark:text-white text-sm">{{ formatIDR(item.orderQty * item.product.buyingPrice) }}</td>
              </tr>

              <tr *ngIf="poItems.length === 0">
                <td colspan="7" class="p-8 text-center text-slate-400 dark:text-slate-500 font-bold italic">
                  {{ 'poNoCritical' | translate }}
                </td>
              </tr>
            </tbody>
            
            <tfoot *ngIf="poItems.length > 0" class="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700">
              <tr>
                <td colspan="4" class="p-3 font-black text-slate-900 dark:text-white text-right uppercase text-[11px]">{{ 'poTotalEstimate' | translate }}</td>
                <td class="p-3 text-center font-mono font-black text-rose-700 dark:text-rose-400 text-sm">+{{ getTotalOrderQty() }} pcs</td>
                <td></td>
                <td class="p-3 text-right font-mono font-black text-emerald-800 dark:text-emerald-400 text-base">{{ formatIDR(getTotalPOCost()) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {{ 'poEditableNote' | translate }}
          </div>

          <div class="flex items-center gap-2">
            <button (click)="close.emit()" class="btn-secondary py-2.5 px-4 font-bold text-xs">{{ 'btnCancel' | translate }}</button>
            <button (click)="printPO()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-rose-600 text-white font-extrabold shadow-md shadow-teal-600/20 cursor-pointer">
              {{ 'btnPrintPO' | translate }}
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PurchaseOrderModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public allProducts: Product[] = [];
  public poItems: POItem[] = [];
  public supplierList: string[] = [];
  public selectedSupplier = 'ALL';

  public poNumber = `PO/CANTIKA/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
  public todayDate = new Date().toLocaleDateString('id-ID');

  constructor(
    private productService: ProductService,
    public langService: LanguageService
  ) {}

  ngOnInit() {
    this.productService.products$.subscribe(prods => {
      this.allProducts = prods;
      const vendors = Array.from(new Set(prods.map(p => p.vendor).filter(Boolean)));
      this.supplierList = vendors;
      this.filterLowStockItems();
    });
  }

  public filterLowStockItems() {
    let lowStock = this.allProducts.filter(p => p.stock <= 2);

    if (this.selectedSupplier !== 'ALL') {
      lowStock = lowStock.filter(p => p.vendor === this.selectedSupplier);
    }

    this.poItems = lowStock.slice(0, 50).map(p => ({
      product: p,
      orderQty: 25 - p.stock // Intelligent default reorder qty targeting 25 pcs
    }));
  }

  public getTotalOrderQty(): number {
    return this.poItems.reduce((sum, item) => sum + (Number(item.orderQty) || 0), 0);
  }

  public getTotalPOCost(): number {
    return this.poItems.reduce((sum, item) => sum + ((Number(item.orderQty) || 0) * item.product.buyingPrice), 0);
  }

  public formatIDR(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  public printPO() {
    window.print();
  }
}
