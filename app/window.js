const SCALE = 0.75;
const { app, BrowserWindow, ipcMain } = require("electron");
const input = require("./input");

function createWindow() {
    const win = new BrowserWindow({
        width: Math.round(600 * SCALE),
        height: Math.round(400 * SCALE),
        x: 1920 - Math.round(537 * SCALE),
        y: 1080 - Math.round(318 * SCALE),
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
        transparent: true,
        // alwaysOnTop: true
    });

    function attachSend(event) {
        return (...args) => {
            try {
                win.webContents.send(event, ...args);
            } catch(e) {
                console.log("could not send IPC to window");
            }
        };
    }

    win.loadFile("cam.htm", {
        query: {
            scale: SCALE
        }
    });

    input.on("mouse", attachSend("mouse"));
    input.on("mousedown", attachSend("mousedown"));
    input.on("mouseup", attachSend("mouseup"));
    input.on("keydown", attachSend("keydown"));
    input.on("keyup", attachSend("keyup"));
    input.on("voice", attachSend("voice"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    app.quit();
});

app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});