const TALKING_THRESHOLD = 20;

let talking = false;

const userMediaPromise = navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
}).then(stream => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    const microphone = audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);

    function updateTalking() {
        requestAnimationFrame(updateTalking);

        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        let sum = 0;
        for (let i = 0; i < array.length; i++) {
            sum += array[i];
        }

        const average = sum / array.length;
        talking = average > TALKING_THRESHOLD;
    }
    updateTalking();
}, (error) => {
    console.log('Error getting audio stream');
    console.error(error);
});
