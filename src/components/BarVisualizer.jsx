import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const Visualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#212529'; // Background refresh
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        // Vibrant Colors
        if (barHeight > 200) ctx.fillStyle = '#ff006e'; // Magenta
        else if (barHeight > 150) ctx.fillStyle = '#fb5607'; // Orange
        else if (barHeight > 100) ctx.fillStyle = '#ffbe0b'; // Yellow
        else if (barHeight > 50) ctx.fillStyle = '#06ffa5'; // Cyan
        else ctx.fillStyle = '#3a86ff'; // Blue

        // Mache es "blockig" für Pixel-Look
        const quantHeight = Math.floor(barHeight / 10) * 10; 
        
        ctx.fillRect(x, canvas.height - quantHeight / 1.5, barWidth, quantHeight / 1.5);

        x += barWidth + 2; // +2 für Lücke
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
    <canvas ref={canvasRef} width={800} height={200} className="visualizer-canvas" />
  );
};

export default Visualizer;