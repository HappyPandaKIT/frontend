import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const AttractorVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Lorenz attractor state
    let x = 0.1;
    let y = 0;
    let z = 0;

    // Lorenz system parameters (can be perturbed by audio)
    let sigma = 10;
    let rho = 28;
    let beta = 8 / 3;

    // Trail history (limited for performance)
    const trailLength = 1500;
    const trail = [];

    // Smoothing
    let smoothedBass = 0;
    let smoothedMid = 0;
    let smoothedHigh = 0;
    const smoothingFactor = 0.85;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      // Extract frequency bands
      const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.15));
      const midRange = dataArray.slice(
        Math.floor(bufferLength * 0.15),
        Math.floor(bufferLength * 0.4)
      );
      const highRange = dataArray.slice(
        Math.floor(bufferLength * 0.4),
        Math.floor(bufferLength * 0.8)
      );

      const bassEnergy = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length / 255;
      const midEnergy = midRange.reduce((sum, val) => sum + val, 0) / midRange.length / 255;
      const highEnergy = highRange.reduce((sum, val) => sum + val, 0) / highRange.length / 255;

      smoothedBass = smoothedBass * smoothingFactor + bassEnergy * (1 - smoothingFactor);
      smoothedMid = smoothedMid * smoothingFactor + midEnergy * (1 - smoothingFactor);
      smoothedHigh = smoothedHigh * smoothingFactor + highEnergy * (1 - smoothingFactor);

      // Perturb Lorenz parameters with audio
      sigma = 10 + smoothedBass * 5;
      rho = 28 + smoothedMid * 10;
      beta = (8 / 3) + smoothedHigh * 2;

      // Clear with fade effect for trail
      ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lorenz system integration (Euler method, multiple steps per frame for smooth curves)
      const dt = 0.005;
      const stepsPerFrame = 3;

      for (let step = 0; step < stepsPerFrame; step++) {
        // Lorenz equations
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;

        // Update state
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        // Add to trail
        trail.push({ x, y, z });
        if (trail.length > trailLength) {
          trail.shift();
        }
      }

      // Draw attractor trail
      if (trail.length > 1) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 8;

        for (let i = 1; i < trail.length; i++) {
          const point = trail[i];
          const prevPoint = trail[i - 1];

          // Project 3D to 2D
          const screenX = centerX + point.x * scale;
          const screenY = centerY + point.y * scale;
          const prevScreenX = centerX + prevPoint.x * scale;
          const prevScreenY = centerY + prevPoint.y * scale;

          // Color based on position in trail and z-depth
          const age = i / trail.length;
          const depth = (point.z + 30) / 60; // Normalize z to 0-1
          
          const hue = (depth * 200 + smoothedBass * 160) % 360;
          const saturation = 60 + smoothedMid * 40;
          const lightness = 30 + age * 40 + smoothedHigh * 20;
          const alpha = age * 0.8;

          ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
          ctx.lineWidth = 1 + age * 2;
          
          // Add glow for recent points
          if (age > 0.9) {
            ctx.shadowBlur = 15 * smoothedBass;
            ctx.shadowColor = ctx.strokeStyle;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.moveTo(prevScreenX, prevScreenY);
          ctx.lineTo(screenX, screenY);
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;

      // Draw current position as bright dot
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 8;
      const screenX = centerX + x * scale;
      const screenY = centerY + y * scale;

      ctx.fillStyle = '#ff006e';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff006e';
      ctx.beginPath();
      ctx.arc(screenX, screenY, 3 + smoothedBass * 4, 0, Math.PI * 2);
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
    <canvas ref={canvasRef} width={800} height={400} className="visualizer-canvas" />
  );
};

export default AttractorVisualizer;
