import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'id' | 'en';

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  id: {
    // Header & Nav
    announcement: '✨ DISTRIBUTOR KOSMETIK & SKINCARE INDONESIA — 100% ORIGINAL BPOM',
    shippingBadge: 'PENGIRIMAN SELURUH INDONESIA',
    storeSubtitle: 'Internal POS & Admin System',
    internalPortal: 'Portal Khusus Internal',
    loginPrompt: 'Login menggunakan Nomor HP WhatsApp & Password yang didaftarkan oleh Owner.',
    phoneLabel: 'Nomor HP / WhatsApp *',
    passwordLabel: 'Password Akses *',
    loginBtn: 'Masuk Sistem POS Internal →',
    quickLoginTitle: 'Uji Coba Akun Terdaftar:',
    ownerRole: '👑 OWNER / PEMILIK',
    employeeRole: '👩‍💼 STAF KASIR',
    logout: 'Logout 🚪',

    // POS & Admin Headers
    totalSKU: 'Total Jenis SKU Produk',
    lowStockTitle: 'Stok Kritis (≤ 2 pcs)',
    totalValuation: 'Total Valuasi Modal',
    unpaidPayables: 'Restok Belum Lunas',
    fromTotalCatalog: 'Dari',
    totalCatalogSuffix: 'total katalog',
    needsRestocking: 'Perlu segera direstok',
    registeredCapital: 'Modal fisik terdaftar',
    unpaidInvoicesCount: 'Faktur belum bayar',

    // Tabs
    tabPosCheckout: 'Kasir (POS)',
    tabCatalog: 'Stock Catalog',
    tabRestock: 'Restock & Bill',
    tabAnalytics: 'Turnover Analytics',
    tabAudit: 'Audit Log',

    // Action Buttons
    btnAddEmployee: '+ Staff',
    btnExportCSV: 'Export CSV',
    btnMakePO: 'Create PO',
    btnRestock: '+ Restock',
    btnAddProduct: '+ Product',
    newBrandOption: '➕ Brand Baru (Custom / Input Manual)',
    enterBrandPlaceholder: 'Masukkan Nama Brand Baru (misal: MAYBELLINE, CERAVE)...',
    outOfStockBadge: '🚫 Stok Habis',
    stockWarningMsg: '⚠️ Perhatian Stok: Hanya tersisa',
    pcsInStock: 'pcs dalam stok toko!',
    btnSearch: '🔍 Cari',

    // Dropdown Labels & Options
    allBrands: 'Semua Brand',
    itemsPerPageLabel: 'Tampilkan Per Halaman:',
    option25Products: '25 Produk',
    option50Products: '50 Produk',
    option100Products: '100 Produk',
    option250Products: '250 Produk',
    option500Products: '500 Produk',
    optionAllProducts: 'Semua Produk',

    // Employee Job Title Options
    jobMorningCashier: 'Kasir Lead Shift Pagi',
    jobNightCashier: 'Kasir Shift Malam',
    jobStockAdmin: 'Stok Admin & Gudang',
    jobStoreStaff: 'Karyawan Toko',

    // Expiry & Batch Labels
    expiringSoonBadge: '⚠️ Expire Soon',
    batchNumberLabel: 'No. Batch BPOM',
    expiryDateLabel: 'Exp Date',

    // POS Checkout Specifics
    posCheckoutTitle: 'Mode Kasir Cepat (POS Counter Checkout)',
    activeCashierLabel: 'Kasir Aktif:',
    posInvoiceLabel: 'Faktur POS:',
    posSearchPlaceholder: 'Cari nama, SKU, barcode, atau brand...',
    stockLabel: 'Stok',
    noProductsFound: 'Tidak ada produk ditemukan untuk pencarian ini.',
    shoppingCart: '🛒 Keranjang Belanja',
    itemLabel: 'Item',
    clearCartBtn: 'Kosongkan',
    emptyCartText: 'Keranjang belanja masih kosong. Klik produk di sebelah kiri untuk menambahkan.',
    customerNameLabel: 'Nama Customer',
    customerPhoneLabel: 'No. HP WA Member',
    paymentMethodLabel: 'Metode Bayar',
    cashPaidLabel: 'Uang Diterima (Rp)',
    paymentCash: '💵 Tunai (Cash)',
    paymentQRIS: '📱 QRIS / E-Wallet',
    paymentTransfer: '🏦 Transfer Bank',
    paymentCOD: '🚚 COD Toko',
    subtotalLabel: 'Subtotal:',
    memberPointsLabel: 'Poin Member (+1% Cashback):',
    totalPayLabel: 'TOTAL BAYAR:',
    cashChangeLabel: 'Kembalian Uang:',
    btnCompleteSale: '✅ Selesaikan Penjualan & Struk WA →',
    saleSuccessTitle: '🎉 Transaksi Berhasil Di-checkout!',
    invoiceNumberLabel: 'Nomor Faktur:',
    sendWAReceiptLink: '📲 Kirim Struk WhatsApp ke',

    // Purchase Order (PO) Modal Specifics
    poModalTitle: '🌺 PURCHASE ORDER (PO) RESTOK',
    poModalSub: 'Dokumen Pemesanan Ulang Produk Stok Kritis',
    poDateLabel: 'Tanggal: ',
    poNumberLabel: 'PO No: ',
    colNo: 'No',
    colProductName: 'Nama Produk',
    colRemainingStockOrder: 'Stok Sisa Order',
    colUnitCost: 'Modal Unit',
    btnPrintPO: '🖨️ Cetak / Download PO',
    poFilterSupplier: 'Filter Supplier:',
    poAllSuppliers: 'Semua Supplier (All Brands)',
    poFoundProducts: 'Ditemukan',
    poCriticalStock: 'produk stok kritis (≤ 2 pcs)',
    poSupplierCol: 'Supplier',
    poRemainingStock: 'Stok Sisa',
    poOrderQtyCol: 'Jumlah Order (Qty)',
    poSubtotalCost: 'Subtotal Modal',
    poNoCritical: 'Tidak ada stok kritis (semua stok produk > 2 pcs) untuk supplier ini.',
    poTotalEstimate: 'Total Estimasi Modal PO:',
    poEditableNote: 'Nilai order dapat diedit langsung pada tabel sebelum dicetak.',

    // Table Headers
    thSku: 'SKU & Barcode',
    thName: 'Nama Produk',
    thBrand: 'Brand',
    thBuyingPrice: 'Harga Modal',
    thSellingPrice: 'Harga Jual',
    thStock: 'Stok',
    thActions: 'Aksi',
    thPaymentStatus: 'Status Bayar',
    thBillCode: 'Kode Bill / Faktur',
    thTimeReceiver: 'Waktu & Penerima',
    thSupplier: 'Supplier / Brand',
    thTotalBill: 'Total Tagihan',
    thDeadline: 'Tenggat (Deadline)',
    thDetail: 'Rincian',
    btnEdit: '✏️ Edit',
    btnDetail: '🔍 Rincian',
    receiverPrefix: 'Penerima: ',
    showingLabel: 'Menampilkan',
    ofLabel: 'dari',
    productsLabel: 'produk terdaftar',
    pageLabel: 'Halaman',
    pageOfLabel: 'dari',
    firstPage: '⏮️ Awal',
    prevPage: '◀️ Sblm',
    nextPage: 'Slnjt ▶️',
    lastPage: 'Akhir ⏭️',

    // Restock & Payables
    statusPaid: '☑️ LUNAS (Done)',
    statusUnpaid: '☐ BELUM DIBAYAR',
    payablesTitle: '🚚 Pelacakan Restok & Tagihan Supplier (Supplier Payables)',
    pendingBadge: 'Pending',

    // Restock Modal Specifics
    restockModalTitle: 'Entri Restok Multi-Produk & Tagihan Supplier',
    receiverLabel: 'Penerima Barang:',
    billCodeLabel: 'Kode Bill / Faktur *',
    supplierBrandLabel: 'Brand / Supplier *',
    deadlineLabel: 'Tenggat Pembayaran *',
    addProductSectionTitle: '➕ Tambah Produk ke Daftar Restok:',
    searchProductPlaceholder: 'Cari nama atau SKU produk...',
    qtyLabel: 'Jumlah *',
    btnAdd: '+ Tambah',
    restockListTitle: 'Daftar Produk Direstok',
    totalInvoiceLabel: 'Total Tagihan:',
    colProduct: 'PRODUK',
    colQty: 'JUMLAH',
    colBuyingCost: 'HARGA MODAL',
    colSubtotal: 'SUBTOTAL',
    colAction: 'AKSI',
    emptyBasketText: 'Belum ada produk ditambahkan ke daftar restok. Pilih produk di atas dan klik "+ Tambah".',
    btnSaveRestockSubmit: '🚚 Simpan Restok & Tagihan →',
    autoNotifNote: 'Notifikasi otomatis dikirim ke HP Owner saat restok disimpan.',

    // Restock Detail Modal Specifics
    detailInvoiceTitle: 'Rincian Faktur Restok & Supplier',
    detailItemsTitle: 'Daftar Produk Direstok Dalam Faktur Ini:',
    detailSupplierLabel: 'Supplier / Brand:',
    detailDeadlineLabel: 'Tenggat Pembayaran (Deadline):',
    detailReceivedLabel: 'Waktu Penerimaan:',
    detailReceiverLabel: 'Staf Penerima Barang:',
    detailRestockQty: 'Jumlah Restok',
    detailUnitCost: 'Modal Satuan',
    detailTotalInvoice: 'Total Tagihan Faktur:',
    detailCloseBtn: 'Tutup Rincian',

    // Edit/Add Product Modals Specifics
    customProfitMarginLabel: 'Persentase Profit Kustom (%)',
    quickPresetsLabel: 'Quick Presets Margin:',
    saveChangesBtn: 'Simpan Perubahan',

    // Audit Log View
    auditTitle: '📜 Audit Log Histori Perubahan Data (Khusus Owner)',
    auditOldValue: 'Lama: ',
    auditNewValue: ' → Baru: ',

    // Analytics View
    analyticsTitle: 'Laporan Omset & Keuntungan Toko',
    analyticsSubtitle: 'Ringkasan nilai aset, potensi keuntungan bersih, dan brand terlaris.',
    analyticsTag: '📈 Analitik Omset & Performa Keuangan',
    totalRetailOmset: 'Total Omset Retail',
    netProfitPotential: 'Potensi Profit Bersih',
    topBrandsTitle: '🏆 Top Brand Nilai Omset Tertinggi',

    // Security & Suggester
    securityLockNotice: '🔒 Perlindungan Keamanan: Staf Kasir tidak dapat merubah harga produk untuk mencegah kerugian toko.',
    recomMarginTitle: 'Rekomendasi Jual',
    useRecommendation: '✨ Gunakan Rekomendasi',
    ownerOnly: '🔒 (Khusus Wewenang Owner)',

    // Add Product Modal
    addProductTitle: 'Tambah Entri Produk Baru',
    addProductSub: 'Mencatat produk baru ke katalog & POS toko',
    productFullName: 'Nama Produk Lengkap *',
    skuCode: 'Kode SKU *',
    brandCategory: 'Brand / Kategori *',
    initialStock: 'Stok Awal *',
    unitLabel: 'Satuan',
    btnCancel: 'Batal',
    btnSaveNotif: 'Simpan & Notif Owner',

    // Edit Product Modal
    editProductTitle: 'Edit Data Produk',

    // Employee Modal
    createEmpTitle: 'Buat Akun Login Karyawan Baru',
    createEmpSub: 'Khusus Wewenang Pemilik Toko (Owner)',
    empFullName: 'Nama Lengkap Karyawan *',
    empPhone: 'No. HP / WhatsApp (Untuk Login) *',
    empPassword: 'Password Akses *',
    empJobTitle: 'Jabatan / Shift *',
    btnCreateEmp: '+ Buat Akun Karyawan',
    registeredEmpList: 'Daftar Akun Karyawan Terdaftar:',
    statusActive: 'Aktif',

    // Mobile Toast & Drawer
    notifDrawerTitle: 'Notifikasi HP Owner',
    notifDrawerSub: 'Real-Time Mobile Push Feeds',
    toastHeader: '📱 Notifikasi HP Owner',

    // Footer
    footerTitle: 'CANTIKA BEAUTY',
    footerSubtitle: 'Distributor Resmi Grosir & Retail Skincare, Kosmetik, Soflens, dan Aksesoris Original BPOM Indonesia.'
  },
  en: {
    // Header & Nav
    announcement: '✨ INDONESIA COSMETICS & SKINCARE DISTRIBUTOR — 100% BPOM CERTIFIED',
    shippingBadge: 'NATIONWIDE SHIPPING',
    storeSubtitle: 'Internal POS & Admin System',
    internalPortal: 'Strictly Internal Portal',
    loginPrompt: 'Log in using your registered WhatsApp Phone Number & Password created by Owner.',
    phoneLabel: 'Phone / WhatsApp Number *',
    passwordLabel: 'Access Password *',
    loginBtn: 'Enter Internal POS System →',
    quickLoginTitle: 'Quick Demo Registered Accounts:',
    ownerRole: '👑 STORE OWNER',
    employeeRole: '👩‍💼 CASHIER STAFF',
    logout: 'Logout 🚪',

    // POS & Admin Headers
    totalSKU: 'Total Product SKUs',
    lowStockTitle: 'Critical Low Stock (≤ 2 pcs)',
    totalValuation: 'Total Capital Valuation',
    unpaidPayables: 'Unpaid Supplier Payables',
    fromTotalCatalog: 'From',
    totalCatalogSuffix: 'total catalog',
    needsRestocking: 'Needs immediate restocking',
    registeredCapital: 'Registered physical capital',
    unpaidInvoicesCount: 'Unpaid invoices',

    // Tabs
    tabPosCheckout: 'POS Counter',
    tabCatalog: 'Stock Catalog',
    tabRestock: 'Restock & Bill',
    tabAnalytics: 'Turnover Analytics',
    tabAudit: 'Audit Log',

    // Action Buttons
    btnAddEmployee: '+ Staff',
    btnExportCSV: 'Export CSV',
    btnMakePO: 'Create PO',
    btnRestock: '+ Restock',
    btnAddProduct: '+ Product',
    newBrandOption: '➕ New Brand (Custom Input)',
    enterBrandPlaceholder: 'Enter New Brand Name (e.g., MAYBELLINE, CERAVE)...',
    outOfStockBadge: '🚫 Out of Stock',
    stockWarningMsg: '⚠️ Stock Alert: Only',
    pcsInStock: 'pcs available in store stock!',
    btnSearch: '🔍 Search',

    // Dropdown Labels & Options
    allBrands: 'All Brands',
    itemsPerPageLabel: 'Items Per Page:',
    option25Products: '25 Products',
    option50Products: '50 Products',
    option100Products: '100 Products',
    option250Products: '250 Products',
    option500Products: '500 Products',
    optionAllProducts: 'All Products',

    // Employee Job Title Options
    jobMorningCashier: 'Morning Shift Lead Cashier',
    jobNightCashier: 'Night Shift Cashier',
    jobStockAdmin: 'Stock & Warehouse Admin',
    jobStoreStaff: 'Store Staff',

    // Expiry & Batch Labels
    expiringSoonBadge: '⚠️ Expire Soon',
    batchNumberLabel: 'BPOM Batch No.',
    expiryDateLabel: 'Exp Date',

    // POS Checkout Specifics
    posCheckoutTitle: 'Quick Cashier Mode (POS Counter Checkout)',
    activeCashierLabel: 'Active Cashier:',
    posInvoiceLabel: 'POS Invoice:',
    posSearchPlaceholder: 'Search name, SKU, barcode, or brand...',
    stockLabel: 'Stock',
    noProductsFound: 'No products found for this search.',
    shoppingCart: '🛒 Shopping Cart',
    itemLabel: 'Item',
    clearCartBtn: 'Clear All',
    emptyCartText: 'Shopping cart is empty. Click a product on the left to add it.',
    customerNameLabel: 'Customer Name',
    customerPhoneLabel: 'WA Member Phone',
    paymentMethodLabel: 'Payment Method',
    cashPaidLabel: 'Cash Tendered (Rp)',
    paymentCash: '💵 Cash',
    paymentQRIS: '📱 QRIS / E-Wallet',
    paymentTransfer: '🏦 Bank Transfer',
    paymentCOD: '🚚 Store COD',
    subtotalLabel: 'Subtotal:',
    memberPointsLabel: 'Member Points (+1% Cashback):',
    totalPayLabel: 'TOTAL PAY:',
    cashChangeLabel: 'Cash Change:',
    btnCompleteSale: '✅ Complete Sale & Send WA Receipt →',
    saleSuccessTitle: '🎉 Transaction Successfully Checked Out!',
    invoiceNumberLabel: 'Invoice No:',
    sendWAReceiptLink: '📲 Send WhatsApp Receipt to',

    // Purchase Order (PO) Modal Specifics
    poModalTitle: '🌺 PURCHASE ORDER (PO) DRAFT',
    poModalSub: 'Low Stock Product Reorder Document',
    poDateLabel: 'Date: ',
    poNumberLabel: 'PO No: ',
    colNo: 'No',
    colProductName: 'Product Name',
    colRemainingStockOrder: 'Stock & Order Qty',
    colUnitCost: 'Unit Cost',
    btnPrintPO: '🖨️ Print / Download PO',
    poFilterSupplier: 'Filter Supplier:',
    poAllSuppliers: 'All Suppliers (All Brands)',
    poFoundProducts: 'Found',
    poCriticalStock: 'critical low stock products (≤ 2 pcs)',
    poSupplierCol: 'Supplier',
    poRemainingStock: 'Remaining Stock',
    poOrderQtyCol: 'Order Qty',
    poSubtotalCost: 'Subtotal Cost',
    poNoCritical: 'No critical stock found (all products > 2 pcs) for this supplier.',
    poTotalEstimate: 'Total Estimated PO Cost:',
    poEditableNote: 'Order quantities can be edited directly in the table before printing.',

    // Table Headers
    thSku: 'SKU & Barcode',
    thName: 'Product Name',
    thBrand: 'Brand',
    thBuyingPrice: 'Buying Cost',
    thSellingPrice: 'Retail Price',
    thStock: 'Stock',
    thActions: 'Actions',
    thPaymentStatus: 'Payment Status',
    thBillCode: 'Bill / Invoice Code',
    thTimeReceiver: 'Timestamp & Receiver',
    thSupplier: 'Supplier / Brand',
    thTotalBill: 'Total Invoice',
    thDeadline: 'Payment Deadline',
    thDetail: 'Details',
    btnEdit: '✏️ Edit',
    btnDetail: '🔍 Details',
    receiverPrefix: 'Receiver: ',
    showingLabel: 'Showing',
    ofLabel: 'of',
    productsLabel: 'registered items',
    pageLabel: 'Page',
    pageOfLabel: 'of',
    firstPage: '⏮️ First',
    prevPage: '◀️ Prev',
    nextPage: 'Next ▶️',
    lastPage: 'Last ⏭️',

    // Restock & Payables
    statusPaid: '☑️ PAID (Done)',
    statusUnpaid: '☐ PENDING / UNPAID',
    payablesTitle: '🚚 Restock Shipment & Supplier Payables Tracking',
    pendingBadge: 'Pending',

    // Restock Modal Specifics
    restockModalTitle: 'Multi-Item Restock Entry & Supplier Invoice',
    receiverLabel: 'Shipment Receiver:',
    billCodeLabel: 'Bill / Invoice Code *',
    supplierBrandLabel: 'Brand / Supplier *',
    deadlineLabel: 'Payment Deadline *',
    addProductSectionTitle: '➕ Add Products to Restock List:',
    searchProductPlaceholder: 'Search product name or SKU...',
    qtyLabel: 'Quantity *',
    btnAdd: '+ Add',
    restockListTitle: 'Restocked Items List',
    totalInvoiceLabel: 'Total Invoice:',
    colProduct: 'PRODUCT',
    colQty: 'QUANTITY',
    colBuyingCost: 'BUYING COST',
    colSubtotal: 'SUBTOTAL',
    colAction: 'ACTION',
    emptyBasketText: 'No products added to restock list yet. Select a product above and click "+ Add".',
    btnSaveRestockSubmit: '🚚 Save Restock & Invoice →',
    autoNotifNote: 'Automatic notifications sent to Owner phone when restock is saved.',

    // Restock Detail Modal Specifics
    detailInvoiceTitle: 'Restock Invoice & Supplier Details',
    detailItemsTitle: 'Products Restocked in this Invoice:',
    detailSupplierLabel: 'Supplier / Brand:',
    detailDeadlineLabel: 'Payment Deadline:',
    detailReceivedLabel: 'Received Timestamp:',
    detailReceiverLabel: 'Receiving Staff:',
    detailRestockQty: 'Restock Qty',
    detailUnitCost: 'Unit Cost',
    detailTotalInvoice: 'Total Invoice Amount:',
    detailCloseBtn: 'Close Details',

    // Edit/Add Product Modals Specifics
    customProfitMarginLabel: 'Custom Profit Margin (%)',
    quickPresetsLabel: 'Quick Margin Presets:',
    saveChangesBtn: 'Save Changes',

    // Audit Log View
    auditTitle: '📜 Audit Trail Log (Owner Authorized Only)',
    auditOldValue: 'Previous: ',
    auditNewValue: ' → New: ',

    // Analytics View
    analyticsTitle: 'Store Revenue & Profit Report',
    analyticsSubtitle: 'Asset valuation overview, net profit potential, and top performing brands.',
    analyticsTag: '📈 Sales Analytics & Financial Performance',
    totalRetailOmset: 'Total Retail Revenue',
    netProfitPotential: 'Net Profit Potential',
    topBrandsTitle: '🏆 Top Brands by Sales Valuation',

    // Security & Suggester
    securityLockNotice: '🔒 Security Protection: Cashier staff cannot modify selling prices to prevent store financial loss.',
    recomMarginTitle: 'Recommended Price',
    useRecommendation: '✨ Apply Suggestion',
    ownerOnly: '🔒 (Owner Authorized Only)',

    // Add Product Modal
    addProductTitle: 'Add New Product Entry',
    addProductSub: 'Add a new product to store catalog & POS',
    productFullName: 'Full Product Name *',
    skuCode: 'SKU Code *',
    brandCategory: 'Brand / Category *',
    initialStock: 'Initial Stock *',
    unitLabel: 'Unit',
    btnCancel: 'Cancel',
    btnSaveNotif: 'Save & Notify Owner',

    // Edit Product Modal
    editProductTitle: 'Edit Product Details',

    // Employee Modal
    createEmpTitle: 'Create New Employee Account',
    createEmpSub: 'Owner Authorized Authority',
    empFullName: 'Employee Full Name *',
    empPhone: 'Phone / WhatsApp No (For Login) *',
    empPassword: 'Access Password *',
    empJobTitle: 'Job Title / Shift *',
    btnCreateEmp: '+ Create Employee Account',
    registeredEmpList: 'Registered Staff Accounts:',
    statusActive: 'Active',

    // Mobile Toast & Drawer
    notifDrawerTitle: 'Owner Phone Notifications',
    notifDrawerSub: 'Real-Time Mobile Push Feeds',
    toastHeader: '📱 Owner Phone Notification',

    // Footer
    footerTitle: 'CANTIKA BEAUTY',
    footerSubtitle: 'Official Wholesale & Retail Distributor for Skincare, Cosmetics, Softlens, and Accessories.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<Language>('id');
  public currentLang$ = this.currentLangSubject.asObservable();

  public setLanguage(lang: Language) {
    this.currentLangSubject.next(lang);
  }

  public toggleLanguage() {
    const nextLang = this.currentLangSubject.value === 'id' ? 'en' : 'id';
    this.currentLangSubject.next(nextLang);
  }

  public getCurrentLanguage(): Language {
    return this.currentLangSubject.value;
  }

  public t(key: string): string {
    const lang = this.currentLangSubject.value;
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['id']?.[key] || key;
  }
}
