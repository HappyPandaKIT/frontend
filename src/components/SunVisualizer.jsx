import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const SunVisualizer = ({ analyser }) => {
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

    // Smoothing for stable animation
    let smoothedBass = 0;
    let smoothedPitch = 0;
    const smoothingFactor = 0.7;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate bass energy (low frequencies 0-15%)
      const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.15));
      const bassEnergy = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length;
      smoothedBass = smoothedBass * smoothingFactor + bassEnergy * (1 - smoothingFactor);

      // Calculate pitch indicator (mid to high frequency balance)
      const midRange = dataArray.slice(
        Math.floor(bufferLength * 0.15),
        Math.floor(bufferLength * 0.4)
      );
      const highRange = dataArray.slice(
        Math.floor(bufferLength * 0.4),
        Math.floor(bufferLength * 0.8)
      );
      
      const midEnergy = midRange.reduce((sum, val) => sum + val, 0) / midRange.length;
      const highEnergy = highRange.reduce((sum, val) => sum + val, 0) / highRange.length;
      
      // Pitch indicator: ratio of high to total energy (0 = warm/low, 1 = cool/high)
      const totalEnergy = midEnergy + highEnergy + 1; // +1 to avoid division by zero
      const pitchRatio = highEnergy / totalEnergy;
      smoothedPitch = smoothedPitch * smoothingFactor + pitchRatio * (1 - smoothingFactor);

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate sun properties
      const baseRadius = 60;
      const maxExpansion = 120;
      const sunRadius = baseRadius + (smoothedBass / 255) * maxExpansion;

      // Color shift from warm (orange/red) to cool (cyan/blue) based on pitch
      // Low pitch = warm (hue ~0-30), high pitch = cool (hue ~180-210)
      const hue = 20 + smoothedPitch * 160; // 20° (orange-red) to 180° (cyan)
      const saturation = 85 + smoothedPitch * 15; // More saturated at higher pitches
      const lightness = 50 + (smoothedBass / 255) * 15; // Brighter with more bass

      // Create multiple layers of blur for glowing effect
      const layers = 5;
      for (let i = layers; i > 0; i--) {
        const layerRadius = sunRadius * (1 + (i * 0.15));
        const layerAlpha = 0.12 / i;
        
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, layerRadius
        );
        
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${layerAlpha * 3})`);
        gradient.addColorStop(0.4, `hsla(${hue}, ${saturation}%, ${lightness - 10}%, ${layerAlpha * 2})`);
        gradient.addColorStop(0.7, `hsla(${hue}, ${saturation - 20}%, ${lightness - 20}%, ${layerAlpha})`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation - 30}%, ${lightness - 30}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw the core sun with intense glow
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, sunRadius
      );
      
      coreGradient.addColorStop(0, `hsl(${hue + 10}, 100%, ${Math.min(lightness + 25, 85)}%)`);
      coreGradient.addColorStop(0.3, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
      coreGradient.addColorStop(0.6, `hsl(${hue - 10}, ${saturation - 10}%, ${lightness - 15}%)`);
      coreGradient.addColorStop(1, `hsla(${hue - 20}, ${saturation - 20}%, ${lightness - 25}%, 0.3)`);

      ctx.fillStyle = coreGradient;
      ctx.shadowBlur = 60 + (smoothedBass / 255) * 40;
      ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Additional outer glow
      ctx.shadowBlur = 100;
      ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`;
      ctx.fill();

      ctx.shadowBlur = 0;

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

export default SunVisualizer;
