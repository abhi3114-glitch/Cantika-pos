import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleTransaction } from '../../models/product.model';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-pos-receipt-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen && transaction" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div 
        class="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative space-y-4 max-h-[92vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <button (click)="close.emit()" class="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-700">✕</button>

        <div class="text-center space-y-1">
          <div class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
            ✓ Transaksi Berhasil
          </div>
          <h3 class="text-sm font-black text-slate-900 font-heading">Struk Kasir POS Counter</h3>
        </div>

        <!-- Thermal Receipt Paper Box (58mm/80mm Style) -->
        <div id="printable-receipt" class="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 font-mono text-[11px] space-y-3 text-slate-900 shadow-inner">
          
          <!-- Store Header -->
          <div class="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-3">
            <div class="font-black text-xs text-rose-900 font-heading">🌺 CANTIKA BEAUTY STORE</div>
            <div class="text-[9px] text-slate-500">Distributor Skincare & Kosmetik Original</div>
          </div>

          <!-- Transaction Info -->
          <div class="space-y-0.5 text-[10px] border-b border-dashed border-slate-400 pb-2">
            <div class="flex justify-between">
              <span class="text-slate-500">No. Faktur:</span>
              <span class="font-bold text-rose-900">{{ transaction.transactionNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Waktu:</span>
              <span>{{ transaction.timestamp }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Kasir:</span>
              <span class="font-bold">{{ transaction.cashierName }}</span>
            </div>
            <div class="flex justify-between" *ngIf="transaction.customerName">
              <span class="text-slate-500">Customer:</span>
              <span class="font-bold">{{ transaction.customerName }}</span>
            </div>
          </div>

          <!-- Itemized Items List -->
          <div class="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
            <div *ngFor="let item of transaction.items" class="space-y-0.5">
              <div class="font-bold text-slate-900 line-clamp-1">{{ item.product.name }}</div>
              <div class="flex justify-between text-[10px] text-slate-600">
                <span>{{ item.quantity }} x Rp {{ item.product.price.toLocaleString('id-ID') }}</span>
                <span class="font-bold text-slate-900">Rp {{ (item.quantity * item.product.price).toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>

          <!-- Financial Calculation -->
          <div class="space-y-1 text-[10px] border-b border-dashed border-slate-400 pb-2">
            <div class="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>Rp {{ transaction.subtotal.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between font-black text-xs text-slate-900 pt-1">
              <span>TOTAL BAYAR:</span>
              <span class="text-rose-700">Rp {{ transaction.totalAmount.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Bayar ({{ transaction.paymentMethod }}):</span>
              <span>Rp {{ transaction.cashPaid.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between text-emerald-700 font-bold" *ngIf="transaction.paymentMethod === 'Tunai'">
              <span>Kembali:</span>
              <span>Rp {{ transaction.cashChange.toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <!-- Points & Footer Message -->
          <div class="text-center text-[9px] space-y-1 text-slate-500 pt-1">
            <div class="font-bold text-emerald-800" *ngIf="transaction.pointsEarned > 0">
              🎉 Poin Member Diperoleh: +{{ transaction.pointsEarned }} pts
            </div>
            <div>Terima Kasih Atas Kunjungan Anda!</div>
            <div>Produk 100% Original BPOM Indonesia</div>
          </div>

        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-1">
          <button
            (click)="printThermalReceipt()"
            class="w-full py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-rose-950 hover:from-black hover:to-rose-900 text-white font-extrabold text-xs shadow-lg shadow-slate-900/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            🖨️ Cetak Struk Thermal (58/80mm)
          </button>

          <button
            (click)="close.emit()"
            class="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Tutup Struk
          </button>
        </div>

      </div>
    </div>
  `
})
export class PosReceiptModalComponent {
  @Input() isOpen = false;
  @Input() transaction: SaleTransaction | null = null;
  @Output() close = new EventEmitter<void>();

  constructor(public langService: LanguageService) {}

  public printThermalReceipt() {
    const area = document.getElementById('printable-receipt');
    if (!area) return;

    const oldFrame = document.getElementById('cantika-receipt-print-frame') as HTMLIFrameElement;
    if (oldFrame && oldFrame.parentNode) {
      oldFrame.parentNode.removeChild(oldFrame);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'cantika-receipt-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran - Cantika Beauty Store</title>
          <meta charset="utf-8">
          <style>
            @page {
              margin: 2mm;
              size: 80mm auto;
            }
            body {
              background-color: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 4px !important;
              font-family: monospace !important;
              font-size: 11px !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            #printable-receipt {
              width: 100% !important;
              background: #ffffff !important;
            }
            .text-center { text-align: center !important; }
            .font-bold, .font-black { font-weight: 700 !important; }
            .text-xs { font-size: 12px !important; }
            .text-\\[10px\\] { font-size: 10px !important; }
            .text-\\[9px\\] { font-size: 9px !important; }
            .border-b { border-bottom: 1px dashed #666666 !important; }
            .pb-2 { padding-bottom: 8px !important; }
            .pb-3 { padding-bottom: 12px !important; }
            .pt-1 { padding-top: 4px !important; }
            .space-y-0\\.5 > * + * { margin-top: 2px !important; }
            .space-y-1 > * + * { margin-top: 4px !important; }
            .space-y-1\\.5 > * + * { margin-top: 6px !important; }
            .space-y-3 > * + * { margin-top: 12px !important; }
            .flex { display: flex !important; }
            .justify-between { justify-content: space-between !important; }
          </style>
        </head>
        <body>
          ${area.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  }

  public getWAReceiptLink(): string {
    if (!this.transaction) return '#';
    const phone = this.transaction.customerPhone ? this.transaction.customerPhone.replace(/[^0-9]/g, '') : '';
    const text = `*STRUK BELANJA CANTIKA BEAUTY STORE*\n` +
      `Faktur: ${this.transaction.transactionNumber}\n` +
      `Tanggal: ${this.transaction.timestamp}\n` +
      `Total: Rp ${this.transaction.totalAmount.toLocaleString('id-ID')}\n` +
      `Metode: ${this.transaction.paymentMethod}\n` +
      `Terima kasih telah berbelanja kosmetik BPOM original di Cantika Beauty!`;

    const encoded = encodeURIComponent(text);
    return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  }
}
