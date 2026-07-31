import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { AuditService } from '../../services/audit.service';
import { NotificationService } from '../../services/notification.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-edit-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen && product" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 dark:border-slate-800 relative space-y-5 max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            ✏️
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white font-heading">{{ 'editProductTitle' | translate }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">SKU: {{ product.sku }}</p>
          </div>
        </div>

        <form (ngSubmit)="handleSave()" class="space-y-4 text-xs">
          <!-- Smooth Professional Inline Validation Error Banner -->
          <div *ngIf="validationErrorMessage" class="p-3.5 bg-rose-50 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-rose-800 dark:text-rose-200 font-extrabold text-xs shadow-xs animate-shake">
            <span class="text-base">⚠️</span>
            <span>{{ validationErrorMessage }}</span>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {{ 'productFullName' | translate }} *
            </label>
            <input
              type="text"
              required
              [(ngModel)]="name"
              name="name"
              [class]="showNameError 
                ? 'w-full px-3 py-2 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 text-rose-900 dark:text-rose-200 rounded-xl font-medium focus:outline-hidden' 
                : 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-medium focus:outline-hidden'"
            />
            <p *ngIf="showNameError" class="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              ⚠️ Nama Produk Wajib Diisi (Tidak Boleh Kosong)!
            </p>
          </div>

          <!-- Global Store Default Margin Banner -->
          <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-base">🌐</span>
              <div>
                <span class="font-extrabold text-slate-700 dark:text-slate-300">Global Store Default Margin:</span>
                <span class="ml-1.5 font-mono font-black text-rose-600 dark:text-rose-400 text-sm">{{ globalMargin }}%</span>
              </div>
            </div>
            <button
              type="button"
              *ngIf="isOwner()"
              (click)="setAsGlobalDefault()"
              class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs transition-all flex items-center gap-1 active:scale-95"
              title="Simpan {{ customMargin }}% Sebagai Standar Profit Toko"
            >
              <span>⭐ Save as Global Default ({{ customMargin }}%)</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {{ 'thBuyingPrice' | translate }} {{ !isOwner() ? '🔒' : '' }}
              </label>
              <input
                type="number"
                [disabled]="!isOwner()"
                [(ngModel)]="buyingPrice"
                name="buyingPrice"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono font-bold disabled:opacity-50"
              />
            </div>

            <div>
              <label class="font-bold text-rose-800 dark:text-rose-400 block mb-1">Custom Item Margin (%)</label>
              <div class="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="500"
                  [disabled]="!isOwner()"
                  [(ngModel)]="customMargin"
                  name="customMargin"
                  placeholder="25"
                  class="w-full px-3 py-2 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-xl font-mono font-black text-rose-900 dark:text-rose-300 disabled:opacity-50"
                />
                <span class="font-extrabold text-rose-700 dark:text-rose-400 text-sm">%</span>
              </div>
            </div>
          </div>

          <!-- Quick Preset Margin Pills -->
          <div>
            <label class="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase block mb-1">{{ 'quickPresetsLabel' | translate }}</label>
            <div class="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                *ngFor="let m of [15, 20, 25, 30, 35, 40, 50]"
                [disabled]="!isOwner()"
                (click)="customMargin = m"
                [class]="customMargin === m 
                  ? 'px-2.5 py-1 rounded-xl bg-rose-600 text-white font-extrabold text-[10px] disabled:opacity-50' 
                  : 'px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50'"
              >
                +{{ m }}%
              </button>
            </div>
          </div>

          <!-- Smart Price Suggester Banner -->
          <div *ngIf="buyingPrice > 0 && canEditPrice()" class="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-2 text-xs">
            <div class="text-emerald-900 dark:text-emerald-200">
              <div class="font-bold text-[10px] uppercase text-emerald-700 dark:text-emerald-400">RECOMMENDED PRICE (+{{customMargin}}%)</div>
              <div class="text-sm font-extrabold font-heading">{{ formatIDR(getSuggestedPrice()) }}</div>
            </div>
            <button
              type="button"
              (click)="applyRecommendation()"
              class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] cursor-pointer"
            >
              {{ 'useRecommendation' | translate }}
            </button>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {{ 'thSellingPrice' | translate }} * {{ !canEditPrice() ? ('ownerOnly' | translate) : '' }}
            </label>
            <input
              type="number"
              required
              [disabled]="!canEditPrice()"
              [(ngModel)]="price"
              name="price"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-rose-700 dark:text-rose-400 disabled:opacity-50"
            />
            <p *ngIf="!canEditPrice()" class="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
              {{ 'securityLockNotice' | translate }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ 'thStock' | translate }} *</label>
              <input
                type="number"
                required
                min="0"
                [(ngModel)]="stock"
                name="stock"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ 'unitLabel' | translate }}</label>
              <input
                type="text"
                [(ngModel)]="unit"
                name="unit"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-medium"
              />
            </div>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" (click)="close.emit()" class="btn-secondary py-2 px-4">{{ 'btnCancel' | translate }}</button>
            <button type="submit" class="btn-primary py-2 px-5 font-bold">{{ 'saveChangesBtn' | translate }}</button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class EditProductModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();

  public name = '';
  public price = 0;
  public buyingPrice = 0;
  public stock = 0;
  public unit = 'pcs';
  
  public globalMargin = 20;
  public customMargin = 25;
  public showNameError = false;
  public validationErrorMessage = '';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private auditService: AuditService,
    private notificationService: NotificationService,
    public langService: LanguageService
  ) {
    this.globalMargin = this.productService.getGlobalProfitMargin();
    this.customMargin = this.globalMargin;

    this.productService.globalProfitMargin$.subscribe(m => {
      if (m) this.globalMargin = m;
    });
  }

  ngOnChanges() {
    if (this.product) {
      this.name = this.product.name;
      this.price = this.product.price;
      this.buyingPrice = this.product.buyingPrice;
      this.stock = this.product.stock;
      this.unit = this.product.unit;
      this.showNameError = false;
      this.validationErrorMessage = '';

      if (this.buyingPrice > 0 && this.price > 0) {
        this.customMargin = Math.round(((this.price - this.buyingPrice) / this.buyingPrice) * 100);
      } else {
        this.customMargin = this.globalMargin;
      }
    }
  }

  public setAsGlobalDefault() {
    this.productService.setGlobalProfitMargin(this.customMargin);
  }

  public canEditPrice(): boolean {
    return this.authService.canEditPrice();
  }

  public isOwner(): boolean {
    return this.authService.isOwner();
  }

  public getSuggestedPrice(): number {
    if (this.buyingPrice <= 0) return 0;
    const raw = this.buyingPrice * (1 + (this.customMargin || 20) / 100);
    return Math.ceil(raw / 100) * 100;
  }

  public applyRecommendation() {
    this.price = this.getSuggestedPrice();
  }

  public formatIDR(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  public handleSave() {
    if (!this.product) return;
    this.showNameError = false;
    this.validationErrorMessage = '';

    if (!this.name || !this.name.trim()) {
      this.showNameError = true;
      this.validationErrorMessage = '⚠️ Gagal Menyimpan: Nama produk wajib diisi dan tidak boleh kosong!';
      return;
    }

    const user = this.authService.getCurrentUser();
    const updated: Product = {
      ...this.product,
      name: this.name,
      price: Number(this.price),
      buyingPrice: Number(this.buyingPrice),
      stock: Number(this.stock),
      unit: this.unit
    };

    this.productService.updateProduct(updated);

    // Audit log
    const timestampStr = new Date().toLocaleString('id-ID') + ' WIB';
    this.auditService.addLog({
      id: `log_${Date.now()}`,
      timestamp: timestampStr,
      userId: user?.id || 'usr_staff',
      userName: user?.name || 'Staff Kasir',
      userRole: user?.role || 'employee',
      productId: this.product.id,
      productName: this.name,
      productSku: this.product.sku,
      fieldChanged: 'Perubahan Data Produk (Edit)',
      oldValue: `Harga: Rp ${this.product.price}, Stok: ${this.product.stock}`,
      newValue: `Harga: Rp ${this.price}, Stok: ${this.stock} (Margin: ${this.customMargin}%)`
    });

    // Upgraded Rich Mobile/Telegram Notification
    const oldPriceStr = this.formatIDR(this.product.price);
    const newPriceStr = this.formatIDR(this.price);
    const priceDiff = this.price - this.product.price;
    const priceDiffStr = priceDiff >= 0 ? `+${this.formatIDR(priceDiff)}` : `-${this.formatIDR(Math.abs(priceDiff))}`;
    
    const profitMargin = this.price - this.buyingPrice;
    const marginPercent = this.buyingPrice > 0 ? ((profitMargin / this.buyingPrice) * 100).toFixed(1) : '0';

    const editMsg = 
      `📦 Produk: ${this.name}\n` +
      `🏷️ Barcode / SKU: ${this.product.barcode || '-'} | SKU: ${this.product.sku}\n\n` +
      `💥 Perubahan Harga: ${oldPriceStr} ➔ ${newPriceStr} (${priceDiffStr})\n` +
      `📊 Perubahan Stok: ${this.product.stock} pcs ➔ ${this.stock} pcs\n` +
      `📈 Analisis Margin: Modal ${this.formatIDR(this.buyingPrice)} ➔ Untung ${this.formatIDR(profitMargin)} (+${marginPercent}%)`;

    this.notificationService.sendNotification({
      id: `notif_${Date.now()}`,
      type: 'price_change',
      title: `✏️ UPDATE HARGA & DETAIL PRODUK`,
      message: editMsg,
      timestamp: timestampStr,
      read: false,
      actorName: user?.name ? `${user.name} (${user.role === 'owner' ? 'Owner' : 'Kasir'})` : 'Jess Lim (Owner)',
      productName: this.name
    });

    this.close.emit();
  }
}
