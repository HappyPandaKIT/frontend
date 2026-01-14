import React, { useRef, useEffect } from 'react';

const WaveformVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.fillStyle = '#212529';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glowing oscillating line
      ctx.strokeStyle = '#92cc41';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#92cc41';
      ctx.shadowBlur = 15;
      ctx.globalAlpha = 0.9;

      ctx.beginPath();
      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255.0;
        const y = (v * canvas.height);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw grid lines for retro effect
      ctx.strokeStyle = 'rgba(146, 204, 65, 0.2)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;

      for (let i = 0; i < 4; i++) {
        const y = (canvas.height / 4) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
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

export default WaveformVisualizer;
