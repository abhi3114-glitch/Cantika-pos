import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950 via-gray-900 to-rose-900 text-white p-6 md:p-10 shadow-xl border border-rose-900/50 my-4">
      <!-- Background Decorative Elements -->
      <div class="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-12 -left-12 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

      <div class="relative z-10 max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
          <span>🌸 PUSAT GROSIR & RETAIL KOSMETIK BPOM</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-heading leading-tight">
          Solusi Kecantikan Terlengkap <br/>
          <span className="bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
            Wardah, Skintific, Somethinc & 50+ Brand Original
          </span>
        </h2>

        <p className="text-xs md:text-sm text-rose-100/80 font-medium max-w-xl">
          Akses lebih dari <strong>5.180+ produk pilihan</strong> kecantikan Indonesia dengan jaminan originalitas 100%, stok terupdate real-time, dan pengiriman super cepat.
        </p>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div class="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
            <div class="text-lg md:text-xl font-extrabold text-amber-300 font-heading">5.186+</div>
            <div class="text-[10px] text-gray-300 font-medium uppercase">Katalog Produk</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
            <div class="text-lg md:text-xl font-extrabold text-emerald-400 font-heading">100%</div>
            <div class="text-[10px] text-gray-300 font-medium uppercase">Original BPOM</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
            <div class="text-lg md:text-xl font-extrabold text-rose-300 font-heading">Sameday</div>
            <div class="text-[10px] text-gray-300 font-medium uppercase">Pengiriman COD</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
            <div class="text-lg md:text-xl font-extrabold text-pink-300 font-heading">Real-Time</div>
            <div class="text-[10px] text-gray-300 font-medium uppercase">Stok POS Admin</div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class HeroComponent {}
