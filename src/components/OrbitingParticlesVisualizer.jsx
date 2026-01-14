import React, { useRef, useEffect } from 'react';

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

    // Initialize particles
    const particleCount = 60;
    const particles = Array(particleCount).fill(0).map((_, i) => ({
      angle: (Math.PI * 2 * i) / particleCount,
      distance: 50 + Math.random() * 80,
      speed: 0.01 + Math.random() * 0.02,
      size: 3 + Math.random() * 3,
      orbitRadius: 20 + Math.random() * 60,
      trail: []
    }));

    let time = 0;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Get average frequency
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length / 255;

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(33, 37, 41, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.01;

      particles.forEach((particle, idx) => {
        // Get frequency for this particle
        const freqIdx = Math.floor((idx / particleCount) * dataArray.length);
        const frequency = dataArray[freqIdx] / 255;

        // Update angle
        particle.angle += particle.speed + frequency * 0.05;

        // Calculate position with orbital motion
        const baseX = centerX + Math.cos(particle.angle) * particle.distance;
        const baseY = centerY + Math.sin(particle.angle) * particle.distance;
        
        const orbitAngle = time * 2 + particle.angle * 3;
        const x = baseX + Math.cos(orbitAngle) * particle.orbitRadius * (0.5 + frequency);
        const y = baseY + Math.sin(orbitAngle) * particle.orbitRadius * (0.5 + frequency);

        // Store trail
        particle.trail.push({ x, y });
        if (particle.trail.length > 10) {
          particle.trail.shift();
        }

        // Draw trail
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < particle.trail.length - 1; i++) {
          const t1 = particle.trail[i];
          const t2 = particle.trail[i + 1];
          
          ctx.strokeStyle = frequency > 0.7 ? '#e76e55' : frequency > 0.4 ? '#f7d51d' : '#92cc41';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(t1.x, t1.y);
          ctx.lineTo(t2.x, t2.y);
          ctx.stroke();
        }

        // Draw particle
        ctx.globalAlpha = 0.8 + frequency * 0.2;
        
        if (frequency > 0.7) ctx.fillStyle = '#e76e55'; // Red
        else if (frequency > 0.4) ctx.fillStyle = '#f7d51d'; // Yellow
        else ctx.fillStyle = '#92cc41'; // Green

        ctx.beginPath();
        ctx.arc(x, y, particle.size + frequency * 3, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10 + frequency * 15;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Draw center
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      gradient.addColorStop(0, '#8bac0f');
      gradient.addColorStop(0.5, '#306230');
      gradient.addColorStop(1, 'rgba(15, 56, 15, 0.5)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25 + average * 15, 0, Math.PI * 2);
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
    <div className="nes-container is-dark with-title">
      <p className="title">Visualizer-3000</p>
      <canvas ref={canvasRef} width={400} height={400} style={{width: '100%', maxWidth: '400px', margin: '0 auto', display: 'block'}} />
    </div>
  );
};

export default OrbitingParticlesVisualizer;
