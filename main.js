import { detectCD, drawDetection } from './imageProcessor.js';
import { scan } from './scanner.js';
import { initAudio, playSequence, stopSequence } from './audio.js';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const scanButton = document.getElementById('scan-button');
const playButton = document.getElementById('play-button');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

let noteSequence = [];
let isPlaying = false;

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1024 },
                height: { ideal: 1024 }
            } 
        });
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            statusEl.textContent = 'Camera ready. Center the CD.';
        });
    } catch (err) {
        console.error("Error accessing camera: ", err);
        statusEl.textContent = 'Could not access camera. Please grant permission.';
    }
}

function takeSnapshot() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

scanButton.addEventListener('click', () => {
    stopSequence();
    isPlaying = false;
    playButton.textContent = 'Play';
    playButton.disabled = true;
    
    statusEl.textContent = 'Scanning...';
    takeSnapshot();
    
    const cdInfo = detectCD(canvas);

    if (cdInfo) {
        statusEl.textContent = 'CD detected! Processing colors...';
        drawDetection(canvas, cdInfo);
        noteSequence = scan(canvas, cdInfo);
        if (noteSequence.length > 0) {
            statusEl.textContent = `Scan complete! ${noteSequence.length} notes found.`;
            playButton.disabled = false;
        } else {
            statusEl.textContent = 'CD found, but no distinct colors detected. Try again.';
        }
    } else {
        statusEl.textContent = 'No CD detected. Please center the CD and try again.';
    }
});

playButton.addEventListener('click', () => {
    if (isPlaying) {
        stopSequence();
        isPlaying = false;
        playButton.textContent = 'Play';
    } else {
        if (noteSequence.length > 0) {
            isPlaying = true;
            playButton.textContent = 'Stop';
            playSequence(noteSequence, () => {
                isPlaying = false;
                playButton.textContent = 'Play';
            });
        }
    }
});

function init() {
    initAudio();
    setupCamera();
}

init();

