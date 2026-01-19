import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const ExpandingRingsVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Ring management
    const rings = [];
    let lastKickTime = 0;
    let lastSnareTime = 0;

    // Smoothing
    let smoothedBass = 0;
    let smoothedHigh = 0;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate frequency bands
      const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.15));
      const midRange = dataArray.slice(
        Math.floor(bufferLength * 0.15),
        Math.floor(bufferLength * 0.4)
      );
      const highRange = dataArray.slice(
        Math.floor(bufferLength * 0.4),
        Math.floor(bufferLength * 0.85)
      );

      const bassEnergy = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length / 255;
      const midEnergy = midRange.reduce((sum, val) => sum + val, 0) / midRange.length / 255;
      const highEnergy = highRange.reduce((sum, val) => sum + val, 0) / highRange.length / 255;

      smoothedBass = smoothedBass * 0.7 + bassEnergy * 0.3;
      smoothedHigh = smoothedHigh * 0.7 + highEnergy * 0.3;

      // Ghosting effect for trails (not full clear)
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentTime = Date.now();

      // Kick drum detection - spawn new ring
      if (smoothedBass > 0.5 && currentTime - lastKickTime > 300) {
        rings.push({
          radius: 0,
          maxRadius: Math.min(canvas.width, canvas.height) * 0.8,
          life: 1,
          speed: 2 + smoothedBass * 3,
          color: Math.random() * 60 + 160, // Cyan to blue range
          thickness: 2,
          type: 'kick'
        });
        lastKickTime = currentTime;
      }

      // Snare detection - spawn different style ring
      if (midEnergy > 0.6 && currentTime - lastSnareTime > 250) {
        rings.push({
          radius: 0,
          maxRadius: Math.min(canvas.width, canvas.height) * 0.6,
          life: 1,
          speed: 3 + midEnergy * 2,
          color: Math.random() * 40 + 300, // Magenta to pink range
          thickness: 4,
          type: 'snare'
        });
        lastSnareTime = currentTime;
      }

      // Update and draw rings
      rings.forEach((ring) => {
        // Expand ring
        ring.radius += ring.speed;
        ring.life = 1 - (ring.radius / ring.maxRadius);

        if (ring.life > 0) {
          // Highs cause jitter/vibration
          const jitterAmount = smoothedHigh * 8;
          const jitterX = (Math.random() - 0.5) * jitterAmount;
          const jitterY = (Math.random() - 0.5) * jitterAmount;

          // Draw ring
          const alpha = ring.life * 0.8;
          const currentThickness = ring.thickness * (0.5 + ring.life * 0.5);
          
          ctx.strokeStyle = `hsla(${ring.color}, 80%, 60%, ${alpha})`;
          ctx.lineWidth = currentThickness;
          ctx.shadowBlur = 15 + smoothedHigh * 20;
          ctx.shadowColor = `hsla(${ring.color}, 90%, 70%, ${alpha * 0.6})`;
          
          ctx.beginPath();
          ctx.arc(
            centerX + jitterX,
            centerY + jitterY,
            ring.radius,
            0,
            Math.PI * 2
          );
          ctx.stroke();

          // Inner glow for depth
          if (ring.life > 0.7) {
            ctx.globalAlpha = (ring.life - 0.7) * 0.4;
            ctx.strokeStyle = `hsla(${ring.color + 20}, 100%, 80%, 1)`;
            ctx.lineWidth = currentThickness * 0.5;
            ctx.shadowBlur = 25;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      ctx.shadowBlur = 0;

      // Remove dead rings
      rings.splice(0, rings.length, ...rings.filter(r => r.life > 0));

      // Draw subtle center point
      const centerPulse = smoothedBass * 15;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 10 + centerPulse
      );
      gradient.addColorStop(0, `hsla(180, 80%, 70%, ${0.6 + smoothedBass * 0.4})`);
      gradient.addColorStop(1, 'hsla(180, 80%, 70%, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10 + centerPulse, 0, Math.PI * 2);
      ctx.fill();

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

export default ExpandingRingsVisualizer;
