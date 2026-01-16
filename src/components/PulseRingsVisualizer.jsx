import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const PulseRingsVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let rings = [];

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = '#212529';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get average frequency for pulse
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length / 255;

      // Create new ring when pulse is strong
      if (average > 0.3) {
        rings.push({
          radius: 10,
          maxRadius: 150,
          life: 1,
          frequency: average
        });
      }

      // Draw center nucleus
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
      centerGradient.addColorStop(0, '#ff006e');
      centerGradient.addColorStop(0.5, '#8b2fc9');
      centerGradient.addColorStop(1, '#3a86ff');
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3a86ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw and update rings
      rings = rings.filter(ring => ring.life > 0);

      rings.forEach((ring, idx) => {
        // Calculate color based on frequency
        if (ring.frequency > 0.8) ctx.strokeStyle = '#ff006e'; // Magenta
        else if (ring.frequency > 0.6) ctx.strokeStyle = '#fb5607'; // Orange
        else if (ring.frequency > 0.4) ctx.strokeStyle = '#ffbe0b'; // Yellow
        else if (ring.frequency > 0.2) ctx.strokeStyle = '#06ffa5'; // Cyan
        else ctx.strokeStyle = '#3a86ff'; // Blue

        // Fade line width and opacity
        ctx.lineWidth = 3 * ring.life;
        ctx.globalAlpha = ring.life * 0.8;

        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Expand ring
        ring.radius += 2;
        ring.life -= 0.02;
      });

      ctx.globalAlpha = 1;

      // Draw frequency bar around center for extra feedback
      ctx.strokeStyle = '#ffbe0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40 + average * 30, 0, Math.PI * 2);
      ctx.stroke();

      // Draw grid reference circles
      ctx.strokeStyle = 'rgba(6, 255, 165, 0.15)';
      ctx.lineWidth = 1;
      for (let r = 50; r < 150; r += 30) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }
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

export default PulseRingsVisualizer;
