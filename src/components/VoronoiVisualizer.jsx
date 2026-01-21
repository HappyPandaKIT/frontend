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

    // Color palette matching circwave visualizer
    const colors = [
      { r: 255, g: 0, b: 110 },   // #ff006e magenta
      { r: 251, g: 86, b: 7 },    // #fb5607 orange
      { r: 255, g: 190, b: 11 },  // #ffbe0b yellow
      { r: 6, g: 255, b: 165 },   // #06ffa5 cyan
      { r: 58, g: 134, b: 255 }   // #3a86ff blue
    ];

    // Node count for constellation effect
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
        freqIndex: Math.floor((i / cellCount) * bufferLength),
        colorIndex: i % colors.length
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

      // Clear with black background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections between nearby cells (constellation effect)
      const connectionDistance = 180; // Max distance to draw connections
      
      for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
          const dx = cells[i].x - cells[j].x;
          const dy = cells[i].y - cells[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            // Line opacity based on distance and audio
            const freq1 = dataArray[cells[i].freqIndex] / 255;
            const freq2 = dataArray[cells[j].freqIndex] / 255;
            const avgFreq = (freq1 + freq2) / 2;
            
            const opacity = (1 - distance / connectionDistance) * (0.3 + avgFreq * 0.5);
            
            // Blend colors of connected cells
            const color1 = colors[cells[i].colorIndex];
            const color2 = colors[cells[j].colorIndex];
            const blendR = (color1.r + color2.r) / 2;
            const blendG = (color1.g + color2.g) / 2;
            const blendB = (color1.b + color2.b) / 2;
            
            // Line thickness based on audio
            ctx.lineWidth = 1 + avgFreq * 2;
            ctx.strokeStyle = `rgba(${blendR}, ${blendG}, ${blendB}, ${opacity})`;
            
            // Add glow effect for high frequencies
            if (avgFreq > 0.5) {
              ctx.shadowBlur = 10 + avgFreq * 15;
              ctx.shadowColor = `rgba(${blendR}, ${blendG}, ${blendB}, ${avgFreq})`;
            } else {
              ctx.shadowBlur = 0;
            }
            
            ctx.beginPath();
            ctx.moveTo(cells[i].x, cells[i].y);
            ctx.lineTo(cells[j].x, cells[j].y);
            ctx.stroke();
          }
        }
      }
      
      ctx.shadowBlur = 0;

      // Draw glowing cell centers with enhanced effects
      cells.forEach((cell) => {
        const frequency = dataArray[cell.freqIndex] / 255;
        const radius = 5 + frequency * 10;
        
        const color = colors[cell.colorIndex];
        const colorStr = `rgb(${color.r}, ${color.g}, ${color.b})`;
        
        // Outer glow
        ctx.shadowBlur = 25 + frequency * 30;
        ctx.shadowColor = colorStr;
        ctx.fillStyle = colorStr;
        
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
