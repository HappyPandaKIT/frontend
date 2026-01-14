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

        // Pixel Art Colors
        if (barHeight > 200) ctx.fillStyle = '#e76e55'; // Red
        else if (barHeight > 100) ctx.fillStyle = '#f7d51d'; // Yellow
        else ctx.fillStyle = '#92cc41'; // Green

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
    <div className="nes-container is-dark with-title visualizer-container">
      <p className="title">Visualizer-3000</p>
      <canvas ref={canvasRef} width={800} height={200} className="visualizer-canvas" />
    </div>
  );
};

export default Visualizer;