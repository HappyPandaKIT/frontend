// Shared audio analysis utilities for visualizers

/**
 * Calculate frequency bands from audio data
 * @param {Uint8Array} dataArray - The frequency data array
 * @returns {Object} Object containing bass, mid, and high energy values (0-1)
 */
export const getFrequencyBands = (dataArray) => {
  const bufferLength = dataArray.length;
  
  const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.15));
  const midRange = dataArray.slice(Math.floor(bufferLength * 0.15), Math.floor(bufferLength * 0.4));
  const highRange = dataArray.slice(Math.floor(bufferLength * 0.4), Math.floor(bufferLength * 0.85));

  const bass = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length / 255;
  const mid = midRange.reduce((sum, val) => sum + val, 0) / midRange.length / 255;
  const high = highRange.reduce((sum, val) => sum + val, 0) / highRange.length / 255;

  return { bass, mid, high };
};

/**
 * Get average value from a data array
 * @param {Uint8Array} dataArray - The frequency data array
 * @returns {number} Average value normalized to 0-1
 */
export const getAverageFrequency = (dataArray) => {
  const sum = dataArray.reduce((acc, val) => acc + val, 0);
  return sum / dataArray.length / 255;
};

/**
 * Get color based on frequency value
 * @param {number} value - Normalized frequency value (0-1)
 * @returns {string} CSS color string
 */
export const getFrequencyColor = (value) => {
  if (value > 0.7) return '#ff006e';  // Magenta
  if (value > 0.5) return '#fb5607';  // Orange
  if (value > 0.3) return '#ffbe0b';  // Yellow
  return '#06ffa5';  // Cyan
};

/**
 * Get RGB color object based on frequency value
 * @param {number} value - Normalized frequency value (0-1)
 * @returns {Object} Object with r, g, b properties
 */
export const getFrequencyColorRGB = (value) => {
  if (value > 0.7) return { r: 255, g: 0, b: 110 };   // Magenta
  if (value > 0.5) return { r: 251, g: 86, b: 7 };    // Orange
  if (value > 0.3) return { r: 255, g: 190, b: 11 };  // Yellow
  return { r: 6, g: 255, b: 165 };  // Cyan
};

// Color palette for visualizers
export const VISUALIZER_COLORS = {
  magenta: '#ff006e',
  orange: '#fb5607',
  yellow: '#ffbe0b',
  cyan: '#06ffa5',
  blue: '#3a86ff',
  green: '#92cc41',
  purple: '#7209b7',
  pink: '#f72585'
};

// Color palette as RGB objects
export const VISUALIZER_COLORS_RGB = [
  { r: 255, g: 0, b: 110 },   // Magenta
  { r: 251, g: 86, b: 7 },    // Orange
  { r: 255, g: 190, b: 11 },  // Yellow
  { r: 6, g: 255, b: 165 },   // Cyan
  { r: 58, g: 134, b: 255 }   // Blue
];
