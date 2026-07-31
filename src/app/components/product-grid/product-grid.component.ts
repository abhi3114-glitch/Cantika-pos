import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="space-y-4 my-4">
      
      <!-- Total Counter Header -->
      <div class="flex items-center justify-between px-1">
        <div class="text-xs font-bold text-gray-600">
          Menampilkan <span class="text-rose-600 font-extrabold">{{ (filteredProducts$ | async)?.length }}</span> Produk Kecantikan Pilihan
        </div>
        <div class="text-xs text-gray-400 font-semibold">
          Halaman {{ currentPage }} dari {{ totalPages }}
        </div>
      </div>

      <!-- Grid Container -->
      <ng-container *ngIf="(filteredProducts$ | async) as products">
        <div *ngIf="products.length > 0; else emptyState" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <app-product-card
            *ngFor="let product of getPaginatedProducts(products)"
            [product]="product"
            (selectProduct)="selectProduct.emit($event)"
            (addToCart)="addToCart.emit($event)"
          ></app-product-card>
        </div>

        <!-- Pagination Bar -->
        <div *ngIf="products.length > pageSize" class="flex items-center justify-center gap-2 pt-6">
          <button
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="px-4 py-2 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            ← Sebelumnya
          </button>

          <span class="text-xs font-bold text-gray-600 px-3">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage >= totalPages"
            class="px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-40 shadow-sm"
          >
            Berikutnya →
          </button>
        </div>
      </ng-container>

      <ng-template #emptyState>
        <div class="bg-white p-12 rounded-3xl text-center border border-gray-200 space-y-3">
          <div class="text-4xl">🔍</div>
          <h3 class="text-base font-bold text-gray-900">Produk Tidak Ditemukan</h3>
          <p class="text-xs text-gray-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau pilih brand lain dari filter di atas.
          </p>
        </div>
      </ng-template>

    </div>
  `
})
export class ProductGridComponent {
  @Output() selectProduct = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  public filteredProducts$: Observable<Product[]>;
  public currentPage = 1;
  public pageSize = 24;
  public totalPages = 1;

  constructor(private productService: ProductService) {
    this.filteredProducts$ = this.productService.getFilteredProducts();
    this.filteredProducts$.subscribe(products => {
      this.totalPages = Math.ceil(products.length / this.pageSize) || 1;
      this.currentPage = 1;
    });
  }

  public getPaginatedProducts(products: Product[]): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return products.slice(start, start + this.pageSize);
  }

  public goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }
}
