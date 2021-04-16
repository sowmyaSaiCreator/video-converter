const { app, BrowserWindow } = require('electron');
const ipc = require("electron").ipcMain;
const path = require('path');
const os = require("os");
const fs = require("fs");
var { dialog } = require("electron");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  const subWindow = new BrowserWindow({
    width: 600,
    height: 500,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  subWindow.loadFile(path.join(__dirname, 'conversion.html'));

  //subWindow.webContents.openDevTools();

  //open sub-window
  ipc.on("open-sub-window", function (event) {
    subWindow.show();
  })

  //close sub-window
  ipc.on("close-sub-window", function (event) {
    subWindow.hide();
  })

  ipc.on('selFolder', (event, arg) => {
    console.log("selFolder inside main process is: ", arg); // this comes from within window 1 -> and into the mainProcess
    subWindow.webContents.send( 'selFolder-subWindow', arg ); // sends the stuff from Window1 to Window2.
  });

  ipc.on('selFile', (event, arg) => {
    console.log("selFile inside main process is: ", arg); // this comes from within window 1 -> and into the mainProcess
    subWindow.webContents.send( 'selFile-subWindow', arg ); // sends the stuff from Window1 to Window2.
  });

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


//for selecting empty folder
ipc.on("open-dialog-for-folder", async function (event) {
  // console.log("emp folder");
  try {
    let folderPath = await dialog.showOpenDialog(null, {
      properties: ["openDirectory"]
    });

    // console.log(folderPath.filePaths[0]);
    // console.log(typeof (folderPath.filePaths[0]));

    let selectedFolder = folderPath.filePaths[0];

    fs.readdir(selectedFolder, (err, files) => {
      if (err)
        console.log(err);
      else {
        if (files.length === 0) {
          //send to the renderer processor
          //enable select file
          event.sender.send("selected-folder", selectedFolder); //passing this to renderer processor
          //next step==>enable selct button
        }
        else {
          //notification alert msg and return
          event.sender.send("selected-folder", "withFiles"); //passing this to renderer processor
        }
      }
    })

  }
  catch (err) {
    console.log(err);
  }
})

//dialog to select mp4 file
ipc.on("open-dialog-for-selecting-file", async function (event) {
  if (os.platform() === "win32" || os.platform() === "linux") {
    try {
      let result = await dialog.showOpenDialog(null, {
        properties: ["openFile"],
        filters: [
          { name: 'Videos', extensions: ['mp4'] },
        ]
      })
      //console.log(result.filePaths);
      event.sender.send("selected-video-file-to-send", result.filePaths[0]); //passing this to renderer processor

    }
    catch (err) {
      console.log(err);
    }

  }
  else {
    try {
      let result = await dialog.showOpenDialog(null, {
        properties: ["openFile", "openDirectory"],
        filters: [
          { name: 'Videos', extensions: ['mp4'] },
        ]
      })
      // console.log(result.filePaths);
      event.sender.send("selected-video-file-to-send", result.filePaths[0]); //passing this to renderer processor
    }
    catch (err) {
      console.log(err);
    }
  }
})
