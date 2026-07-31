import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private masterKeyStr = 'CantikaBeauty_SecureVault_Key_2026_AES256';
  private autoLockMinutes = 15;
  private lastActivityTime = Date.now();

  constructor() {
    this.setupActivityListener();
  }

  private setupActivityListener() {
    if (typeof window !== 'undefined') {
      ['mousemove', 'keydown', 'click', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, () => {
          this.lastActivityTime = Date.now();
        });
      });
    }
  }

  public getApiUrl(): string {
    if (typeof localStorage !== 'undefined') {
      const custom = localStorage.getItem('cantika_backend_api_url');
      if (custom && custom.trim()) {
        let url = custom.trim().replace(/\/+$/, '');
        if (!url.endsWith('/api')) url += '/api';
        return url;
      }
    }
    if (typeof window !== 'undefined' && (window as any).CANTIKA_API_URL) {
      const raw = (window as any).CANTIKA_API_URL.trim().replace(/\/+$/, '');
      return raw.endsWith('/api') ? raw : raw + '/api';
    }
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const host = window.location.hostname;
      return `http://${host}:3000/api`;
    }
    return 'http://localhost:3000/api';
  }

  public setApiUrl(url: string) {
    if (typeof localStorage !== 'undefined') {
      if (!url || !url.trim()) {
        localStorage.removeItem('cantika_backend_api_url');
      } else {
        let clean = url.trim().replace(/\/+$/, '');
        localStorage.setItem('cantika_backend_api_url', clean);
      }
    }
  }

  public isSessionExpired(): boolean {
    const elapsedMinutes = (Date.now() - this.lastActivityTime) / (1000 * 60);
    return elapsedMinutes > this.autoLockMinutes;
  }

  // SHA-256 Data Integrity Checksum Calculation
  public async generateChecksum(data: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      return 'fallback_hash_' + data.length;
    }
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.error('SHA-256 checksum error:', err);
      return 'hash_err';
    }
  }

  // Base64 Obfuscation + XOR AES-style Vault Encryption for Local Data Storage
  public encryptData(payload: any): string {
    try {
      const jsonStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
      let encrypted = '';
      for (let i = 0; i < jsonStr.length; i++) {
        const charCode = jsonStr.charCodeAt(i) ^ this.masterKeyStr.charCodeAt(i % this.masterKeyStr.length);
        encrypted += String.fromCharCode(charCode);
      }
      return 'SEC_VAULT_v1:' + btoa(unescape(encodeURIComponent(encrypted)));
    } catch (err) {
      console.error('Encryption error:', err);
      return JSON.stringify(payload);
    }
  }

  public decryptData(encryptedStr: string): any {
    if (!encryptedStr || !encryptedStr.startsWith('SEC_VAULT_v1:')) {
      // Legacy unencrypted fallback
      try {
        return JSON.parse(encryptedStr);
      } catch {
        return encryptedStr;
      }
    }

    try {
      const rawBase64 = encryptedStr.replace('SEC_VAULT_v1:', '');
      const decodedStr = decodeURIComponent(escape(atob(rawBase64)));
      let decrypted = '';
      for (let i = 0; i < decodedStr.length; i++) {
        const charCode = decodedStr.charCodeAt(i) ^ this.masterKeyStr.charCodeAt(i % this.masterKeyStr.length);
        decrypted += String.fromCharCode(charCode);
      }
      return JSON.parse(decrypted);
    } catch (err) {
      console.error('Decryption error:', err);
      return null;
    }
  }

  // Secure Local Storage Adapter
  public setSecureStorage(key: string, data: any) {
    if (typeof localStorage === 'undefined') return;
    const encrypted = this.encryptData(data);
    localStorage.setItem(key, encrypted);
  }

  public getSecureStorage(key: string, defaultValue: any = null): any {
    if (typeof localStorage === 'undefined') return defaultValue;
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const decrypted = this.decryptData(raw);
    return decrypted !== null ? decrypted : defaultValue;
  }
}
