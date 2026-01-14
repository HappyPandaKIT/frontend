import React, { useRef, useEffect } from 'react';

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
      ctx.strokeStyle = '#306230';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Draw center crosshair
      ctx.strokeStyle = 'rgba(146, 204, 65, 0.3)';
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
        ctx.strokeStyle = 'rgba(146, 204, 65, 0.15)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Lissajous curve
      ctx.strokeStyle = '#92cc41';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#92cc41';
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
        ctx.strokeStyle = '#e76e55'; // Red - high intensity
        ctx.shadowColor = '#e76e55';
      } else if (maxAmplitude > 0.4) {
        ctx.strokeStyle = '#f7d51d'; // Yellow - medium
        ctx.shadowColor = '#f7d51d';
      } else {
        ctx.strokeStyle = '#92cc41'; // Green - low
        ctx.shadowColor = '#92cc41';
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
      ctx.fillStyle = '#8bac0f';
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
    <div className="nes-container is-dark with-title">
      <p className="title">Visualizer-3000</p>
      <canvas ref={canvasRef} width={400} height={400} style={{width: '100%', maxWidth: '400px', margin: '0 auto', display: 'block'}} />
    </div>
  );
};

export default OscilloscopeVisualizer;
