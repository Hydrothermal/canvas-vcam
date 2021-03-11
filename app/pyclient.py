import sys, socket
from pynput import mouse, keyboard

import pyaudio, struct, math

BASE_VOICE_THRESHOLD = 0.015
FORMAT = pyaudio.paInt16
SHORT_NORMALIZE = (1.0 / 32768.0)
RATE = 44100
INPUT_BLOCK_TIME = 0.01
INPUT_FRAMES_PER_BLOCK = int(RATE * INPUT_BLOCK_TIME)
MINIMUM_TALK_LENGTH = 25

voice_threshold = BASE_VOICE_THRESHOLD
talking = 0

def get_rms(block):
    count = len(block) / 2
    format = "%dh" % count
    shorts = struct.unpack(format, block)
    sum_squares = 0.0

    for sample in shorts:
        n = sample * SHORT_NORMALIZE
        sum_squares += n * n

    return math.sqrt(sum_squares / count)

pa = pyaudio.PyAudio()

stream = pa.open(format = FORMAT,
         channels = 1,
         rate = RATE,
         input = True,
         frames_per_buffer = INPUT_FRAMES_PER_BLOCK)

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

def on_voice(mode):
    s.send("voice {0}".format(mode).encode())

with mouse.Listener(on_move=on_move, on_click=on_click) as mouse_listener:
    with keyboard.Listener(on_press=on_press, on_release=on_release) as keyboard_listener:
        while True:
            block = stream.read(INPUT_FRAMES_PER_BLOCK)
            amplitude = get_rms(block)

            if talking != 0:
                talking += 1

            if amplitude > voice_threshold:
                if talking == 0:
                    on_voice("start")
                    voice_threshold = BASE_VOICE_THRESHOLD * 0.7
                    talking = 1
            elif talking >= MINIMUM_TALK_LENGTH:
                talking = 0
                voice_threshold = BASE_VOICE_THRESHOLD
                on_voice("end")

        mouse_listener.join()
        keyboard_listener.join()