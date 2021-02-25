const net = require("net");
const { spawn } = require("child_process");
const { EventEmitter } = require("events");

const emitter = module.exports = new EventEmitter();

function closed() {
    console.log("closed");
}

const server = net.createServer(client => {
    console.log("connection");

    // this assumes that one event is sent per chunk, which is not always the case if the
    // python client loads events too quickly
    // however, garbage data is discarded by the window and events come in very fast, so
    // this isn't a big issue
    client.on("data", chunk => {
        const data = chunk.toString().split(/\s+/);
        emitter.emit(...data);
    });

    client.on("close", closed);
    client.on("error", closed);
});

server.on("listening", () => {
    const port = server.address().port;

    emitter.emit("ready");
    console.log(`listening on ${port}`);
    spawn("python", ["app/pyclient.py", port]);
});

// listen on random port
server.listen(0);