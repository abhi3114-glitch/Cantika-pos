import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { LanguageService } from '../../services/language.service';
import { OwnerNotification } from '../../models/notification.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl relative border-l border-slate-200"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div class="flex items-center gap-2.5">
            <app-icon name="bell" size="18" class="text-rose-400"></app-icon>
            <div>
              <h2 class="text-xs font-bold font-heading">Store Notifications</h2>
              <span class="text-[10px] text-slate-400 font-medium">Real-Time Store Events Feed</span>
            </div>
          </div>
          <button (click)="close.emit()" class="p-1 text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        <!-- Telegram Connection Status Badge -->
        <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-semibold text-slate-800 text-[11px]">Telegram Alerts Active</span>
          </div>
          <button
            (click)="showSettings = !showSettings"
            class="text-[10px] text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer"
          >
            {{ showSettings ? 'Close Config' : 'Configure Bot' }}
          </button>
        </div>

        <!-- Collapsible Telegram Bot Config Panel -->
        <div *ngIf="showSettings" class="p-3 bg-slate-900 text-white text-xs border-b border-slate-800 space-y-2 animate-fade-in">
          <div class="font-bold text-[11px] text-slate-300">Telegram Bot Credentials</div>
          <div class="space-y-1.5">
            <input
              type="text"
              [(ngModel)]="telegramBotTokenInput"
              placeholder="Telegram Bot Token..."
              class="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-white font-mono"
            />
            <div class="flex items-center gap-1.5">
              <input
                type="text"
                [(ngModel)]="telegramChatIdInput"
                placeholder="Telegram Chat ID..."
                class="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-white font-mono"
              />
              <button
                (click)="saveTelegramConfig()"
                class="btn-primary py-1 px-3 text-[10px]"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications Feed List -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <ng-container *ngIf="notifications$ | async as notifs">
            <div 
              *ngFor="let notif of notifs"
              [class]="notif.read ? 'p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1' : 'p-3 rounded-xl bg-rose-50/60 border border-rose-200 shadow-2xs space-y-1'"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="font-bold text-xs text-slate-900 leading-snug">{{ notif.title }}</span>
                <span class="text-[9px] font-mono text-slate-400 shrink-0">{{ notif.timestamp }}</span>
              </div>
              <p class="text-xs text-slate-600 font-medium leading-relaxed">{{ notif.message }}</p>
            </div>

            <div *ngIf="notifs.length === 0" class="p-8 text-center text-slate-400 font-medium text-xs space-y-1">
              <div>No new notifications</div>
              <div class="text-[10px] text-slate-500 font-normal">Real-time alerts for sales, restocks, and price changes will appear here & push to Telegram.</div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class NotificationDrawerComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public notifications$: Observable<OwnerNotification[]>;
  public showSettings = false;
  public telegramBotTokenInput = localStorage.getItem('telegram_bot_token') || '8413299329:AAGIRUPOQbBHX9s-qz1yGqt4lV2mu9HptJ8';
  public telegramChatIdInput = localStorage.getItem('telegram_chat_id') || '-1004397635379';

  constructor(
    private notificationService: NotificationService,
    public langService: LanguageService
  ) {
    this.notifications$ = this.notificationService.notifications$;
  }

  public saveTelegramConfig() {
    this.notificationService.setTelegramConfig(this.telegramBotTokenInput, this.telegramChatIdInput);
    this.notificationService.sendNotification({
      id: `notif_tg_${Date.now()}`,
      type: 'system',
      title: '✅ Telegram Bot Terhubung',
      message: 'Konfigurasi Bot Telegram otomatis berhasil disimpan.',
      timestamp: new Date().toLocaleString('id-ID') + ' WIB',
      read: false
    });
  }
}
