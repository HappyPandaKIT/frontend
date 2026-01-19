import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const FlowFieldVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Optimized particle count for mobile (500 particles)
    const particleCount = 500;
    const particles = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        life: Math.random(),
        hue: Math.random() * 360
      });
    }

    // Flow field grid (optimized: 20x10 cells)
    const cols = 20;
    const rows = 10;
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    const flowField = [];

    // Initialize flow field
    for (let i = 0; i < cols * rows; i++) {
      flowField.push(0);
    }

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate frequency bands
      const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.15));
      const midRange = dataArray.slice(
        Math.floor(bufferLength * 0.15),
        Math.floor(bufferLength * 0.5)
      );
      const highRange = dataArray.slice(
        Math.floor(bufferLength * 0.5),
        Math.floor(bufferLength * 0.85)
      );

      const bassAvg = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length / 255;
      const midAvg = midRange.reduce((sum, val) => sum + val, 0) / midRange.length / 255;
      const highAvg = highRange.reduce((sum, val) => sum + val, 0) / highRange.length / 255;

      // Overall amplitude controls speed
      const amplitude = (bassAvg + midAvg + highAvg) / 3;

      // Clear with fade for trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update flow field based on frequency
      const time = Date.now() / 1000;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          
          // Different frequencies affect different regions
          const regionX = col / cols;
          const regionY = row / rows;
          
          // Create rotating wind patterns influenced by audio
          const baseAngle = time * 0.5 + regionX * Math.PI + regionY * Math.PI;
          const bassInfluence = Math.sin(regionX * Math.PI * 2) * bassAvg * Math.PI;
          const midInfluence = Math.cos(regionY * Math.PI * 2) * midAvg * Math.PI * 0.5;
          const highInfluence = Math.sin((regionX + regionY) * Math.PI) * highAvg * Math.PI * 0.3;
          
          flowField[idx] = baseAngle + bassInfluence + midInfluence + highInfluence;
        }
      }

      // Update and draw particles
      particles.forEach((particle, idx) => {
        // Get flow field direction at particle position
        const col = Math.floor(particle.x / cellWidth);
        const row = Math.floor(particle.y / cellHeight);
        const fieldIdx = row * cols + col;
        const angle = flowField[fieldIdx] || 0;

        // Apply flow field force
        const speed = 1 + amplitude * 3;
        particle.vx += Math.cos(angle) * 0.2;
        particle.vy += Math.sin(angle) * 0.2;

        // Damping
        particle.vx *= 0.95;
        particle.vy *= 0.95;

        // Update position
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Update life and color
        particle.life += 0.01;
        particle.hue = (particle.hue + highAvg * 2) % 360;

        // Draw particle
        const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const alpha = Math.min(0.8, velocity * 0.3 + amplitude * 0.3);
        
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1.5 + amplitude * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw short trail
        if (velocity > 1) {
          ctx.strokeStyle = `hsla(${particle.hue}, 70%, 50%, ${alpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy * 2);
          ctx.stroke();
        }
      });

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

export default FlowFieldVisualizer;
