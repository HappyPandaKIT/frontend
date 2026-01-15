import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const CircleVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = '#212529';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw circle background
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw frequency bars in circle
      const barCount = bufferLength;
      const angleSlice = (Math.PI * 2) / barCount;

      for (let i = 0; i < barCount; i++) {
        const barHeight = dataArray[i] / 255;
        const angle = angleSlice * i;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight * 60);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight * 60);

        // Color based on frequency
        if (barHeight > 0.8) ctx.strokeStyle = '#ff006e'; // Magenta
        else if (barHeight > 0.6) ctx.strokeStyle = '#fb5607'; // Orange
        else if (barHeight > 0.4) ctx.strokeStyle = '#ffbe0b'; // Yellow
        else if (barHeight > 0.2) ctx.strokeStyle = '#06ffa5'; // Cyan
        else ctx.strokeStyle = '#3a86ff'; // Blue

        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw center circle
      ctx.fillStyle = '#8bac0f';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f380f';
      ctx.lineWidth = 2;
      ctx.stroke();
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
