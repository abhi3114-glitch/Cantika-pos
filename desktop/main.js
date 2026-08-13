const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 720,
    title: 'Cantika Beauty Store | Enterprise Desktop POS',
    backgroundColor: '#090D16',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Load Production Live Cloud POS App (with local www offline fallback)
  const appUrl = process.env.CANTIKA_POS_URL || 'https://cantika-pos.vercel.app';
  mainWindow.loadURL(appUrl).catch(() => {
    const localIndex = path.join(__dirname, 'www', 'index.html');
    if (fs.existsSync(localIndex)) {
      mainWindow.loadFile(localIndex);
    }
  });

  // Show window smoothly when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Handle external links safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Custom Desktop Application Menu
  const menuTemplate = [
    {
      label: 'Kasir POS',
      submenu: [
        {
          label: 'F2 - Cari Produk',
          accelerator: 'F2',
          click: () => mainWindow.webContents.send('focus-search')
        },
        {
          label: 'F4 - Selesaikan Transaksi',
          accelerator: 'F4',
          click: () => mainWindow.webContents.send('trigger-checkout')
        },
        { type: 'separator' },
        {
          label: 'Muat Ulang Halaman (Reload)',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        },
        { role: 'quit', label: 'Keluar dari Aplikasi' }
      ]
    },
    {
      label: 'Tampilan',
      submenu: [
        { role: 'togglefullscreen', label: 'Mode Layar Penuh (Full Screen)' },
        { role: 'resetZoom', label: 'Ukuran Normal (100%)' },
        { role: 'zoomIn', label: 'Perbesar (Zoom In)' },
        { role: 'zoomOut', label: 'Perkecil (Zoom Out)' }
      ]
    },
    {
      label: 'Bantuan & Vault',
      submenu: [
        {
          label: 'Status Cloud Database (MongoDB Atlas)',
          click: () => shell.openExternal('https://cloud.mongodb.com')
        },
        {
          label: 'Portal Vercel Frontend',
          click: () => shell.openExternal('https://cantika-pos.vercel.app')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App Lifecycle
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const fs = require('fs');

// IPC Event Handlers for Hardware Printers & Cash Drawers
ipcMain.on('print-receipt', (event, htmlData) => {
  if (!mainWindow) return;
  const printWin = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
  printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlData)}`);
  printWin.webContents.on('did-finish-load', () => {
    printWin.webContents.print({ silent: false, printBackground: true }, (success, failureReason) => {
      printWin.close();
    });
  });
});

ipcMain.on('export-file', (event, { filename, content, type }) => {
  try {
    const downloadsPath = app.getPath('downloads');
    const filePath = path.join(downloadsPath, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    shell.showItemInFolder(filePath);
  } catch (err) {
    console.error('Failed to export file in Desktop App:', err);
  }
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});
