import {engine} from "./main.js";

//engine.socket.emit("c2s:test", "connection test");
engine.socket.on("s2c:test", (data) => {
    console.log("Test Connection: "+data);
});

