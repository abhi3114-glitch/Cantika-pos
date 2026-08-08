import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LanguageService, Language } from '../../services/language.service';
import { ThemeService } from '../../services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, IconComponent],
  template: `
    <header class="sticky top-0 z-40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div class="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        
        <!-- Store Brand -->
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-rose-900 text-white flex items-center justify-center font-heading font-black text-sm tracking-tight shadow-xs">
            CB
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-sm font-bold tracking-tight text-slate-900 dark:text-white font-heading leading-none">
                CANTIKA BEAUTY STORE
              </h1>
              <span class="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[10px] uppercase font-bold border border-rose-200 dark:border-rose-900 font-mono">
                POS ENTERPRISE
              </span>

              <!-- Live Online/Offline Network Status Indicator -->
              <div 
                class="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight border font-mono transition-all"
                [class]="isOnline 
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'"
                [title]="isOnline ? 'Terkoneksi Online ke Cloud Database MongoDB Atlas' : 'Mode Offline: Menggunakan Local Vault Terenkripsi'"
              >
                <span class="relative flex h-2 w-2">
                  <span *ngIf="isOnline" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2" [class]="isOnline ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                </span>
                <span>{{ isOnline ? 'Online (MongoDB Cloud)' : 'Offline Vault Mode' }}</span>
              </div>
            </div>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide block mt-0.5">
              Integrated Inventory & Point of Sale System
            </span>
          </div>
        </div>

        <!-- User Controls -->
        <div class="flex items-center gap-2" *ngIf="authService.currentUser$ | async as user">
          
          <!-- Segmented Theme Mode Switcher -->
          <div class="flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300/80 dark:border-slate-700">
            <button
              (click)="themeService.setTheme('light')"
              [class]="(themeService.theme$ | async) === 'light'
                ? 'px-2.5 py-1 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-all'
                : 'px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-xs hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-all'"
              title="Activate Light Mode"
            >
              <app-icon name="sun" size="13" class="text-amber-500"></app-icon>
              <span>Light</span>
            </button>
            <button
              (click)="themeService.setTheme('dark')"
              [class]="(themeService.theme$ | async) === 'dark'
                ? 'px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-all'
                : 'px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-xs hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-all'"
              title="Activate Dark Mode"
            >
              <app-icon name="moon" size="13" class="text-indigo-400"></app-icon>
              <span>Dark</span>
            </button>
          </div>

          <!-- Language Selector -->
          <button
            (click)="toggleLang()"
            class="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Switch Language"
          >
            <span class="font-mono text-[11px] font-bold">{{ (currentLang$ | async) === 'id' ? 'ID' : 'EN' }}</span>
          </button>

          <!-- Owner Global Profit Margin Setting Control -->
          <button
            *ngIf="user.role === 'owner'"
            (click)="openGlobalMarginModal.emit()"
            class="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Pengaturan Profit Margin Global Toko"
          >
            <span>🌐</span>
            <span class="hidden lg:inline font-mono">Margin Global:</span>
            <span class="font-mono font-black text-rose-700 dark:text-rose-300">{{ (productService.globalProfitMargin$ | async) || 20 }}%</span>
          </button>

          <!-- Database Security Shield Button (Owner Only) -->
          <button
            *ngIf="user.role === 'owner'"
            (click)="openSecurityShield.emit()"
            class="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Database Security Status"
          >
            <app-icon name="shield" size="14" class="text-emerald-700 dark:text-emerald-400"></app-icon>
            <span class="hidden md:inline font-mono">Security Vault</span>
          </button>

          <!-- Owner Mobile Push Notification Bell -->
          <button
            *ngIf="user.role === 'owner'"
            (click)="toggleNotifications.emit()"
            class="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Store Notifications"
          >
            <app-icon name="bell" size="15" class="text-slate-700 dark:text-slate-300"></app-icon>
            <span 
              *ngIf="getUnreadNotifCount() > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
            >
              {{ getUnreadNotifCount() }}
            </span>
          </button>

          <!-- Profile Badge -->
          <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 pr-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <img 
              [src]="user.avatarUrl" 
              [alt]="user.name"
              class="w-6 h-6 rounded object-cover border border-slate-200 dark:border-slate-700"
            />
            <div class="text-left hidden sm:block">
              <div class="font-semibold text-slate-900 dark:text-white leading-tight text-[11px]">{{ user.name }}</div>
              <div class="text-[9px] font-medium uppercase text-slate-500 dark:text-slate-400">
                {{ user.role === 'owner' ? 'Owner' : 'Staff' }}
              </div>
            </div>
            <button 
              (click)="authService.logout()" 
              class="ml-1 px-2 py-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>

        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  @Output() toggleNotifications = new EventEmitter<void>();
  @Output() openSecurityShield = new EventEmitter<void>();
  @Output() openGlobalMarginModal = new EventEmitter<void>();

  public currentLang$: Observable<Language>;
  public isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor(
    public productService: ProductService,
    public authService: AuthService,
    public notificationService: NotificationService,
    public langService: LanguageService,
    public themeService: ThemeService
  ) {
    this.currentLang$ = this.langService.currentLang$;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.isOnline = true);
      window.addEventListener('offline', () => this.isOnline = false);
    }
  }

  public toggleLang() {
    this.langService.toggleLanguage();
  }

  public toggleTheme() {
    this.themeService.toggleTheme();
  }

  public getUnreadNotifCount(): number {
    return this.notificationService.getUnreadCount();
  }
}
