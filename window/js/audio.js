const TALKING_THRESHOLD = 20;

let getIsTalking;

(function audioInit() {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    const array = new Uint8Array(analyser.frequencyBinCount);
    getIsTalking = function getIsTalking() {
        analyser.getByteFrequencyData(array);

        let sum = 0;
        for (let i = 0; i < array.length; i++) {
            sum += array[i];
        }

        const average = sum / array.length;
        return average > TALKING_THRESHOLD;
    };

    const userMediaPromise = navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
    }).then(stream => {
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
    }, (error) => {
        console.log('Error getting audio stream');
        console.error(error);
    });
})();