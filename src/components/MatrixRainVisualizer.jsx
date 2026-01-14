import React, { useRef, useEffect, useState } from 'react';

const MatrixRainVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const charSize = 20;
    const cols = Math.floor(width / charSize);
    
    // Initialize character columns
    let columns = Array(cols).fill(0).map((_, i) => ({
      x: i * charSize,
      y: Math.random() * height,
      speed: Math.random() * 2 + 1,
      chars: '01ｦｧｨｩｪｫｬｭｮｯ'
    }));

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Semi-transparent black overlay for trail effect
      ctx.fillStyle = 'rgba(33, 37, 41, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw falling characters
      ctx.font = `bold ${charSize}px 'Courier New', monospace`;
      ctx.textAlign = 'center';

      columns.forEach((col, idx) => {
        // Get frequency data for this column
        const freqIdx = Math.floor((idx / cols) * dataArray.length);
        const frequency = dataArray[freqIdx] / 255;

        // Color based on frequency
        if (frequency > 0.8) ctx.fillStyle = '#e76e55'; // Red (high)
        else if (frequency > 0.4) ctx.fillStyle = '#f7d51d'; // Yellow (mid)
        else ctx.fillStyle = '#92cc41'; // Green (low)

        // Draw character
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(char, col.x + charSize / 2, col.y);

        // Update position
        col.y += col.speed + frequency * 3;

        // Reset to top if off screen
        if (col.y > height) {
          col.y = -charSize;
          col.speed = Math.random() * 2 + 1;
        }
      });
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
      <canvas ref={canvasRef} width={800} height={200} style={{width: '100%'}} />
    </div>
  );
};

export default MatrixRainVisualizer;
