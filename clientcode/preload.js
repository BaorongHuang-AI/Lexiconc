// const { contextBridge } = require('electron');
const { contextBridge, ipcRenderer } = require('electron')
window.ipcRenderer = require('electron').ipcRenderer;
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer:{
    ...ipcRenderer,
    on: ipcRenderer.on.bind(ipcRenderer),
    removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
  },
  showDialog: async () => ipcRenderer.invoke('dialog:open'),
  saveDialog: async (alignedData) => ipcRenderer.invoke('dialog:save', alignedData),
  // ipcRenderer: {
  //   hi() {
  //     ipcRenderer.send('hi');
  //   },
  // },

})

// ipcRenderer.on('FILE_OPEN', (event, args) => {
//   // here the args will be the fileObj.filePaths array
//   // do whatever you need to do with it
//   console.log('got FILE_OPEN', event, args);
//   ipcRenderer.send("PING", args);
//
//
// });


process.once('loaded', () => {
  global.electron = require('electron')
  // global.setImmediate = _setImmediate;
  // global.clearImmediate = _clearImmediate;
});

// contextBridge.exposeInMainWorld('electron', {
//
// })
