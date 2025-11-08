import { EDGE_THRESHOLD } from './config.js';

/**
 * Detects the CD in the canvas by finding the inner and outer circles.
 * Assumes the CD is roughly centered.
 * @param {HTMLCanvasElement} canvas
 * @returns {object|null} { centerX, centerY, innerRadius, outerRadius } or null if not found.
 */
export function detectCD(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    const samples = 36; // Check in 36 directions
    const innerRadii = [];
    const outerRadii = [];

    for (let i = 0; i < samples; i++) {
        const angle = (i / samples) * 2 * Math.PI;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        let lastLum = getLuminance(data, centerX, centerY, width);
        let foundInner = false;
        
        // Scan from center outwards
        const maxRadius = Math.min(centerX, centerY);
        for (let r = 1; r < maxRadius; r++) {
            const x = Math.floor(centerX + r * cos);
            const y = Math.floor(centerY + r * sin);
            
            if (x < 0 || x >= width || y < 0 || y >= height) break;

            const currentLum = getLuminance(data, x, y, width);
            const deltaLum = Math.abs(currentLum - lastLum);

            if (deltaLum > EDGE_THRESHOLD) {
                if (!foundInner) {
                    innerRadii.push(r);
                    foundInner = true;
                } else {
                     // Last major edge is probably the outer one
                    outerRadii.push(r);
                }
            }
            lastLum = currentLum;
        }
    }
    
    // Replace outer radii with the last found radii for each angle
    const finalOuterRadii = [];
    for (let i = 0; i < samples; i++) {
        const angle = (i / samples) * 2 * Math.PI;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        let lastLum = getLuminance(data, centerX, centerY, width);
        let lastEdgeRadius = 0;
        
        const maxRadius = Math.min(centerX, centerY);
        for (let r = 1; r < maxRadius; r++) {
            const x = Math.floor(centerX + r * cos);
            const y = Math.floor(centerY + r * sin);
            if (x < 0 || x >= width || y < 0 || y >= height) break;
            const currentLum = getLuminance(data, x, y, width);
             if (Math.abs(currentLum - lastLum) > EDGE_THRESHOLD) {
                lastEdgeRadius = r;
            }
            lastLum = currentLum;
        }
        if (lastEdgeRadius > 0) finalOuterRadii.push(lastEdgeRadius);
    }

    if (innerRadii.length < samples / 4 || finalOuterRadii.length < samples / 4) {
        return null; // Not enough data points to be confident
    }

    const innerRadius = getAverage(innerRadii);
    const outerRadius = getAverage(finalOuterRadii);
    
    if (outerRadius - innerRadius < 20 || !innerRadius || !outerRadius) return null;

    return { centerX, centerY, innerRadius, outerRadius };
}

function getLuminance(data, x, y, width) {
    const i = (y * width + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
}

function getAverage(arr) {
    if (arr.length === 0) return 0;
    // Simple outlier rejection: sort and take the middle 50%
    arr.sort((a, b) => a - b);
    const start = Math.floor(arr.length * 0.25);
    const end = Math.ceil(arr.length * 0.75);
    const sliced = arr.slice(start, end);
    return sliced.reduce((sum, val) => sum + val, 0) / sliced.length;
}


/**
 * Draws the detected circles on the canvas for visual feedback.
 * @param {HTMLCanvasElement} canvas
 * @param {object} cdInfo { centerX, centerY, innerRadius, outerRadius }
 */
export function drawDetection(canvas, cdInfo) {
    const ctx = canvas.getContext('2d');
    const { centerX, centerY, innerRadius, outerRadius } = cdInfo;

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.stroke();
}