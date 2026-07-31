import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 dark:border-slate-800 relative space-y-5 max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            📦
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white font-heading">{{ 'addProductTitle' | translate }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ 'addProductSub' | translate }}</p>
          </div>
        </div>

        <form (ngSubmit)="handleAdd()" class="space-y-4 text-xs">
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
              placeholder="WARDAH - LIQUID LIPSTICK 05"
              [class]="showNameError 
                ? 'w-full px-3 py-2 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 text-rose-900 dark:text-rose-200 rounded-xl font-medium focus:outline-hidden' 
                : 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-medium focus:outline-hidden'"
            />
            <p *ngIf="showNameError" class="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              ⚠️ Nama Produk Wajib Diisi (Tidak Boleh Kosong)!
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ 'skuCode' | translate }} *</label>
              <input
                type="text"
                required
                [(ngModel)]="sku"
                name="sku"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ 'brandCategory' | translate }}</label>
              <select
                [(ngModel)]="vendor"
                name="vendor"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold"
              >
                <option *ngFor="let b of existingBrands" [value]="b">{{ b }}</option>
                <option value="NEW_CUSTOM">{{ 'newBrandOption' | translate }}</option>
              </select>

              <!-- Custom Brand Text Input if 'NEW_CUSTOM' selected -->
              <input
                *ngIf="vendor === 'NEW_CUSTOM'"
                type="text"
                required
                [(ngModel)]="customVendor"
                name="customVendor"
                [placeholder]="'enterBrandPlaceholder' | translate"
                class="w-full px-3 py-2 mt-2 bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 rounded-xl font-bold font-mono text-rose-900 dark:text-rose-300 uppercase"
              />
            </div>
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
              (click)="setAsGlobalDefault()"
              class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs transition-all flex items-center gap-1 active:scale-95"
              title="Simpan {{ customMargin }}% Sebagai Standar Profit Toko"
            >
              <span>⭐ Save as Global Default ({{ customMargin }}%)</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ 'thBuyingPrice' | translate }} *</label>
              <input
                type="number"
                required
                min="0"
                [(ngModel)]="buyingPrice"
                name="buyingPrice"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono font-bold"
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
                  [(ngModel)]="customMargin"
                  name="customMargin"
                  placeholder="25"
                  class="w-full px-3 py-2 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-xl font-mono font-black text-rose-900 dark:text-rose-300"
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
                (click)="customMargin = m"
                [class]="customMargin === m 
                  ? 'px-2.5 py-1 rounded-xl bg-rose-600 text-white font-extrabold text-[10px]' 
                  : 'px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700'"
              >
                +{{ m }}%
              </button>
            </div>
          </div>

          <!-- Smart Price Suggester Banner -->
          <div *ngIf="buyingPrice > 0" class="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-2 text-xs">
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
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ 'thSellingPrice' | translate }} *</label>
            <input
              type="number"
              required
              min="0"
              [(ngModel)]="price"
              name="price"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-rose-700 dark:text-rose-400"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ 'initialStock' | translate }}</label>
              <input
                type="number"
                required
                min="1"
                [(ngModel)]="stock"
                name="stock"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-emerald-700 dark:text-emerald-400"
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
            <button type="submit" class="btn-primary py-2 px-5 font-bold">{{ 'btnSaveNotif' | translate }}</button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class AddProductModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public name = '';
  public sku = `${Math.floor(8990000000000 + Math.random() * 999999999)}`;
  public vendor = 'WARDAH';
  public customVendor = '';
  public existingBrands: string[] = ['WARDAH', 'SKINTIFIC', 'SOMETHINC', 'HANASUI', 'AKSESORIS', 'SOFLENS'];
  public buyingPrice = 28000;
  public price = 35000;
  public stock = 20;
  public unit = 'pcs';
  
  public globalMargin = 20;
  public customMargin = 25;
  public showNameError = false;
  public showSkuError = false;
  public validationErrorMessage = '';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private auditService: AuditService,
    private notificationService: NotificationService,
    public langService: LanguageService
  ) {}

  ngOnInit() {
    this.globalMargin = this.productService.getGlobalProfitMargin();
    this.customMargin = this.globalMargin;

    this.productService.globalProfitMargin$.subscribe(margin => {
      if (margin) {
        this.globalMargin = margin;
      }
    });

    this.productService.products$.subscribe(prods => {
      if (prods && prods.length > 0) {
        const unique = Array.from(new Set(prods.map(p => p.vendor).filter(Boolean))).sort();
        if (unique.length > 0) {
          this.existingBrands = unique;
          if (!this.existingBrands.includes(this.vendor)) {
            this.vendor = this.existingBrands[0];
          }
        }
      }
    });
  }

  public setAsGlobalDefault() {
    this.productService.setGlobalProfitMargin(this.customMargin);
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

  public handleAdd() {
    this.showNameError = false;
    this.showSkuError = false;
    this.validationErrorMessage = '';

    if (!this.name || !this.name.trim()) {
      this.showNameError = true;
      this.validationErrorMessage = '⚠️ Gagal Menyimpan: Nama produk wajib diisi dan tidak boleh kosong!';
      return;
    }

    if (!this.sku || !this.sku.trim()) {
      this.showSkuError = true;
      this.validationErrorMessage = '⚠️ Gagal Menyimpan: Kode SKU/Barcode wajib diisi!';
      return;
    }
    const user = this.authService.getCurrentUser();
    const finalVendor = this.vendor === 'NEW_CUSTOM' 
      ? (this.customVendor.trim().toUpperCase() || 'CUSTOM BRAND') 
      : this.vendor;

    const newProd: Product = {
      id: `prod_${Date.now()}`,
      sku: this.sku,
      barcode: this.sku,
      name: this.name,
      vendor: finalVendor,
      type: finalVendor,
      buyingPrice: Number(this.buyingPrice),
      price: Number(this.price),
      stock: Number(this.stock),
      unit: this.unit,
      weight: 100,
      weightUnit: 'gram',
      collection: 'Baru'
    };

    this.productService.addProduct(newProd);

    // Audit log
    const timestampStr = new Date().toLocaleString('id-ID') + ' WIB';
    this.auditService.addLog({
      id: `log_${Date.now()}`,
      timestamp: timestampStr,
      userId: user?.id || 'usr_staff',
      userName: user?.name || 'Staff Kasir',
      userRole: user?.role || 'employee',
      productId: newProd.id,
      productName: this.name,
      productSku: this.sku,
      fieldChanged: `Entri Produk Baru (${finalVendor})`,
      oldValue: 'Belum Ada',
      newValue: `Brand: ${finalVendor}, Stok Awal: ${this.stock} ${this.unit}, Harga: Rp ${this.price} (Margin: ${this.customMargin}%)`
    });

    // Upgraded Rich Notification for New Product
    const profitMargin = Number(this.price) - Number(this.buyingPrice);
    const marginPercent = Number(this.buyingPrice) > 0 ? ((profitMargin / Number(this.buyingPrice)) * 100).toFixed(1) : '0';

    const addMsg = 
      `🏢 Brand / Vendor: ${finalVendor}\n` +
      `📦 Nama Produk: ${this.name}\n` +
      `🏷️ SKU / Kode: ${this.sku}\n\n` +
      `💵 Harga Modal (Buying): ${this.formatIDR(Number(this.buyingPrice))}\n` +
      `💰 Harga Jual (Selling): ${this.formatIDR(Number(this.price))}\n` +
      `📈 Margin Profit: ${this.formatIDR(profitMargin)} (+${marginPercent}%)\n` +
      `📊 Stok Awal Terdaftar: ${this.stock} ${this.unit}`;

    this.notificationService.sendNotification({
      id: `notif_${Date.now()}`,
      type: 'new_product',
      title: `✨ PRODUK BARU DITAMBAHKAN`,
      message: addMsg,
      timestamp: timestampStr,
      read: false,
      actorName: user?.name ? `${user.name} (${user.role === 'owner' ? 'Owner' : 'Kasir'})` : 'Jess Lim (Owner)',
      productName: this.name
    });

    // Reset form
    this.customVendor = '';
    this.close.emit();
  }
}
