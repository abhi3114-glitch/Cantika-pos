import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuditLog } from '../models/audit.model';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private auditLogsSubject = new BehaviorSubject<AuditLog[]>([]);
  public auditLogs$ = this.auditLogsSubject.asObservable();

  constructor(private securityService: SecurityService) {
    this.loadLogs();
  }

  private loadLogs() {
    const cached = this.securityService.getSecureStorage('cantika_audit_vault', []);
    this.auditLogsSubject.next(cached);
  }

  public addLog(log: AuditLog) {
    const updated = [log, ...this.auditLogsSubject.value];
    this.auditLogsSubject.next(updated);
    this.securityService.setSecureStorage('cantika_audit_vault', updated);
  }

  public getLogs(): AuditLog[] {
    return this.auditLogsSubject.value;
  }
}
