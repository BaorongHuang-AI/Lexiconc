const { app, BrowserWindow, ipcMain, dialog, nativeImage, Menu, Tray } = require('electron');
const fs = require('fs');
const path = require('path'); //添加path
const httpServer = require('http-server'); //添加引用
// const exec = require('child_process').exec
const { exec } = require('child_process');
require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`),
});
let win;

// import {globalShortcut} from 'electron';
// 快捷键注册
// function registryShortcut() {
//   globalShortcut.register('CommandOrControl+J+K', () => {
//     // 获取当前窗口
//     BrowserWindow.getFocusedWindow().webContents.openDevTools();
//   });
// }

function start() {
  // // 任何你期望执行的cmd命令，ls都可以
  // let cmdStr1 = 'pwd'
  // let cmdPath = './'
  // // 子进程名称
  // let workerProcess
  // runExec(cmdStr1)
  // function runExec (cmdStr) {
  //   workerProcess = exec(cmdStr, { cwd: cmdPath })
  //   // 打印正常的后台可执行程序输出
  //   workerProcess.stdout.on('data', function (data) {
  //     console.log('stdout: ' + data)
  //     // alert(data);
  //   })
  //   // 打印错误的后台可执行程序输出
  //   workerProcess.stderr.on('data', function (data) {
  //     console.log('stderr: ' + data)
  //   })
  //   // 退出之后的输出
  //   workerProcess.on('close', function (code) {
  //     console.log('out code：' + code)
  //   })
  // }

  exec('main.exe', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

function createWindow() {
  // app.commandLine.appendSwitch("--disable-http-cache");
  //给dist文件夹添加8000端口的http服务
  httpServer.createServer({ root: path.join(__dirname, './dist') }).listen(8000);
  win = new BrowserWindow({
    width: 1400,
    height: 800,
    icon: 'icon.ico',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      // contextIsolation: false,
      // partition: String(+new Date()),
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  // Menu.setApplicationMenu(null);
  // menu.setApplicationMenu(null);

  // win.loadFile('./dist/index.html')
  win.loadURL('http://localhost:8000'); //改成本地8000端口监听
  // 打开开发模式
  win.webContents.openDevTools();
  console.log('dir', path.join(__dirname, 'favicon.ico'));
  // win.webContents.session.clearCache().then(()=>{
  //   win.webContents.reload()
  // });

  var menuTemplate = [
    {
      label: 'File',
      submenu: [
        // accelerator 配置快捷键
        {
          label: 'Open File',
          accelerator: 'ctrl+f',
          click: () => {
            dialog
              .showOpenDialog({
                properties: ['openFile'],
                filters: [
                  {
                    name: 'text file',
                    extensions: ['txt', 'text'],
                  },
                ],
              })
              .then(function (fileObj) {
                // the fileObj has two props
                if (!fileObj.canceled) {
                  console.log(fileObj.filePaths);
                  win.webContents.send('FILE_OPEN', fileObj.filePaths, false);
                }
              })
              // should always handle the error yourself, later Electron release might crash if you don't
              .catch(function (err) {
                console.error(err);
              });
          },
        },
        {
          label: 'Open Folder',
          accelerator: 'ctrl+o',
          click: () => {
            dialog
              .showOpenDialog({
                properties: ['openDirectory'],
              })
              .then(function (fileObj) {
                // the fileObj has two props
                if (!fileObj.canceled) {
                  console.log(fileObj.filePaths);
                  win.webContents.send('FILE_OPEN', fileObj.filePaths, true);
                }
              })
              // should always handle the error yourself, later Electron release might crash if you don't
              .catch(function (err) {
                console.error(err);
              });
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click() {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'About',
      click: showAboutInfo,
    },
  ];
  // 固定写法
  var menuBuilder = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menuBuilder);

  initTrayMenu(win);
  win.once('ready-to-show', () => {
    win.reload();
  });
}

function closeProcess() {
  exec('taskkill /im main.exe /f', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

app.whenReady().then(() => {
  createWindow();

  //启动子进程
  start();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeProcess();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('dialog:open', async (_, args) => {
  const result = await dialog.showOpenDialog({ properties: ['openFile'] });
  return result;
});

ipcMain.handle('dialog:save', async (_, alignedData) => {
  console.log('aligned data', alignedData);
  dialog
    .showSaveDialog(null, {
      title: 'Save align results',
      // defaultPath: path.format ({ dir: downloadPath, base: filename }), // construct a proper path
      filters: [{ name: 'Aligned File (*.txt)', extensions: ['txt'] }], // filter the possible files
    })
    .then((result) => {
      // console.log(result);
      if (result.canceled) return; // discard the result altogether; user has clicked "cancel"
      else {
        var filePath = result.filePath;
        console.log(filePath);
        if (!filePath.endsWith('.txt')) {
          // This is an additional safety check which should not actually trigger.
          // However, generally appending a file extension to a filename is not a
          // good idea, as they would be (possibly) doubled without this check.
          filePath += '.txt';
        }
        // var alignedData = window.localStorage.getItem("dataStack");
        console.log(' aligned data', alignedData);

        fs.writeFile(filePath, alignedData, 'utf8', (err) => console.log(err));
      }
    })
    .catch((err) => {
      console.log(err);
    });
  // dialog.showSaveDialog(
  //   {
  //     title: 'Save align results',
  //     // defaultPath: path.format ({ dir: downloadPath, base: filename }), // construct a proper path
  //     filters: [{ name: 'Aligned File (*.txt)', extensions: ['txt'] }] // filter the possible files
  //   }
  // ).then ((result) => {
  //   console.log(result);
  //   if (result.canceled) return; // discard the result altogether; user has clicked "cancel"
  //   else {
  //     var filePath = result.filePath;
  //     console.log(filePath);
  //     if (!filePath.endsWith('.txt')) {
  //       // This is an additional safety check which should not actually trigger.
  //       // However, generally appending a file extension to a filename is not a
  //       // good idea, as they would be (possibly) doubled without this check.
  //       filePath += '.txt';
  //     }
  //     var alignedData = localStorage.getItem("dataStack");
  //     console.log(" aligned data", alignedData);
  //
  //     fs.writeFile(filePath, 'test',  'utf8', (err) => console.log(err) )
  //   }
  // }).catch ((err) => {
  //   console.log (err);
  // });
});

ipcMain.on('sendData', (event, arg) => {
  // const { product } = arg;
  // console.log(arg);
});

// import { resetLocalData } from './globalShortcut'
// import icon from '@res/logo.png?asset'
// import logo from '@res/icons/128x128.png?asset'
// import { productName, description, author } from '@package';
const isMac = process.platform === 'darwin';

async function showAboutInfo() {
  await dialog.showMessageBox({
    type: 'info',
    buttons: ['Close'],
    title: `About Lexiconc`,
    message: `Lexiconc V1.0.0 \nLexiConc for academic language analysis. \n`,
    detail: `Copyright © 2022 Afzaal & Huang \n`,
    defaultId: 0,
    icon: path.join(__dirname, 'icons', 'icon.ico'),
    // textWidth: 400,
  });
}

// function getSysBaseInfo() {
//   let vers = process.versions
//   return ['electron', 'chrome', 'node', 'v8'].reduce((prev, k) => {
//     prev += `\n${k}: ${vers[k]}`
//     return prev
//   }, '')
// }

function initTrayMenu(mainWindow) {
  // const menu = Menu.buildFromTemplate(template)
  // Menu.setApplicationMenu(menu)
  // const logo = new Tray('/path/to/my/icon')

  const icon = nativeImage.createFromPath(path.join(__dirname, 'icons', 'icon.ico'));
  const tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      click() {
        mainWindow.destroy();
        app.exit();
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'About',
      click: showAboutInfo,
    },
  ]);
  // tray.setToolTip(`${productName} \n接口调试工具`)
  // tray.setTitle(`${productName}`)
  tray.setContextMenu(contextMenu);
  // 点击通知区图标实现打开关闭应用的功能
  // console.log(mainWindow.isVisible())
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
      mainWindow.setSkipTaskbar(true);
    }
  });
}

ipcMain.on('open-file-dialog', (event) => {
  dialog
    .showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: 'text file',
          extensions: ['txt', 'text'],
        },
      ],
    })
    .then(function (fileObj) {
      // the fileObj has two props
      if (!fileObj.canceled) {
        console.log(fileObj.filePaths);
        event.sender.send('FILE_OPEN', fileObj.filePaths, false);
      }
    })
    // should always handle the error yourself, later Electron release might crash if you don't
    .catch(function (err) {
      console.error(err);
    });
});

ipcMain.on('open-folder-dialog', (event) => {
  dialog
    .showOpenDialog({
      properties: ['openDirectory'],
    })
    .then(function (fileObj) {
      // the fileObj has two props
      if (!fileObj.canceled) {
        console.log(fileObj.filePaths);
        event.sender.send('FILE_OPEN', fileObj.filePaths, true);
      }
    })
    // should always handle the error yourself, later Electron release might crash if you don't
    .catch(function (err) {
      console.error(err);
    });
});

ipcMain.on('show-dialog', (event, arg) => {
  if (win) {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Information',
      message: arg.message,
    });
  }
});
