import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const WormholeVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let rings = [];
    let time = 0;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Get average frequency for pulse
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length / 255;

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(33, 37, 41, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.02;

      // Create new rings periodically
      if (rings.length === 0 || rings[rings.length - 1].radius > 20) {
        rings.push({
          radius: 1,
          thickness: 3 + average * 5,
          speed: 2 + average * 3
        });
      }

      // Draw and update rings
      rings = rings.filter(ring => ring.radius < Math.max(centerX, centerY) + 50);

      rings.forEach((ring, idx) => {
        // Calculate color based on distance from center
        const normalizedRadius = ring.radius / centerX;
        
        if (normalizedRadius < 0.2) ctx.strokeStyle = '#ff006e'; // Magenta (close)
        else if (normalizedRadius < 0.4) ctx.strokeStyle = '#fb5607'; // Orange
        else if (normalizedRadius < 0.6) ctx.strokeStyle = '#ffbe0b'; // Yellow (mid)
        else if (normalizedRadius < 0.8) ctx.strokeStyle = '#06ffa5'; // Cyan
        else ctx.strokeStyle = '#3a86ff'; // Blue (far)

        // Draw concentric circle
        ctx.lineWidth = ring.thickness;
        ctx.globalAlpha = Math.max(0.3, 1 - normalizedRadius);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw connecting lines for tunnel effect
        if (idx > 0 && idx % 3 === 0) {
          const prevRing = rings[idx - 3];
          const segments = 8;
          
          for (let i = 0; i < segments; i++) {
            const angle = (Math.PI * 2 * i) / segments + time;
            
            const x1 = centerX + Math.cos(angle) * ring.radius;
            const y1 = centerY + Math.sin(angle) * ring.radius;
            const x2 = centerX + Math.cos(angle) * prevRing.radius;
            const y2 = centerY + Math.sin(angle) * prevRing.radius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }

        // Expand ring
        ring.radius += ring.speed;
      });

      ctx.globalAlpha = 1;

      // Draw center vortex
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      gradient.addColorStop(0, '#ff006e');
      gradient.addColorStop(0.5, '#8b2fc9');
      gradient.addColorStop(1, '#3a86ff');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30 + average * 20, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#3a86ff';
      ctx.lineWidth = 2;
      ctx.stroke();
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

export default WormholeVisualizer;
