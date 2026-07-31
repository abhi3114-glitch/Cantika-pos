import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuditLog } from '../models/audit.model';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private get apiUrl(): string {
    return this.securityService.getApiUrl();
  }

  private auditLogsSubject = new BehaviorSubject<AuditLog[]>([]);
  public auditLogs$ = this.auditLogsSubject.asObservable();

  constructor(private securityService: SecurityService) {
    this.loadLogs();
    this.setupAutoSync();
  }

  public loadLogs() {
    fetch(`${this.apiUrl}/audit`)
      .then(res => res.json())
      .then((data: AuditLog[]) => {
        if (Array.isArray(data)) {
          this.auditLogsSubject.next(data);
          this.securityService.setSecureStorage('cantika_audit_vault', data);
          return;
        }
        this.fallbackLoad();
      })
      .catch(() => this.fallbackLoad());
  }

  private setupAutoSync() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.silentSyncLogs();
      }, 8000);

      window.addEventListener('focus', () => {
        this.silentSyncLogs();
      });
    }
  }

  private silentSyncLogs() {
    fetch(`${this.apiUrl}/audit`)
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: AuditLog[]) => {
        if (Array.isArray(data)) {
          const currentJson = JSON.stringify(this.auditLogsSubject.value);
          const newJson = JSON.stringify(data);
          if (currentJson !== newJson) {
            this.auditLogsSubject.next(data);
            this.securityService.setSecureStorage('cantika_audit_vault', data);
          }
        }
      })
      .catch(() => {});
  }

  private fallbackLoad() {
    const cached = this.securityService.getSecureStorage('cantika_audit_vault', []);
    this.auditLogsSubject.next(Array.isArray(cached) ? cached : []);
  }

  public addLog(log: AuditLog) {
    const updated = [log, ...this.auditLogsSubject.value];
    this.auditLogsSubject.next(updated);
    this.securityService.setSecureStorage('cantika_audit_vault', updated);

    fetch(`${this.apiUrl}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    }).catch(err => console.warn('Audit log sync warning:', err));
  }

  public getLogs(): AuditLog[] {
    return this.auditLogsSubject.value;
  }
}
