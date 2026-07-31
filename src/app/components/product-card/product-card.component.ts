import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="glass-card group p-3.5 flex flex-col justify-between h-full relative overflow-hidden cursor-pointer"
      (click)="selectProduct.emit(product)"
    >
      <!-- Stock & BPOM Badges Header -->
      <div class="flex items-center justify-between gap-1 mb-2">
        <span class="badge badge-brand text-[10px]">
          {{ product.vendor || product.type }}
        </span>

        <span 
          [class]="product.stock > 10 
            ? 'badge badge-stock text-[9px]' 
            : product.stock > 0 
            ? 'badge badge-low-stock text-[9px]' 
            : 'badge badge-out-stock text-[9px]'"
        >
          {{ product.stock > 0 ? 'Stok: ' + product.stock + ' ' + product.unit : 'Habis' }}
        </span>
      </div>

      <!-- Product Image Placeholder Thumbnail -->
      <div class="w-full h-36 rounded-2xl bg-gradient-to-tr from-pink-50 via-rose-50 to-amber-50 flex items-center justify-center p-3 my-1 relative group-hover:scale-[1.02] transition-all">
        <span class="text-4xl">✨</span>
        <div class="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-mono text-gray-500 font-bold">
          SKU: {{ product.sku.slice(0, 10) }}
        </div>
      </div>

      <!-- Product Title & Details -->
      <div class="space-y-1 my-2">
        <h3 class="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors">
          {{ product.name }}
        </h3>
        <p class="text-[10px] text-gray-400 font-medium">
          Isi: {{ product.unit }}
        </p>
      </div>

      <!-- Pricing & Add to Cart Footer -->
      <div class="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
        <div>
          <span class="text-[10px] text-gray-400 font-bold uppercase block -mb-0.5">Harga Retail</span>
          <span class="text-sm font-extrabold font-heading text-rose-700">
            {{ formatIDR(product.price) }}
          </span>
        </div>

        <button
          (click)="$event.stopPropagation(); addToCart.emit(product)"
          [disabled]="product.stock <= 0"
          class="w-9 h-9 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-sm disabled:opacity-40 transition-all"
          title="Tambah ke Keranjang"
        >
          🛒
        </button>
      </div>

    </div>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() selectProduct = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  public formatIDR(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }
}
