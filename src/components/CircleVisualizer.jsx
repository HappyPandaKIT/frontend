import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const CircleVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Divide spectrum into frequency ranges
      const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.1));
      const midRange = dataArray.slice(Math.floor(bufferLength * 0.1), Math.floor(bufferLength * 0.4));
      const highRange = dataArray.slice(Math.floor(bufferLength * 0.4), bufferLength);

      // Calculate average energy for each range
      const bassAvg = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length;
      const midAvg = midRange.reduce((sum, val) => sum + val, 0) / midRange.length;
      const highAvg = highRange.reduce((sum, val) => sum + val, 0) / highRange.length;

      // Bass controls size (radius scaling)
      const baseRadius = 80;
      const radiusScale = 1 + (bassAvg / 255) * 0.8; // 1.0 to 1.8
      const effectiveRadius = baseRadius * radiusScale;

      // Highs control color shift (hue rotation)
      const hueShift = (highAvg / 255) * 120; // 0 to 120 degrees

      // Draw circular bars based on mid-range frequencies (circular waveform)
      const barCount = 64;
      const angleStep = (Math.PI * 2) / barCount;

      for (let i = 0; i < barCount; i++) {
        const angle = angleStep * i;
        
        // Map bar index to frequency bin in mid-range (where most energy is)
        const freqIndex = Math.floor(bufferLength * 0.05) + Math.floor((i / barCount) * midRange.length * 2);
        const amplitude = dataArray[Math.min(freqIndex, bufferLength - 1)] || 0;
        const normalizedAmp = amplitude / 255;

        // Bar height controlled by mid frequencies
        const barHeight = normalizedAmp * 100;

        // Calculate bar position in polar coordinates
        const innerRadius = effectiveRadius;
        const outerRadius = effectiveRadius + barHeight;

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;

        // Color based on position + high frequency shift
        const baseHue = (i / barCount) * 360;
        const finalHue = (baseHue + hueShift) % 360;
        const saturation = 70 + normalizedAmp * 30; // More saturated with amplitude
        const lightness = 45 + normalizedAmp * 20;

        ctx.strokeStyle = `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 8 + normalizedAmp * 10;
        ctx.shadowColor = ctx.strokeStyle;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Draw fancy vibrant center circle that pulses with bass
      const centerRadius = 25 + (bassAvg / 255) * 30;
      
      // Create multi-layer gradient for depth
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
      gradient.addColorStop(0, `hsl(${hueShift + 180}, 100%, 70%)`); // Bright complementary center
      gradient.addColorStop(0.3, `hsl(${hueShift + 60}, 90%, 60%)`); // Vibrant mid
      gradient.addColorStop(0.6, `hsl(${hueShift}, 85%, 55%)`); // Rich main color
      gradient.addColorStop(1, `hsl(${hueShift + 40}, 70%, 35%)`); // Deep edge
      
      // Add glow effect
      ctx.shadowBlur = 20 + (bassAvg / 255) * 25;
      ctx.shadowColor = `hsl(${hueShift}, 100%, 60%)`;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add bright inner highlight
      const highlightGradient = ctx.createRadialGradient(
        centerX - centerRadius * 0.2, 
        centerY - centerRadius * 0.2, 
        0,
        centerX, 
        centerY, 
        centerRadius * 0.5
      );
      highlightGradient.addColorStop(0, `hsla(${hueShift + 180}, 100%, 90%, 0.8)`);
      highlightGradient.addColorStop(1, `hsla(${hueShift + 180}, 100%, 70%, 0)`);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = highlightGradient;
      ctx.fill();
      
      // Add rotating accent ring
      const ringRotation = (Date.now() / 1000) * 2; // Rotate over time
      const ringRadius = centerRadius * 0.7;
      const ringThickness = 2 + (midAvg / 255) * 3;
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = `hsl(${(hueShift + 120) % 360}, 100%, 60%)`;
      
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i + ringRotation;
        const intensity = 0.5 + 0.5 * Math.sin(angle * 2 + ringRotation);
        const x = centerX + Math.cos(angle) * ringRadius;
        const y = centerY + Math.sin(angle) * ringRadius;
        
        ctx.beginPath();
        ctx.arc(x, y, ringThickness * intensity, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${(hueShift + 240) % 360}, 100%, 70%, ${0.6 + intensity * 0.4})`;
        ctx.fill();
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [analyser]);

  return (
    <canvas ref={canvasRef} width={400} height={400} className="visualizer-canvas-square" />
  );
};

export default CircleVisualizer;
