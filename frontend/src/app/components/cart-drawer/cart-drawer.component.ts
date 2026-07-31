import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white w-full max-w-md h-full flex flex-col shadow-2xl relative"
        (click)="$event.stopPropagation()"
      >
        <!-- Drawer Header -->
        <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
          <div class="flex items-center gap-2">
            <span class="text-xl">🛒</span>
            <div>
              <h2 class="text-sm font-bold text-gray-900 font-heading">Keranjang Belanja</h2>
              <span class="text-[10px] text-gray-500 font-medium">Cantika Beauty Store</span>
            </div>
          </div>
          <button (click)="close.emit()" class="p-2 rounded-full text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <ng-container *ngIf="cart$ | async as cart">
            <div *ngIf="cart.length > 0; else emptyCart" class="space-y-3">
              <div *ngFor="let item of cart" class="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3">
                <div class="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-xl shrink-0">✨</div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-xs font-bold text-gray-900 truncate">{{ item.product.name }}</h4>
                  <div class="text-xs font-extrabold text-rose-700 font-mono">{{ formatIDR(item.product.price) }}</div>
                </div>

                <!-- Quantity controls -->
                <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                  <button (click)="updateQuantity(item.product.id, item.quantity - 1)" class="w-6 h-6 font-bold text-xs">-</button>
                  <span class="w-6 text-center text-xs font-bold font-mono">{{ item.quantity }}</span>
                  <button (click)="updateQuantity(item.product.id, item.quantity + 1)" class="w-6 h-6 font-bold text-xs">+</button>
                </div>
              </div>
            </div>
          </ng-container>

          <ng-template #emptyCart>
            <div class="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <span class="text-4xl">🛍️</span>
              <h3 class="text-sm font-bold text-gray-800">Keranjang Masih Kosong</h3>
              <p class="text-xs text-gray-400">Pilih produk kecantikan favorit Anda dan tambahkan ke keranjang.</p>
            </div>
          </ng-template>
        </div>

        <!-- Checkout Summary Footer -->
        <div *ngIf="getCartSubtotal() > 0" class="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
          <div class="space-y-1 text-xs">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal Produk:</span>
              <span class="font-mono font-bold">{{ formatIDR(getCartSubtotal()) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Ongkos Kirim:</span>
              <span class="font-mono font-bold text-emerald-600">GRATIS</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
              <span>Total Pembayaran:</span>
              <span class="font-mono font-extrabold text-rose-700 text-base">{{ formatIDR(getCartSubtotal()) }}</span>
            </div>
          </div>

          <!-- WhatsApp Order Receipt Button -->
          <a
            [href]="getWhatsAppLink()"
            target="_blank"
            class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center"
          >
            💬 Kirim Struk Pesanan ke WhatsApp Toko
          </a>
        </div>

      </div>
    </div>
  `
})
export class CartDrawerComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public cart$: Observable<CartItem[]>;

  constructor(private productService: ProductService) {
    this.cart$ = this.productService.cart$;
  }

  public updateQuantity(productId: string, quantity: number) {
    this.productService.updateCartQuantity(productId, quantity);
  }

  public getCartSubtotal(): number {
    let subtotal = 0;
    this.productService.cart$.subscribe(items => {
      subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    });
    return subtotal;
  }

  public formatIDR(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  public getWhatsAppLink(): string {
    let text = `*STRUK PESANAN CANTIKA BEAUTY STORE*\n`;
    text += `-------------------------------------------\n`;
    text += `*Waktu:* ${new Date().toLocaleString('id-ID')}\n\n`;
    text += `*DETAIL PRODUK:*\n`;

    let subtotal = 0;
    this.productService.cart$.subscribe(items => {
      items.forEach((item, idx) => {
        text += `${idx + 1}. *${item.product.name}*\n`;
        text += `   ${item.quantity} x ${this.formatIDR(item.product.price)} = *${this.formatIDR(item.product.price * item.quantity)}*\n`;
        subtotal += item.product.price * item.quantity;
      });
    });

    text += `\n-------------------------------------------\n`;
    text += `*TOTAL PEMBAYARAN: ${this.formatIDR(subtotal)}*\n`;
    text += `-------------------------------------------\n`;
    text += `Terima kasih telah berbelanja di Cantika Beauty Store! 🌸`;

    return `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;
  }
}
