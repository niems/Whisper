const {app, BrowserWindow, Menu, Notification} = require('electron');
const url = require('url');

process.env.GOOGLE_API_KEY = '';
process.env.ELECTRON_ENABLE_STACK_DUMPING=true;
process.env.ELECTRON_DEFAULT_ERROR_MODE=true;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    //400x600 - login
    //750x500 - chat page
    mainWindow = new BrowserWindow({width: 860, minWidth: 650, height: 500, minHeight: 300, resizable: true, alwaysOnTop: true, frame: false});
    //Menu.setApplicationMenu(null);
    // and load the index.html of the app.
    //mainWindow.setOpacity(0.99);
    mainWindow.loadURL('http://localhost:3000');

    //figure out how to resize the window if it's reloaded (ctrl + r)
    mainWindow.on('close', () => {
            console.log('closing window :(');
         //mainWindow.setSize(400, 600);
    });

    
    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
