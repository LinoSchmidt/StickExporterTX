import {app, BrowserWindow, dialog, ipcMain, NativeImage} from 'electron';
import {initialize as remoteInitialize, enable as remoteEnable} from '@electron/remote/main';
import path from 'path';
import { autoUpdater } from "electron-updater";
import logger from 'electron-log';
import { Platform, platform } from './components/platform';

logger.transports.console.format = "{h}:{i}:{s} {text}";
logger.transports.file.getFile();
logger.transports.file.resolvePath = () => path.join(app.getPath('userData'), "logs", "start.log");

const appIconPath = path.join(app.getAppPath().replace("app.asar", ""), "assets", "icon.png");
const finsishedIconPath = path.join(app.getAppPath().replace("app.asar", ""), "assets", "render_finished_icon.png");

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

if(platform === Platform.Windows) {
  app.setAppUserModelId(app.name);
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
    },
    titleBarStyle: 'hidden'
  });
  
  mainWindow.setMenu(null);
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  remoteInitialize();
  remoteEnable(mainWindow.webContents);

  // load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  ipcMain.on('closeApp', () => {
    mainWindow.webContents.send('isRenderActiveClose');
  });
  
  ipcMain.on('minimize', () => {
    mainWindow.minimize();
  });
  
  ipcMain.on('renderInactiveClose', () => {
    app.quit();
  });
  ipcMain.on('renderActiveClose', async () => {
    const response = await dialog.showMessageBox({
      type: 'warning',
      noLink: true,
      buttons: ['Cancel','Minimize', 'Exit'],
      defaultId: 0,
      title: 'Close',
      message: 'A video is still being renderd!',
      detail:
        'If you close the application, the progress will be lost!',
    });
    if (response.response === 2) {
      app.quit();
    } else if (response.response === 1) {
      mainWindow.minimize();
    }
  });
  
  ipcMain.on('setProgress', (event, arg) => {
    const progress = parseFloat(arg);
    mainWindow.setProgressBar(progress);
    if(progress === 1 && !mainWindow.isFocused()) {
      mainWindow.setOverlayIcon(finsishedIconPath as unknown as NativeImage, 'Rendering Complete');
      mainWindow.flashFrame(true);
    }
  });
  
  mainWindow.on('focus', () => {
    mainWindow.setOverlayIcon(null, '');
    mainWindow.flashFrame(false);
  });
  
  mainWindow.on('close', () => {
    mainWindow.webContents.send('closeApp');
  });
  
  ipcMain.on('openApp', () => {
    mainWindow.show();
  });
  
  mainWindow.setIcon(appIconPath);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (platform !== Platform.Mac) {
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