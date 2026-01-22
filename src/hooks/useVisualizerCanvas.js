import { useRef, useEffect } from 'react';

/**
 * Custom hook for audio visualizer canvas setup and animation loop
 * Reduces boilerplate code across all visualizer components
 * 
 * @param {Object} analyser - Web Audio API AnalyserNode or merged analyser object
 * @param {Function} drawFn - Drawing function called each animation frame
 *                           Receives: (ctx, canvas, dataArray, bufferLength)
 * @param {Object} options - Optional configuration
 * @param {number} options.width - Canvas width (default: 800)
 * @param {number} options.height - Canvas height (default: 400)
 * @param {boolean} options.useTimeDomain - If true, uses getByteTimeDomainData instead of frequency
 * @returns {Object} { canvasRef } - Ref to attach to canvas element
 */
export const useVisualizerCanvas = (analyser, drawFn, options = {}) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const { useTimeDomain = false } = options;

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (useTimeDomain) {
        analyser.getByteTimeDomainData(dataArray);
      } else {
        analyser.getByteFrequencyData(dataArray);
      }
      
      drawFn(ctx, canvas, dataArray, bufferLength);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [analyser, drawFn, useTimeDomain]);

  return { canvasRef };
};

export default useVisualizerCanvas;
