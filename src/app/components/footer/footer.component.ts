import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-slate-950 text-white border-t border-slate-900 mt-12 py-8 px-4 text-xs">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <!-- Brand Footer -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-lg font-black font-heading shadow-md">
            🌺
          </div>
          <div>
            <div class="font-black text-sm text-white font-heading tracking-tight">CANTIKA BEAUTY STORE</div>
            <div class="text-[10px] text-slate-400 max-w-sm">{{ langService.t('footerSubtitle') }}</div>
          </div>
        </div>

        <!-- System Copyright & BPOM Badge -->
        <div class="text-right text-[10px] text-slate-400 space-y-1">
          <div>© 2026 <strong>Cantika Beauty System</strong>. All rights reserved.</div>
          <div class="flex items-center gap-2 justify-end">
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">✓ 100% BPOM Verified</span>
            <span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">🔐 Encrypted POS</span>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  constructor(public langService: LanguageService) {}
}
