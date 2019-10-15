

const {app, BrowserWindow, ipcMain} = require('electron')
require('electron-reload')(__dirname)

function createWindow() {
    let win = new BrowserWindow({
        width: 1440,
        height: 900,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html')
    //win.webContents.openDevTools()
    win.on('closed', () => {
        win = null
    })

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        console.log('Exiting!')
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})