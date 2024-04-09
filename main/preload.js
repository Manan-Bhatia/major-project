const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
    on: (channel, callback) => {
        ipcRenderer.on(channel, callback);
    },
    receiveTokenFromMain: (callback) => {
        ipcRenderer.on("tokenToRenderer", (event, token) => {
            // Pass token to the callback function
            callback(token);
        });
    },
    send: (channel, args) => {
        ipcRenderer.send(channel, args);
    },
});
