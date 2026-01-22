import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const PulseRingsVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let beatScale = 1;
    let targetScale = 1;
    let lastBeatTime = 0;

    // Simple heart shape path function
    const drawHeart = (x, y, size) => {
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      // Left side
      ctx.bezierCurveTo(
        x, y, 
        x - size / 2, y, 
        x - size / 2, y + topCurveHeight
      );
      ctx.bezierCurveTo(
        x - size / 2, y + (size + topCurveHeight) / 2, 
        x, y + (size + topCurveHeight) / 2, 
        x, y + size
      );
      // Right side
      ctx.bezierCurveTo(
        x, y + (size + topCurveHeight) / 2,
        x + size / 2, y + (size + topCurveHeight) / 2,
        x + size / 2, y + topCurveHeight
      );
      ctx.bezierCurveTo(
        x + size / 2, y,
        x, y,
        x, y + topCurveHeight
      );
      ctx.closePath();
    };

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get bass frequency for beat detection
      const bassSum = dataArray.slice(0, Math.floor(dataArray.length * 0.15))
        .reduce((s, v) => s + v, 0);
      const bassAvg = bassSum / Math.floor(dataArray.length * 0.15) / 255;

      // Get overall average for continuous responsiveness
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length / 255;

      // Beat detection with lower threshold for more responsiveness
      const currentTime = Date.now();
      if (bassAvg > 0.4 && currentTime - lastBeatTime > 250) {
        targetScale = 1.25 + bassAvg * 0.3;
        lastBeatTime = currentTime;
      }

      // Smooth scale interpolation with faster response
      beatScale += (targetScale - beatScale) * 0.25;
      targetScale += (1 - targetScale) * 0.15; // Return to normal faster

      // Base heart size with beat scale + continuous audio response
      const baseSize = 80;
      const heartSize = baseSize * beatScale * (1 + average * 0.15);

      // Draw main heart with gradient
      const gradient = ctx.createRadialGradient(
        centerX, centerY - 10, 0,
        centerX, centerY, heartSize
      );
      gradient.addColorStop(0, '#ff006e');
      gradient.addColorStop(0.6, '#d90058');
      gradient.addColorStop(1, '#a00042');

      drawHeart(centerX, centerY - 40, heartSize);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add glow effect based on bass
      ctx.shadowBlur = 20 + bassAvg * 40;
      ctx.shadowColor = '#ff006e';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw heart outline
      ctx.strokeStyle = '#ff0080';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw pulse waves emanating from heart as heart shapes
      const numWaves = 3;
      for (let i = 0; i < numWaves; i++) {
        const wavePhase = (Date.now() / 600 + i * 0.8) % 1.75; // Faster speed and longer duration
        const waveSize = heartSize + wavePhase * 70; // Travel further
        const waveOpacity = Math.max(0, 1 - wavePhase / 2.5) * bassAvg;

        if (waveOpacity > 0.1) {
          ctx.globalAlpha = waveOpacity * 0.5;
          ctx.strokeStyle = '#ff006e';
          ctx.lineWidth = 2;
          drawHeart(centerX, centerY - 40, waveSize);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      // Draw waveform line at bottom using actual audio data
      const waveformData = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(waveformData);
      
      const lineY = canvas.height - 80;
      const lineHeight = 40;
      ctx.strokeStyle = '#ff006e';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff006e';
      
      ctx.beginPath();
      const sliceWidth = 300 / waveformData.length;
      const startX = centerX - 150;
      
      for (let i = 0; i < waveformData.length; i++) {
        const v = waveformData[i] / 255.0;
        const y = lineY + (v - 0.5) * lineHeight * 2;
        const x = startX + i * sliceWidth;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      ctx.shadowBlur = 0;
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

export default PulseRingsVisualizer;
