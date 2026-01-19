import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const InkWaterVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Ink drops and ripples (mobile optimized)
    const inkDrops = [];
    const ripples = [];
    let lastSnareTime = 0;
    let smoothedBass = 0;

    // Metaball-style ink simulation (simplified)
    const inkParticles = [];

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
        Math.floor(bufferLength * 0.8)
      );

      const bassEnergy = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length / 255;
      const midEnergy = midRange.reduce((sum, val) => sum + val, 0) / midRange.length / 255;
      const highEnergy = highRange.reduce((sum, val) => sum + val, 0) / highRange.length / 255;

      smoothedBass = smoothedBass * 0.8 + bassEnergy * 0.2;

      // Clear with water-like fade
      ctx.fillStyle = 'rgba(5, 10, 20, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Detect snare hits (mid-high frequencies spike)
      const snareEnergy = midEnergy + highEnergy;
      const currentTime = Date.now();
      
      if (snareEnergy > 0.6 && currentTime - lastSnareTime > 200) {
        // Add ink drop with realistic ink colors
        const inkColors = [
          220, // Deep blue
          240, // Indigo  
          200, // Navy
          260, // Deep purple-blue
          180  // Dark cyan
        ];
        
        inkDrops.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height / 2 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 30 + Math.random() * 30,
          life: 1,
          hue: inkColors[Math.floor(Math.random() * inkColors.length)]
        });
        lastSnareTime = currentTime;
      }

      // Create ripples from bass
      if (bassEnergy > 0.5 && Math.random() < 0.3) {
        ripples.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 0,
          maxRadius: 100 + bassEnergy * 100,
          life: 1
        });
      }

      // Update and draw ripples
      ripples.forEach((ripple, idx) => {
        ripple.radius += 2 + bassEnergy * 3;
        ripple.life -= 0.015;

        if (ripple.life > 0) {
          ctx.strokeStyle = `rgba(6, 255, 165, ${ripple.life * 0.3})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Remove dead ripples
      ripples.splice(0, ripples.length, ...ripples.filter(r => r.life > 0));

      // Update and draw ink drops
      inkDrops.forEach((drop, idx) => {
        // Apply ripple forces
        ripples.forEach(ripple => {
          const dx = drop.x - ripple.x;
          const dy = drop.y - ripple.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < ripple.radius + 50 && dist > ripple.radius - 20) {
            const force = (ripple.maxRadius - ripple.radius) / ripple.maxRadius * 0.5;
            drop.vx += (dx / dist) * force * smoothedBass;
            drop.vy += (dy / dist) * force * smoothedBass;
          }
        });

        // Apply velocity
        drop.x += drop.vx;
        drop.y += drop.vy;

        // Damping
        drop.vx *= 0.98;
        drop.vy *= 0.98;

        // Fade out
        drop.life -= 0.005;

        // Keep in bounds with bounce
        if (drop.x < 0 || drop.x > canvas.width) drop.vx *= -0.8;
        if (drop.y < 0 || drop.y > canvas.height) drop.vy *= -0.8;
        drop.x = Math.max(0, Math.min(canvas.width, drop.x));
        drop.y = Math.max(0, Math.min(canvas.height, drop.y));

        // Draw ink drop with glow
        if (drop.life > 0) {
          const gradient = ctx.createRadialGradient(
            drop.x, drop.y, 0,
            drop.x, drop.y, drop.size
          );
          
          // Dark, saturated ink colors
          gradient.addColorStop(0, `hsla(${drop.hue}, 70%, 20%, ${drop.life * 0.9})`); // Very dark core
          gradient.addColorStop(0.5, `hsla(${drop.hue + 10}, 75%, 25%, ${drop.life * 0.7})`); // Dark mid
          gradient.addColorStop(1, `hsla(${drop.hue + 15}, 60%, 15%, 0)`); // Very dark edge

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
          ctx.fill();

          // Add smaller particles around main drop (darker)
          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = drop.size * 0.7;
            const px = drop.x + Math.cos(angle) * dist;
            const py = drop.y + Math.sin(angle) * dist;
            
            ctx.fillStyle = `hsla(${drop.hue + i * 15}, 65%, 18%, ${drop.life * 0.5})`; // Dark particles
            ctx.beginPath();
            ctx.arc(px, py, drop.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Remove faded ink drops
      inkDrops.splice(0, inkDrops.length, ...inkDrops.filter(d => d.life > 0));

      // Add ambient glow based on overall audio (darker, ink-stained water)
      const ambientGlow = (bassEnergy + midEnergy + highEnergy) / 3;
      if (ambientGlow > 0.3) {
        ctx.globalAlpha = (ambientGlow - 0.3) * 0.15; // Subtle
        ctx.fillStyle = `hsl(220, 50%, 15%)`; // Deep blue-black
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

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

export default InkWaterVisualizer;
