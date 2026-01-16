import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const OscilloscopeVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const dataArray2 = new Uint8Array(bufferLength);

    let phase = 0;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      // Create second channel with phase offset for Lissajous
      for (let i = 0; i < bufferLength; i++) {
        dataArray2[i] = dataArray[(i + Math.floor(bufferLength / 4)) % bufferLength];
      }

      // Clear canvas with CRT phosphor fade effect
      ctx.fillStyle = 'rgba(10, 20, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      phase += 0.01;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = Math.min(centerX, centerY) * 0.8;

      // Draw CRT screen border
      ctx.strokeStyle = '#06ffa5';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Draw center crosshair
      ctx.strokeStyle = 'rgba(6, 255, 165, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, 20);
      ctx.lineTo(centerX, canvas.height - 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(20, centerY);
      ctx.lineTo(canvas.width - 20, centerY);
      ctx.stroke();

      // Draw concentric circles for scale
      for (let r = 50; r < scale; r += 50) {
        ctx.strokeStyle = 'rgba(6, 255, 165, 0.15)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Lissajous curve
      ctx.strokeStyle = '#06ffa5';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06ffa5';
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.9;

      ctx.beginPath();
      let maxAmplitude = 0;

      for (let i = 0; i < bufferLength; i++) {
        const x = ((dataArray[i] / 255.0) - 0.5) * 2;
        const y = ((dataArray2[i] / 255.0) - 0.5) * 2;
        
        const amplitude = Math.sqrt(x * x + y * y);
        maxAmplitude = Math.max(maxAmplitude, amplitude);

        const posX = centerX + x * scale;
        const posY = centerY + y * scale;

        if (i === 0) {
          ctx.moveTo(posX, posY);
        } else {
          ctx.lineTo(posX, posY);
        }
      }

      ctx.stroke();

      // Color intensity based on signal strength
      if (maxAmplitude > 0.8) {
        ctx.strokeStyle = '#ff006e'; // Magenta - high intensity
        ctx.shadowColor = '#ff006e';
      } else if (maxAmplitude > 0.5) {
        ctx.strokeStyle = '#fb5607'; // Orange - medium-high
        ctx.shadowColor = '#fb5607';
      } else if (maxAmplitude > 0.3) {
        ctx.strokeStyle = '#ffbe0b'; // Yellow - medium
        ctx.shadowColor = '#ffbe0b';
      } else {
        ctx.strokeStyle = '#06ffa5'; // Cyan - low
        ctx.shadowColor = '#06ffa5';
      }

      // Redraw with color
      ctx.shadowBlur = 15;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();

      for (let i = 0; i < bufferLength; i++) {
        const x = ((dataArray[i] / 255.0) - 0.5) * 2;
        const y = ((dataArray2[i] / 255.0) - 0.5) * 2;

        const posX = centerX + x * scale;
        const posY = centerY + y * scale;

        if (i === 0) {
          ctx.moveTo(posX, posY);
        } else {
          ctx.lineTo(posX, posY);
        }
      }

      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Draw scope info text
      ctx.fillStyle = '#06ffa5';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText('X-Y MODE', 20, 30);
      ctx.fillText(`AMPLITUDE: ${(maxAmplitude * 100).toFixed(1)}%`, 20, 45);
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

export default OscilloscopeVisualizer;
