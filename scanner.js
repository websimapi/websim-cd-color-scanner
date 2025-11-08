import { COLOR_MAP, SCANNER_ANGULAR_STEPS, SCANNER_RADIAL_STEPS, COLOR_THRESHOLD, NOTE_FREQUENCIES } from './config.js';

/**
 * Scans the CD area on the canvas and generates a sequence of notes.
 * @param {HTMLCanvasElement} canvas
 * @param {object} cdInfo { centerX, centerY, innerRadius, outerRadius }
 * @returns {Array<object>} [{ note, time }]
 */
export function scan(canvas, cdInfo) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width } = imageData;
    const { centerX, centerY, innerRadius, outerRadius } = cdInfo;

    const noteSequence = [];
    const trackWidth = (outerRadius - innerRadius) / SCANNER_RADIAL_STEPS;
    let lastNote = null;

    // Scan spirally: angle is time, radius is progression
    for (let i = 0; i < SCANNER_ANGULAR_STEPS; i++) {
        for (let j = 0; j < SCANNER_RADIAL_STEPS; j++) {
            const angle = (i / SCANNER_ANGULAR_STEPS) * 2 * Math.PI;
            const radius = innerRadius + j * trackWidth;

            const x = Math.floor(centerX + radius * Math.cos(angle));
            const y = Math.floor(centerY + radius * Math.sin(angle));

            const pixelIndex = (y * width + x) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];

            const matchedColor = findClosestColor(r, g, b);

            if (matchedColor) {
                const currentNote = matchedColor.note;
                if (currentNote !== lastNote) {
                    noteSequence.push({
                        note: currentNote,
                        freq: NOTE_FREQUENCIES[currentNote],
                    });
                    lastNote = currentNote;
                }
            }
        }
    }

    return noteSequence;
}

function findClosestColor(r, g, b) {
    let bestMatch = null;
    let minDistance = Infinity;

    // Calculate distance to pure black/white/grey
    const greyDist = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    if (greyDist < 60) return null; // Ignore greyscale colors

    for (const color of COLOR_MAP) {
        const dist = Math.sqrt(
            Math.pow(r - color.r, 2) +
            Math.pow(g - color.g, 2) +
            Math.pow(b - color.b, 2)
        );

        if (dist < minDistance) {
            minDistance = dist;
            bestMatch = color;
        }
    }

    if (minDistance < COLOR_THRESHOLD) {
        return bestMatch;
    }

    return null;
}