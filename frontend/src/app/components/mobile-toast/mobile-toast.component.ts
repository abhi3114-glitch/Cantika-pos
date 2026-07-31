import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { LanguageService } from '../../services/language.service';
import { OwnerNotification } from '../../models/notification.model';

@Component({
  selector: 'app-mobile-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="activeToast$ | async as toast"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 space-y-2 animate-slide-down"
    >
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-lg shrink-0 shadow-md">
          📱
        </div>

        <div class="flex-1 min-w-0 text-xs">
          <div class="flex items-center justify-between text-[10px] text-rose-300 font-bold uppercase tracking-wider">
            <span>{{ langService.t('toastHeader') }}</span>
            <span>{{ toast.timestamp }}</span>
          </div>
          <div class="font-extrabold text-white text-xs mt-0.5">{{ toast.title }}</div>
          <div class="text-slate-300 font-medium truncate mt-0.5">{{ toast.message }}</div>
        </div>

        <button (click)="dismiss()" class="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer">
          ✕
        </button>
      </div>

      <div class="pt-1 flex items-center justify-end gap-2 border-t border-slate-800">
        <a
          [href]="getWaLink(toast)"
          target="_blank"
          (click)="$event.stopPropagation()"
          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          💬 Kirim ke WA (+91 7453877233) →
        </a>
      </div>
    </div>
  `
})
export class MobileToastComponent {
  public activeToast$: Observable<OwnerNotification | null>;

  constructor(
    private notificationService: NotificationService,
    public langService: LanguageService
  ) {
    this.activeToast$ = this.notificationService.activeToast$;
  }

  public dismiss() {
    this.notificationService.dismissToast();
  }

  public getWaLink(toast: OwnerNotification): string {
    return this.notificationService.getWhatsAppLink(toast);
  }
}
