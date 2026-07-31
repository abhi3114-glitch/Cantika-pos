import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestockOrder } from '../../models/restock.model';
import { RestockService } from '../../services/restock.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-restock-detail-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen && order" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-amber-100 dark:border-slate-800 relative space-y-5 max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>

        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              📄
            </div>
            <div>
              <div class="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">{{ 'detailInvoiceTitle' | translate }}</div>
              <h2 class="text-lg font-black text-slate-900 dark:text-white font-mono">{{ order.billCode || order.id }}</h2>
            </div>
          </div>

          <button
            (click)="toggleStatus()"
            [class]="order.isPaid 
              ? 'px-3.5 py-1.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black border border-emerald-300 dark:border-emerald-800 text-xs shadow-xs' 
              : 'px-3.5 py-1.5 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black border border-rose-300 dark:border-rose-800 text-xs shadow-xs'"
          >
            {{ order.isPaid ? ('statusPaid' | translate) : ('statusUnpaid' | translate) }}
          </button>
        </div>

        <!-- Supplier & Metadata Summary Card -->
        <div class="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <div class="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase">{{ 'detailSupplierLabel' | translate }}</div>
            <div class="font-extrabold text-slate-900 dark:text-white text-sm">{{ order.supplierName }}</div>
          </div>

          <div>
            <div class="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase">{{ 'detailDeadlineLabel' | translate }}</div>
            <div class="font-mono font-black text-rose-700 dark:text-rose-400 text-sm">{{ order.paymentDeadline }}</div>
          </div>

          <div>
            <div class="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase">{{ 'detailReceivedLabel' | translate }}</div>
            <div class="font-bold text-slate-800 dark:text-slate-200">{{ order.timestamp }}</div>
          </div>

          <div>
            <div class="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase">{{ 'detailReceiverLabel' | translate }}</div>
            <div class="font-bold text-slate-800 dark:text-slate-200">{{ order.receivedByUserName }}</div>
          </div>
        </div>

        <!-- Itemized Products Breakdown Table -->
        <div class="space-y-2">
          <h4 class="font-black text-slate-900 dark:text-white font-heading text-xs">{{ 'detailItemsTitle' | translate }}</h4>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900 dark:bg-slate-950 text-white uppercase text-[10px] font-black">
                <tr>
                  <th class="p-2.5">{{ 'colProduct' | translate }} & SKU</th>
                  <th class="p-2.5 text-center">{{ 'detailRestockQty' | translate }}</th>
                  <th class="p-2.5 text-right">{{ 'detailUnitCost' | translate }}</th>
                  <th class="p-2.5 text-right">{{ 'colSubtotal' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr *ngFor="let item of order.items" class="hover:bg-amber-50/40 dark:hover:bg-amber-950/40">
                  <td class="p-2.5">
                    <div class="font-bold text-slate-900 dark:text-white">{{ item.productName }}</div>
                    <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">SKU: {{ item.sku }}</div>
                  </td>
                  <td class="p-2.5 text-center font-mono font-bold text-rose-700 dark:text-rose-400">+{{ item.quantityAdded }} pcs</td>
                  <td class="p-2.5 text-right font-mono text-slate-600 dark:text-slate-300">{{ formatIDR(item.buyingPriceUnit) }}</td>
                  <td class="p-2.5 text-right font-mono font-black text-slate-900 dark:text-white">{{ formatIDR(item.totalCost) }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <tr>
                  <td colspan="3" class="p-3 font-black text-slate-900 dark:text-white text-right uppercase text-[11px]">{{ 'detailTotalInvoice' | translate }}</td>
                  <td class="p-3 font-mono font-black text-amber-900 dark:text-amber-400 text-right text-sm">{{ formatIDR(order.totalAmountToPay) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button (click)="close.emit()" class="btn-primary py-2 px-5 font-bold text-xs cursor-pointer">{{ 'detailCloseBtn' | translate }}</button>
        </div>

      </div>
    </div>
  `
})
export class RestockDetailModalComponent {
  @Input() isOpen = false;
  @Input() order: RestockOrder | null = null;
  @Output() close = new EventEmitter<void>();

  constructor(private restockService: RestockService) {}

  public toggleStatus() {
    if (this.order) {
      this.restockService.togglePaymentStatus(this.order.id);
    }
  }

  public formatIDR(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }
}
