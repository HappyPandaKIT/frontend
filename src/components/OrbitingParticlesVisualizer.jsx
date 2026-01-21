import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const OrbitingParticlesVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Reduced particle count for better performance
    const particleCount = 24;
    const particles = Array(particleCount).fill(0).map((_, i) => ({
      angle: (Math.PI * 2 * i) / particleCount,
      distance: 50 + Math.random() * 80,
      speed: 0.02 + Math.random() * 0.03,
      size: 4 + Math.random() * 2,
      orbitRadius: 25 + Math.random() * 40
    }));

    let time = 0;
    let smoothedAverage = 0;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Get average frequency with smoothing for responsiveness
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length / 255;
      smoothedAverage = smoothedAverage * 0.7 + average * 0.3;

      // Clear canvas with stronger fade for less trail clutter
      ctx.fillStyle = 'rgba(33, 37, 41, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.015;

      particles.forEach((particle, idx) => {
        // Get frequency for this particle
        const freqIdx = Math.floor((idx / particleCount) * dataArray.length);
        const frequency = dataArray[freqIdx] / 255;

        // Update angle - more responsive to audio
        particle.angle += particle.speed + frequency * 0.08;

        // Calculate position with orbital motion
        const baseX = centerX + Math.cos(particle.angle) * particle.distance;
        const baseY = centerY + Math.sin(particle.angle) * particle.distance;
        
        const orbitAngle = time * 2 + particle.angle * 3;
        const orbitMult = 0.5 + frequency * 0.8;
        const x = baseX + Math.cos(orbitAngle) * particle.orbitRadius * orbitMult;
        const y = baseY + Math.sin(orbitAngle) * particle.orbitRadius * orbitMult;

        // Draw particle (no trails for better performance)
        ctx.globalAlpha = 0.7 + frequency * 0.3;
        
        if (frequency > 0.7) ctx.fillStyle = '#ff006e'; // Magenta
        else if (frequency > 0.5) ctx.fillStyle = '#fb5607'; // Orange
        else if (frequency > 0.3) ctx.fillStyle = '#ffbe0b'; // Yellow
        else ctx.fillStyle = '#06ffa5'; // Cyan

        const particleSize = particle.size + frequency * 4;
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();

        // Simplified glow effect
        if (frequency > 0.4) {
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 8 + frequency * 12;
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Draw center with more responsive pulsing
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      gradient.addColorStop(0, '#ff006e');
      gradient.addColorStop(0.5, '#8b2fc9');
      gradient.addColorStop(1, 'rgba(58, 134, 255, 0.5)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 + smoothedAverage * 20, 0, Math.PI * 2);
      ctx.fill();
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

export default OrbitingParticlesVisualizer;
