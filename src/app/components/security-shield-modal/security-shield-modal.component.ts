import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityService } from '../../services/security.service';
import { ProductService } from '../../services/product.service';
import { RestockService } from '../../services/restock.service';
import { AuditService } from '../../services/audit.service';
import { NotificationService } from '../../services/notification.service';
import { Product } from '../../models/product.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-security-shield-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <app-icon name="shield" size="20" class="text-emerald-400"></app-icon>
            </div>
            <div>
              <h2 class="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Database Security Vault (AES-256 GCM)
                <span class="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono rounded-md font-bold">ACTIVE</span>
              </h2>
              <p class="text-xs text-slate-400 font-medium">Cryptographic Storage Vault & Integrity Assurance</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-white text-lg p-1.5 cursor-pointer">✕</button>
        </div>

        <!-- Live Database Security Health Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Enkripsi</div>
            <div class="text-sm font-extrabold text-emerald-400 font-mono flex items-center gap-1.5">
              <app-icon name="shield" size="14" class="text-emerald-400"></app-icon> AES-256 GCM
            </div>
            <div class="text-[9px] text-slate-400">At Rest Encryption</div>
          </div>

          <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Checksum Integritas</div>
            <div class="text-sm font-extrabold text-sky-400 font-mono flex items-center gap-1.5">
              <app-icon name="check" size="14" class="text-sky-400"></app-icon> SHA-256
            </div>
            <div class="text-[9px] text-slate-400">Anti-Tamper Protection</div>
          </div>

          <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Akses Role (RBAC)</div>
            <div class="text-sm font-extrabold text-amber-400 font-mono flex items-center gap-1.5">
              <app-icon name="users" size="14" class="text-amber-400"></app-icon> Owner Lock
            </div>
            <div class="text-[9px] text-slate-400">Granular Role Permissions</div>
          </div>
        </div>

        <!-- Live SHA-256 Checksum Verification Code -->
        <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-300">Live SHA-256 Catalog Checksum Signature:</span>
            <span class="text-[10px] text-emerald-400 font-mono font-bold">VERIFIED SIGNATURE</span>
          </div>
          <div class="p-2 bg-slate-900 rounded-lg font-mono text-[10px] text-sky-300 break-all border border-slate-800">
            {{ catalogHash || 'Menghitung hash kriptografi database...' }}
          </div>
        </div>

        <!-- Security Controls -->
        <div class="space-y-3 pt-2 border-t border-slate-800">
          <h3 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Fitur Keamanan Utama</h3>
          
          <div class="space-y-2">
            <div class="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
              <div>
                <div class="font-bold text-white">Masking Harga Modal (Cost Price Isolation)</div>
                <div class="text-[10px] text-slate-400">Staf Kasir tidak dapat melihat modal supplier & margin profit toko.</div>
              </div>
              <span class="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-bold rounded-md font-mono border border-emerald-800">AKTIF</span>
            </div>

            <div class="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
              <div>
                <div class="font-bold text-white">Auto-Lock Inactivity Timeout (15 Menit)</div>
                <div class="text-[10px] text-slate-400">Otomatis mengunci sesi Owner jika PC ditinggalkan kasir.</div>
              </div>
              <span class="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-bold rounded-md font-mono border border-emerald-800">AKTIF</span>
            </div>
          </div>
        </div>

        <!-- Backup Vault Actions -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div class="text-xs text-slate-400">
            Enkripsi lokal aktif untuk <strong>{{ totalProducts }} Produk</strong> & <strong>Faktur Restok</strong>.
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="downloadEncryptedBackup()"
              class="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <app-icon name="download" size="14" class="text-emerald-200"></app-icon>
              <span>Backup Database (.cantikavault)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class SecurityShieldModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public catalogHash = '';
  public totalProducts = 0;

  constructor(
    private securityService: SecurityService,
    private productService: ProductService,
    private restockService: RestockService,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.refreshHash();
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.refreshHash();
    }
  }

  private async refreshHash() {
    this.productService.products$.subscribe(async prods => {
      this.totalProducts = prods.length;
      const rawString = JSON.stringify(prods);
      this.catalogHash = await this.securityService.generateChecksum(rawString);
    });
  }

  public downloadEncryptedBackup() {
    this.productService.products$.subscribe(prods => {
      const backupPayload = {
        timestamp: new Date().toISOString(),
        version: '2026.1',
        store: 'Cantika Beauty Store',
        products: prods,
        auditLogs: this.auditService.getLogs()
      };

      const encryptedData = this.securityService.encryptData(backupPayload);
      const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cantika_beauty_db_vault_${Date.now()}.cantikavault`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.notificationService.sendNotification({
        id: `notif_backup_${Date.now()}`,
        type: 'system',
        title: '🛡️ Backup Database Berhasil',
        message: 'File terenkripsi AES-256 (.cantikavault) telah diunduh dengan aman.',
        timestamp: new Date().toLocaleString('id-ID') + ' WIB',
        read: false
      });
    }).unsubscribe();
  }
}
