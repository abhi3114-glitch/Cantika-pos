import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Product } from '../../models/product.model';
import BEAUTY_SHADES_DATA from '../../data/beauty-shades.json';

const BEAUTY_SHADES: Record<string, string> = BEAUTY_SHADES_DATA as Record<string, string>;

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
              (click)="saveAsPDF()"
              [disabled]="isGeneratingPDF || filteredBrandProducts.length === 0"
              class="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-900/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              title="Download File PDF Langsung ke Laptop / Komputer"
            >
              <span>{{ isGeneratingPDF ? '⏳ Memproses PDF...' : '📄 Save Direct PDF (' + filteredBrandProducts.length + ')' }}</span>
            </button>
            <button
              (click)="printPage()"
              [disabled]="filteredBrandProducts.length === 0"
              class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              🖨️ Cetak / Print Label ({{ filteredBrandProducts.length }})
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
                  (click)="setTemplateMode('word')"
                  [class]="templateMode === 'word' ? 'py-2 px-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-xs' : 'py-2 px-2.5 rounded-xl text-slate-400 font-bold text-xs hover:text-white'"
                >
                  📄 Tag Harga Word
                </button>
                <button
                  (click)="setTemplateMode('iseller')"
                  [class]="templateMode === 'iseller' ? 'py-2 px-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-xs' : 'py-2 px-2.5 rounded-xl text-slate-400 font-bold text-xs hover:text-white'"
                >
                  🏷️ Label iSeller
                </button>
              </div>
            </div>

            <!-- Filter Products by Brand / Search (Multi-Brand Selection with Chips & History) -->
            <div class="space-y-2 pt-2 border-t border-slate-800 relative">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <span>🏷️ Brand Produk</span>
                  <span class="text-[9px] font-normal text-slate-500 lowercase">(bisa pilih banyak)</span>
                </label>
                <span *ngIf="selectedBrands.length > 1" class="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800/60 font-mono">
                  {{ selectedBrands.length }} Brand
                </span>
                <span *ngIf="selectedBrands.length === 1" class="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-800/60 truncate max-w-[130px]" [title]="selectedBrands[0]">
                  {{ selectedBrands[0] }}
                </span>
                <span *ngIf="selectedBrands.length === 0 && !brandSearchInput" class="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800/60">
                  Semua Brand
                </span>
              </div>

              <!-- Selected Brands Chips (Easy Multi-Brand Management) -->
              <div *ngIf="selectedBrands.length > 0" class="p-2 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5 animate-fade-in">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span>✨ Terpilih:</span>
                    <strong class="text-rose-400 font-mono">{{ selectedBrands.length }} Brand</strong>
                  </span>
                  <button
                    type="button"
                    (click)="clearAllBrands()"
                    class="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                    title="Batal pilih semua brand & tampilkan seluruh katalog"
                  >
                    ✕ Hapus Semua
                  </button>
                </div>

                <!-- Chips container -->
                <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  <span
                    *ngFor="let b of selectedBrands"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/90 border border-rose-700/80 text-rose-200 text-[11px] font-extrabold shadow-xs"
                  >
                    <span>🏷️ {{ b }}</span>
                    <span class="text-[9px] text-rose-400/90 font-mono font-normal">({{ getBrandProductCount(b) }})</span>
                    <button
                      type="button"
                      (click)="removeBrand(b, $event)"
                      class="ml-0.5 text-rose-400 hover:text-white hover:bg-rose-800/60 rounded-sm w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer transition-colors"
                      title="Hapus brand ini"
                    >
                      ✕
                    </button>
                  </span>
                </div>

                <!-- Paper Saving Helper Note -->
                <div *ngIf="selectedBrands.length > 1" class="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold pt-0.5 bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-800/40">
                  <span>🌱</span>
                  <span><strong>Hemat Kertas!</strong> {{ selectedBrands.length }} brand digabung dalam 1 cetakan tanpa sisa lembar kosong.</span>
                </div>
              </div>

              <!-- Google-style Autocomplete Brand Input -->
              <div class="relative">
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-slate-400 text-xs pointer-events-none">🔍</span>
                  <input
                    type="text"
                    [(ngModel)]="brandSearchInput"
                    (ngModelChange)="onBrandSearchChange($event)"
                    (focus)="onBrandSearchFocus($event)"
                    (blur)="onInputBlur()"
                    (keydown.arrowdown)="onKeyDownArrow(1, $event)"
                    (keydown.arrowup)="onKeyDownArrow(-1, $event)"
                    (keydown.enter)="onKeyDownEnter($event)"
                    (keydown.escape)="isBrandDropdownOpen = false"
                    [placeholder]="selectedBrands.length > 0 ? '+ Cari & tambah brand lain...' : 'Ketik nama brand (kosong = semua brand)...'"
                    class="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-xs text-white font-bold placeholder:text-slate-500 transition-all outline-hidden"
                    autocomplete="off"
                    spellcheck="false"
                  />
                  <button
                    *ngIf="brandSearchInput"
                    type="button"
                    (click)="clearBrandSearch()"
                    class="absolute right-2.5 p-1 text-slate-400 hover:text-white rounded-md text-xs cursor-pointer transition-colors"
                    title="Kosongkan pencarian"
                  >
                    ✕
                  </button>
                </div>

                <!-- Google Search History & Suggestions Dropdown List -->
                <div
                  *ngIf="isBrandDropdownOpen && (brandSuggestions.length > 0 || !brandSearchInput)"
                  class="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl z-40 overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-800/60"
                >
                  <!-- All Brands Item -->
                  <div
                    (mousedown)="selectAllBrands(); $event.stopPropagation()"
                    (click)="selectAllBrands()"
                    class="p-2.5 flex items-center justify-between hover:bg-slate-800/80 cursor-pointer transition-colors text-xs font-bold text-emerald-400 bg-emerald-950/20 select-none"
                  >
                    <div class="flex items-center gap-2 pointer-events-none">
                      <span>✨</span>
                      <span>Semua Brand (Tampilkan Seluruh Produk)</span>
                    </div>
                    <span class="text-[10px] font-mono text-emerald-500 pointer-events-none">({{ products.length }} item)</span>
                  </div>

                  <!-- Suggestions & History Items -->
                  <div
                    *ngFor="let item of brandSuggestions; let idx = index; trackBy: trackByBrandItem"
                    (mousedown)="toggleBrand(item.name, $event); $event.stopPropagation()"
                    (click)="toggleBrand(item.name, $event)"
                    (mouseenter)="activeSuggestionIndex = idx"
                    [class]="activeSuggestionIndex === idx 
                      ? (isBrandSelected(item.name) ? 'p-2.5 flex items-center justify-between bg-rose-900/60 text-white cursor-pointer transition-colors text-xs select-none' : 'p-2.5 flex items-center justify-between bg-slate-800 text-white cursor-pointer transition-colors text-xs select-none')
                      : (isBrandSelected(item.name) ? 'p-2.5 flex items-center justify-between bg-rose-950/40 text-rose-200 cursor-pointer transition-colors text-xs select-none' : 'p-2.5 flex items-center justify-between hover:bg-slate-800/60 text-slate-200 cursor-pointer transition-colors text-xs select-none')"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <!-- Selection Indicator Checkbox -->
                      <span 
                        class="w-4 h-4 rounded flex items-center justify-center text-[10px] font-black shrink-0 transition-colors"
                        [class]="isBrandSelected(item.name) ? 'bg-rose-600 text-white shadow-xs' : 'border border-slate-600 bg-slate-800 text-slate-400'"
                      >
                        {{ isBrandSelected(item.name) ? '✓' : '+' }}
                      </span>

                      <span class="text-slate-400 text-xs shrink-0 pointer-events-none">{{ item.isHistory ? '🕒' : '🏷️' }}</span>
                      <div class="truncate font-semibold pointer-events-none" [innerHTML]="highlightMatch(item.name, brandSearchInput)"></div>
                      <span *ngIf="item.isHistory" class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded-md border border-slate-700/60 shrink-0 pointer-events-none">
                        Riwayat
                      </span>
                    </div>

                    <div class="flex items-center gap-2 shrink-0 ml-2">
                      <span class="text-[10px] font-mono text-slate-400 pointer-events-none">
                        {{ getBrandProductCount(item.name) }} produk
                      </span>
                      <button
                        type="button"
                        (mousedown)="selectSingleBrand(item.name, $event)"
                        (click)="selectSingleBrand(item.name, $event)"
                        class="text-[9px] font-bold text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-700 cursor-pointer"
                        title="Pilih hanya brand ini saja"
                      >
                        Hanya Ini
                      </button>
                      <button
                        *ngIf="item.isHistory"
                        type="button"
                        (mousedown)="$event.stopPropagation(); removeHistoryItem(item.name, $event)"
                        (click)="$event.stopPropagation(); removeHistoryItem(item.name, $event)"
                        class="text-slate-500 hover:text-rose-400 text-xs p-1 rounded-sm cursor-pointer"
                        title="Hapus dari riwayat pencarian"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <!-- Done / Close Selection Footer in Dropdown -->
                  <div class="p-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between sticky bottom-0">
                    <span class="text-[10px] font-mono text-slate-400">
                      {{ selectedBrands.length > 0 ? selectedBrands.length + ' brand terpilih' : 'Semua brand aktif' }}
                    </span>
                    <button
                      type="button"
                      (mousedown)="isBrandDropdownOpen = false; $event.stopPropagation()"
                      class="px-3 py-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-xs"
                    >
                      ✓ Selesai Memilih
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Print Copies Count Setting -->
            <div class="space-y-1.5 pt-2 border-t border-slate-800">
              <label class="text-[11px] font-black uppercase text-slate-400 tracking-wider">Jumlah Rangkap Label Per Produk</label>
              <div class="relative">
                <input
                  type="number"
                  min="1"
                  max="500"
                  [(ngModel)]="printCopiesCount"
                  (ngModelChange)="onCopiesChange()"
                  placeholder="Jumlah salinan (misal 24)..."
                  class="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold font-mono text-white focus:outline-hidden"
                />
              </div>

              <!-- Quick Presets -->
              <div class="flex items-center gap-1">
                <button (click)="setCopies(1)" [class]="printCopiesCount === 1 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">1x</button>
                <button (click)="setCopies(6)" [class]="printCopiesCount === 6 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">6x</button>
                <button (click)="setCopies(12)" [class]="printCopiesCount === 12 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">12x</button>
                <button (click)="setCopies(24)" [class]="printCopiesCount === 24 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">24x</button>
                <button (click)="setCopies(48)" [class]="printCopiesCount === 48 ? 'px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg' : 'px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg'">48x</button>
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
                  (ngModelChange)="onSingleParentChange()"
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

            <!-- Product Selection Section (Select what to print) -->
            <div class="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <span>📋 Pilih Produk Dicetak</span>
                </label>
                <span class="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-800/60 font-mono">
                  {{ selectedCount }} / {{ totalCount }}
                </span>
              </div>

              <!-- Quick Action Buttons -->
              <div class="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  (click)="selectAllProducts()"
                  [class]="areAllSelected ? 'py-1 px-2 rounded-lg bg-rose-600 text-white font-bold text-[10px] shadow-xs cursor-pointer' : 'py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition-all cursor-pointer'"
                >
                  ✓ Pilih Semua
                </button>
                <button
                  type="button"
                  (click)="deselectAllProducts()"
                  [class]="selectedCount === 0 ? 'py-1 px-2 rounded-lg bg-rose-600 text-white font-bold text-[10px] shadow-xs cursor-pointer' : 'py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition-all cursor-pointer'"
                >
                  ✕ Batal Semua
                </button>
              </div>

              <!-- Compact Checklist Search Filter -->
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="checklistSearchQuery"
                  (ngModelChange)="onChecklistSearchChange()"
                  placeholder="Cari dalam checklist..."
                  class="w-full pl-7 pr-7 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-white placeholder:text-slate-500 font-medium focus:outline-hidden focus:border-rose-500"
                />
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">🔍</span>
                <button
                  *ngIf="checklistSearchQuery"
                  (click)="checklistSearchQuery = ''; onChecklistSearchChange()"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >✕</button>
              </div>

              <!-- Fast Scrollable Product Checklist -->
              <div class="max-h-52 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-800/50 border border-slate-800 rounded-xl bg-slate-950/60 p-1.5">
                <div *ngIf="visibleChecklistItems.length === 0" class="p-3 text-center text-slate-500 text-[11px]">
                  Tidak ada produk ditemukan.
                </div>

                <div
                  *ngFor="let item of visibleChecklistItems; trackBy: trackByProduct"
                  (click)="toggleProduct(item)"
                  class="p-1.5 flex items-start gap-2 hover:bg-slate-800/60 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    [checked]="isProductSelected(item)"
                    (click)="$event.stopPropagation(); toggleProduct(item)"
                    class="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer mt-0.5 shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="text-[11px] font-bold text-white truncate" [title]="getLabelPrintTitle(item)">
                      {{ getLabelPrintTitle(item) }}
                    </div>
                    <div class="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                      <span>{{ item.sku || item.barcode }}</span>
                      <span class="text-rose-300 font-bold">Rp {{ formatNumber(item.price) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Load More Checklist Items if truncated -->
                <div *ngIf="hasMoreChecklistItems" class="pt-1.5 pb-1 text-center">
                  <button
                    type="button"
                    (click)="loadMoreChecklistItems()"
                    class="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    + Tampilkan 50 Lainnya ({{ visibleChecklistItems.length }} / {{ matchingChecklistCount }})
                  </button>
                </div>
              </div>
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
                    (click)="setColumns(3)"
                    [class]="columns === 3 ? 'py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl' : 'py-1.5 bg-slate-900 text-slate-400 font-bold text-xs rounded-xl hover:text-white'"
                  >
                    3 Kolom (Word)
                  </button>
                  <button
                    (click)="setColumns(4)"
                    [class]="columns === 4 ? 'py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl' : 'py-1.5 bg-slate-900 text-slate-400 font-bold text-xs rounded-xl hover:text-white'"
                  >
                    4 Kolom (Label)
                  </button>
                </div>
              </div>
            </div>

            <!-- Quick Counter Summary -->
            <div class="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Siap Cetak: <strong class="text-emerald-400 font-bold">{{ filteredBrandProducts.length }} Produk ({{ getSelectedBrandsLabel() }})</strong></div>
              <div class="text-[10px] text-slate-400 font-medium">
                Total {{ displayProducts.length }} label tag harga (~{{ getEstimatedSheetCount() }} lembar A4 siap dicetak).
              </div>
            </div>

          </div>

          <!-- Printable Display Sheet Preview Area -->
          <div class="flex-1 bg-slate-200 p-6 overflow-y-auto print-sheet-container">
            
            <!-- Quick Selection Info Toolbar (Screen only, hidden on print) -->
            <div class="no-print mb-4 p-3 bg-white rounded-2xl border border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs">
                <span class="font-black text-slate-800 flex items-center gap-1">
                  <span>📋 Pilihan Cetak:</span>
                </span>
                <span class="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 font-mono">
                  {{ filteredBrandProducts.length }} / {{ rawFilteredBrandProducts.length }} Produk
                </span>
                <span class="text-slate-600 font-mono text-[11px] font-bold">({{ displayProducts.length }} label | ~{{ getEstimatedSheetCount() }} lembar A4)</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  (click)="selectAllProducts()"
                  class="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  ✓ Pilih Semua
                </button>
                <button
                  type="button"
                  (click)="deselectAllProducts()"
                  class="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  ✕ Batal Semua
                </button>
              </div>
            </div>

            <!-- Empty Selection State (Screen only) -->
            <div *ngIf="filteredBrandProducts.length === 0" class="bg-white p-10 rounded-2xl shadow-lg border border-slate-300 text-center space-y-3 my-6">
              <span class="text-4xl block">🏷️</span>
              <h3 class="text-base font-black text-slate-800">Tidak Ada Produk yang Dipilih untuk Dicetak</h3>
              <p class="text-xs text-slate-500 max-w-md mx-auto">
                Silakan centang produk yang ingin dicetak pada daftar produk di sebelah kiri, atau klik tombol <strong>"Pilih Semua"</strong>.
              </p>
              <button
                type="button"
                (click)="selectAllProducts()"
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>✓ Centang Semua Produk ({{ rawFilteredBrandProducts.length }})</span>
              </button>
            </div>

            <!-- Performance Optimization Banner for Large Datasets -->
            <div *ngIf="!showAllOnScreen && displayProducts.length > maxPreviewItems && filteredBrandProducts.length > 0" class="no-print mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs animate-fade-in">
              <div class="flex items-center gap-2">
                <span class="text-base">⚡</span>
                <span class="font-medium">
                  <strong>Pratinjau Ringan:</strong> Menampilkan {{ previewItemCount }} label di layar (dari total <strong>{{ displayProducts.length }}</strong> label). Saat klik <strong>"Cetak"</strong> atau <strong>"Save Direct PDF"</strong>, seluruh <strong>{{ displayProducts.length }} label</strong> akan diproses lengkap otomatis.
                </span>
              </div>
              <button
                type="button"
                (click)="toggleShowAllOnScreen()"
                class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                👁️ Tampilkan Semua ({{ displayProducts.length }})
              </button>
            </div>

            <div *ngIf="showAllOnScreen && displayProducts.length > maxPreviewItems" class="no-print mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between gap-2 text-xs shadow-xs">
              <span>Menampilkan seluruh {{ displayProducts.length }} label di layar.</span>
              <button
                type="button"
                (click)="toggleShowAllOnScreen()"
                class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                ⚡ Mode Ringan ({{ maxPreviewItems }} Label)
              </button>
            </div>

            <!-- WORD TEMPLATE MODE SHEET (Row-based Chunking for 100% Unbroken Page Breaks) -->
            <ng-container *ngIf="templateMode === 'word' && filteredBrandProducts.length > 0">
              <div class="bg-white p-6 rounded-2xl shadow-xl border border-slate-300 printable-area space-y-3">
                <div 
                  *ngFor="let row of (showAllOnScreen || isFullPrintRendering ? productRows : previewRows); trackBy: trackByRow"
                  [class]="columns === 3 ? 'grid grid-cols-3 gap-3 print-row' : 'grid grid-cols-4 gap-2.5 print-row'"
                  style="page-break-inside: avoid !important; break-inside: avoid !important; break-inside: avoid-page !important;"
                >
                  <div 
                    *ngFor="let item of row; trackBy: trackByProduct"
                    class="border-2 border-black p-3.5 flex flex-col justify-between items-center text-center rounded-xs bg-white min-h-[140px] word-tag-card relative group"
                    style="page-break-inside: avoid !important; break-inside: avoid !important; break-inside: avoid-page !important;"
                  >
                    <!-- Quick Remove Button (Screen only, hidden on print) -->
                    <button
                      type="button"
                      (click)="toggleProduct(item)"
                      class="no-print absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-400 flex items-center justify-center text-[10px] font-black transition-colors cursor-pointer shadow-xs"
                      title="Keluarkan dari daftar cetak"
                    >
                      ✕
                    </button>

                    <!-- Item Name Header (Clean Tag Harga with SKU at top) -->
                    <div class="w-full border-b border-black/20 pb-2 mb-2">
                      <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-600 block">SKU: {{ item.sku }}</span>
                      <h3 [class]="getTitleFontSizeClass(item)">{{ getLabelPrintTitle(item) }}</h3>
                    </div>

                    <!-- Price Display Box -->
                    <div class="space-y-1 my-auto w-full">
                      <!-- Strikethrough Old Price (Red Line through Old Price) -->
                      <div *ngIf="showStrikethrough" class="text-xs font-bold text-gray-400 relative inline-block px-1">
                        <span>RP {{ formatNumber(getOldPrice(item.price)) }}</span>
                        <span class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-red-600 w-full pointer-events-none"></span>
                      </div>

                      <!-- Large New Promo Price -->
                      <div class="text-lg font-black text-black font-heading tracking-tight leading-none">
                        RP {{ formatNumber(item.price) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- iSELLER TEMPLATE MODE SHEET (Row-based Chunking for 100% Unbroken Page Breaks) -->
            <ng-container *ngIf="templateMode === 'iseller' && filteredBrandProducts.length > 0">
              <div class="bg-white p-6 rounded-2xl shadow-xl border border-slate-300 printable-area space-y-2">
                <div 
                  *ngFor="let row of (showAllOnScreen || isFullPrintRendering ? productRows : previewRows); trackBy: trackByRow"
                  [class]="columns === 3 ? 'grid grid-cols-3 gap-3 print-row' : 'grid grid-cols-4 gap-2 print-row'"
                  style="page-break-inside: avoid !important; break-inside: avoid !important; break-inside: avoid-page !important;"
                >
                  <div 
                    *ngFor="let item of row; trackBy: trackByProduct"
                    [class]="getLabelCardClasses() + ' relative group'"
                    style="page-break-inside: avoid !important; break-inside: avoid !important; break-inside: avoid-page !important;"
                  >
                    <!-- Quick Remove Button (Screen only, hidden on print) -->
                    <button
                      type="button"
                      (click)="toggleProduct(item)"
                      class="no-print absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-400 flex items-center justify-center text-[10px] font-black transition-colors cursor-pointer shadow-xs"
                      title="Keluarkan dari daftar cetak"
                    >
                      ✕
                    </button>

                    <!-- Barcode Number Top -->
                    <div *ngIf="showBarcodeNumber" class="text-[10px] font-mono font-bold text-black tracking-wider text-left">
                      {{ item.barcode || item.sku }}
                    </div>

                    <!-- Product Name -->
                    <div [class]="getTitleFontSizeClass(item)">
                      {{ getLabelPrintTitle(item) }}
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
              </div>
            </ng-container>

          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    @media print {
      @page {
        margin: 8mm;
        size: A4 portrait;
      }
      body * {
        visibility: hidden;
      }
      .printable-area, .printable-area * {
        visibility: visible;
      }
      .printable-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }
      .no-print {
        display: none !important;
      }
      .print-modal-container {
        position: static !important;
        background: none !important;
        padding: 0 !important;
        backdrop-filter: none !important;
      }
      .print-modal-content {
        position: static !important;
        background: none !important;
        border: none !important;
        box-shadow: none !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }
      .print-sheet-container {
        background: white !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      .print-row {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        break-inside: avoid-page !important;
        margin-bottom: 8px !important;
        display: block !important;
      }

      .printable-area {
        position: relative !important;
        width: 100% !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: visible !important;
        background: white !important;
      }

      .word-tag-card, .iseller-label-card {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        break-inside: avoid-page !important;
        -webkit-column-break-inside: avoid !important;
        display: inline-flex !important;
        flex-direction: column !important;
        box-sizing: border-box !important;
      }

      .word-tag-card {
        border: 2px solid black !important;
      }

      .iseller-label-card {
        border: 1px solid #000 !important;
      }
    }
  `]
})
export class PrintLabelModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() products: Product[] = [];
  @Output() close = new EventEmitter<void>();

  public templateMode: 'word' | 'iseller' = 'word';
  public searchTerm = '';
  public selectedBrands: string[] = [];
  public selectedBrand = '';
  public brandSearchInput = '';
  public isBrandDropdownOpen = false;
  public activeSuggestionIndex = -1;
  public recentBrands: string[] = [];
  public brandCounts: Record<string, number> = {};
  public columns: 3 | 4 = 3;
  
  public showStrikethrough = true;
  public strikethroughMarkup = 15;

  public labelSize = 'medium';
  public showBarcodeNumber = true;
  public showPrice = true;
  public showSKU = true;

  public brands: string[] = [];
  public printCopiesCount = 1;
  public singleParentOnly = true;

  public selectedProductKeys = new Set<string>();
  private lastSelectionBrand = '__INIT__';
  private lastSingleParentMode: boolean | null = null;

  // Pre-computed data arrays for extreme performance (NO GETTERS)
  public rawFilteredBrandProducts: Product[] = [];
  public filteredBrandProducts: Product[] = [];
  public displayProducts: Product[] = [];
  public productRows: Product[][] = [];
  public previewRows: Product[][] = [];
  public showAllOnScreen = false;
  public isFullPrintRendering = false;
  public maxPreviewItems = 48;

  // Sidebar Checklist properties
  public checklistSearchQuery = '';
  public visibleChecklistCount = 50;
  public visibleChecklistItems: Product[] = [];
  public matchingChecklistCount = 0;

  public totalCount = 0;
  public selectedCount = 0;
  public areAllSelected = true;

  // Performance Caches
  private parentNameCache = new Map<string, string>();
  private brandNameCache = new Map<string, string>();
  private labelTitleCache = new Map<string, string>();

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.extractBrands();
    this.updatePrintData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['products']) {
      this.brandNameCache.clear();
      this.parentNameCache.clear();
      this.labelTitleCache.clear();
      this.extractBrands();
    }
    if (changes['isOpen'] && this.isOpen) {
      this.updatePrintData();
    }
  }

  public getProductKey(p: Product): string {
    if (!p) return '';
    return this.singleParentOnly
      ? ('parent_' + this.extractParentName(p))
      : (p.id ? String(p.id) : (p.sku ? String(p.sku) : (p.barcode ? String(p.barcode) : p.name)));
  }

  public isProductSelected(p: Product): boolean {
    return this.selectedProductKeys.has(this.getProductKey(p));
  }

  public toggleProduct(p: Product) {
    const key = this.getProductKey(p);
    if (this.selectedProductKeys.has(key)) {
      this.selectedProductKeys.delete(key);
    } else {
      this.selectedProductKeys.add(key);
    }
    this.updatePrintData();
  }

  public selectAllProducts() {
    this.selectedProductKeys = new Set(this.rawFilteredBrandProducts.map(p => this.getProductKey(p)));
    this.updatePrintData();
  }

  public deselectAllProducts() {
    this.selectedProductKeys.clear();
    this.updatePrintData();
  }

  public setTemplateMode(mode: 'word' | 'iseller') {
    this.templateMode = mode;
  }

  public setColumns(col: 3 | 4) {
    this.columns = col;
    this.updatePrintData();
  }

  public setCopies(count: number) {
    this.printCopiesCount = count;
    this.updatePrintData();
  }

  public onCopiesChange() {
    this.updatePrintData();
  }

  public onSingleParentChange() {
    this.updatePrintData();
  }

  public toggleShowAllOnScreen() {
    this.showAllOnScreen = !this.showAllOnScreen;
  }

  get previewItemCount(): number {
    return this.previewRows.reduce((sum, r) => sum + r.length, 0);
  }

  public trackByRow(index: number, row: Product[]): string {
    return 'row_' + index + '_' + (row[0]?.id || row[0]?.sku || index);
  }

  public trackByProduct(index: number, item: Product): string {
    return item?.id ? String(item.id) : (item?.sku ? String(item.sku) : String(index));
  }

  public trackByBrandItem(index: number, item: { name: string; isHistory: boolean }): string {
    return item.name + '_' + (item.isHistory ? 'hist' : 'brand');
  }

  public extractBrandName(p: Product): string {
    if (!p || !p.name) return 'LAINNYA';
    const id = p.id || p.sku || p.name;
    if (this.brandNameCache.has(id)) {
      return this.brandNameCache.get(id)!;
    }

    const rawName = p.name.trim();
    let res = 'BEAUTY';

    if (/^AKSESORI?ES?/i.test(rawName)) {
      res = 'AKSESORIS';
    } else {
      const parts = rawName.split(/\s+-\s+/);
      if (parts.length >= 2 && parts[0].trim().length > 1) {
        const b = parts[0].trim().replace(/^CV\.\s*/i, '').replace(/^PT\.\s*/i, '').toUpperCase();
        if (!/^PT\b/i.test(b) && !/^CV\b/i.test(b)) {
          res = b;
        }
      }
      if (res === 'BEAUTY' && p.type && p.type.trim() && !/^PT\b/i.test(p.type.trim())) {
        res = p.type.trim().toUpperCase();
      }
      if (res === 'BEAUTY') {
        const clean = rawName.replace(/^CV\.\s*/i, '').replace(/^PT\.\s*/i, '');
        const firstWord = clean.split(/[\s\-_\/:]+/)[0];
        res = firstWord ? firstWord.toUpperCase() : 'BEAUTY';
      }
    }

    this.brandNameCache.set(id, res);
    return res;
  }

  private extractBrands() {
    if (!this.products) return;
    const counts: Record<string, number> = {};
    this.products.forEach(p => {
      const b = this.extractBrandName(p);
      if (b && b !== 'LAINNYA' && b !== 'BEAUTY') {
        counts[b] = (counts[b] || 0) + 1;
      }
    });
    this.brandCounts = counts;
    this.brands = Object.keys(counts).sort();

    // Load recent searches from localStorage
    try {
      const saved = localStorage.getItem('cantika_recent_brand_history');
      if (saved) {
        this.recentBrands = JSON.parse(saved);
      }
    } catch (e) {}

    // Default to blank to show ALL brands initially
    if (!this.selectedBrand && !this.brandSearchInput) {
      this.selectedBrand = '';
      this.brandSearchInput = '';
    }
  }

  public selectAllBrands() {
    this.selectedBrands = [];
    this.selectedBrand = '';
    this.brandSearchInput = '';
    this.isBrandDropdownOpen = false;
    this.activeSuggestionIndex = -1;
    this.updatePrintData();
  }

  public clearAllBrands() {
    this.selectAllBrands();
  }

  public isBrandSelected(brand: string): boolean {
    if (!brand) return false;
    const lower = brand.trim().toLowerCase();
    return this.selectedBrands.some(b => b.toLowerCase() === lower);
  }

  public toggleBrand(brand: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const trimmed = brand.trim();
    const lower = trimmed.toLowerCase();
    const existingIdx = this.selectedBrands.findIndex(b => b.toLowerCase() === lower);

    if (existingIdx >= 0) {
      this.selectedBrands.splice(existingIdx, 1);
    } else {
      this.selectedBrands.push(trimmed);
    }

    this.selectedBrand = this.selectedBrands.length === 1 ? this.selectedBrands[0] : '';
    this.brandSearchInput = '';

    // Save to Google-style search history (deduplicated, max 8 items)
    this.recentBrands = [trimmed, ...this.recentBrands.filter(b => b.toLowerCase() !== lower)].slice(0, 8);
    try {
      localStorage.setItem('cantika_recent_brand_history', JSON.stringify(this.recentBrands));
    } catch (e) {}

    this.updatePrintData();
  }

  public selectSingleBrand(brand: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const trimmed = brand.trim();
    this.selectedBrands = [trimmed];
    this.selectedBrand = trimmed;
    this.brandSearchInput = '';
    this.isBrandDropdownOpen = false;
    this.activeSuggestionIndex = -1;

    this.recentBrands = [trimmed, ...this.recentBrands.filter(b => b.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    try {
      localStorage.setItem('cantika_recent_brand_history', JSON.stringify(this.recentBrands));
    } catch (e) {}

    this.updatePrintData();
  }

  public selectBrand(brand: string) {
    this.toggleBrand(brand);
  }

  public removeBrand(brand: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const lower = brand.trim().toLowerCase();
    this.selectedBrands = this.selectedBrands.filter(b => b.toLowerCase() !== lower);
    this.selectedBrand = this.selectedBrands.length === 1 ? this.selectedBrands[0] : '';
    this.updatePrintData();
  }

  public getSelectedBrandsLabel(): string {
    if (this.selectedBrands.length === 0) {
      return this.brandSearchInput ? 'Cari: ' + this.brandSearchInput : 'Semua Brand';
    }
    if (this.selectedBrands.length === 1) {
      return 'Brand: ' + this.selectedBrands[0];
    }
    return `${this.selectedBrands.length} Brand: ${this.selectedBrands.join(', ')}`;
  }

  public getEstimatedSheetCount(): number {
    const perSheet = this.columns === 3 ? 12 : 16;
    return Math.ceil(this.displayProducts.length / perSheet) || 1;
  }

  public onBrandSearchFocus(event?: Event) {
    this.isBrandDropdownOpen = true;
    if (event && event.target) {
      try {
        (event.target as HTMLInputElement).select();
      } catch (e) {}
    }
  }

  public onInputBlur() {
    setTimeout(() => {
      this.isBrandDropdownOpen = false;
    }, 250);
  }

  public onBrandSearchChange(val: string) {
    this.brandSearchInput = val;
    this.isBrandDropdownOpen = true;
    this.activeSuggestionIndex = -1;
    this.updatePrintData();
  }

  public removeHistoryItem(brand: string, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.recentBrands = this.recentBrands.filter(b => b !== brand);
    try {
      localStorage.setItem('cantika_recent_brand_history', JSON.stringify(this.recentBrands));
    } catch (e) {}
  }

  public clearBrandSearch() {
    this.brandSearchInput = '';
    this.isBrandDropdownOpen = true;
    this.activeSuggestionIndex = -1;
    this.updatePrintData();
  }

  public onKeyDownArrow(direction: number, event: Event) {
    event.preventDefault();
    const list = this.brandSuggestions;
    if (list.length === 0) return;
    this.isBrandDropdownOpen = true;

    this.activeSuggestionIndex += direction;
    if (this.activeSuggestionIndex < 0) {
      this.activeSuggestionIndex = list.length - 1;
    } else if (this.activeSuggestionIndex >= list.length) {
      this.activeSuggestionIndex = 0;
    }
  }

  public onKeyDownEnter(event: Event) {
    event.preventDefault();
    const list = this.brandSuggestions;
    if (list.length === 0) return;

    if (this.activeSuggestionIndex >= 0 && this.activeSuggestionIndex < list.length) {
      this.toggleBrand(list[this.activeSuggestionIndex].name);
    } else if (list.length > 0) {
      this.toggleBrand(list[0].name);
    }
  }

  get brandSuggestions(): { name: string; isHistory: boolean }[] {
    const q = (this.brandSearchInput || '').trim().toLowerCase();
    
    if (!q) {
      const result: { name: string; isHistory: boolean }[] = [];
      const seen = new Set<string>();

      this.recentBrands.forEach(b => {
        if (this.brands.includes(b) && !seen.has(b)) {
          result.push({ name: b, isHistory: true });
          seen.add(b);
        }
      });

      this.brands.forEach(b => {
        if (!seen.has(b)) {
          result.push({ name: b, isHistory: false });
          seen.add(b);
        }
      });

      return result;
    }

    const prefixMatches: { name: string; isHistory: boolean }[] = [];
    const otherMatches: { name: string; isHistory: boolean }[] = [];

    this.brands.forEach(b => {
      const lower = b.toLowerCase();
      const isHist = this.recentBrands.includes(b);
      if (lower.startsWith(q)) {
        prefixMatches.push({ name: b, isHistory: isHist });
      } else if (lower.includes(q)) {
        otherMatches.push({ name: b, isHistory: isHist });
      }
    });

    return [...prefixMatches, ...otherMatches];
  }

  public getBrandProductCount(brand: string): number {
    return this.brandCounts[brand] || 0;
  }

  public highlightMatch(text: string, query: string): SafeHtml {
    if (!query || !query.trim()) return text;
    const q = query.trim();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const html = text.replace(regex, '<span class="text-rose-400 font-black underline decoration-rose-500/60">$1</span>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  public extractParentName(p: Product): string {
    if (!p || !p.name) return '';
    const id = p.id || p.sku || p.name;
    if (this.parentNameCache.has(id)) {
      return this.parentNameCache.get(id)!;
    }

    const raw = p.name.trim();
    let res = raw;

    if (p.option1Value && p.option1Value.trim()) {
      res = raw.replace(new RegExp(`\\s*-\\s*${p.option1Value.trim()}$`, 'i'), '').trim();
    } else {
      const parts = raw.split(/\s+-\s+/);
      if (parts.length >= 3) {
        res = parts.slice(0, parts.length - 1).join(' - ').trim();
      } else if (parts.length === 2) {
        const p2 = parts[1].trim();
        if (/^(shade|no|color|warna|size|ml|gr|pcs|\d+)/i.test(p2) || (p2.length <= 20 && !p2.includes(' '))) {
          res = parts[0].trim();
        }
      }
    }

    this.parentNameCache.set(id, res);
    return res;
  }

  public getLabelPrintTitle(p: Product): string {
    if (!p) return '';
    if (this.singleParentOnly) {
      return this.extractParentName(p);
    }
    const id = (p.id || p.sku || p.name) + '_variant';
    if (this.labelTitleCache.has(id)) {
      return this.labelTitleCache.get(id)!;
    }

    const rawName = (p.name || '').trim();
    const sku = (p.sku || '').trim();
    const barcode = (p.barcode || '').trim();
    const shadeName = BEAUTY_SHADES[sku] || BEAUTY_SHADES[barcode] || p.option1Value || p.option2Value || '';

    let res = rawName;
    if (shadeName && shadeName.trim() && shadeName.trim() !== 'Default') {
      const cleanShade = shadeName.trim();
      if (!rawName.toLowerCase().includes(cleanShade.toLowerCase())) {
        const cleanParent = rawName.replace(/\s+ALL\s+VARIAN\s*$/i, '').replace(/\s+ALL\s+VARIANT\s*$/i, '').trim();
        res = `${cleanParent} - ${cleanShade}`;
      }
    }

    this.labelTitleCache.set(id, res);
    return res;
  }

  // Central fast update method: runs in ~2ms without template getter overhead
  public updatePrintData() {
    if (!this.products || this.products.length === 0) {
      this.rawFilteredBrandProducts = [];
      this.filteredBrandProducts = [];
      this.displayProducts = [];
      this.productRows = [];
      this.previewRows = [];
      this.visibleChecklistItems = [];
      this.totalCount = 0;
      this.selectedCount = 0;
      this.areAllSelected = false;
      return;
    }

    const brandQuery = (this.brandSearchInput || '').trim().toLowerCase();

    // 1. Filter by brand & search term
    let filtered = this.products.filter(p => {
      const productBrand = this.extractBrandName(p).toLowerCase();
      let matchBrand = false;
      if (this.selectedBrands.length > 0) {
        matchBrand = this.selectedBrands.some(b => b.toLowerCase() === productBrand);
      } else if (brandQuery) {
        matchBrand = productBrand.includes(brandQuery);
      } else {
        matchBrand = true;
      }
      const matchSearch = !this.searchTerm ||
        (p.name && p.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (p.barcode && p.barcode.includes(this.searchTerm)) ||
        (p.sku && p.sku.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return matchBrand && matchSearch;
    });

    // 2. Single parent deduplication
    if (this.singleParentOnly) {
      const seenParents = new Set<string>();
      const parentList: Product[] = [];
      filtered.forEach(p => {
        const parentName = this.extractParentName(p);
        if (!seenParents.has(parentName)) {
          seenParents.add(parentName);
          parentList.push({ ...p, name: parentName });
        }
      });
      filtered = parentList;
    }

    this.rawFilteredBrandProducts = filtered;
    this.totalCount = filtered.length;

    // 3. Sync selection on brand or mode switch
    const currentBrand = (this.selectedBrands.slice().sort().join('|') + '::' + (this.selectedBrands.length === 0 ? brandQuery : '')).toLowerCase();
    if (this.lastSelectionBrand !== currentBrand || this.lastSingleParentMode !== this.singleParentOnly) {
      this.lastSelectionBrand = currentBrand;
      this.lastSingleParentMode = this.singleParentOnly;
      this.selectedProductKeys = new Set(filtered.map(p => this.getProductKey(p)));
    }

    // 4. Selected items
    this.filteredBrandProducts = filtered.filter(p => this.selectedProductKeys.has(this.getProductKey(p)));
    this.selectedCount = this.filteredBrandProducts.length;
    this.areAllSelected = this.totalCount > 0 && this.selectedCount >= this.totalCount;

    // 5. Update checklist slice
    this.updateChecklistSlice();

    // 6. Generate display duplicates based on copies count
    const copies = Math.max(1, Math.min(500, Number(this.printCopiesCount) || 1));
    const disp: Product[] = [];
    this.filteredBrandProducts.forEach(item => {
      for (let i = 0; i < copies; i++) {
        if (disp.length < 3000) {
          disp.push(item);
        }
      }
    });
    this.displayProducts = disp;

    // 7. Chunk into rows
    const cols = this.columns || 3;
    const rows: Product[][] = [];
    for (let i = 0; i < disp.length; i += cols) {
      rows.push(disp.slice(i, i + cols));
    }
    this.productRows = rows;

    // 8. Chunk into preview rows for screen
    const maxPreviewRows = Math.ceil(this.maxPreviewItems / cols);
    this.previewRows = rows.slice(0, maxPreviewRows);
  }

  public updateChecklistSlice() {
    const q = (this.checklistSearchQuery || '').trim().toLowerCase();
    let matches = this.rawFilteredBrandProducts;
    if (q) {
      matches = matches.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const skuMatch = p.sku && p.sku.toLowerCase().includes(q);
        const barcodeMatch = p.barcode && p.barcode.includes(q);
        return nameMatch || skuMatch || barcodeMatch;
      });
    }
    this.matchingChecklistCount = matches.length;
    this.visibleChecklistItems = matches.slice(0, this.visibleChecklistCount);
  }

  public onChecklistSearchChange() {
    this.visibleChecklistCount = 50;
    this.updateChecklistSlice();
  }

  public loadMoreChecklistItems() {
    this.visibleChecklistCount += 50;
    this.updateChecklistSlice();
  }

  get hasMoreChecklistItems(): boolean {
    return this.visibleChecklistItems.length < this.matchingChecklistCount;
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

  public getTitleFontSizeClass(item: Product): string {
    const title = this.getLabelPrintTitle(item);
    if (title.length > 55) {
      return 'text-[9px] leading-[1.15] font-black uppercase text-black my-1 break-words tracking-tight';
    } else if (title.length > 38) {
      return 'text-[10px] leading-tight font-black uppercase text-black my-1 break-words tracking-tight';
    }
    return 'text-[11px] leading-tight font-black uppercase text-black my-1 break-words tracking-tight';
  }

  public isGeneratingPDF = false;

  public async saveAsPDF() {
    this.isGeneratingPDF = true;
    this.isFullPrintRendering = true;

    // Small delay to let full DOM render for html2pdf
    await new Promise(r => setTimeout(r, 60));

    try {
      const area = document.querySelector('.printable-area') as HTMLElement;
      if (!area) return;

      if (!(window as any).html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load html2pdf script'));
          document.head.appendChild(script);
        });
      }

      let brandName = 'Produk';
      if (this.selectedBrands.length === 1) {
        brandName = this.selectedBrands[0].replace(/[^a-zA-Z0-9_-]/g, '_');
      } else if (this.selectedBrands.length > 1) {
        const topBrands = this.selectedBrands.slice(0, 3).map(b => b.replace(/[^a-zA-Z0-9_-]/g, '_')).join('_');
        brandName = topBrands + (this.selectedBrands.length > 3 ? `_dan_${this.selectedBrands.length - 3}_brand` : '');
      } else if (this.brandSearchInput) {
        brandName = this.brandSearchInput.replace(/[^a-zA-Z0-9_-]/g, '_');
      }
      const filename = `Label_Tag_Harga_Cantika_${brandName}.pdf`;

      const opt = {
        margin: [6, 6, 6, 6],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#ffffff',
          logging: false,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { 
          mode: ['css', 'legacy'], 
          avoid: ['.word-tag-card', '.iseller-label-card'] 
        }
      };

      await (window as any).html2pdf().set(opt).from(area).save();
    } catch (err) {
      console.error('PDF generation error:', err);
      this.printPage();
    } finally {
      this.isGeneratingPDF = false;
      this.isFullPrintRendering = false;
    }
  }

  public printPage() {
    // Clean up any previous print iframe
    const oldFrame = document.getElementById('cantika-label-print-frame') as HTMLIFrameElement;
    if (oldFrame && oldFrame.parentNode) {
      oldFrame.parentNode.removeChild(oldFrame);
    }

    // Create isolated hidden print iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'cantika-label-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Generate full printable HTML directly in JS string: ultra-fast (2ms), zero browser freeze!
    const rowsHtml = this.generatePrintRowsHtml(this.productRows);

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Label Tag Harga - Cantika Beauty Store</title>
          <meta charset="utf-8">
          <style>
            @page {
              margin: 6mm;
              size: A4 portrait;
            }
            body {
              background-color: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .grid {
              display: grid !important;
            }
            .grid-cols-3 {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              gap: 12px !important;
            }
            .grid-cols-4 {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              gap: 8px !important;
            }
            .printable-area {
              width: 100% !important;
              background: #ffffff !important;
              box-sizing: border-box !important;
            }
            .word-tag-card, .iseller-label-card {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              break-inside: avoid-page !important;
              -webkit-column-break-inside: avoid !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              align-items: center !important;
              text-align: center !important;
              box-sizing: border-box !important;
              background: #ffffff !important;
              padding: 10px !important;
              border-radius: 2px !important;
            }
            .word-tag-card {
              border: 2px solid #000000 !important;
              min-height: 140px !important;
            }
            .iseller-label-card {
              border: 1px solid #000000 !important;
              min-height: 105px !important;
            }
            .text-xs { font-size: 12px !important; line-height: 1.2 !important; }
            .text-sm { font-size: 14px !important; line-height: 1.3 !important; }
            .text-lg { font-size: 18px !important; line-height: 1.2 !important; }
            .text-\\[10px\\] { font-size: 10px !important; }
            .text-\\[11px\\] { font-size: 11px !important; }
            .text-\\[9px\\] { font-size: 9px !important; }
            .font-bold { font-weight: 700 !important; }
            .font-black, .font-extrabold { font-weight: 900 !important; }
            .font-mono { font-family: monospace !important; }
            .uppercase { text-transform: uppercase !important; }
            .line-through { text-decoration: line-through !important; }
            .text-gray-400, .text-gray-500 { color: #6b7280 !important; }
            .text-black { color: #000000 !important; }
            .text-slate-600 { color: #475569 !important; }
            .w-full { width: 100% !important; }
            .border-b { border-bottom: 1px solid #e2e8f0 !important; }
            .pb-2 { padding-bottom: 8px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .mt-0.5 { margin-top: 2px !important; }
            .my-auto { margin-top: auto !important; margin-bottom: auto !important; }
            .space-y-1 > * + * { margin-top: 4px !important; }
            .break-words { overflow-wrap: break-word !important; word-break: break-word !important; }
            .relative { position: relative !important; }
            .absolute { position: absolute !important; }
            .inline-block { display: inline-block !important; }
            .left-0 { left: 0 !important; }
            .right-0 { right: 0 !important; }
            .top-1\/2 { top: 50% !important; }
            .-translate-y-1\/2 { transform: translateY(-50%) !important; }
            .h-\\[2px\\] { height: 2px !important; }
            .bg-red-600 { background-color: #dc2626 !important; }
            .pointer-events-none { pointer-events: none !important; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          <div class="printable-area">
            ${rowsHtml}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  }

  private generatePrintRowsHtml(rows: Product[][]): string {
    const isWord = this.templateMode === 'word';
    const colsClass = this.columns === 3 ? 'grid grid-cols-3' : 'grid grid-cols-4';

    return rows.map(row => {
      const cardsHtml = row.map(item => {
        const title = this.getLabelPrintTitle(item);
        const titleClass = this.getTitleFontSizeClass(item);
        const sku = item.sku || '';
        const barcode = item.barcode || sku;
        const priceFmt = this.formatNumber(item.price);

        if (isWord) {
          const oldPriceFmt = this.formatNumber(this.getOldPrice(item.price));
          const strikeHtml = this.showStrikethrough ? `
            <div class="text-xs font-bold text-gray-400 relative inline-block px-1">
              <span>RP ${oldPriceFmt}</span>
              <span class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-red-600 w-full pointer-events-none"></span>
            </div>
          ` : '';

          return `
            <div class="border-2 border-black p-3.5 flex flex-col justify-between items-center text-center rounded-xs bg-white min-h-[140px] word-tag-card">
              <div class="w-full border-b border-black/20 pb-2 mb-2">
                <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-600 block">SKU: ${sku}</span>
                <h3 class="${titleClass}">${title}</h3>
              </div>
              <div class="space-y-1 my-auto w-full">
                ${strikeHtml}
                <div class="text-lg font-black text-black font-heading tracking-tight leading-none">
                  RP ${priceFmt}
                </div>
              </div>
            </div>
          `;
        } else {
          // iSeller mode
          const cardClass = this.getLabelCardClasses();
          const bcNumHtml = this.showBarcodeNumber ? `<div class="text-[10px] font-mono font-bold text-black tracking-wider text-left">${barcode}</div>` : '';
          const priceHtml = this.showPrice ? `<div class="text-xs font-black text-black font-heading mt-1">Rp ${priceFmt}</div>` : '';
          const skuHtml = this.showSKU ? `<div class="text-[9px] font-mono text-gray-500 mt-0.5">SKU: ${sku}</div>` : '';

          return `
            <div class="${cardClass}">
              ${bcNumHtml}
              <div class="${titleClass}">${title}</div>
              ${priceHtml}
              ${skuHtml}
            </div>
          `;
        }
      }).join('');

      return `<div class="${colsClass} print-row" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 8px;">${cardsHtml}</div>`;
    }).join('');
  }
}
