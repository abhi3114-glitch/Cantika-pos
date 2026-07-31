import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { RestockService } from '../../services/restock.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-6 animate-fade-in my-4">
      
      <!-- Top Hero Analytics Banner -->
      <div class="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 text-white p-7 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
        
        <!-- Ambient Glow -->
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl"></div>

        <div class="space-y-1 z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
            {{ 'analyticsTag' | translate }}
          </div>
          <h2 class="text-2xl md:text-3xl font-black font-heading tracking-tight">{{ 'analyticsTitle' | translate }}</h2>
          <p class="text-xs text-slate-400 max-w-md leading-relaxed">{{ 'analyticsSubtitle' | translate }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3.5 w-full md:w-auto z-10">
          <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center shadow-lg">
            <div class="text-[10px] uppercase font-bold text-slate-300">{{ 'totalRetailOmset' | translate }}</div>
            <div class="text-lg md:text-xl font-black text-rose-300 font-heading font-mono">{{ formatIDR(totalRetailValuation) }}</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center shadow-lg">
            <div class="text-[10px] uppercase font-bold text-slate-300">{{ 'netProfitPotential' | translate }}</div>
            <div class="text-lg md:text-xl font-black text-emerald-400 font-heading font-mono">{{ formatIDR(totalPotentialProfit) }}</div>
          </div>
        </div>
      </div>

      <!-- Top Brands Leaderboard Card -->
      <div class="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-5">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-black text-slate-900 font-heading flex items-center gap-2">
            {{ 'topBrandsTitle' | translate }}
          </h3>
          <span class="text-xs font-bold text-slate-400 font-mono">6 Top Leaderboard</span>
        </div>

        <div class="space-y-4">
          <div *ngFor="let item of topBrands; let idx = index" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-slate-900 flex items-center gap-2">
                <span [class]="idx === 0 ? 'w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] flex items-center justify-center' : 'w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-black text-[10px] flex items-center justify-center'">
                  {{ idx + 1 }}
                </span>
                {{ item.brand }} <span class="text-slate-400 font-normal">({{ item.count }} SKU)</span>
              </span>
              <span class="text-rose-700 font-black font-mono text-sm">{{ formatIDR(item.value) }}</span>
            </div>
            <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div 
                class="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full transition-all duration-700 shadow-xs" 
                [style.width.%]="(item.value / (topBrands[0] ? topBrands[0].value : 1)) * 100"
              ></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  public totalRetailValuation = 0;
  public totalPotentialProfit = 0;
  public topBrands: { brand: string; count: number; value: number }[] = [];

  constructor(
    private productService: ProductService,
    private restockService: RestockService,
    public langService: LanguageService
  ) {}

  ngOnInit() {
    this.productService.products$.subscribe(products => {
      this.totalRetailValuation = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
      const totalCost = products.reduce((sum, p) => sum + (p.buyingPrice * p.stock), 0);
      this.totalPotentialProfit = this.totalRetailValuation - totalCost;

      const brandStats: { [key: string]: { count: number; value: number } } = {};
      products.forEach(p => {
        const b = p.type || 'Lainnya';
        if (!brandStats[b]) brandStats[b] = { count: 0, value: 0 };
        brandStats[b].count += 1;
        brandStats[b].value += p.price * p.stock;
      });

      this.topBrands = Object.entries(brandStats)
        .map(([brand, data]) => ({ brand, count: data.count, value: data.value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    });
  }

  public formatIDR(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }
}
