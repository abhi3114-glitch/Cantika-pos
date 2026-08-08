const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cantikaDesktopAPI', {
  isDesktop: true,
  appVersion: '1.0.0',
  platform: process.platform,
  printReceipt: (htmlData) => ipcRenderer.send('print-receipt', htmlData),
  openCashDrawer: () => ipcRenderer.send('open-cash-drawer'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});
