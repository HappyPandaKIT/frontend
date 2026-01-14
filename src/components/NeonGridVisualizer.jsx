import React, { useRef, useEffect } from 'react';

const NeonGridVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let time = 0;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.02;

      // Grid parameters
      const cols = 12;
      const rows = 8;
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      // Draw grid cells
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = Math.floor(((col + row * cols) / (cols * rows)) * dataArray.length);
          const value = dataArray[index] / 255;

          if (value < 0.1) continue;

          const x = col * cellWidth;
          const y = row * cellHeight;

          // Pulsing effect
          const pulse = Math.sin(time + col * 0.5 + row * 0.3) * 0.3 + 0.7;
          const intensity = value * pulse;

          // Color based on frequency
          let color;
          if (value > 0.7) color = `rgba(231, 110, 85, ${intensity})`; // Red/pink
          else if (value > 0.4) color = `rgba(247, 213, 29, ${intensity})`; // Yellow/gold
          else color = `rgba(146, 204, 65, ${intensity})`; // Green/lime

          // Draw filled cell with glow
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 20 * intensity;
          
          const padding = 5;
          ctx.fillRect(
            x + padding, 
            y + padding, 
            cellWidth - padding * 2, 
            cellHeight - padding * 2
          );

          // Draw cell border
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 15 * intensity;
          ctx.strokeRect(
            x + padding, 
            y + padding, 
            cellWidth - padding * 2, 
            cellHeight - padding * 2
          );

          // Morphing geometric shapes inside cells
          if (value > 0.5) {
            ctx.save();
            ctx.translate(x + cellWidth / 2, y + cellHeight / 2);
            ctx.rotate(time + col + row);

            const shapeSize = (cellWidth / 3) * intensity;
            
            ctx.beginPath();
            if (value > 0.75) {
              // Triangle
              ctx.moveTo(0, -shapeSize);
              ctx.lineTo(shapeSize, shapeSize);
              ctx.lineTo(-shapeSize, shapeSize);
            } else {
              // Diamond
              ctx.moveTo(0, -shapeSize);
              ctx.lineTo(shapeSize, 0);
              ctx.lineTo(0, shapeSize);
              ctx.lineTo(-shapeSize, 0);
            }
            ctx.closePath();
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 25;
            ctx.stroke();

            ctx.restore();
          }
        }
      }

      ctx.shadowBlur = 0;

      // Draw grid lines
      ctx.strokeStyle = 'rgba(146, 204, 65, 0.2)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, canvas.height);
        ctx.stroke();
      }

      for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(canvas.width, i * cellHeight);
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
    <div className="nes-container is-dark with-title">
      <p className="title">Visualizer-3000</p>
      <canvas ref={canvasRef} width={800} height={400} style={{width: '100%'}} />
    </div>
  );
};

export default NeonGridVisualizer;
