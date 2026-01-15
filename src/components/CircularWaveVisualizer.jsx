import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const CircularWaveVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = '#212529';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate average for center circle pulse
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length / 255;

      // Draw center circle with gradient (pulsing)
      const centerRadius = 20 + average * 15;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
      gradient.addColorStop(0, '#ff006e');
      gradient.addColorStop(0.5, '#8338ec');
      gradient.addColorStop(1, '#3a86ff');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Define frequency bands (bass, low-mid, mid, high-mid, high)
      const bands = [
        { start: 0, end: Math.floor(bufferLength * 0.1), color: '#ff006e', amplitude: 30 },    // Bass
        { start: Math.floor(bufferLength * 0.1), end: Math.floor(bufferLength * 0.25), color: '#fb5607', amplitude: 25 },  // Low-mid
        { start: Math.floor(bufferLength * 0.25), end: Math.floor(bufferLength * 0.5), color: '#ffbe0b', amplitude: 20 }, // Mid
        { start: Math.floor(bufferLength * 0.5), end: Math.floor(bufferLength * 0.75), color: '#06ffa5', amplitude: 18 }, // High-mid
        { start: Math.floor(bufferLength * 0.75), end: bufferLength, color: '#3a86ff', amplitude: 15 }  // High
      ];

      const baseRadius = 120; // All bands share the same base radius

      // Draw each frequency band as a circular waveform
      bands.forEach(band => {
        const samples = 180; // Number of points around the circle
        const angleStep = (Math.PI * 2) / samples;
        const bandData = dataArray.slice(band.start, band.end);
        
        // Draw only colored outline (no fill)
        ctx.strokeStyle = band.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = band.color;
        
        ctx.beginPath();
        for (let i = 0; i < samples; i++) {
          const dataIndex = Math.floor((i / samples) * bandData.length);
          const amplitude = (bandData[dataIndex] || 0) / 255;
          const angle = angleStep * i;
          
          const waveHeight = amplitude * band.amplitude;
          const distance = baseRadius + waveHeight;
          
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      });

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

export default CircularWaveVisualizer;
