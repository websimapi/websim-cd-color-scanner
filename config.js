// --- COLOR TO NOTE MAPPING ---
// Maps a color name to a musical note frequency (in Hz).
// C4 is Middle C.
export const NOTE_FREQUENCIES = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,
    C5: 523.25,
};

// Defines the RGB values for colors we want to detect.
// We'll calculate the distance to these colors to find the best match.
export const COLOR_MAP = [
    { name: 'RED',    r: 255, g: 0,   b: 0,   note: 'C4' },
    { name: 'GREEN',  r: 0,   g: 255, b: 0,   note: 'D4' },
    { name: 'BLUE',   r: 0,   g: 0,   b: 255, note: 'E4' },
    { name: 'YELLOW', r: 255, g: 255, b: 0,   note: 'F4' },
    { name: 'MAGENTA',r: 255, g: 0,   b: 255, note: 'G4' },
    { name: 'CYAN',   r: 0,   g: 255, b: 255, note: 'A4' },
    // Add more colors and notes here if you like
];

// --- SCANNER SETTINGS ---
// How many steps to scan around the circle. More is higher resolution.
export const SCANNER_ANGULAR_STEPS = 360; 
// How many tracks to scan from inside to outside.
export const SCANNER_RADIAL_STEPS = 50;
// Note duration in seconds
export const NOTE_DURATION = 0.15; 

// --- IMAGE PROCESSING SETTINGS ---
// How far from pure R, G, or B a color can be to be considered "colored"
// Lower is stricter.
export const COLOR_THRESHOLD = 100;
// How sensitive the edge detection is. Higher means it needs a sharper change.
export const EDGE_THRESHOLD = 50; 