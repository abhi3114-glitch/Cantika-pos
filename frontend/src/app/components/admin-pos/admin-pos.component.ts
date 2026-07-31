import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { AuditService } from '../../services/audit.service';
import { RestockService } from '../../services/restock.service';
import { LanguageService } from '../../services/language.service';
import { NotificationService } from '../../services/notification.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Product, SaleTransaction } from '../../models/product.model';
import { AuditLog } from '../../models/audit.model';
import { RestockOrder } from '../../models/restock.model';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { PosCheckoutComponent } from '../pos-checkout/pos-checkout.component';
import { PrintLabelModalComponent } from '../print-label-modal/print-label-modal.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-admin-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, AnalyticsComponent, PosCheckoutComponent, PrintLabelModalComponent, TranslatePipe, IconComponent],
  template: `
    <div class="space-y-5 animate-fade-in my-4">
      
      <!-- Top Metrics Dashboard Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span class="text-[10px] uppercase font-semibold tracking-wide">{{ 'totalSKU' | translate }}</span>
            <app-icon name="box" size="15" class="text-slate-400 dark:text-slate-500"></app-icon>
          </div>
          <div class="text-lg md:text-xl font-bold font-heading tracking-tight text-slate-900 dark:text-white">{{ filteredProducts.length }} Items</div>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{{ 'fromTotalCatalog' | translate }} {{ products.length }} {{ 'totalCatalogSuffix' | translate }}</div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div class="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span class="text-[10px] uppercase font-semibold tracking-wide text-slate-500 dark:text-slate-400">{{ 'lowStockTitle' | translate }}</span>
            <app-icon name="tag" size="15" class="text-amber-500"></app-icon>
          </div>
          <div class="text-lg md:text-xl font-bold font-heading tracking-tight text-amber-600 dark:text-amber-400">{{ lowStockItems.length }} Items</div>
          <div class="text-[10px] text-amber-700 dark:text-amber-300 font-medium">{{ 'needsRestocking' | translate }}</div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div class="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span class="text-[10px] uppercase font-semibold tracking-wide text-slate-500 dark:text-slate-400">{{ 'totalValuation' | translate }}</span>
            <app-icon name="shield" size="15" class="text-emerald-500"></app-icon>
          </div>
          <div class="text-base md:text-lg font-bold font-heading font-mono tracking-tight text-slate-900 dark:text-white">
            {{ isOwner() ? formatIDR(totalCostValuation) : '🔒 Rp ***.*** (Owner Only)' }}
          </div>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{{ 'registeredCapital' | translate }}</div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span class="text-[10px] uppercase font-semibold tracking-wide">{{ 'unpaidPayables' | translate }}</span>
            <app-icon name="file-text" size="15" class="text-slate-400 dark:text-slate-500"></app-icon>
          </div>
          <div class="text-base md:text-lg font-bold font-heading font-mono tracking-tight text-slate-900 dark:text-white">
            {{ isOwner() ? formatIDR(totalUnpaidPayables) : '🔒 Rp ***.*** (Owner Only)' }}
          </div>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{{ getUnpaidRestockCount() }} {{ 'unpaidInvoicesCount' | translate }}</div>
        </div>
      </div>

      <!-- Top Segment Navigation & Actions Bar -->
      <div class="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3 transition-colors">
        <!-- Segment Tabs -->
        <div class="flex items-center gap-1 overflow-x-auto w-full lg:w-auto no-scrollbar">
          <button
            (click)="activeTab = 'pos_checkout'"
            [class]="activeTab === 'pos_checkout' 
              ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-900 text-white shadow-xs cursor-pointer flex items-center gap-1.5' 
              : 'px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5'"
          >
            <app-icon name="shopping-bag" size="14"></app-icon>
            <span>{{ 'tabPosCheckout' | translate }}</span>
          </button>

          <button
            (click)="activeTab = 'inventory'"
            [class]="activeTab === 'inventory' 
              ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-900 text-white shadow-xs cursor-pointer flex items-center gap-1.5' 
              : 'px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5'"
          >
            <app-icon name="box" size="14"></app-icon>
            <span>{{ 'tabCatalog' | translate }}</span>
          </button>

          <button
            (click)="activeTab = 'restock_payables'"
            [class]="activeTab === 'restock_payables' 
              ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5' 
              : 'px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5'"
          >
            <app-icon name="truck" size="14"></app-icon>
            <span>{{ 'tabRestock' | translate }} ({{ getUnpaidRestockCount() }})</span>
          </button>

          <button
            (click)="switchTab('analytics')"
            [class]="activeTab === 'analytics' 
              ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white shadow-xs cursor-pointer flex items-center gap-1.5' 
              : 'px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5'"
          >
            <app-icon name="line-chart" size="14"></app-icon>
            <span>{{ 'tabAnalytics' | translate }}</span>
          </button>

          <button
            (click)="switchTab('audit_logs')"
            [class]="activeTab === 'audit_logs' 
              ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white shadow-xs cursor-pointer flex items-center gap-1.5' 
              : 'px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5'"
          >
            <app-icon name="file-text" size="14"></app-icon>
            <span>{{ 'tabAudit' | translate }} ({{ auditLogs.length }})</span>
          </button>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
          <button
            (click)="showPrintLabelModal = true"
            class="btn-secondary py-1.5 px-3 text-[11px]"
            title="Cetak Label & Tag Harga"
          >
            <app-icon name="printer" size="13" class="text-slate-600 dark:text-slate-300"></app-icon>
            <span>Labels & Tags</span>
          </button>

          <button
            *ngIf="isOwner()"
            (click)="openCreateEmployee.emit()"
            class="btn-secondary py-1.5 px-3 text-[11px]"
          >
            <app-icon name="users" size="13" class="text-slate-600 dark:text-slate-300"></app-icon>
            <span>+ Staff</span>
          </button>

          <button
            (click)="openPurchaseOrder.emit()"
            class="btn-secondary py-1.5 px-3 text-[11px]"
          >
            <app-icon name="tag" size="13" class="text-amber-600 dark:text-amber-400"></app-icon>
            <span>Create PO</span>
          </button>

          <button
            (click)="openRestock.emit()"
            class="btn-secondary py-1.5 px-3 text-[11px]"
          >
            <app-icon name="truck" size="13" class="text-amber-700 dark:text-amber-400"></app-icon>
            <span>+ Restock</span>
          </button>

          <button
            (click)="openAddProduct.emit()"
            class="btn-primary py-1.5 px-3 text-[11px]"
          >
            <app-icon name="plus" size="13"></app-icon>
            <span>+ Product</span>
          </button>
        </div>
      </div>

      <!-- Tab Content 0: POS Counter Sales Checkout (Preserved State via [hidden]) -->
      <div [hidden]="activeTab !== 'pos_checkout'">
        <app-pos-checkout (completeCheckout)="completeCheckout.emit($event)"></app-pos-checkout>
      </div>

      <!-- Tab Content 1: Full Paginated Inventory Table -->
      <ng-container *ngIf="activeTab === 'inventory'">
        <div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-rose-100 dark:border-slate-800 shadow-md overflow-hidden space-y-3 transition-colors">
          
          <!-- Top Table Toolbar with Page Size Selector -->
          <div class="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div>
              Showing <span class="text-rose-600 dark:text-rose-400 font-extrabold">{{ getStartIndex() }} - {{ getEndIndex() }}</span> of <span class="text-slate-900 dark:text-white font-extrabold">{{ filteredProducts.length }}</span> items
            </div>

            <div class="flex items-center gap-2">
              <span>{{ 'itemsPerPageLabel' | translate }}</span>
              <select
                [(ngModel)]="pageSize"
                (ngModelChange)="onPageSizeChange()"
                class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option [ngValue]="25">{{ 'option25Products' | translate }}</option>
                <option [ngValue]="50">{{ 'option50Products' | translate }}</option>
                <option [ngValue]="100">{{ 'option100Products' | translate }}</option>
                <option [ngValue]="250">{{ 'option250Products' | translate }}</option>
                <option [ngValue]="500">{{ 'option500Products' | translate }}</option>
                <option [ngValue]="5186">{{ 'optionAllProducts' | translate }} ({{ filteredProducts.length }})</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-950 dark:bg-slate-950 text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th class="p-3.5 whitespace-nowrap">{{ 'thSku' | translate }}</th>
                  <th class="p-3.5 min-w-[180px]">{{ 'thName' | translate }}</th>
                  <th class="p-3.5 min-w-[140px] whitespace-nowrap">{{ 'thBrand' | translate }}</th>
                  <th class="p-3.5 text-right whitespace-nowrap">{{ 'thBuyingPrice' | translate }}</th>
                  <th class="p-3.5 text-right whitespace-nowrap">{{ 'thSellingPrice' | translate }}</th>
                  <th class="p-3.5 text-center whitespace-nowrap">{{ 'thStock' | translate }}</th>
                  <th class="p-3.5 text-center whitespace-nowrap">{{ 'thActions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr *ngFor="let p of pagedProducts" class="hover:bg-rose-50/50 dark:hover:bg-rose-950/40 transition-colors">
                  <td class="p-3.5 font-mono text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">{{ p.sku }}</td>
                  <td class="p-3.5 font-extrabold text-slate-900 dark:text-white leading-snug">{{ p.name }}</td>
                  <td class="p-3.5 whitespace-nowrap">
                    <span class="inline-block px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[10px] font-extrabold uppercase border border-rose-200 dark:border-rose-900 tracking-tight whitespace-nowrap">
                      {{ p.vendor }}
                    </span>
                  </td>
                  <td class="p-3.5 text-right font-mono font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{{ formatIDR(p.buyingPrice) }}</td>
                  <td class="p-3.5 text-right font-mono font-black text-rose-700 dark:text-rose-400 text-sm whitespace-nowrap">{{ formatIDR(p.price) }}</td>
                  <td class="p-3.5 text-center whitespace-nowrap">
                    <span 
                      [class]="p.stock <= 2 
                        ? 'inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 font-black text-[11px] border border-rose-300 dark:border-rose-900 whitespace-nowrap' 
                        : 'inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 font-black text-[11px] border border-emerald-300 dark:border-emerald-900 whitespace-nowrap'"
                    >
                      {{ p.stock }} {{ p.unit }}
                    </span>
                  </td>
                  <td class="p-3.5 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <button
                        (click)="openEditProduct.emit(p)"
                        class="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-800 dark:text-slate-200 font-extrabold text-[11px] transition-all shadow-xs cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                        title="Edit Produk"
                      >
                        <app-icon name="edit" size="12"></app-icon>
                        <span>Edit</span>
                      </button>

                      <button
                        (click)="openRestock.emit(p)"
                        class="px-2 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-600 hover:text-white text-amber-900 dark:text-amber-300 font-extrabold text-[11px] border border-amber-200 dark:border-amber-800 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        title="Restok Produk Ini"
                      >
                        <app-icon name="truck" size="12"></app-icon>
                        <span>Restok</span>
                      </button>

                      <button
                        (click)="handleDeleteProduct(p)"
                        class="px-2 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-600 hover:text-white text-rose-800 dark:text-rose-300 font-extrabold text-[11px] border border-rose-200 dark:border-rose-900 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        title="Hapus Produk dari Catalog"
                      >
                        <app-icon name="trash" size="12"></app-icon>
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredProducts.length === 0">
                  <td colspan="7" class="p-8 text-center text-slate-400 dark:text-slate-500 font-bold italic">
                    Tidak ada produk ditemukan untuk kata kunci pencarian "{{ searchQuery }}".
                    <button (click)="resetSearchFilter()" class="ml-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-xs">
                      Reset Filter
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Pagination Controls -->
          <div class="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div class="font-bold text-slate-600 dark:text-slate-400">
              Halaman <span class="text-rose-600 dark:text-rose-400 font-extrabold">{{ currentPage }}</span> dari <span class="text-slate-900 dark:text-white font-extrabold">{{ totalPages }}</span>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                (click)="goToPage(1)"
                [disabled]="currentPage === 1"
                class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-rose-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Awal
              </button>
              <button
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-rose-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                ◀ Sblm
              </button>
              
              <span class="px-3 py-1.5 bg-rose-600 text-white font-extrabold rounded-xl shadow-xs">
                {{ currentPage }}
              </span>

              <button
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
                class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-rose-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Slnjt ▶
              </button>
              <button
                (click)="goToPage(totalPages)"
                [disabled]="currentPage === totalPages"
                class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-rose-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Akhir
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Tab Content 2: Restock & Supplier Payables Table with Checkboxes & Bill Codes -->
      <ng-container *ngIf="activeTab === 'restock_payables'">
        <div class="bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden space-y-3 p-5">
          <h3 class="text-base font-black text-slate-900 font-heading">
            {{ 'payablesTitle' | translate }}
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-amber-900 text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th class="p-3.5 text-center">{{ 'thPaymentStatus' | translate }}</th>
                  <th class="p-3.5">{{ 'thBillCode' | translate }}</th>
                  <th class="p-3.5">{{ 'thTimeReceiver' | translate }}</th>
                  <th class="p-3.5">{{ 'thSupplier' | translate }}</th>
                  <th class="p-3.5 text-right">{{ 'thTotalBill' | translate }}</th>
                  <th class="p-3.5 text-center">{{ 'thDeadline' | translate }}</th>
                  <th class="p-3.5 text-center">Rincian</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr *ngFor="let order of restockOrders" [class]="order.isPaid ? 'bg-emerald-50/40' : 'bg-rose-50/50'">
                  <!-- Interactive Checkbox -->
                  <td class="p-3.5 text-center">
                    <button
                      (click)="togglePayment(order.id)"
                      [class]="order.isPaid 
                        ? 'px-3.5 py-1.5 rounded-2xl bg-emerald-100 text-emerald-800 font-black border border-emerald-300 shadow-xs cursor-pointer' 
                        : 'px-3.5 py-1.5 rounded-2xl bg-rose-100 text-rose-800 font-black border border-rose-300 shadow-xs cursor-pointer'"
                    >
                      {{ order.isPaid ? ('statusPaid' | translate) : ('statusUnpaid' | translate) }}
                    </button>
                  </td>

                  <td class="p-3.5 font-mono font-black text-rose-900 bg-amber-50/60 text-xs">
                    {{ order.billCode || order.id }}
                  </td>

                  <td class="p-3.5">
                    <div class="font-extrabold text-slate-900">{{ order.timestamp }}</div>
                    <div class="text-[10px] text-slate-500 font-semibold">{{ 'receiverPrefix' | translate }} {{ order.receivedByUserName }}</div>
                  </td>

                  <td class="p-3.5 font-black text-slate-900">{{ order.supplierName }}</td>
                  <td class="p-3.5 text-right font-mono font-black text-amber-900 text-sm">{{ formatIDR(order.totalAmountToPay) }}</td>
                  <td class="p-3.5 text-center font-mono font-extrabold text-slate-700">{{ order.paymentDeadline }}</td>
                  <td class="p-3.5 text-center">
                    <button
                      (click)="openRestockDetail.emit(order)"
                      class="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-600 hover:text-white text-amber-900 font-extrabold text-[11px] transition-all cursor-pointer"
                    >
                      🔍 Rincian
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- Tab Content 3: Analytics -->
      <ng-container *ngIf="activeTab === 'analytics'">
        <app-analytics></app-analytics>
      </ng-container>

      <!-- Tab Content 4: Audit Logs -->
      <ng-container *ngIf="activeTab === 'audit_logs'">
        <div class="bg-white rounded-3xl border border-rose-100 shadow-md p-5 space-y-4">
          <h3 class="text-base font-black text-slate-900 font-heading">{{ 'auditTitle' | translate }}</h3>
          <div class="space-y-2.5">
            <div *ngFor="let log of auditLogs" class="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between text-xs">
              <div>
                <div class="font-bold text-slate-700">{{ log.timestamp }} — <span class="text-rose-800 font-mono font-bold">{{ log.userName }} ({{ log.userRole }})</span></div>
                <div class="font-extrabold text-slate-900 mt-1">{{ log.productName }} — <span class="text-rose-600">{{ log.fieldChanged }}</span></div>
                <div class="text-[11px] text-slate-600 mt-0.5">
                  {{ 'auditOldValue' | translate }} <del class="text-rose-600">{{ log.oldValue }}</del> {{ 'auditNewValue' | translate }} <strong class="text-emerald-700">{{ log.newValue }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Printable Price Tag & Barcode Label Modal -->
      <app-print-label-modal
        [isOpen]="showPrintLabelModal"
        [products]="products"
        (close)="showPrintLabelModal = false"
      ></app-print-label-modal>

      <!-- Sleek Production Delete Confirmation Modal (Zero Chrome Dialogs!) -->
      <div *ngIf="deleteConfirmProduct" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
        <div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/60 text-center space-y-4 animate-scale-up">
          <div class="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl mx-auto ring-4 ring-rose-100 dark:ring-rose-900/30">
            🗑️
          </div>

          <div class="space-y-1">
            <h3 class="text-base font-black font-heading text-slate-900 dark:text-white">Hapus Produk dari Catalog?</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Apakah Anda yakin ingin menghapus <strong class="text-rose-600 dark:text-rose-400">"{{ deleteConfirmProduct.name }}"</strong> (SKU: {{ deleteConfirmProduct.sku }})?
            </p>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2">
            <button
              (click)="deleteConfirmProduct = null"
              class="py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              (click)="confirmDeleteProduct()"
              class="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              Ya, Hapus Produk
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminPosComponent implements OnInit {
  @Output() openEditProduct = new EventEmitter<Product>();
  @Output() openAddProduct = new EventEmitter<void>();
  @Output() openRestock = new EventEmitter<Product | undefined>();
  @Output() openPurchaseOrder = new EventEmitter<void>();
  @Output() openCreateEmployee = new EventEmitter<void>();
  @Output() openRestockDetail = new EventEmitter<RestockOrder>();
  @Output() completeCheckout = new EventEmitter<SaleTransaction>();
  @Output() openCsvImport = new EventEmitter<void>();

  public activeTab: 'pos_checkout' | 'inventory' | 'restock_payables' | 'analytics' | 'audit_logs' = 'pos_checkout';
  public showPrintLabelModal = false;
  public deleteConfirmProduct: Product | null = null;
  public products: Product[] = [];
  public filteredProducts: Product[] = [];
  public pagedProducts: Product[] = [];
  public lowStockItems: Product[] = [];
  public totalCostValuation = 0;
  public totalUnpaidPayables = 0;
  public auditLogs: AuditLog[] = [];
  public restockOrders: RestockOrder[] = [];

  public searchQuery = '';
  public selectedBrand = 'Semua Brand';
  public brandList = ['Semua Brand', 'WARDAH', 'SKINTIFIC', 'SOMETHINC', 'HANASUI', 'AKSESORIS', 'SOFLENS'];

  // Pagination state
  public currentPage = 1;
  public pageSize = 50;
  public totalPages = 1;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private auditService: AuditService,
    private restockService: RestockService,
    private notificationService: NotificationService,
    public langService: LanguageService
  ) {}

  ngOnInit() {
    this.productService.products$.subscribe(prods => {
      this.products = prods;
      const uniqueVendors: string[] = Array.from(new Set(prods.map((p: Product) => p.vendor).filter(Boolean))).sort() as string[];
      this.brandList = ['Semua Brand', ...uniqueVendors];
      this.applyFilter(false);
      this.lowStockItems = prods.filter((p: Product) => p.stock <= 2);
      this.totalCostValuation = prods.reduce((sum: number, p: Product) => sum + (p.buyingPrice * p.stock), 0);
    });

    this.auditService.auditLogs$.subscribe(logs => {
      this.auditLogs = logs;
    });

    this.restockService.restockOrders$.subscribe(orders => {
      this.restockOrders = orders;
      this.totalUnpaidPayables = orders.filter(o => !o.isPaid).reduce((sum, o) => sum + o.totalAmountToPay, 0);
    });
  }

  public selectBrand(brand: string) {
    this.selectedBrand = brand;
    this.applyFilter(true);
  }

  public applyFilter(resetPage = false) {
    let result = [...this.products];

    if (this.selectedBrand !== 'Semua Brand') {
      result = result.filter(p => 
        (p.vendor && p.vendor.toUpperCase() === this.selectedBrand.toUpperCase()) || 
        (p.type && p.type.toUpperCase() === this.selectedBrand.toUpperCase())
      );
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.vendor && p.vendor.toLowerCase().includes(q)) ||
        (p.type && p.type.toLowerCase().includes(q))
      );
    }

    this.filteredProducts = result;
    if (resetPage) {
      this.currentPage = 1;
    }
    this.updatePagination();
  }

  public resetSearchFilter() {
    this.searchQuery = '';
    this.selectedBrand = 'Semua Brand';
    this.applyFilter(true);
  }

  public updatePagination() {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedProducts = this.filteredProducts.slice(start, end);
  }

  public goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  public onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  public getStartIndex(): number {
    if (this.filteredProducts.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  public getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.filteredProducts.length ? this.filteredProducts.length : end;
  }

  public isOwner(): boolean {
    return this.authService.isOwner();
  }

  public switchTab(tab: 'inventory' | 'restock_payables' | 'analytics' | 'audit_logs') {
    if ((tab === 'analytics' || tab === 'audit_logs') && !this.isOwner()) {
      this.notificationService.sendNotification({
        id: `notif_perm_${Date.now()}`,
        type: 'system',
        title: '🔒 Akses Khusus Owner',
        message: 'Menu Analisis Laba & Audit Log khusus untuk Pemilik Toko (Owner).',
        timestamp: new Date().toLocaleString('id-ID') + ' WIB',
        read: false
      });
      return;
    }
    this.activeTab = tab;
  }

  public getUnpaidRestockCount(): number {
    return this.restockOrders.filter(o => !o.isPaid).length;
  }

  public togglePayment(orderId: string) {
    this.restockService.togglePaymentStatus(orderId);
  }

  public formatIDR(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  public exportInventoryCSV() {
    const headers = ['SKU', 'Barcode', 'Nama Produk', 'Vendor', 'Harga Modal', 'Harga Jual', 'Stok'];
    const rows = this.products.map(p => [
      `"${p.sku}"`,
      `"${p.barcode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.vendor}"`,
      p.buyingPrice,
      p.price,
      p.stock
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = uri;
    link.download = `Katalog_Stok_Cantika_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  public handleDeleteProduct(p: Product) {
    this.deleteConfirmProduct = p;
  }

  public confirmDeleteProduct() {
    if (this.deleteConfirmProduct) {
      const p = this.deleteConfirmProduct;
      const user = this.authService.getCurrentUser();

      // 1. Delete product from catalog & backend
      this.productService.deleteProduct(p.id);

      // 2. Add entry to Audit Log
      this.auditService.addLog({
        id: `audit_del_${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID'),
        userId: user?.id || 'usr_owner_1',
        userName: user?.name || 'Jess Lim (Owner)',
        userRole: user?.role === 'owner' ? 'Owner' : 'Kasir',
        productId: p.id,
        productName: p.name,
        productSku: p.sku,
        fieldChanged: 'HAPUS PRODUK KATALOG',
        oldValue: `SKU: ${p.sku} | Stok: ${p.stock} | Rp ${p.price}`,
        newValue: 'PRODUK DIHAPUS DARI SISTEM'
      });

      // 3. Trigger Notification
      this.notificationService.sendNotification({
        id: `notif_del_${Date.now()}`,
        type: 'system',
        title: '🗑️ Produk Dihapus',
        message: `Produk "${p.name}" (SKU: ${p.sku}) telah dihapus dari katalog.`,
        timestamp: new Date().toLocaleString('id-ID') + ' WIB',
        read: false
      });

      this.deleteConfirmProduct = null;
    }
  }
}
