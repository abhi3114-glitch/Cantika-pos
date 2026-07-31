import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuditService } from '../../services/audit.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-csv-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 max-h-[92vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            📥
          </div>
          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white font-heading">Impor Bulk CSV Katalog Produk</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Unggah atau tempel data CSV untuk menambah ratusan produk sekaligus</p>
          </div>
        </div>

        <!-- Mode Selector: Paste Raw CSV Text vs Quick Sample Data -->
        <div class="space-y-4 text-xs">
          
          <div class="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-900 text-indigo-950 dark:text-indigo-200 space-y-1">
            <div class="font-bold text-[11px] uppercase">Format Header CSV Yang Didukung:</div>
            <code class="block bg-white dark:bg-slate-900 p-2 rounded-xl border border-indigo-200 dark:border-indigo-800 font-mono text-[10px] text-slate-800 dark:text-slate-200">
              Handle, Title, Vendor, Type, Variant SKU, Variant Price, Variant Compare At Price, Variant Inventory Qty
            </code>
          </div>

          <div>
            <label class="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Tempel Teks CSV / CSV Content *</label>
            <textarea
              [(ngModel)]="csvText"
              rows="6"
              placeholder="Title,Vendor,Variant SKU,Variant Price,Variant Inventory Qty&#10;Wardah Lip Cream,WARDAH,W-001,35000,50"
              class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            ></textarea>
          </div>

          <div *ngIf="parsedCount > 0" class="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-2xl font-bold">
            🎉 Terdeteksi {{ parsedCount }} produk valid siap diimpor ke sistem!
          </div>

          <div *ngIf="errorMessage" class="p-3 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800 rounded-2xl font-bold">
            ⚠️ {{ errorMessage }}
          </div>

          <!-- Action Buttons -->
          <div class="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              (click)="loadSampleCSV()"
              class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline cursor-pointer"
            >
              📋 Muat Contoh Data CSV Demo
            </button>

            <div class="flex items-center gap-2">
              <button (click)="close.emit()" class="btn-secondary py-2.5 px-4 font-bold">{{ 'btnCancel' | translate }}</button>
              <button
                (click)="handleImport()"
                [disabled]="!csvText.trim()"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold shadow-md shadow-indigo-600/20 disabled:opacity-40 cursor-pointer"
              >
                📥 Impor Produk Sekarang →
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class CsvImportModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public csvText = '';
  public parsedCount = 0;
  public errorMessage = '';

  constructor(
    private productService: ProductService,
    private auditService: AuditService,
    private authService: AuthService,
    public langService: LanguageService
  ) {}

  public loadSampleCSV() {
    this.csvText = `Title,Vendor,Type,Variant SKU,Variant Price,Variant Inventory Qty
Wardah Velvet Matte Lip Mousse 01,WARDAH,WARDAH,W-LIP-001,42000,30
Skintific 5X Ceramide Barrier Moisture Gel 30g,SKINTIFIC,SKINTIFIC,SKIN-GEL-01,129000,45
Somethinc Niacinamide Moisture Serum 20ml,SOMETHINC,SOMETHINC,SOM-SER-01,89000,25
Hanasui Serum Gold Whitening 20ml,HANASUI,HANASUI,HAN-GOLD-01,24000,60
Softlens Beauty Queen Gray Normal,SOFLENS,SOFLENS,SOF-GRAY-01,35000,40`;
    this.errorMessage = '';
  }

  public handleImport() {
    this.errorMessage = '';
    const lines = this.csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      this.errorMessage = 'Format CSV membutuhkan setidaknya 1 baris header dan 1 baris data.';
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes('title') || h.includes('nama') || h.includes('name'));
    const vendorIdx = headers.findIndex(h => h.includes('vendor') || h.includes('brand'));
    const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('code'));
    const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('harga'));
    const qtyIdx = headers.findIndex(h => h.includes('qty') || h.includes('stock') || h.includes('stok'));

    let importedCount = 0;
    const user = this.authService.getCurrentUser();

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"/, '').replace(/"$/, ''));
      if (cols.length >= 2) {
        const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : cols[0];
        const vendor = vendorIdx !== -1 && cols[vendorIdx] ? cols[vendorIdx] : 'IMPOR';
        const sku = skuIdx !== -1 && cols[skuIdx] ? cols[skuIdx] : `SKU-${Date.now()}-${i}`;
        const price = priceIdx !== -1 && !isNaN(Number(cols[priceIdx])) ? Number(cols[priceIdx]) : 35000;
        const stock = qtyIdx !== -1 && !isNaN(Number(cols[qtyIdx])) ? Number(cols[qtyIdx]) : 20;

        const newProd: Product = {
          id: `prod_csv_${Date.now()}_${i}`,
          sku: sku,
          barcode: sku,
          name: name,
          vendor: vendor,
          type: vendor,
          buyingPrice: Math.round(price * 0.8),
          price: price,
          stock: stock,
          unit: 'pcs',
          weight: 100,
          weightUnit: 'gram',
          collection: 'Impor Bulk'
        };

        this.productService.addProduct(newProd);
        importedCount++;
      }
    }

    if (importedCount > 0) {
      this.auditService.addLog({
        id: `log_csv_${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID') + ' WIB',
        userId: user?.id || 'usr_staff',
        userName: user?.name || 'Staff',
        userRole: user?.role || 'employee',
        productId: 'bulk_csv',
        productName: `${importedCount} Produk CSV`,
        productSku: 'BULK-CSV',
        fieldChanged: 'Impor Bulk CSV',
        oldValue: 'Belum Ada',
        newValue: `Berhasil mengimpor ${importedCount} produk dari file CSV`
      });

      this.csvText = '';
      this.close.emit();
    } else {
      this.errorMessage = 'Gagal memproses baris data CSV. Pastikan kolom sesuai format header.';
    }
  }
}
