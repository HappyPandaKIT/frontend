import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const BlocksVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = '#212529';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid parameters
      const cols = 16;
      const rows = 8;
      const blockWidth = canvas.width / cols;
      const blockHeight = 30;
      const isoAngle = Math.PI / 6; // 30 degrees for isometric effect
      const baseY = canvas.height - 50;

      // Draw blocks in isometric grid
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = Math.floor((col / cols + row / rows) * dataArray.length / 2);
          const value = dataArray[index] / 255;
          
          if (value < 0.1) continue; // Skip silent frequencies

          const height = value * 100;
          
          // Calculate isometric position
          const isoX = (col - row) * (blockWidth / 2) + canvas.width / 2;
          const isoY = (col + row) * (blockHeight / 4) + baseY - height;

          // Determine color based on frequency value
          let color;
          if (value > 0.7) color = '#e76e55'; // Red
          else if (value > 0.4) color = '#f7d51d'; // Yellow
          else color = '#92cc41'; // Green

          // Draw isometric block (3D cube effect)
          drawIsometricBlock(ctx, isoX, isoY, blockWidth / 2, blockHeight / 2, height, color);
        }
      }
    };

    const drawIsometricBlock = (ctx, x, y, width, depth, height, color) => {
      // Top face
      ctx.fillStyle = lightenColor(color, 20);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y + depth);
      ctx.lineTo(x, y + depth * 2);
      ctx.lineTo(x - width, y + depth);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Left face
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x - width, y + depth);
      ctx.lineTo(x - width, y + depth + height);
      ctx.lineTo(x, y + depth * 2 + height);
      ctx.lineTo(x, y + depth * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right face
      ctx.fillStyle = darkenColor(color, 20);
      ctx.beginPath();
      ctx.moveTo(x, y + depth * 2);
      ctx.lineTo(x, y + depth * 2 + height);
      ctx.lineTo(x + width, y + depth + height);
      ctx.lineTo(x + width, y + depth);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    const lightenColor = (color, percent) => {
      const num = parseInt(color.replace('#', ''), 16);
      const r = Math.min(255, ((num >> 16) & 0xFF) + percent);
      const g = Math.min(255, ((num >> 8) & 0xFF) + percent);
      const b = Math.min(255, (num & 0xFF) + percent);
      return `rgb(${r}, ${g}, ${b})`;
    };

    const darkenColor = (color, percent) => {
      const num = parseInt(color.replace('#', ''), 16);
      const r = Math.max(0, ((num >> 16) & 0xFF) - percent);
      const g = Math.max(0, ((num >> 8) & 0xFF) - percent);
      const b = Math.max(0, (num & 0xFF) - percent);
      return `rgb(${r}, ${g}, ${b})`;
    };

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [analyser]);

  return (
    <div className="nes-container is-dark with-title visualizer-container">
      <p className="title">Visualizer-3000</p>
      <canvas ref={canvasRef} width={800} height={400} className="visualizer-canvas" />
    </div>
  );
};

export default BlocksVisualizer;
