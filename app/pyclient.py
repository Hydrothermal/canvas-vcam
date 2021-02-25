import sys, socket
from pynput import mouse, keyboard

# accounts for secondary monitor
X_OFFSET = 1600
X_MAX = 1820

port = sys.argv[1]
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("localhost", int(port)))

def on_move(x, y):
    x = min(x + X_OFFSET, X_MAX)
    s.send("mouse {0} {1}\n".format(x, y).encode())

def on_click(x, y, button, pressed):
    s.send(("mousedown\n" if pressed else "mouseup\n").encode())

def on_press(key):
    s.send("keydown\n".encode())

def on_release(key):
    s.send("keyup\n".encode())

with mouse.Listener(on_move=on_move, on_click=on_click) as mouse_listener:
    with keyboard.Listener(on_press=on_press, on_release=on_release) as keyboard_listener:
        mouse_listener.join()
        keyboard_listener.join()