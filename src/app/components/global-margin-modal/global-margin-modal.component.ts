import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-global-margin-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 dark:border-slate-800 relative space-y-5 animate-scale-up"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">✕</button>

        <!-- Modal Header -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-rose-600/30">
            🌐
          </div>
          <div>
            <h2 class="text-base font-black text-slate-900 dark:text-white font-heading">Margin Profit Global Toko</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Standar Keuntungan Default Seluruh Produk (Pengaturan Owner)</p>
          </div>
        </div>

        <!-- Inline Status Banner -->
        <div *ngIf="saveSuccessMessage" class="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-2xl flex items-center gap-2 animate-fade-in">
          <span>✅</span>
          <span>{{ saveSuccessMessage }}</span>
        </div>

        <form (ngSubmit)="handleSave()" class="space-y-4 text-xs">
          <!-- Current Active Margin Indicator -->
          <div class="p-4 bg-rose-50/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl space-y-1">
            <span class="text-[10px] uppercase font-black tracking-wider text-rose-700 dark:text-rose-400 block">Margin Global Aktif Saat Ini</span>
            <div class="text-3xl font-black font-mono text-rose-900 dark:text-rose-200">
              {{ currentMargin }}%
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Margin ini otomatis digunakan saat entri produk baru untuk menghitung rekomendasi harga jual.
            </p>
          </div>

          <!-- Input New Margin -->
          <div class="space-y-1.5">
            <label class="font-extrabold text-slate-700 dark:text-slate-300 block">Set Profit Margin Global Baru (%):</label>
            <div class="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0"
                max="500"
                required
                [(ngModel)]="newMarginInput"
                name="newMarginInput"
                placeholder="25"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-mono font-black text-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
              />
              <span class="text-xl font-black font-mono text-rose-600 dark:text-rose-400">%</span>
            </div>
          </div>

          <!-- Quick Presets -->
          <div>
            <label class="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase block mb-1.5">Pilihan Quick Presets</label>
            <div class="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                *ngFor="let m of [15, 20, 25, 30, 35, 40, 50]"
                (click)="newMarginInput = m"
                [class]="newMarginInput === m 
                  ? 'px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs shadow-xs cursor-pointer' 
                  : 'px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'"
              >
                {{ m }}%
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs cursor-pointer transition-all"
            >
              Batal
            </button>

            <button
              type="submit"
              class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 uppercase tracking-wider cursor-pointer transition-all active:scale-95"
            >
              ⭐ Simpan Margin Global
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class GlobalMarginModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public currentMargin = 20;
  public newMarginInput = 20;
  public saveSuccessMessage = '';

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.currentMargin = this.productService.getGlobalProfitMargin();
    this.newMarginInput = this.currentMargin;

    this.productService.globalProfitMargin$.subscribe(m => {
      if (m) {
        this.currentMargin = m;
      }
    });
  }

  public handleSave() {
    const valid = Math.max(0, Number(this.newMarginInput) || 0);
    this.productService.setGlobalProfitMargin(valid);
    this.currentMargin = valid;
    this.saveSuccessMessage = `Margin Global Toko berhasil diperbarui menjadi ${valid}%!`;

    this.notificationService.sendNotification({
      id: `notif_margin_${Date.now()}`,
      type: 'system',
      title: '🌐 Profit Margin Global Diperbarui',
      message: `Owner memperbarui standar profit margin toko menjadi ${valid}%.`,
      timestamp: new Date().toLocaleString('id-ID') + ' WIB',
      read: false
    });

    setTimeout(() => {
      this.saveSuccessMessage = '';
      this.close.emit();
    }, 1500);
  }
}
