const SCALE = 0.75;
// const SCALE = 1;
const { app, BrowserWindow, Menu, Tray, screen } = require("electron");
const input = require("./input");
const db = require("./db");
const hats = ["none", "top hat", "fedora", "shroom", "crown", "harry"];
let window, settings_window;

function createSettingsWindow() {
    const [x, y] = window.getPosition();

    settings_window = new BrowserWindow({
        width: 500,
        height: 500,
        x: x + 20,
        y: y + 20,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        frame: true,
        transparent: true
    });

    settings_window.setAlwaysOnTop(true, "pop-up-menu");
    settings_window.removeMenu();
    settings_window.loadFile("window/settings.htm");
}

function createWindow() {
    window = new BrowserWindow({
        width: Math.round(600 * SCALE),
        height: Math.round(400 * SCALE),
        // x: 0, y: 0,
        x: -1000, y: 100,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        frame: false,
        transparent: true
    });

    window.setAlwaysOnTop(true, "pop-up-menu");
    // win.setIgnoreMouseEvents(true);

    function attachSend(event) {
        return (...args) => {
            try {
                window.webContents.send(event, ...args);
            } catch(e) {
                console.log("could not send IPC to window " + String(e));
            }
        };
    }

    window.loadFile("window/cam.htm", {
        query: {
            scale: SCALE,
            hats: hats.join(";")
        }
    });

    for(const eventName of ["mouse", "mousedown", "mouseup", "keydown", "keyup"]) {
        const handler = attachSend(eventName);
        input.on(eventName, handler);
        window.on("closed", () => {
            input.off(eventName, handler);
        });
    }

    window.on("close", () => {
        app.quit();
    });

    window.webContents.on("ipc-message", (event, channel) => {
        switch(channel) {
            case "get-screens":
            const screens = screen.getAllDisplays().map(display => display.workArea);
            window.send("screens", screens);
            break;

            case "settings":
            if(settings_window && !settings_window.isDestroyed()) {
                settings_window.focus();
            } else {
                createSettingsWindow();
            }
            break;
        }
    });
}

function clickHat(event) {
    const hat_index = hats.indexOf(event.label);
    window.webContents.send("hat", hat_index);
}

function createTrayIcon() {
    const contextMenu = Menu.buildFromTemplate(
        hats.map(name => ({ label: name, type: "radio", click: clickHat }))
    );
    const tray = new Tray(__dirname + "/../icon.png");

    tray.setToolTip("streamcam")
    tray.setContextMenu(contextMenu);
}

function initialize() {
    createWindow();
    createTrayIcon();
}

app.whenReady().then(initialize);

app.on("window-all-closed", () => {
    app.quit();
});

app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
