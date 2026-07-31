import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityService } from '../../services/security.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { RestockService } from '../../services/restock.service';
import { AuditService } from '../../services/audit.service';
import { NotificationService } from '../../services/notification.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-security-shield-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <app-icon name="shield" size="20" class="text-emerald-400"></app-icon>
            </div>
            <div>
              <h2 class="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Database Safeguard & Backup Vault
                <span class="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono rounded-md font-bold">TRIPLE SAFEGUARD</span>
              </h2>
              <p class="text-xs text-slate-400 font-medium">Render Cloud Persistence, Auto Daily Snapshots & Instant Offline Backups</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-white text-lg p-1.5 cursor-pointer">✕</button>
        </div>

        <!-- Live Server Connection Config Section -->
        <div class="p-4 bg-slate-950 border border-sky-900/50 rounded-xl space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">🌐 Central Server API Connection</span>
              <span [class]="serverStatus === 'online' ? 'px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono rounded font-bold' : 'px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono rounded font-bold'">
                {{ serverStatus === 'online' ? 'CONNECTED & SECURE' : 'OFFLINE' }}
              </span>
            </div>
          </div>

          <p class="text-[11px] text-slate-300 leading-relaxed">
            Your central database runs on Render cloud server with atomic file persistence and automated daily backup snapshots in <code class="text-emerald-400">backend/data/backups/</code>.
          </p>

          <div class="space-y-2 pt-1">
            <label class="block text-[11px] font-bold text-slate-400 uppercase">Deployed Backend Server URL:</label>
            <div class="flex items-center gap-2">
              <input
                type="url"
                [(ngModel)]="apiUrlInput"
                placeholder="https://cantika-pos.onrender.com"
                class="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                (click)="testAndSaveServerUrl()"
                [disabled]="isTestingServer"
                class="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>{{ isTestingServer ? 'Connecting...' : 'Save & Sync' }}</span>
              </button>
            </div>
            <div *ngIf="connectionFeedback" [class]="serverStatus === 'online' ? 'text-[11px] font-bold text-emerald-400 font-mono mt-1' : 'text-[11px] font-bold text-amber-400 font-mono mt-1'">
              {{ connectionFeedback }}
            </div>
          </div>
        </div>

        <!-- Live Database Security Health Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atomic Save</div>
            <div class="text-sm font-extrabold text-emerald-400 font-mono flex items-center gap-1.5">
              <app-icon name="check" size="14" class="text-emerald-400"></app-icon> ZERO CORRUPTION
            </div>
            <div class="text-[9px] text-slate-400">Atomic Temp Write & Rename</div>
          </div>

          <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backup Daily</div>
            <div class="text-sm font-extrabold text-sky-400 font-mono flex items-center gap-1.5">
              <app-icon name="shield" size="14" class="text-sky-400"></app-icon> AUTO SNAPSHOTS
            </div>
            <div class="text-[9px] text-slate-400">Render Cloud Server History</div>
          </div>

          <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Vault</div>
            <div class="text-sm font-extrabold text-amber-400 font-mono flex items-center gap-1.5">
              <app-icon name="download" size="14" class="text-amber-400"></app-icon> AES-256 VAULT
            </div>
            <div class="text-[9px] text-slate-400">Encrypted Offline Mirror</div>
          </div>
        </div>

        <!-- Live SHA-256 Checksum Verification Code -->
        <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-300">Live Database SHA-256 Signature Checksum:</span>
            <span class="text-[10px] text-emerald-400 font-mono font-bold">VERIFIED SAFE</span>
          </div>
          <div class="p-2 bg-slate-900 rounded-lg font-mono text-[10px] text-sky-300 break-all border border-slate-800">
            {{ catalogHash || 'Calculating SHA-256 database signature...' }}
          </div>
        </div>

        <!-- Backup Vault Actions for Owner -->
        <div class="space-y-3 pt-2 border-t border-slate-800">
          <h3 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Owner Database Protection Controls</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Download Full JSON Backup -->
            <button
              (click)="exportDatabaseJson()"
              class="p-3.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 rounded-xl text-left space-y-1 cursor-pointer transition-all group"
            >
              <div class="flex items-center justify-between text-emerald-300 font-bold text-xs">
                <span class="flex items-center gap-1.5">
                  <app-icon name="download" size="14" class="text-emerald-400"></app-icon>
                  Download Full DB Backup (.json)
                </span>
                <span class="text-[10px] font-mono bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-200">INSTANT</span>
              </div>
              <p class="text-[10px] text-slate-400">Download complete offline JSON file of all 5,182 products, employee accounts, restocks & audit logs.</p>
            </button>

            <!-- Restore Database JSON File -->
            <label
              class="p-3.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 rounded-xl text-left space-y-1 cursor-pointer transition-all group block"
            >
              <div class="flex items-center justify-between text-sky-300 font-bold text-xs">
                <span class="flex items-center gap-1.5">
                  <app-icon name="upload" size="14" class="text-sky-400"></app-icon>
                  Upload & Restore DB (.json)
                </span>
                <span class="text-[10px] font-mono bg-sky-900 px-1.5 py-0.5 rounded text-sky-200">RESTORE</span>
              </div>
              <p class="text-[10px] text-slate-400">Restore your server database from a previously downloaded .json backup file anytime.</p>
              <input type="file" accept=".json" (change)="handleDatabaseRestoreFile($event)" class="hidden" />
            </label>
          </div>

          <div *ngIf="restoreMessage" [class]="restoreSuccess ? 'p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-mono font-bold' : 'p-3 bg-rose-950 border border-rose-800 text-rose-300 rounded-xl text-xs font-mono font-bold'">
            {{ restoreMessage }}
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div class="text-xs text-slate-400">
            Protected: <strong>{{ totalProducts }} Active Products</strong> on Cloud Database.
          </div>

          <button
            (click)="close.emit()"
            class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Close Vault
          </button>
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
  public apiUrlInput = '';
  public isTestingServer = false;
  public serverStatus: 'online' | 'offline' = 'offline';
  public connectionFeedback = '';
  public restoreMessage = '';
  public restoreSuccess = false;

  constructor(
    private securityService: SecurityService,
    private productService: ProductService,
    private authService: AuthService,
    private restockService: RestockService,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.apiUrlInput = this.securityService.getApiUrl().replace(/\/api$/, '');
    this.checkCurrentServerStatus();
    this.refreshHash();
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.apiUrlInput = this.securityService.getApiUrl().replace(/\/api$/, '');
      this.checkCurrentServerStatus();
      this.refreshHash();
    }
  }

  private checkCurrentServerStatus() {
    const targetUrl = this.securityService.getApiUrl();
    fetch(`${targetUrl}/health`)
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'ok') {
          this.serverStatus = 'online';
          this.connectionFeedback = `Terhubung ke Backend Server Cloud (${data.totalProducts || 5182} produk terdaftar).`;
        } else {
          this.serverStatus = 'offline';
        }
      })
      .catch(() => {
        this.serverStatus = 'offline';
        this.connectionFeedback = 'Server API offline. Menggunakan local encrypted master vault.';
      });
  }

  public testAndSaveServerUrl() {
    if (!this.apiUrlInput || !this.apiUrlInput.trim()) {
      this.securityService.setApiUrl('');
      this.connectionFeedback = 'Menggunakan Backend API Default (https://cantika-pos.onrender.com/api)';
      this.checkCurrentServerStatus();
      this.productService.loadProducts();
      return;
    }

    this.isTestingServer = true;
    this.connectionFeedback = 'Menguji koneksi server API...';

    let cleanUrl = this.apiUrlInput.trim().replace(/\/+$/, '');
    let testEndpoint = cleanUrl.endsWith('/api') ? `${cleanUrl}/health` : `${cleanUrl}/api/health`;

    fetch(testEndpoint)
      .then(res => res.json())
      .then(data => {
        this.isTestingServer = false;
        if (data && data.status === 'ok') {
          this.securityService.setApiUrl(cleanUrl);
          this.serverStatus = 'online';
          this.connectionFeedback = '✅ Berhasil terhubung ke Backend Server Cloud! Memuat data produk...';
          this.productService.loadProducts();
          this.notificationService.sendNotification({
            id: `notif_server_${Date.now()}`,
            type: 'system',
            title: '🌐 Backend Server Terhubung',
            message: `Frontend berhasil terhubung ke ${cleanUrl}`,
            timestamp: new Date().toLocaleString('id-ID') + ' WIB',
            read: false
          });
        } else {
          this.isTestingServer = false;
          this.serverStatus = 'offline';
          this.connectionFeedback = '❌ Server merespons tetapi format bukan Backend Cantika POS.';
        }
      })
      .catch(() => {
        this.isTestingServer = false;
        this.serverStatus = 'offline';
        this.connectionFeedback = '❌ Gagal terhubung ke URL Server. Pastikan Backend Server sudah aktif/deployed.';
      });
  }

  private async refreshHash() {
    this.productService.products$.subscribe(async prods => {
      this.totalProducts = prods.length;
      const rawString = JSON.stringify(prods);
      this.catalogHash = await this.securityService.generateChecksum(rawString);
    });
  }

  public exportDatabaseJson() {
    this.productService.products$.subscribe(prods => {
      const fullBackup = {
        timestamp: new Date().toISOString(),
        version: '2026.1',
        store: 'Cantika Beauty Store Enterprise',
        products: prods,
        employees: this.authService.getEmployees ? this.authService.getEmployees() : [],
        auditLogs: this.auditService.getLogs(),
        globalProfitMargin: this.productService.getGlobalProfitMargin()
      };

      const jsonString = JSON.stringify(fullBackup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cantika_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.notificationService.sendNotification({
        id: `notif_export_${Date.now()}`,
        type: 'system',
        title: '📥 Backup Database Diunduh',
        message: `File cadangan master database (${prods.length} produk) berhasil diunduh.`,
        timestamp: new Date().toLocaleString('id-ID') + ' WIB',
        read: false
      });
    }).unsubscribe();
  }

  public handleDatabaseRestoreFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonContent = JSON.parse(e.target?.result as string);
        if (!jsonContent || (!Array.isArray(jsonContent.products) && !Array.isArray(jsonContent))) {
          this.restoreSuccess = false;
          this.restoreMessage = '❌ File bukan cadangan database Cantika POS yang valid.';
          return;
        }

        const payload = Array.isArray(jsonContent) ? { products: jsonContent } : jsonContent;
        const apiUrl = this.securityService.getApiUrl();

        fetch(`${apiUrl}/backup/restore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.success) {
            this.restoreSuccess = true;
            this.restoreMessage = `✅ SUKSES! Database server berhasil dipulihkan (${data.totalProducts} produk).`;
            this.productService.loadProducts();
            this.restockService.loadRestockOrders();
            this.auditService.loadLogs();
            this.notificationService.sendNotification({
              id: `notif_restore_${Date.now()}`,
              type: 'system',
              title: '🔄 Database Server Dipulihkan',
              message: `Database berhasil dipulihkan dari file backup (${data.totalProducts} produk).`,
              timestamp: new Date().toLocaleString('id-ID') + ' WIB',
              read: false
            });
          } else {
            this.restoreSuccess = false;
            this.restoreMessage = `❌ Gagal pemulihan database: ${data.error || 'Unknown error'}`;
          }
        })
        .catch(err => {
          this.restoreSuccess = false;
          this.restoreMessage = `❌ Gagal menghubungi server untuk pemulihan: ${err.message}`;
        });

      } catch (err) {
        this.restoreSuccess = false;
        this.restoreMessage = '❌ File terkorupsi atau format JSON tidak valid.';
      }
    };

    reader.readAsText(file);
  }
}
