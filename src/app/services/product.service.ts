import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, CartItem, FilterState, ViewMode } from '../models/product.model';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  private globalProfitMarginSubject = new BehaviorSubject<number>(this.getGlobalProfitMargin());
  public globalProfitMargin$ = this.globalProfitMarginSubject.asObservable();

  private viewModeSubject = new BehaviorSubject<ViewMode>('customer');
  public viewMode$ = this.viewModeSubject.asObservable();

  private filtersSubject = new BehaviorSubject<FilterState>({
    searchQuery: '',
    selectedVendor: 'ALL',
    selectedType: 'ALL',
    maxPrice: 2000000,
    inStockOnly: false,
    sortBy: 'featured'
  });
  public filters$ = this.filtersSubject.asObservable();

  constructor(private securityService: SecurityService) {
    this.loadProducts();
  }

  private loadProducts() {
    const cachedVault = this.securityService.getSecureStorage('cantika_products_vault');
    if (cachedVault && Array.isArray(cachedVault) && cachedVault.length > 0) {
      this.productsSubject.next(cachedVault);
      return;
    }

    fetch('assets/products.json')
      .then(res => res.json())
      .then((data: Product[]) => {
        this.productsSubject.next(data);
        this.securityService.setSecureStorage('cantika_products_vault', data);
      })
      .catch(err => {
        console.error('Failed to load products.json:', err);
      });
  }

  public getFilteredProducts(): Observable<Product[]> {
    return combineLatest([this.products$, this.filters$]).pipe(
      map(([products, filters]) => {
        return products
          .filter(p => {
            const matchesSearch = filters.searchQuery === '' ||
              p.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              p.sku.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              (p.barcode && p.barcode.includes(filters.searchQuery));

            const matchesVendor = filters.selectedVendor === 'ALL' || p.vendor === filters.selectedVendor;
            const matchesType = filters.selectedType === 'ALL' || p.type === filters.selectedType;
            const matchesPrice = p.price <= filters.maxPrice;
            const matchesStock = !filters.inStockOnly || p.stock > 0;

            return matchesSearch && matchesVendor && matchesType && matchesPrice && matchesStock;
          })
          .sort((a, b) => {
            if (filters.sortBy === 'price-low') return a.price - b.price;
            if (filters.sortBy === 'price-high') return b.price - a.price;
            if (filters.sortBy === 'name-asc') return a.name.localeCompare(b.name);
            if (filters.sortBy === 'stock-desc') return b.stock - a.stock;
            return 0;
          });
      })
    );
  }

  public updateFilters(newFilters: Partial<FilterState>) {
    this.filtersSubject.next({
      ...this.filtersSubject.value,
      ...newFilters
    });
  }

  public setViewMode(mode: ViewMode) {
    this.viewModeSubject.next(mode);
  }

  public updateProduct(updated: Product) {
    const current = this.productsSubject.value;
    const index = current.findIndex(p => p.id === updated.id);
    if (index !== -1) {
      const updatedList = [...current];
      updatedList[index] = updated;
      this.productsSubject.next(updatedList);
      this.securityService.setSecureStorage('cantika_products_vault', updatedList);
    }
  }

  public updateProducts(updatedItems: Product[]) {
    if (!updatedItems || updatedItems.length === 0) return;
    const current = [...this.productsSubject.value];
    updatedItems.forEach(updated => {
      const idx = current.findIndex(p => p.id === updated.id);
      if (idx !== -1) {
        current[idx] = updated;
      }
    });
    this.productsSubject.next(current);
    this.securityService.setSecureStorage('cantika_products_vault', current);
  }

  public addProduct(newProduct: Product) {
    const updatedList = [newProduct, ...this.productsSubject.value];
    this.productsSubject.next(updatedList);
    this.securityService.setSecureStorage('cantika_products_vault', updatedList);
  }

  public deleteProduct(id: string) {
    const updatedList = this.productsSubject.value.filter(p => p.id !== id);
    this.productsSubject.next(updatedList);
    this.securityService.setSecureStorage('cantika_products_vault', updatedList);
  }

  public getGlobalProfitMargin(): number {
    try {
      const saved = localStorage.getItem('cantika_global_profit_margin');
      return saved ? (Number(saved) || 20) : 20;
    } catch (e) {
      return 20;
    }
  }

  public setGlobalProfitMargin(margin: number) {
    const valid = Math.max(0, Number(margin) || 0);
    try {
      localStorage.setItem('cantika_global_profit_margin', String(valid));
    } catch (e) {}
    this.globalProfitMarginSubject.next(valid);
  }

  // Cart operations
  public addToCart(product: Product, quantity: number = 1) {
    const currentCart = this.cartSubject.value;
    const existing = currentCart.find(item => item.product.id === product.id);

    if (existing) {
      this.cartSubject.next(
        currentCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      this.cartSubject.next([...currentCart, { product, quantity }]);
    }
  }

  public updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this.cartSubject.next(
        this.cartSubject.value.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }

  public removeFromCart(productId: string) {
    this.cartSubject.next(
      this.cartSubject.value.filter(item => item.product.id !== productId)
    );
  }

  public clearCart() {
    this.cartSubject.next([]);
  }
}
