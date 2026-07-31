import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { AuditService } from '../../services/audit.service';
import { NotificationService } from '../../services/notification.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Product, CartItem, SaleTransaction } from '../../models/product.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-pos-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, IconComponent],
  template: `
    <div class="bg-slate-100/60 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 animate-fade-in transition-colors">
      
      <!-- Shopify POS Header Bar -->
      <div class="flex items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-slate-900 dark:bg-rose-950/80 text-white flex items-center justify-center font-bold text-sm border border-slate-800 dark:border-rose-900">
            <app-icon name="shopping-bag" size="18" class="text-rose-400"></app-icon>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900 dark:text-white font-heading leading-tight">{{ 'posCheckoutTitle' | translate }}</h2>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{{ 'activeCashierLabel' | translate }} <strong class="text-slate-800 dark:text-slate-200 font-semibold">{{ getCurrentUser()?.name }}</strong></p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700">
            INV: <span class="text-slate-900 dark:text-rose-400 font-bold">{{ transactionNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Main Shopify POS 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        <!-- LEFT COLUMN: Product Catalog Grid (Shopify POS Tiles) -->
        <div class="lg:col-span-7 space-y-3">
          
          <!-- Search Bar -->
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <input
                id="pos-search-input"
                type="text"
                [(ngModel)]="searchTerm"
                (ngModelChange)="filterProducts()"
                (keyup.enter)="onSearchEnter()"
                [placeholder]="'posSearchPlaceholder' | translate"
                class="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-800 shadow-xs transition-colors"
              />
              <app-icon name="search" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></app-icon>
              <button
                *ngIf="searchTerm"
                (click)="clearSearch()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold p-0.5 cursor-pointer"
                title="Clear Search"
              >
                ✕
              </button>
            </div>

            <button
              (click)="filterProducts(); onSearchEnter()"
              class="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-rose-900 text-white font-bold text-xs hover:bg-slate-800 dark:hover:bg-rose-950 cursor-pointer transition-colors"
            >
              Search
            </button>
          </div>

          <!-- Stock Limit Alert Banner -->
          <div *ngIf="stockAlertMessage" class="p-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-between shadow-xs border border-amber-400 animate-fade-in">
            <span>{{ stockAlertMessage }}</span>
            <button (click)="stockAlertMessage = ''" class="ml-2 font-mono font-bold text-slate-900 hover:text-white cursor-pointer">✕</button>
          </div>

          <!-- Product Tiles Grid (Shopify POS Card System) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2.5 max-h-[560px] overflow-y-auto pr-1">
            <div
              *ngFor="let p of searchResults"
              (click)="addToCart(p)"
              class="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-700 dark:hover:border-rose-600 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2 group active:scale-[0.98]"
            >
              <div>
                <div class="flex items-center justify-between text-[10px] mb-1">
                  <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[9px] truncate max-w-[100px]">{{ getVendorDisplay(p) }}</span>
                  <span [class]="p.stock === 0 ? 'text-rose-600 dark:text-rose-400 font-bold text-[9px]' : (p.stock <= 2 ? 'text-amber-600 dark:text-amber-400 font-bold text-[9px]' : 'text-slate-400 dark:text-slate-500 text-[9px]')">
                    {{ p.stock === 0 ? 'Out of Stock' : (p.stock + ' ' + p.unit) }}
                  </span>
                </div>
                <h4 class="font-semibold text-slate-900 dark:text-slate-100 text-xs line-clamp-2 leading-tight group-hover:text-rose-800 dark:group-hover:text-rose-400 transition-colors">{{ p.name }}</h4>
              </div>

              <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span class="font-bold text-slate-900 dark:text-white text-xs font-mono">Rp {{ p.price.toLocaleString('id-ID') }}</span>
                <span class="w-6 h-6 rounded-md bg-slate-900 dark:bg-slate-800 group-hover:bg-rose-800 text-white flex items-center justify-center font-bold text-xs shadow-xs transition-colors">+</span>
              </div>
            </div>

            <div *ngIf="searchResults.length === 0" class="col-span-3 p-8 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center space-y-3">
              <div class="text-slate-500 dark:text-slate-400 font-medium text-xs">
                No registered items match <span class="font-mono text-rose-800 dark:text-rose-400 font-bold">"{{ searchTerm }}"</span>
              </div>
              <button
                (click)="quickAddScannedBarcode(searchTerm)"
                class="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-rose-900 text-white font-bold text-xs hover:bg-slate-800 dark:hover:bg-rose-950 cursor-pointer"
              >
                + Add Barcode {{ searchTerm }} to Catalog
              </button>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: Shopify POS Cart & Checkout Sidebar -->
        <div class="lg:col-span-5 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          
          <!-- Cart Header -->
          <div class="flex items-center justify-between font-bold text-slate-900 dark:text-white font-heading text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <span class="flex items-center gap-1.5">
              <app-icon name="shopping-bag" size="16" class="text-slate-700 dark:text-slate-300"></app-icon>
              Current Sale ({{ getCartTotalQty() }} {{ getCartTotalQty() === 1 ? 'item' : 'items' }})
            </span>
            <button (click)="clearCart()" *ngIf="cart.length > 0" class="text-[11px] text-rose-700 dark:text-rose-400 hover:text-rose-900 font-semibold cursor-pointer">Clear All</button>
          </div>

          <!-- Line Items List -->
          <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <div *ngFor="let item of cart; let idx = index" class="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs gap-2">
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-slate-900 dark:text-white line-clamp-1 text-[11px]">{{ item.product.name }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Rp {{ item.product.price.toLocaleString('id-ID') }} × {{ item.quantity }} = <strong class="text-rose-700 dark:text-rose-400">Rp {{ (item.product.price * item.quantity).toLocaleString('id-ID') }}</strong>
                </div>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <button (click)="updateQty(idx, -1)" class="w-6 h-6 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center cursor-pointer text-xs shadow-xs">-</button>
                <input
                  type="number"
                  min="1"
                  [name]="'cart_qty_' + idx"
                  [ngModel]="item.quantity"
                  (input)="setDirectQty(idx, $any($event.target).value)"
                  class="font-mono font-bold text-slate-900 dark:text-white w-11 text-center text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded py-0.5"
                />
                <button (click)="updateQty(idx, 1)" class="w-6 h-6 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center cursor-pointer text-xs shadow-xs">+</button>
                <button (click)="removeItem(idx)" class="ml-1 text-slate-400 dark:text-slate-500 hover:text-rose-700 dark:hover:text-rose-400 font-bold cursor-pointer text-xs p-1">✕</button>
              </div>
            </div>

            <div *ngIf="cart.length === 0" class="p-8 text-center text-slate-400 dark:text-slate-500 font-medium text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              Cart is empty. Tap items on the left to add.
            </div>
          </div>

          <!-- Customer & Payment Fields -->
          <div class="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">Customer Name</label>
                <input
                  type="text"
                  [(ngModel)]="customerName"
                  placeholder="General Customer"
                  class="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">Payment Method</label>
                <select
                  [(ngModel)]="paymentMethod"
                  class="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-xs text-slate-900 dark:text-white"
                >
                  <option value="Tunai">Cash (Tunai)</option>
                  <option value="QRIS">QRIS / Instant</option>
                  <option value="Transfer Bank">Bank Transfer</option>
                  <option value="COD">COD</option>
                </select>
              </div>
            </div>

            <!-- Custom Discount Input & Presets -->
            <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <app-icon name="tag" size="13" class="text-amber-600 dark:text-amber-400"></app-icon> Discount
                </span>
                <div class="flex items-center gap-1">
                  <button
                    (click)="discountType = 'percent'"
                    [class]="discountType === 'percent' ? 'px-2 py-0.5 bg-slate-900 dark:bg-rose-900 text-white font-bold text-[10px] rounded' : 'px-2 py-0.5 text-slate-600 dark:text-slate-400 text-[10px]'"
                  >
                    %
                  </button>
                  <button
                    (click)="discountType = 'nominal'"
                    [class]="discountType === 'nominal' ? 'px-2 py-0.5 bg-slate-900 dark:bg-rose-900 text-white font-bold text-[10px] rounded' : 'px-2 py-0.5 text-slate-600 dark:text-slate-400 text-[10px]'"
                  >
                    Rp
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="number"
                  [(ngModel)]="discountValue"
                  placeholder="Discount value..."
                  class="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-900 dark:text-white"
                />
                <div class="flex items-center gap-1">
                  <button (click)="setDiscountPreset(5)" class="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-[10px] rounded">5%</button>
                  <button (click)="setDiscountPreset(10)" class="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-[10px] rounded">10%</button>
                  <button (click)="setDiscountPreset(15)" class="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-[10px] rounded">15%</button>
                </div>
              </div>
            </div>

            <!-- Cash Received / Change (Return) Input Box for Cash Payment -->
            <div *ngIf="paymentMethod === 'Tunai'" class="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="font-bold text-emerald-950 dark:text-emerald-300 text-xs">
                  💵 Cash Received / Pay (Rp)
                </label>
                <div class="flex items-center gap-1">
                  <button type="button" (click)="setPresetCashAmount(0)" class="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100 font-extrabold text-[10px] rounded-lg cursor-pointer hover:bg-emerald-300">Exact</button>
                  <button type="button" (click)="setPresetCashAmount(50000)" class="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100 font-extrabold text-[10px] rounded-lg cursor-pointer hover:bg-emerald-300">50k</button>
                  <button type="button" (click)="setPresetCashAmount(100000)" class="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100 font-extrabold text-[10px] rounded-lg cursor-pointer hover:bg-emerald-300">100k</button>
                  <button type="button" (click)="setPresetCashAmount(500000)" class="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100 font-extrabold text-[10px] rounded-lg cursor-pointer hover:bg-emerald-300">500k</button>
                </div>
              </div>

              <input
                type="number"
                name="cashPaidInput"
                [ngModel]="cashPaid"
                (input)="onCashInput($any($event.target).value)"
                (keyup)="onCashInput($any($event.target).value)"
                placeholder="Enter cash received (e.g. 50000)..."
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-700 rounded-xl text-sm font-mono font-black text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <!-- Financial Summary Box -->
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 text-xs">
              <div class="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span>Subtotal ({{ getCartTotalQty() }} items)</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">Rp {{ getSubtotal().toLocaleString('id-ID') }}</span>
              </div>

              <div *ngIf="getDiscountAmount() > 0" class="flex justify-between text-rose-600 dark:text-rose-400 font-extrabold">
                <span>Discount ({{ discountType === 'percent' ? discountValue + '%' : 'Nominal' }})</span>
                <span class="font-mono">-Rp {{ getDiscountAmount().toLocaleString('id-ID') }}</span>
              </div>

              <div class="flex justify-between text-slate-900 dark:text-white font-black text-sm pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span>Total</span>
                <span class="font-mono text-rose-600 dark:text-rose-400 text-base font-black">Rp {{ getTotalPay().toLocaleString('id-ID') }}</span>
              </div>

              <div *ngIf="paymentMethod === 'Tunai'" class="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                <div class="flex justify-between text-slate-600 dark:text-slate-400 font-bold">
                  <span>Pay (Cash Received):</span>
                  <span class="font-mono font-black text-slate-900 dark:text-white">Rp {{ getCashPaidNumber().toLocaleString('id-ID') }}</span>
                </div>

                <div class="flex justify-between items-center pt-0.5">
                  <span class="font-bold text-slate-700 dark:text-slate-300 font-heading">Return / Change:</span>
                  <span *ngIf="getCashPaidNumber() >= getTotalPay()" class="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                    Rp {{ getCashChange().toLocaleString('id-ID') }}
                  </span>
                  <span *ngIf="getCashPaidNumber() < getTotalPay()" class="font-mono font-black text-rose-600 dark:text-rose-400 text-xs">
                    Less than Rp {{ (getTotalPay() - getCashPaidNumber()).toLocaleString('id-ID') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Shopify POS Iconic Full-Width CHARGE Button -->
            <button
              (click)="handleCheckout()"
              [disabled]="cart.length === 0"
              class="w-full py-3.5 rounded-lg bg-rose-900 hover:bg-rose-950 dark:bg-rose-800 dark:hover:bg-rose-900 text-white font-bold text-sm shadow-xs tracking-wide uppercase disabled:opacity-40 cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <app-icon name="shopping-bag" size="18" class="text-white"></app-icon>
              <span>CHARGE RP. {{ getTotalPay().toLocaleString('id-ID') }}</span>
            </button>

            <!-- Success Receipt Modal Notification -->
            <div *ngIf="lastSale" class="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-lg space-y-1 text-xs animate-fade-in">
              <div class="font-bold flex items-center justify-between">
                <span>✓ Sale Completed!</span>
                <span class="font-mono">INV #{{ lastSale.transactionNumber }}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  `
})
export class PosCheckoutComponent implements OnInit {
  @Output() completeCheckout = new EventEmitter<SaleTransaction>();

  public allProducts: Product[] = [];
  public searchResults: Product[] = [];
  public searchTerm = '';

  public cart: CartItem[] = [];
  public customerName = '';
  public customerPhone = '';
  public paymentMethod: 'Tunai' | 'QRIS' | 'Transfer Bank' | 'COD' = 'Tunai';
  public cashPaid = 0;
  public discountType: 'percent' | 'nominal' = 'percent';
  public discountValue = 0;

  public transactionNumber = `POS-${Date.now().toString().slice(-6)}`;
  public lastSale: SaleTransaction | null = null;
  public stockAlertMessage = '';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private auditService: AuditService,
    private notificationService: NotificationService,
    public langService: LanguageService
  ) {}

  ngOnInit() {
    this.loadSavedCart();
    this.productService.products$.subscribe(prods => {
      this.allProducts = prods;
      this.filterProducts();
    });
  }

  private persistCart() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cantika_pos_cart', JSON.stringify(this.cart));
    }
  }

  private loadSavedCart() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('cantika_pos_cart');
      if (saved) {
        try {
          const items = JSON.parse(saved);
          if (Array.isArray(items)) {
            this.cart = items.map((i: any) => ({
              product: i.product,
              quantity: Math.max(1, Math.floor(Number(i.quantity) || 1))
            }));
          }
        } catch (e) {}
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault();
      const el = document.getElementById('pos-search-input');
      if (el) el.focus();
    } else if (event.key === 'F4') {
      event.preventDefault();
      if (this.cart.length > 0) {
        this.handleCheckout();
      }
    } else if (event.key === 'Escape') {
      if (this.searchTerm) {
        this.searchTerm = '';
        this.filterProducts();
      }
    }
  }

  public filterProducts() {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.searchResults = this.allProducts.slice(0, 30);
      return;
    }

    try {
      const q = this.searchTerm.toLowerCase().trim();
      const matches = this.allProducts.filter(p => {
        if (!p) return false;
        const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
        const skuMatch = p.sku ? p.sku.toLowerCase().includes(q) : false;
        const barcodeMatch = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
        const vendorMatch = p.vendor ? p.vendor.toLowerCase().includes(q) : false;
        const typeMatch = p.type ? p.type.toLowerCase().includes(q) : false;
        return nameMatch || skuMatch || barcodeMatch || vendorMatch || typeMatch;
      });

      // Barcode Scanner Auto-Add if exact barcode match AND in stock!
      const exactBarcode = this.allProducts.find(p => p && p.barcode && p.barcode.toLowerCase() === q);
      if (exactBarcode && exactBarcode.stock > 0 && q.length >= 8) {
        this.addToCart(exactBarcode);
        this.searchTerm = '';
        this.searchResults = this.allProducts.slice(0, 30);
        return;
      }

      this.searchResults = matches.slice(0, 30);
    } catch (err) {
      console.error('Error filtering products:', err);
    }
  }

  public quickAddScannedBarcode(barcode: string) {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;
    const newProd: Product = {
      id: `prod_${Date.now()}`,
      sku: cleanBarcode,
      barcode: cleanBarcode,
      name: `Produk Barcode ${cleanBarcode}`,
      vendor: 'AKSESORIS',
      type: 'AKSESORIS',
      buyingPrice: 15000,
      price: 25000,
      stock: 50,
      unit: 'pcs',
      weight: 100,
      weightUnit: 'gram',
      collection: 'Baru'
    };
    this.productService.addProduct(newProd);
    this.addToCart(newProd);
    this.searchTerm = '';
    this.filterProducts();
  }

  public onSearchEnter() {
    if (this.searchResults.length === 1) {
      this.addToCart(this.searchResults[0]);
      this.searchTerm = '';
      this.filterProducts();
    }
  }

  public clearSearch() {
    this.searchTerm = '';
    this.filterProducts();
  }

  public getCartTotalQty(): number {
    return this.cart.reduce((sum, item) => sum + Math.max(1, Math.floor(Number(item.quantity) || 1)), 0);
  }

  public addToCart(product: Product) {
    if (!product) return;

    // Fresh product instance resolution
    const latestProd = this.allProducts.find(p => p.id === product.id) || product;
    const existing = this.cart.find(c => c.product.id === latestProd.id);

    if (existing) {
      const currentQty = Math.max(1, Math.floor(Number(existing.quantity) || 1));
      const nextQty = currentQty + 1;
      existing.quantity = nextQty;
      if (nextQty > latestProd.stock) {
        this.stockAlertMessage = `⚠️ System Stock Notice: "${latestProd.name}" quantity (${nextQty}) exceeds recorded system stock (${latestProd.stock} ${latestProd.unit}). Item added to sale.`;
        setTimeout(() => this.stockAlertMessage = '', 4000);
      }
    } else {
      this.cart.push({ product: { ...latestProd }, quantity: 1 });
      if (latestProd.stock <= 0) {
        this.stockAlertMessage = `⚠️ System Stock Notice: "${latestProd.name}" has 0 recorded stock in system. Added to Current Sale.`;
        setTimeout(() => this.stockAlertMessage = '', 4000);
      }
    }
    this.cart = [...this.cart];
    this.persistCart();
  }

  public updateQty(index: number, delta: number) {
    const item = this.cart[index];
    if (!item) return;
    const currentQty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      this.cart.splice(index, 1);
    } else {
      item.quantity = newQty;
      const latestProd = this.allProducts.find(p => p.id === item.product.id) || item.product;
      if (newQty > latestProd.stock) {
        this.stockAlertMessage = `⚠️ System Stock Notice: "${latestProd.name}" quantity (${newQty}) exceeds recorded system stock (${latestProd.stock} ${latestProd.unit}).`;
        setTimeout(() => this.stockAlertMessage = '', 4000);
      }
    }
    this.cart = [...this.cart];
    this.persistCart();
  }

  public setDirectQty(index: number, val: any) {
    const item = this.cart[index];
    if (!item) return;
    const num = Math.max(1, Math.floor(Number(val) || 1));
    item.quantity = num;
    const latestProd = this.allProducts.find(p => p.id === item.product.id) || item.product;
    if (num > latestProd.stock) {
      this.stockAlertMessage = `⚠️ System Stock Notice: "${latestProd.name}" quantity (${num}) exceeds recorded system stock (${latestProd.stock} ${latestProd.unit}).`;
      setTimeout(() => this.stockAlertMessage = '', 4000);
    }
    this.cart = [...this.cart];
    this.persistCart();
  }

  public removeItem(index: number) {
    this.cart.splice(index, 1);
    this.cart = [...this.cart];
    this.persistCart();
  }

  public clearCart() {
    this.cart = [];
    this.customerName = '';
    this.customerPhone = '';
    this.cashPaid = 0;
    this.discountValue = 0;
    this.discountType = 'percent';
    this.stockAlertMessage = '';
    this.persistCart();
  }

  public setDiscountPreset(percent: number) {
    this.discountType = 'percent';
    this.discountValue = percent;
  }

  public getSubtotal(): number {
    if (!this.cart || this.cart.length === 0) return 0;
    return this.cart.reduce((sum, item) => {
      const price = Number(item.product?.price) || 0;
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      return sum + (price * qty);
    }, 0);
  }

  public getDiscountAmount(): number {
    const subtotal = this.getSubtotal();
    const val = Number(this.discountValue) || 0;
    if (val <= 0 || subtotal <= 0) return 0;
    if (this.discountType === 'percent') {
      return Math.round((subtotal * Math.min(100, val)) / 100);
    } else {
      return Math.min(val, subtotal);
    }
  }

  public getTotalPay(): number {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    return Math.max(0, subtotal - discount);
  }

  public getPointsEarned(): number {
    return Math.floor(this.getTotalPay() * 0.01);
  }

  public getCashPaidNumber(): number {
    if (this.cashPaid === null || this.cashPaid === undefined) return 0;
    const num = Number(this.cashPaid);
    return isNaN(num) ? 0 : Math.max(0, num);
  }

  public onCashInput(val: any) {
    if (val === null || val === undefined || val === '') {
      this.cashPaid = 0;
    } else {
      this.cashPaid = Math.max(0, Number(val) || 0);
    }
  }

  public setPresetCashAmount(preset: number) {
    if (preset === 0) {
      this.cashPaid = this.getTotalPay();
    } else {
      this.cashPaid = preset;
    }
  }

  public getCashChange(): number {
    const total = this.getTotalPay();
    const cash = this.getCashPaidNumber();
    if (cash < total) return 0;
    return cash - total;
  }

  public getVendorDisplay(p: Product): string {
    if (p && p.vendor && p.vendor.trim()) return p.vendor.trim();
    if (!p || !p.name) return 'BEAUTY';
    const clean = p.name.trim().replace(/^CV\.\s*/i, '');
    const firstWord = clean.split(/[\s\-_\/:]+/)[0];
    return firstWord ? firstWord.toUpperCase() : 'BEAUTY';
  }

  public getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  public handleCheckout() {
    if (this.cart.length === 0) return;

    const user = this.getCurrentUser();
    const timestampStr = new Date().toLocaleString('id-ID') + ' WIB';
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const total = this.getTotalPay();

    // Deep copy cart snapshot for transaction receipt
    const snapshotItems: CartItem[] = JSON.parse(JSON.stringify(this.cart.map(i => ({
      product: i.product,
      quantity: Math.max(1, Math.floor(Number(i.quantity) || 1))
    }))));

    // 1. Create Sale Transaction record
    const sale: SaleTransaction = {
      id: `sale_${Date.now()}`,
      transactionNumber: this.transactionNumber,
      timestamp: timestampStr,
      cashierName: user?.name || 'Kasir',
      customerName: this.customerName || 'Pelanggan Toko',
      customerPhone: this.customerPhone || '-',
      items: snapshotItems,
      subtotal: subtotal,
      discountPercent: this.discountType === 'percent' ? this.discountValue : 0,
      discountAmount: discount,
      totalAmount: total,
      paymentMethod: this.paymentMethod,
      cashPaid: Number(this.cashPaid) || total,
      cashChange: this.getCashChange(),
      pointsEarned: this.getPointsEarned()
    };

    // 2. Batch stock updates & audit logs
    const updatedProducts: Product[] = [];
    snapshotItems.forEach(item => {
      const prod = this.allProducts.find(p => p.id === item.product.id);
      if (prod) {
        const itemQty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        const newStock = Math.max(0, prod.stock - itemQty);
        updatedProducts.push({
          ...prod,
          stock: newStock
        });

        // Audit Log
        this.auditService.addLog({
          id: `log_sale_${Date.now()}_${prod.id}`,
          timestamp: timestampStr,
          userId: user?.id || 'usr_staff',
          userName: user?.name || 'Kasir',
          userRole: user?.role || 'employee',
          productId: prod.id,
          productName: prod.name,
          productSku: prod.sku,
          fieldChanged: `Penjualan POS [${this.transactionNumber}]`,
          oldValue: `${prod.stock} pcs`,
          newValue: `${newStock} pcs (-${itemQty})`
        });

        // Low stock alert trigger
        if (newStock <= 2) {
          this.notificationService.sendNotification({
            id: `notif_low_${Date.now()}`,
            type: 'low_stock',
            title: '⚠️ STOK KRITIS TERDETEKSI (LOW STOCK)',
            message: `📦 Produk: ${prod.name}\n🏷️ Barcode: ${prod.barcode || prod.sku}\n📊 Stok Tersisa: ${newStock} pcs (Minimum: 2 pcs)\n🛒 Dipicu Oleh: Transaksi POS #${this.transactionNumber}\n💡 Rekomendasi: Segera buat Restock Purchase Order (PO)!`,
            timestamp: timestampStr,
            read: false,
            actorName: user?.name || 'Kasir',
            productName: prod.name
          });
        }
      }
    });

    if (updatedProducts.length > 0) {
      this.productService.updateProducts(updatedProducts);
    }

    // Rich Itemized POS Sale Notification
    const itemLines = snapshotItems.map(i => `  • ${i.product.name} (x${i.quantity}) = ${this.formatIDR(i.product.price * i.quantity)}`).join('\n');
    const custInfo = this.customerName ? `${this.customerName} (${this.customerPhone || '-'})` : 'Pelanggan Umum';
    const discInfo = discount > 0 ? `\n🏷️ Diskon Promo: -${this.formatIDR(discount)}` : '';
    const cashInfo = this.paymentMethod === 'Tunai' ? `\n💵 Tunai Diterima: ${this.formatIDR(this.cashPaid || total)} | Kembalian: ${this.formatIDR(this.getCashChange())}` : '';

    const detailedSaleMsg = 
      `👤 Pembeli: ${custInfo}\n` +
      `💳 Metode Pembayaran: ${this.paymentMethod.toUpperCase()}\n\n` +
      `🛒 Rincian Barang (${snapshotItems.length} Jenis):\n${itemLines}\n` +
      `----------------------------------------\n` +
      `💵 Subtotal: ${this.formatIDR(subtotal)}${discInfo}\n` +
      `💰 TOTAL AKHIR: ${this.formatIDR(total)}${cashInfo}`;

    this.notificationService.sendNotification({
      id: `notif_sale_${Date.now()}`,
      type: 'price_change',
      title: `🛍️ TRANSAKSI PENJUALAN POS #${this.transactionNumber}`,
      message: detailedSaleMsg,
      timestamp: timestampStr,
      read: false,
      actorName: user?.name ? `${user.name} (${user.role === 'owner' ? 'Owner' : 'Kasir'})` : 'Kasir Toko',
      productName: `Faktur #${this.transactionNumber}`
    });

    this.lastSale = sale;
    this.completeCheckout.emit(sale);

    // Clean POS Reset for Next Transaction
    this.cart = [];
    this.customerName = '';
    this.customerPhone = '';
    this.cashPaid = 0;
    this.discountValue = 0;
    this.discountType = 'percent';
    this.stockAlertMessage = '';
    this.transactionNumber = `POS-${Date.now().toString().slice(-6)}`;
    this.persistCart();
  }

  public formatIDR(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  public getWAReceiptLink(sale: SaleTransaction): string {
    const text = encodeURIComponent(
      `*CANTIKA BEAUTY STORE RECEIPT*\n` +
      `Faktur: ${sale.transactionNumber}\n` +
      `Waktu: ${sale.timestamp}\n` +
      `Kasir: ${sale.cashierName}\n` +
      `Customer: ${sale.customerName}\n` +
      `--------------------------------\n` +
      sale.items.map(i => `${i.product.name} x${i.quantity} = Rp ${(i.product.price * i.quantity).toLocaleString('id-ID')}`).join('\n') +
      `\n--------------------------------\n` +
      `TOTAL: Rp ${sale.totalAmount.toLocaleString('id-ID')}\n` +
      `Poin Member: +${sale.pointsEarned} pts\n` +
      `Terima kasih telah berbelanja!`
    );
    const phone = sale.customerPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${phone.startsWith('0') ? '62' + phone.slice(1) : phone}?text=${text}`;
  }
}
