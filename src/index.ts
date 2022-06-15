import {app, BrowserWindow, dialog} from 'electron';
import {initialize as remoteInitialize, enable as remoteEnable} from '@electron/remote/main';
import path from 'path';
import { autoUpdater } from "electron-updater";
import logger from 'electron-log';

logger.transports.console.format = "{h}:{i}:{s} {text}";
logger.transports.file.getFile();
logger.transports.file.resolvePath = () => path.join(app.getPath('userData'), "logs", "start.log");

autoUpdater.autoDownload = false;

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', async () => {
  const response = await dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: 'Found updates, do you want update now?',
    buttons: ['Yes', 'Later'],
  });

  if (response.response === 0) {
    logger.log('Downloading Update');
    autoUpdater.downloadUpdate();
    await dialog.showMessageBox({
      type: 'info',
      title: 'Update Downloading',
      message:
        'Update is being downloaded, you will be notified when it is ready to install',
      buttons: [],
    });
  }
});

autoUpdater.on('update-downloaded', async () => {
  const response = await dialog.showMessageBox({
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: 'Update',
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.',
  });
  if (response.response === 0) {
    setImmediate(() => autoUpdater.quitAndInstall());
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  
  // remove the menu bar when in production.
  if(process.env.NODE_ENV === 'production') mainWindow.setMenu(null);
  
  remoteInitialize();
  remoteEnable(mainWindow.webContents);

  // load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools when in development mode.
  if(process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.