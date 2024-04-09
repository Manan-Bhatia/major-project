const { app, BrowserWindow, ipcMain } = require("electron/main");
const serve = require("electron-serve");
const path = require("path");
const Store = require("electron-store");

const appServe = app.isPackaged
    ? serve({
          directory: path.join(__dirname, "../out"),
      })
    : null;

const storage = new Store();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            webSecurity: false,
        },
    });
    ipcMain.on("save-token", (event, token) => {
        storage.set("token", token);
    });
    ipcMain.on("rendererReady", () => {
        const token = storage.get("token") || "";
        win.webContents.send("tokenToRenderer", token);
    });
    ipcMain.on("logout", () => {
        storage.delete("token");
    });

    if (app.isPackaged) {
        appServe(win).then(() => {
            win.loadURL("app://-");
        });
    } else {
        win.loadURL("http://localhost:3000");
        win.webContents.openDevTools();
        win.webContents.on("did-fail-load", (e, code, desc) => {
            win.webContents.reloadIgnoringCache();
        });
    }
};

app.on("ready", () => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
