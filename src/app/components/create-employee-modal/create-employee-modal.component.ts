import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { EmployeeAccount } from '../../models/auth.model';

@Component({
  selector: 'app-create-employee-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 dark:border-slate-800 relative space-y-5 max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            👥
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white font-heading">{{ langService.t('createEmpTitle') }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ langService.t('createEmpSub') }}</p>
          </div>
        </div>

        <!-- Alert Message -->
        <div *ngIf="alertMessage" [class]="alertSuccess ? 'p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs rounded-xl font-bold' : 'p-3 bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs rounded-xl font-bold'">
          {{ alertMessage }}
        </div>

        <form (ngSubmit)="handleCreateEmployee()" class="space-y-4 text-xs">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ langService.t('empFullName') }}</label>
            <input
              type="text"
              required
              placeholder="Dewi Lestari"
              [(ngModel)]="nameInput"
              name="nameInput"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-medium"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ langService.t('empPhone') }}</label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                [(ngModel)]="phoneInput"
                name="phoneInput"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ langService.t('empPassword') }}</label>
              <input
                type="text"
                required
                placeholder="kasir123"
                [(ngModel)]="passwordInput"
                name="passwordInput"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ 'empJobTitle' | translate }}</label>
            <select
              [(ngModel)]="jobTitleInput"
              name="jobTitleInput"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold"
            >
              <option value="Kepala Toko / Manager">Kepala Toko / Supervisor (Manager)</option>
              <option value="Kasir Lead Shift Pagi">{{ 'jobMorningCashier' | translate }}</option>
              <option value="Kasir Shift Malam">{{ 'jobNightCashier' | translate }}</option>
              <option value="Stok Admin & Gudang">{{ 'jobStockAdmin' | translate }}</option>
              <option value="Karyawan Toko">{{ 'jobStoreStaff' | translate }}</option>
            </select>
          </div>

          <!-- Permission Checkbox for Senior Staff / Store Manager -->
          <div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-1">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                [(ngModel)]="canEditPriceInput"
                name="canEditPriceInput"
                id="permPriceCheck"
                class="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
              <label for="permPriceCheck" class="text-xs font-bold text-amber-900 dark:text-amber-300 cursor-pointer">
                🔑 Berikan Hak Akses Mengubah Harga Produk (Supervisor / Kepala Toko)
              </label>
            </div>
            <p class="text-[10px] text-amber-800 dark:text-amber-400 font-medium pl-6">
              Jika dicentang, staf ini diizinkan mengedit harga jual & stok produk. Jika tidak, staf bertindak sebagai Kasir Standar.
            </p>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" (click)="close.emit()" class="btn-secondary py-2 px-4">{{ langService.t('btnCancel') }}</button>
            <button type="submit" class="btn-primary py-2 px-5">{{ langService.t('btnCreateEmp') }}</button>
          </div>
        </form>

        <!-- Registered Employees List -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <h4 class="text-xs font-bold text-slate-900 dark:text-white font-heading">{{ langService.t('registeredEmpList') }}</h4>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div *ngFor="let emp of (employees$ | async)" class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">
                  {{ emp.name }} 
                  <span class="text-slate-400 dark:text-slate-500 font-normal">({{ emp.jobTitle }})</span>
                  <span *ngIf="emp.canEditPrice" class="ml-1 text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-extrabold px-1.5 py-0.5 rounded-md">🔑 Can Edit Price</span>
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">No. HP: <strong>{{ emp.phone }}</strong> | Pass: <strong class="text-rose-700 dark:text-rose-400">{{ emp.password }}</strong></div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">{{ langService.t('statusActive') }}</span>
                <button (click)="handleDeleteEmployee(emp.id)" class="text-rose-600 hover:text-rose-800 font-bold">✕</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CreateEmployeeModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public nameInput = '';
  public phoneInput = '';
  public passwordInput = 'kasir123';
  public jobTitleInput = 'Kasir Lead Shift Pagi';
  public canEditPriceInput = false;

  public alertMessage = '';
  public alertSuccess = false;

  public employees$: Observable<EmployeeAccount[]>;

  constructor(
    private authService: AuthService,
    public langService: LanguageService
  ) {
    this.employees$ = this.authService.employees$;
  }

  public handleCreateEmployee() {
    if (!this.nameInput || !this.phoneInput || !this.passwordInput) {
      this.alertMessage = 'Harap isi semua kolom data karyawan.';
      this.alertSuccess = false;
      return;
    }

    const res = this.authService.createEmployeeAccount(
      this.nameInput,
      this.phoneInput,
      this.passwordInput,
      this.jobTitleInput,
      this.canEditPriceInput
    );

    this.alertMessage = res.message;
    this.alertSuccess = res.success;

    if (res.success) {
      this.nameInput = '';
      this.phoneInput = '';
      this.passwordInput = 'kasir123';
    }
  }

  public handleDeleteEmployee(id: string) {
    const res = this.authService.deleteEmployeeAccount(id);
    this.alertMessage = res.message;
    this.alertSuccess = res.success;
  }
}
