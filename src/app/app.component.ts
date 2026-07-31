import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './services/product.service';
import { AuthService } from './services/auth.service';
import { LanguageService } from './services/language.service';
import { TranslatePipe } from './pipes/translate.pipe';
import { Product, SaleTransaction } from './models/product.model';
import { RestockOrder } from './models/restock.model';

import { HeaderComponent } from './components/header/header.component';
import { EditProductModalComponent } from './components/edit-product-modal/edit-product-modal.component';
import { AddProductModalComponent } from './components/add-product-modal/add-product-modal.component';
import { RestockModalComponent } from './components/restock-modal/restock-modal.component';
import { RestockDetailModalComponent } from './components/restock-detail-modal/restock-detail-modal.component';
import { NotificationDrawerComponent } from './components/notification-drawer/notification-drawer.component';
import { MobileToastComponent } from './components/mobile-toast/mobile-toast.component';
import { PurchaseOrderModalComponent } from './components/purchase-order-modal/purchase-order-modal.component';
import { CreateEmployeeModalComponent } from './components/create-employee-modal/create-employee-modal.component';
import { PosReceiptModalComponent } from './components/pos-receipt-modal/pos-receipt-modal.component';
import { CsvImportModalComponent } from './components/csv-import-modal/csv-import-modal.component';
import { SecurityShieldModalComponent } from './components/security-shield-modal/security-shield-modal.component';
import { GlobalMarginModalComponent } from './components/global-margin-modal/global-margin-modal.component';
import { AdminPosComponent } from './components/admin-pos/admin-pos.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    EditProductModalComponent,
    AddProductModalComponent,
    RestockModalComponent,
    RestockDetailModalComponent,
    NotificationDrawerComponent,
    MobileToastComponent,
    PurchaseOrderModalComponent,
    CreateEmployeeModalComponent,
    PosReceiptModalComponent,
    CsvImportModalComponent,
    SecurityShieldModalComponent,
    GlobalMarginModalComponent,
    AdminPosComponent,
    FooterComponent,
    TranslatePipe
  ],
  template: `
    <div class="min-h-screen bg-[#FAF4F5] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white transition-colors duration-200">
      
      <!-- Mobile Smartphone Alert Toast Notification -->
      <app-mobile-toast></app-mobile-toast>

      <!-- Internal Security Gatekeeper Login Overlay (When Logged Out) -->
      <ng-container *ngIf="!(authService.currentUser$ | async); else internalSystem">
        <div class="min-h-screen bg-gradient-to-br from-slate-950 via-rose-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
          
          <!-- Ambient Background Glows -->
          <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl animate-pulse-glow"></div>
          <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-glow" style="animation-delay: 1.5s;"></div>

          <!-- Top Language Switcher Toggle (Gatekeeper) -->
          <div class="absolute top-6 right-6 z-20">
            <button
              (click)="langService.toggleLanguage()"
              class="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-xl transition-all cursor-pointer"
            >
              <span>{{ (langService.currentLang$ | async) === 'id' ? '🇮🇩 Bahasa Indonesia' : '🇬🇧 English Language' }}</span>
              <span class="text-amber-300 font-mono">⚙️ Switch</span>
            </button>
          </div>

          <div class="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl border border-rose-200/50 space-y-6 animate-fade-in text-center relative z-10">
            
            <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 text-white flex items-center justify-center text-3xl shadow-xl shadow-rose-600/30 mx-auto font-heading ring-4 ring-rose-100">
              🌺
            </div>

            <div class="space-y-1.5">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                🔒 {{ 'internalPortal' | translate }}
              </span>
              <h2 class="text-2xl font-black text-slate-900 font-heading tracking-tight">CANTIKA BEAUTY STORE</h2>
              <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {{ 'loginPrompt' | translate }}
              </p>
            </div>

            <!-- Error Banner -->
            <div *ngIf="loginErrorMessage" class="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-2xl font-bold text-left shadow-xs">
              {{ loginErrorMessage }}
            </div>

            <form (ngSubmit)="handlePhoneLoginSubmit()" class="space-y-4 text-left text-xs">
              <div>
                <label class="font-extrabold text-slate-700 block mb-1 tracking-wide">{{ 'phoneLabel' | translate }}</label>
                <input
                  type="tel"
                  required
                  [(ngModel)]="phoneInput"
                  name="phoneInput"
                  placeholder="081234567890"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-extrabold text-rose-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                />
              </div>

              <div>
                <label class="font-extrabold text-slate-700 block mb-1 tracking-wide">{{ 'passwordLabel' | translate }}</label>
                <input
                  type="password"
                  required
                  [(ngModel)]="passwordInput"
                  name="passwordInput"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-extrabold text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                />
              </div>

              <button type="submit" class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all duration-300 font-heading uppercase tracking-wider cursor-pointer">
                {{ 'loginBtn' | translate }}
              </button>
            </form>

          </div>
        </div>
      </ng-container>

      <!-- Internal Main System (When Logged In) -->
      <ng-template #internalSystem>
        <!-- Header -->
        <app-header
          (toggleNotifications)="isNotifOpen = !isNotifOpen"
          (openSecurityShield)="isSecurityShieldOpen = true"
          (openGlobalMarginModal)="isGlobalMarginOpen = true"
        ></app-header>

        <!-- Main Workspace -->
        <main class="max-w-7xl mx-auto px-4 flex-1 w-full my-4">
          <app-admin-pos
            (openEditProduct)="selectedEditingProduct = $event"
            (openAddProduct)="isAddProductOpen = true"
            (openRestock)="selectedRestockProduct = $event || null; isRestockOpen = true"
            (openPurchaseOrder)="isPurchaseOrderOpen = true"
            (openCreateEmployee)="isCreateEmployeeOpen = true"
            (openRestockDetail)="selectedRestockDetailOrder = $event"
            (completeCheckout)="completedReceiptTransaction = $event"
            (openCsvImport)="isCsvImportOpen = true"
          ></app-admin-pos>
        </main>

        <!-- Footer -->
        <app-footer></app-footer>

        <!-- Internal Modals & Drawers -->
        <app-edit-product-modal
          [isOpen]="!!selectedEditingProduct"
          [product]="selectedEditingProduct"
          (close)="selectedEditingProduct = null"
        ></app-edit-product-modal>

        <app-add-product-modal
          [isOpen]="isAddProductOpen"
          (close)="isAddProductOpen = false"
        ></app-add-product-modal>

        <app-restock-modal
          [isOpen]="isRestockOpen"
          [preselectedProduct]="selectedRestockProduct"
          (close)="isRestockOpen = false; selectedRestockProduct = null"
        ></app-restock-modal>

        <app-restock-detail-modal
          [isOpen]="!!selectedRestockDetailOrder"
          [order]="selectedRestockDetailOrder"
          (close)="selectedRestockDetailOrder = null"
        ></app-restock-detail-modal>

        <app-notification-drawer
          [isOpen]="isNotifOpen"
          (close)="isNotifOpen = false"
        ></app-notification-drawer>

        <app-purchase-order-modal
          [isOpen]="isPurchaseOrderOpen"
          (close)="isPurchaseOrderOpen = false"
        ></app-purchase-order-modal>

        <app-create-employee-modal
          [isOpen]="isCreateEmployeeOpen"
          (close)="isCreateEmployeeOpen = false"
        ></app-create-employee-modal>

        <app-pos-receipt-modal
          [isOpen]="!!completedReceiptTransaction"
          [transaction]="completedReceiptTransaction"
          (close)="completedReceiptTransaction = null"
        ></app-pos-receipt-modal>

        <app-csv-import-modal
          [isOpen]="isCsvImportOpen"
          (close)="isCsvImportOpen = false"
        ></app-csv-import-modal>

        <app-security-shield-modal
          [isOpen]="isSecurityShieldOpen"
          (close)="isSecurityShieldOpen = false"
        ></app-security-shield-modal>

        <app-global-margin-modal
          [isOpen]="isGlobalMarginOpen"
          (close)="isGlobalMarginOpen = false"
        ></app-global-margin-modal>
      </ng-template>

    </div>
  `
})
export class AppComponent {
  public phoneInput = '';
  public passwordInput = '';
  public loginErrorMessage = '';

  public isAddProductOpen = false;
  public isRestockOpen = false;
  public isNotifOpen = false;
  public isPurchaseOrderOpen = false;
  public isCreateEmployeeOpen = false;
  public isCsvImportOpen = false;
  public isSecurityShieldOpen = false;
  public isGlobalMarginOpen = false;
  public selectedEditingProduct: Product | null = null;
  public selectedRestockProduct: Product | null = null;
  public selectedRestockDetailOrder: RestockOrder | null = null;
  public completedReceiptTransaction: SaleTransaction | null = null;

  constructor(
    public productService: ProductService,
    public authService: AuthService,
    public langService: LanguageService
  ) {}

  public handlePhoneLoginSubmit() {
    const res = this.authService.loginWithPhone(this.phoneInput, this.passwordInput);
    if (!res.success) {
      this.loginErrorMessage = res.message;
    } else {
      this.loginErrorMessage = '';
    }
  }

  public loginWithDemo(role: 'owner' | 'employee') {
    if (role === 'owner') {
      this.phoneInput = '+62 81910195353';
      this.passwordInput = 'bunny1234';
    } else {
      this.phoneInput = '081234567890';
      this.passwordInput = 'kasir123';
    }
    this.handlePhoneLoginSubmit();
  }
}
