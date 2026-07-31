import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 relative space-y-6"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700">✕</button>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            🔒
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 font-heading">Login Sistem POS & Owner</h2>
            <p class="text-xs text-gray-500">Masuk untuk mengelola stok, harga & audit toko</p>
          </div>
        </div>

        <form (ngSubmit)="handleLogin()" class="space-y-4 text-xs">
          <div>
            <label class="font-bold text-gray-700 block mb-1">Email Pengguna *</label>
            <input
              type="email"
              required
              [(ngModel)]="email"
              name="email"
              placeholder="owner@cantika.id"
              class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label class="font-bold text-gray-700 block mb-1">Password *</label>
            <input
              type="password"
              required
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
            />
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <button type="submit" class="btn-primary py-3 font-bold">
              Masuk Sekarang →
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class LoginModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public email = '';
  public password = '';
  public errorMessage = '';

  constructor(private authService: AuthService) {}

  public handleLogin() {
    const res = this.authService.loginWithPhone(this.email, this.password);
    if (res.success) {
      this.close.emit();
    } else {
      this.errorMessage = res.message;
    }
  }
}
