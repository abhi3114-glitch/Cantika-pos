import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

const TOP_BRANDS = [
  'ALL',
  'WARDAH',
  'SKINTIFIC',
  'SOMETHINC',
  'LUXCRIME',
  'HANASUI',
  'MAKE OVER',
  'GLAD2GLOW',
  'BARENBLISS',
  'IMPLORA',
  'PIXY',
  'YOU',
  'ACNAWAY',
  'AKSESORIS',
  'SOFLENS'
];

@Component({
  selector: 'app-brand-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
      <button
        *ngFor="let brand of brands"
        (click)="selectBrand(brand)"
        [class]="selectedVendor === brand 
          ? 'px-4 py-2 rounded-full text-xs font-extrabold bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md transition-all shrink-0' 
          : 'px-4 py-2 rounded-full text-xs font-bold bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600 border border-gray-200 transition-all shrink-0'"
      >
        {{ brand === 'ALL' ? '✨ Semua Brand (5.186)' : brand }}
      </button>
    </div>
  `
})
export class BrandFilterComponent {
  public brands = TOP_BRANDS;
  public selectedVendor = 'ALL';

  constructor(private productService: ProductService) {
    this.productService.filters$.subscribe(filters => {
      this.selectedVendor = filters.selectedVendor;
    });
  }

  public selectBrand(brand: string) {
    this.productService.updateFilters({ selectedVendor: brand });
  }
}
