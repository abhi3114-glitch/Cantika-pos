import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { FilterState } from '../../models/product.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm space-y-4 my-3">
      
      <div class="flex flex-col md:flex-row items-center justify-between gap-3">
        
        <!-- Search Input -->
        <div class="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Cari nama produk, brand, SKU, atau barcode..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-rose-500 transition-all outline-none"
          />
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <button
            *ngIf="searchQuery"
            (click)="clearSearch()"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <!-- Filter Controls Right -->
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <!-- Category Type Selector -->
          <select
            [(ngModel)]="selectedType"
            (ngModelChange)="onFilterChange()"
            class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700 focus:border-rose-500 outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="WARDAH">Wardah Cosmetics</option>
            <option value="SKINTIFIC">Skintific Skincare</option>
            <option value="SOMETHINC">Somethinc Beauty</option>
            <option value="HANASUI">Hanasui Care</option>
            <option value="AKSESORIS">Aksesoris Kecantikan</option>
            <option value="SOFLENS">Soflens & Eyecare</option>
          </select>

          <!-- Sort Selector -->
          <select
            [(ngModel)]="sortBy"
            (ngModelChange)="onFilterChange()"
            class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700 focus:border-rose-500 outline-none"
          >
            <option value="featured">Rekomendasi Utama</option>
            <option value="price-low">Harga: Terrendah ke Tertinggi</option>
            <option value="price-high">Harga: Tertinggi ke Terrendah</option>
            <option value="name-asc">Nama: A - Z</option>
            <option value="stock-desc">Stok Terbanyak</option>
          </select>

          <!-- In Stock Only Checkbox -->
          <label class="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer bg-gray-50 px-3 py-2 rounded-2xl border border-gray-200 select-none">
            <input
              type="checkbox"
              [(ngModel)]="inStockOnly"
              (ngModelChange)="onFilterChange()"
              class="rounded text-rose-600 focus:ring-rose-500"
            />
            <span>Stok Tersedia</span>
          </label>

        </div>

      </div>
    </div>
  `
})
export class FilterBarComponent {
  public searchQuery = '';
  public selectedType = 'ALL';
  public sortBy: FilterState['sortBy'] = 'featured';
  public inStockOnly = false;

  constructor(private productService: ProductService) {}

  public onSearchChange() {
    this.productService.updateFilters({ searchQuery: this.searchQuery });
  }

  public clearSearch() {
    this.searchQuery = '';
    this.onSearchChange();
  }

  public onFilterChange() {
    this.productService.updateFilters({
      selectedType: this.selectedType,
      sortBy: this.sortBy,
      inStockOnly: this.inStockOnly
    });
  }
}
