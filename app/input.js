const { EventEmitter } = require("events");
const iohook = require('iohook');

const emitter = module.exports = new EventEmitter();

iohook.on('mousemove', event => {
  emitter.emit('mouse', event.x, event.y);
});

for (const eventName of ["mousedown", "mouseup", "keydown", "keyup"]) {
    iohook.on(eventName, event => {
        emitter.emit(eventName);
    });
}

iohook.start();