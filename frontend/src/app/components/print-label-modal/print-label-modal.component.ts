import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-print-label-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in print-modal-container">
      <div class="bg-slate-900 text-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden print-modal-content">
        
        <!-- Header (Hidden when printing) -->
        <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 no-print">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🏷️</span>
            <div>
              <h2 class="text-base font-black font-heading text-rose-400">Cetak Label Produk & Tag Harga (Shelf Tag & Barcode)</h2>
              <p class="text-xs text-slate-400 font-medium">Buat Tag Harga Promo (Format Word) atau Stiker Label Barcode (Format iSeller)</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button
              (click)="printPage()"
              class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              🖨️ Cetak / Print Label
            </button>
            <button (click)="close.emit()" class="p-2 text-slate-400 hover:text-white rounded-xl transition-all">✕</button>
          </div>
        </div>

        <div class="flex-1 flex overflow-hidden">
          
          <!-- Sidebar Options Controls (Hidden when printing) -->
          <div class="w-80 bg-slate-950 border-r border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0 no-print">
            
            <!-- Template Mode Switcher -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-black uppercase text-slate-400 tracking-wider">Desain Template Label</label>
              <div class="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
                <button
                  (click)="templateMode = 'word'"
                  [class]="templateMode === 'word' ? 'py-2 px-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-xs' : 'py-2 px-2.5 rounded-xl text-slate-400 font-bold text-xs hover:text-white'"
                >
                  📄 Tag Harga Word
                </button>
                <button
                  (click)="templateMode = 'iseller'"
                  [class]="templateMode === 'iseller' ? 'py-2 px-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-xs' : 'py-2 px-2.5 rounded-xl text-slate-400 font-bold text-xs hover:text-white'"
                >
                  🏷️ Label iSeller
                </button>
              </div>
            </div>

            <!-- Filter Products by Brand / Search -->
            <div class="space-y-2 pt-2 border-t border-slate-800">
              <label class="text-[11px] font-black uppercase text-slate-400 tracking-wider">Pilih Produk / Brand</label>
              
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Cari nama produk atau barcode..."
                class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-rose-500 font-medium"
              />

              <div class="flex items-center gap-1.5">
                <select
                  [(ngModel)]="selectedBrand"
                  class="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden font-bold"
                >
                  <option value="" disabled>-- Pilih Brand Untuk Dicetak --</option>
                  <option *ngFor="let b of brands" [value]="b">✨ Brand: {{ b }}</option>
                </select>
              </div>
            </div>

            <!-- Quantity Copies Multiplier Section -->
            <div class="p-3 bg-rose-950/40 border border-rose-800/60 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-black uppercase text-rose-300 tracking-wider">
                  🔢 Salinan Per Produk (Copies)
                </label>
                <span class="text-[10px] font-bold text-rose-400 font-mono">
                  {{ printCopiesCount }}x Lembar
                </span>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  [(ngModel)]="printCopiesCount"
                  placeholder="Jumlah salinan (misal 24)..."
                  class="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold font-mono text-white focus:outline-hidden"
                />
              </div>

              <!-- Quick Presets -->
              <div class="flex items-center gap-1">
                <button (click)="printCopiesCount = 1" [class]="printCopiesCount === 1 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">1x</button>
                <button (click)="printCopiesCount = 6" [class]="printCopiesCount === 6 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">6x</button>
                <button (click)="printCopiesCount = 12" [class]="printCopiesCount === 12 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">12x</button>
                <button (click)="printCopiesCount = 24" [class]="printCopiesCount === 24 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">24x</button>
                <button (click)="printCopiesCount = 48" [class]="printCopiesCount === 48 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">48x</button>
              </div>
            </div>

            <!-- Single Parent Product Label Switcher -->
            <div class="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-black uppercase text-emerald-300 tracking-wider">
                  ✨ Mode Label Cetak
                </label>
                <span class="text-[10px] font-bold text-emerald-400 font-mono">
                  {{ singleParentOnly ? 'Parent Only' : 'Semua Varian' }}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  [(ngModel)]="singleParentOnly"
                  id="singleParentCheck"
                  class="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <label for="singleParentCheck" class="text-xs text-emerald-200 font-bold cursor-pointer">
                  Single Parent (Tanpa Varian)
                </label>
              </div>
              <p class="text-[10px] text-emerald-400/80 font-medium">
                Menggabungkan produk varian warna/shade menjadi 1 label induk untuk rak toko.
              </p>
            </div>

            <!-- Options Controls -->
            <div class="space-y-3 pt-2 border-t border-slate-800">
              <label class="text-[11px] font-black uppercase text-slate-400 tracking-wider">Pengaturan Cetak</label>
              
              <!-- Word Mode Specific Settings -->
              <ng-container *ngIf="templateMode === 'word'">
                <div class="space-y-1.5">
                  <label class="text-xs text-slate-300 font-bold">Harga Coret (Strikethrough)</label>
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      [(ngModel)]="showStrikethrough"
                      id="strikeCheck"
                      class="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                    />
                    <label for="strikeCheck" class="text-xs text-slate-300 font-medium cursor-pointer">Tampilkan Harga Lama Coret</label>
                  </div>
                </div>

                <div class="space-y-1.5" *ngIf="showStrikethrough">
                  <label class="text-xs text-slate-400 font-medium">Custom % Diskon Harga Coret</label>
                  <div class="flex items-center gap-2">
                    <input
                      type="number"
                      [(ngModel)]="strikethroughMarkup"
                      placeholder="Contoh: 15"
                      class="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold font-mono focus:outline-hidden"
                    />
                    <span class="text-xs font-bold font-slate-400 font-mono">%</span>
                  </div>
                </div>
              </ng-container>

              <!-- iSeller Mode Specific Settings -->
              <ng-container *ngIf="templateMode === 'iseller'">
                <div class="space-y-1.5">
                  <label class="text-xs text-slate-300 font-bold">Ukuran Label Stiker</label>
                  <select
                    [(ngModel)]="labelSize"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-medium"
                  >
                    <option value="medium">Medium 1 1/4" x 2 1/4" (Standar)</option>
                    <option value="small">Small 1" x 1.5" (Kecil)</option>
                    <option value="large">Large 2" x 3" (Besar)</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-300 font-medium">Tampilkan Barcode Angka</span>
                    <input type="checkbox" [(ngModel)]="showBarcodeNumber" class="w-4 h-4 accent-rose-600 rounded cursor-pointer" />
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-300 font-medium">Tampilkan Harga Jual</span>
                    <input type="checkbox" [(ngModel)]="showPrice" class="w-4 h-4 accent-rose-600 rounded cursor-pointer" />
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-300 font-medium">Tampilkan Kode SKU</span>
                    <input type="checkbox" [(ngModel)]="showSKU" class="w-4 h-4 accent-rose-600 rounded cursor-pointer" />
                  </div>
                </div>
              </ng-container>

              <!-- Columns per row -->
              <div class="space-y-1.5">
                <label class="text-xs text-slate-300 font-bold">Jumlah Kolom Per Baris</label>
                <div class="grid grid-cols-2 gap-1.5">
                  <button
                    (click)="columns = 3"
                    [class]="columns === 3 ? 'py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl' : 'py-1.5 bg-slate-900 text-slate-400 font-bold text-xs rounded-xl hover:text-white'"
                  >
                    3 Kolom (Word)
                  </button>
                  <button
                    (click)="columns = 4"
                    [class]="columns === 4 ? 'py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl' : 'py-1.5 bg-slate-900 text-slate-400 font-bold text-xs rounded-xl hover:text-white'"
                  >
                    4 Kolom (Label)
                  </button>
                </div>
              </div>
            </div>

            <!-- Quick Counter Summary -->
            <div class="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Siap Cetak: <strong class="text-white">{{ displayProducts.length }} Produk</strong></div>
              <div class="text-[10px] text-slate-500">Gunakan Ctrl+P atau tombol Cetak untuk mencetak langsung ke printer thermal / kertas label.</div>
            </div>

          </div>

          <!-- Printable Display Sheet Preview Area -->
          <div class="flex-1 bg-slate-200 p-6 overflow-y-auto print-sheet-container">
            
            <!-- WORD TEMPLATE MODE SHEET (Matches Screenshot 1) -->
            <ng-container *ngIf="templateMode === 'word'">
              <div 
                [class]="columns === 3 ? 'grid grid-cols-3 gap-3 bg-white p-6 rounded-2xl shadow-xl border border-slate-300 printable-area' : 'grid grid-cols-4 gap-2.5 bg-white p-6 rounded-2xl shadow-xl border border-slate-300 printable-area'"
              >
                <div 
                  *ngFor="let item of displayProducts"
                  class="border-2 border-black p-3.5 flex flex-col justify-between items-center text-center rounded-xs bg-white min-h-[140px] word-tag-card relative"
                >
                  <!-- Item Name Header (Clean Tag Harga with SKU at top) -->
                  <div class="w-full border-b border-black/20 pb-2 mb-2">
                    <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-600 block">SKU: {{ item.sku }}</span>
                    <h3 class="text-xs font-black text-black leading-tight uppercase line-clamp-2 mt-0.5">{{ item.name }}</h3>
                  </div>

                  <!-- Price Display Box -->
                  <div class="space-y-1 my-auto w-full">
                    <!-- Strikethrough Old Price (Red Line through Old Price) -->
                    <div *ngIf="showStrikethrough" class="text-xs font-bold text-gray-500 relative inline-block">
                      <span class="line-through decoration-red-600 decoration-2 text-gray-400">
                        RP {{ formatNumber(getOldPrice(item.price)) }}
                      </span>
                    </div>

                    <!-- Large New Promo Price -->
                    <div class="text-lg font-black text-black font-heading tracking-tight leading-none">
                      RP {{ formatNumber(item.price) }}
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- iSELLER TEMPLATE MODE SHEET (Matches Screenshot 2) -->
            <ng-container *ngIf="templateMode === 'iseller'">
              <div 
                [class]="columns === 3 ? 'grid grid-cols-3 gap-3 bg-white p-6 rounded-2xl shadow-xl border border-slate-300 printable-area' : 'grid grid-cols-4 gap-2 bg-white p-6 rounded-2xl shadow-xl border border-slate-300 printable-area'"
              >
                <div 
                  *ngFor="let item of displayProducts"
                  [class]="getLabelCardClasses()"
                >
                  <!-- Barcode Number Top -->
                  <div *ngIf="showBarcodeNumber" class="text-[10px] font-mono font-bold text-black tracking-wider text-left">
                    {{ item.barcode || item.sku }}
                  </div>

                  <!-- Product Name -->
                  <div class="text-[11px] font-extrabold text-black uppercase leading-tight line-clamp-2 my-1">
                    {{ item.name }}
                  </div>

                  <!-- Selling Price Bottom -->
                  <div *ngIf="showPrice" class="text-xs font-black text-black font-heading mt-1">
                    Rp {{ formatNumber(item.price) }}
                  </div>

                  <div *ngIf="showSKU" class="text-[9px] font-mono text-gray-500 mt-0.5">
                    SKU: {{ item.sku }}
                  </div>
                </div>
              </div>
            </ng-container>

          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    @media print {
      body * {
        visibility: hidden;
      }
      .no-print {
        display: none !important;
      }
      .print-modal-container {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: auto !important;
        background: white !important;
        padding: 0 !important;
      }
      .print-modal-content {
        border: none !important;
        box-shadow: none !important;
        background: white !important;
        max-height: none !important;
        width: 100% !important;
      }
      .print-sheet-container {
        background: white !important;
        padding: 0 !important;
      }
      .printable-area, .printable-area * {
        visibility: visible !important;
      }
      .printable-area {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        box-shadow: none !important;
        border: none !important;
        padding: 10px !important;
      }
      .word-tag-card {
        border: 2px solid black !important;
        page-break-inside: avoid !important;
      }
      .iseller-label-card {
        border: 1px solid #000 !important;
        page-break-inside: avoid !important;
      }
    }
  `]
})
export class PrintLabelModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() products: Product[] = [];
  @Output() close = new EventEmitter<void>();

  public templateMode: 'word' | 'iseller' = 'word';
  public searchTerm = '';
  public selectedBrand = '';
  public columns: 3 | 4 = 3;
  
  public showStrikethrough = true;
  public strikethroughMarkup = 15;

  public labelSize = 'medium';
  public showBarcodeNumber = true;
  public showPrice = true;
  public showSKU = true;

  public brands: string[] = [];

  ngOnInit() {
    this.extractBrands();
  }

  ngOnChanges() {
    this.extractBrands();
  }

  public extractBrandName(p: Product): string {
    if (!p || !p.name) return 'LAINNYA';
    const rawName = p.name.trim();

    if (/^AKSESORI?ES?/i.test(rawName)) return 'AKSESORIS';

    const parts = rawName.split(/\s+-\s+/);
    if (parts.length >= 2 && parts[0].trim().length > 1) {
      const b = parts[0].trim().replace(/^CV\.\s*/i, '').replace(/^PT\.\s*/i, '').toUpperCase();
      if (!/^PT\b/i.test(b) && !/^CV\b/i.test(b)) return b;
    }

    if (p.type && p.type.trim() && !/^PT\b/i.test(p.type.trim())) {
      return p.type.trim().toUpperCase();
    }

    const clean = rawName.replace(/^CV\.\s*/i, '').replace(/^PT\.\s*/i, '');
    const firstWord = clean.split(/[\s\-_\/:]+/)[0];
    return firstWord ? firstWord.toUpperCase() : 'BEAUTY';
  }

  private extractBrands() {
    if (!this.products) return;
    const brandSet = new Set<string>();
    this.products.forEach(p => {
      const b = this.extractBrandName(p);
      if (b && b !== 'LAINNYA' && b !== 'BEAUTY') {
        brandSet.add(b);
      }
    });
    this.brands = Array.from(brandSet).sort();
    if (this.brands.length > 0 && !this.selectedBrand) {
      this.selectedBrand = this.brands[0];
    }
  }

  public printCopiesCount = 1;
  public singleParentOnly = true;

  public extractParentName(p: Product): string {
    if (!p || !p.name) return '';
    const raw = p.name.trim();

    if (p.option1Value && p.option1Value.trim()) {
      return raw.replace(new RegExp(`\\s*-\\s*${p.option1Value.trim()}$`, 'i'), '').trim();
    }

    const parts = raw.split(/\s+-\s+/);
    if (parts.length >= 3) {
      return parts.slice(0, parts.length - 1).join(' - ').trim();
    } else if (parts.length === 2) {
      const p2 = parts[1].trim();
      if (/^(shade|no|color|warna|size|ml|gr|pcs|\d+)/i.test(p2) || (p2.length <= 20 && !p2.includes(' '))) {
        return parts[0].trim();
      }
    }
    return raw;
  }

  get displayProducts(): Product[] {
    if (!this.products || !this.selectedBrand) return [];
    
    let filtered = this.products.filter(p => {
      const productBrand = this.extractBrandName(p);
      const matchBrand = productBrand === this.selectedBrand;
      const matchSearch = !this.searchTerm || 
        (p.name && p.name.toLowerCase().includes(this.searchTerm.toLowerCase())) || 
        (p.barcode && p.barcode.includes(this.searchTerm)) || 
        (p.sku && p.sku.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return matchBrand && matchSearch;
    });

    if (this.singleParentOnly) {
      const seenParents = new Set<string>();
      const parentList: Product[] = [];

      filtered.forEach(p => {
        const parentName = this.extractParentName(p);
        if (!seenParents.has(parentName)) {
          seenParents.add(parentName);
          parentList.push({
            ...p,
            name: parentName
          });
        }
      });
      filtered = parentList;
    }

    const copies = Math.max(1, Math.min(500, this.printCopiesCount || 1));
    const result: Product[] = [];

    // Max 60 items for fast 0-lag rendering
    const baseItems = filtered.slice(0, 60);
    baseItems.forEach(item => {
      for (let i = 0; i < copies; i++) {
        if (result.length < 300) {
          result.push(item);
        }
      }
    });

    return result;
  }

  public getLabelCardClasses(): string {
    if (this.labelSize === 'small') {
      return 'border border-slate-400 p-1.5 min-h-[75px] flex flex-col justify-between bg-white text-left font-sans rounded-xs iseller-label-card';
    } else if (this.labelSize === 'large') {
      return 'border-2 border-slate-600 p-4 min-h-[140px] flex flex-col justify-between bg-white text-left font-sans rounded-xs iseller-label-card';
    }
    return 'border border-slate-400 p-2.5 min-h-[105px] flex flex-col justify-between bg-white text-left font-sans rounded-xs iseller-label-card';
  }

  public getOldPrice(currentPrice: number): number {
    const markupMultiplier = 1 + (this.strikethroughMarkup / 100);
    return Math.round((currentPrice * markupMultiplier) / 100) * 100;
  }

  public formatNumber(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  }

  public printPage() {
    window.print();
  }
}
