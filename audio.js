import { NOTE_DURATION } from './config.js';

let audioCtx;
let mainGain;
let sequenceTimeout;

export function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        mainGain = audioCtx.createGain();
        mainGain.gain.value = 0.5; // Initial volume
        mainGain.connect(audioCtx.destination);
    }
     // Resume audio context on user gesture
    const resume = () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        document.body.removeEventListener('click', resume);
        document.body.removeEventListener('touchstart', resume);
    };
    document.body.addEventListener('click', resume);
    document.body.addEventListener('touchstart', resume);
}

function playNote(freq, startTime, duration) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.connect(noteGain);
    noteGain.connect(mainGain);

    osc.type = 'sine';
    osc.frequency.value = freq;

    // Envelope
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.8, startTime + duration * 0.1);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

export function playSequence(noteSequence, onEnded) {
    if (!audioCtx || noteSequence.length === 0) return;

    stopSequence(); // Stop any previous sequence

    const startTime = audioCtx.currentTime;
    let currentTime = 0;

    noteSequence.forEach((noteInfo, index) => {
        playNote(noteInfo.freq, startTime + currentTime, NOTE_DURATION);
        currentTime += NOTE_DURATION;
    });

    if (onEnded) {
        sequenceTimeout = setTimeout(onEnded, currentTime * 1000);
    }
}

export function stopSequence() {
    if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
        sequenceTimeout = null;
    }
    // A simple way to stop is to ramp down the main gain quickly
    if (mainGain) {
        mainGain.gain.cancelScheduledValues(audioCtx.currentTime);
        mainGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        mainGain.gain.setValueAtTime(0.5, audioCtx.currentTime + 0.11); // Reset for next play
    }
}