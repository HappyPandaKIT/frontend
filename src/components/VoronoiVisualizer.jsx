import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const VoronoiVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Optimized cell count for performance (20 cells = 400 distance checks per frame)
    const cellCount = 20;
    const cells = [];

    // Initialize cells with positions and target velocities
    for (let i = 0; i < cellCount; i++) {
      cells.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        freqIndex: Math.floor((i / cellCount) * bufferLength)
      });
    }

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update cell positions based on audio
      cells.forEach((cell, idx) => {
        const frequency = dataArray[cell.freqIndex] / 255;
        
        // Calculate movement based on frequency
        const movementRange = 80;
        const angle = (Date.now() / 1000 + idx * Math.PI * 2 / cellCount) * (0.5 + frequency);
        
        const targetX = cell.baseX + Math.cos(angle) * movementRange * frequency;
        const targetY = cell.baseY + Math.sin(angle) * movementRange * frequency;
        
        // Smooth movement
        cell.vx += (targetX - cell.x) * 0.05;
        cell.vy += (targetY - cell.y) * 0.05;
        cell.vx *= 0.9; // Damping
        cell.vy *= 0.9;
        
        cell.x += cell.vx;
        cell.y += cell.vy;

        // Keep cells in bounds
        cell.x = Math.max(0, Math.min(canvas.width, cell.x));
        cell.y = Math.max(0, Math.min(canvas.height, cell.y));
      });

      // Draw Voronoi cells using pixel-based approach (optimized)
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Sample every 2 pixels for performance (4x speedup)
      const step = 2;
      
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          let minDist = Infinity;
          let closestCell = 0;

          // Find closest cell
          for (let i = 0; i < cells.length; i++) {
            const dx = x - cells[i].x;
            const dy = y - cells[i].y;
            const dist = dx * dx + dy * dy; // Skip sqrt for performance

            if (dist < minDist) {
              minDist = dist;
              closestCell = i;
            }
          }

          // Calculate color based on cell index and distance
          const frequency = dataArray[cells[closestCell].freqIndex] / 255;
          const normalizedDist = Math.sqrt(minDist) / 100;
          
          const hue = (closestCell / cellCount) * 360;
          const saturation = 60 + frequency * 40;
          const lightness = Math.max(10, 30 - normalizedDist * 20 + frequency * 30);

          // Convert HSL to RGB
          const h = hue / 360;
          const s = saturation / 100;
          const l = lightness / 100;
          
          let r, g, b;
          if (s === 0) {
            r = g = b = l;
          } else {
            const hue2rgb = (p, q, t) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1/6) return p + (q - p) * 6 * t;
              if (t < 1/2) return q;
              if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
          }

          // Fill 2x2 block for the stepped pixels
          for (let dy = 0; dy < step && y + dy < canvas.height; dy++) {
            for (let dx = 0; dx < step && x + dx < canvas.width; dx++) {
              const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
              data[idx] = r * 255;
              data[idx + 1] = g * 255;
              data[idx + 2] = b * 255;
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Draw cell boundaries (edges) with glow
      ctx.strokeStyle = '#06ffa5';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#06ffa5';

      // Draw cell centers
      cells.forEach((cell, idx) => {
        const frequency = dataArray[cell.freqIndex] / 255;
        const radius = 3 + frequency * 5;
        
        const hue = (idx / cellCount) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
        ctx.shadowBlur = 15 * frequency;
        ctx.shadowColor = ctx.fillStyle;
        
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

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

export default VoronoiVisualizer;
