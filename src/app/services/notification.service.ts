import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OwnerNotification } from '../models/notification.model';

const INITIAL_NOTIFICATIONS: OwnerNotification[] = [];

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<OwnerNotification[]>(this.loadPersistedNotifications());
  public notifications$ = this.notificationsSubject.asObservable();

  private activeToastSubject = new BehaviorSubject<OwnerNotification | null>(null);
  public activeToast$ = this.activeToastSubject.asObservable();

  constructor() {
    this.requestBrowserPushPermission();
  }

  private loadPersistedNotifications(): OwnerNotification[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem('cantika_notifications');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  }

  private persistNotifications() {
    if (typeof localStorage === 'undefined') return;
    try {
      // Keep last 200 notifications to prevent localStorage bloat
      const capped = this.notificationsSubject.value.slice(0, 200);
      localStorage.setItem('cantika_notifications', JSON.stringify(capped));
    } catch (_) {}
  }

  public requestBrowserPushPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          console.log('Browser Push Notification permission:', permission);
        });
      }
    }
  }

  public triggerNativeBrowserPush(notification: OwnerNotification) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: `${notification.message} (${notification.actorName})`,
          tag: notification.id
        });
      } catch (err) {
        console.log('Native push notice:', err);
      }
    }
  }

  public sendNotification(notification: OwnerNotification) {
    this.notificationsSubject.next([notification, ...this.notificationsSubject.value]);
    this.persistNotifications();
    this.activeToastSubject.next(notification);

    // 1. Permanent Native Browser Push Notification (100% Free Forever, Zero Trial, Built into OS/Browser!)
    this.triggerNativeBrowserPush(notification);

    // 2. Permanent Telegram Bot API Dispatch (100% Free Forever, Zero Limits!)
    this.dispatchTelegramAlert(notification);

    // 3. Silent Background Automatic WhatsApp API Dispatch
    this.dispatchSilentWhatsAppAPI(notification);

    setTimeout(() => {
      if (this.activeToastSubject.value?.id === notification.id) {
        this.activeToastSubject.next(null);
      }
    }, 6000);
  }

  private telegramBotToken = localStorage.getItem('telegram_bot_token') || '8413299329:AAGIRUPOQbBHX9s-qz1yGqt4lV2mu9HptJ8';
  private telegramChatId = localStorage.getItem('telegram_chat_id') || '-1004397635379';

  public setTelegramConfig(botToken: string, chatId: string) {
    this.telegramBotToken = botToken.trim();
    this.telegramChatId = chatId.trim();
    localStorage.setItem('telegram_bot_token', this.telegramBotToken);
    localStorage.setItem('telegram_chat_id', this.telegramChatId);
  }

  public dispatchTelegramAlert(notification: OwnerNotification, attempt = 1) {
    if (!this.telegramBotToken || !this.telegramChatId) return;

    const storedUserStr = typeof localStorage !== 'undefined' ? localStorage.getItem('cantika_current_user') : null;
    let activeActor = 'Kasir Toko';
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        if (u && u.name) activeActor = `${u.name} (${u.role === 'owner' ? 'Owner' : 'Kasir'})`;
      } catch (e) {}
    }

    const textMsg = `📌 *${notification.title}*\n----------------------------------------\n👤 *Petugas / Operator:* ${notification.actorName || activeActor}\n${notification.message}\n⏰ *Waktu:* ${notification.timestamp}`;

    const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.telegramChatId,
        text: textMsg,
        parse_mode: 'Markdown'
      })
    })
    .then(r => r.json())
    .then(res => {
      if (res && res.ok) {
        console.log('🤖 Telegram Alert Delivered Successfully:', res.result?.message_id);
      } else {
        console.warn('Telegram API Response Warning:', res);
      }
    })
    .catch(err => {
      console.warn(`Telegram Dispatch attempt ${attempt} failed:`, err);
      if (attempt < 2) {
        setTimeout(() => this.dispatchTelegramAlert(notification, attempt + 1), 1200);
      }
    });
  }

  private whatsappApiKey = localStorage.getItem('whatsapp_api_key') || '';
  private whatsappInstanceId = localStorage.getItem('whatsapp_instance_id') || '';

  public setWhatsAppApiConfig(apiKey: string, instanceId?: string) {
    this.whatsappApiKey = apiKey.trim();
    if (instanceId) this.whatsappInstanceId = instanceId.trim();
    localStorage.setItem('whatsapp_api_key', this.whatsappApiKey);
    if (instanceId) localStorage.setItem('whatsapp_instance_id', this.whatsappInstanceId);
  }

  public dispatchSilentWhatsAppAPI(notification: OwnerNotification) {
    const targetPhone = '917453877233';
    const textMsg = `*CANTIKA BEAUTY STORE ALERT* 📢\n📌 ${notification.title}\n👤 Petugas: ${notification.actorName}\n💬 ${notification.message}\n⏰ ${notification.timestamp}`;

    // 1. Try Local OpenWA Gateway (http://localhost:8080/send-message) - 100% Free & Permanent!
    fetch('http://localhost:8080/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: `${targetPhone}@c.us`,
        message: textMsg
      })
    })
    .then(r => r.json())
    .then(res => console.log('🤖 OpenWA background WhatsApp delivered:', res))
    .catch(() => {
      // Fallback to external API Gateways if OpenWA server is offline
      this.dispatchExternalGateway(targetPhone, textMsg);
    });
  }

  private dispatchExternalGateway(targetPhone: string, textMsg: string) {
    if (this.whatsappApiKey) {
      if (this.whatsappInstanceId.startsWith('AC') || this.whatsappInstanceId.startsWith('twilio_')) {
        // Twilio WhatsApp API Dispatch
        const accountSid = this.whatsappInstanceId.replace('twilio_', '');
        const authToken = this.whatsappApiKey;
        const twilioFrom = 'whatsapp:+14155238886';
        const twilioTo = `whatsapp:+${targetPhone}`;

        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const authHeader = 'Basic ' + btoa(`${accountSid}:${authToken}`);
        const body = new URLSearchParams({
          From: twilioFrom,
          To: twilioTo,
          Body: textMsg
        });

        fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body
        })
        .then(r => r.json())
        .then(res => console.log('✅ Twilio WhatsApp message delivered:', res))
        .catch(err => console.error('Twilio error:', err));
      } else if (this.whatsappInstanceId.startsWith('green_')) {
        const realId = this.whatsappInstanceId.replace('green_', '');
        const url = `https://api.green-api.com/waInstance${realId}/sendMessage/${this.whatsappApiKey}`;
        const body = JSON.stringify({
          chatId: `${targetPhone}@c.us`,
          message: textMsg
        });
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
          .then(r => r.json())
          .then(res => console.log('✅ Green API background WhatsApp delivered:', res))
          .catch(err => console.error('Green API error:', err));
      } else if (this.whatsappInstanceId) {
        const url = `https://api.ultramsg.com/${this.whatsappInstanceId}/messages/chat`;
        const body = new URLSearchParams({
          token: this.whatsappApiKey,
          to: `+${targetPhone}`,
          body: textMsg
        });
        fetch(url, { method: 'POST', body })
          .then(r => r.json())
          .then(res => console.log('✅ UltraMsg background WhatsApp delivered:', res))
          .catch(err => console.error('UltraMsg error:', err));
      } else {
        if (this.whatsappApiKey.length > 10) {
          const url = 'https://api.fonnte.com/send';
          const body = new URLSearchParams({
            target: targetPhone,
            message: textMsg
          });
          fetch(url, { method: 'POST', headers: { 'Authorization': this.whatsappApiKey }, body })
            .then(r => r.json())
            .then(res => console.log('✅ Fonnte background WhatsApp delivered:', res))
            .catch(err => console.error('Fonnte error:', err));
        } else {
          const gatewayUrl = `https://api.callmebot.com/whatsapp.php?phone=+${targetPhone}&text=${encodeURIComponent(textMsg)}&apikey=${this.whatsappApiKey}`;
          fetch(gatewayUrl, { method: 'GET', mode: 'no-cors' })
            .then(() => console.log('🤖 CallMeBot background WhatsApp dispatched to +91 7453877233'))
            .catch(err => console.log('CallMeBot dispatch notice:', err));
        }
      }
    }
  }

  public dismissToast() {
    this.activeToastSubject.next(null);
  }

  public markAllAsRead() {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
  }

  public getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  public getWhatsAppLink(notification: OwnerNotification): string {
    const ownerPhone = '917453877233';
    const text = encodeURIComponent(
      `*CANTIKA BEAUTY STORE — OWNER ALERT* 📢\n` +
      `----------------------------------------\n` +
      `📌 *Judul:* ${notification.title}\n` +
      `👤 *Petugas:* ${notification.actorName}\n` +
      `📦 *Item:* ${notification.productName || '-'}\n` +
      `💬 *Detail:* ${notification.message}\n` +
      `⏰ *Waktu:* ${notification.timestamp}\n` +
      `----------------------------------------\n` +
      `_Pesan otomatis dikirim ke WA: +91 7453877233_`
    );
    return `https://wa.me/${ownerPhone}?text=${text}`;
  }

  public openWhatsApp(notification: OwnerNotification) {
    const link = this.getWhatsAppLink(notification);
    window.open(link, '_blank');
  }
}
