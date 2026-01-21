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
    let rotation = 0;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Get average frequency for pulse
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length / 255;

      // Bass frequency for rotation speed
      const bassSum = dataArray.slice(0, Math.floor(dataArray.length * 0.1))
        .reduce((s, v) => s + v, 0);
      const bassAvg = bassSum / Math.floor(dataArray.length * 0.1) / 255;

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(15, 15, 15, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.02;
      rotation += 0.01 + bassAvg * 0.03; // Rotation speed reacts to bass

      // Create new rings periodically
      if (rings.length === 0 || rings[rings.length - 1].radius > 15) {
        rings.push({
          radius: 1,
          thickness: 2 + average * 4,
          speed: 1.5 + average * 2.5,
          rotation: rotation
        });
      }

      // Draw and update rings
      rings = rings.filter(ring => ring.radius < Math.max(centerX, centerY) + 50);

      // Draw radial lines (tunnel depth effect) - reduced for performance
      const radialSegments = 6;
      ctx.globalAlpha = 0.3;
      ctx.shadowBlur = 0; // No glow on radial lines for performance
      
      for (let i = 0; i < radialSegments; i++) {
        const angle = (Math.PI * 2 * i) / radialSegments + rotation * 0.5;
        
        // Draw from center to edge
        const maxRadius = Math.min(centerX, centerY);
        
        // Simple color instead of gradient for performance
        ctx.strokeStyle = 'rgba(255, 0, 110, 0.3)';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * maxRadius,
          centerY + Math.sin(angle) * maxRadius
        );
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Draw rings with selective glow
      rings.forEach((ring, idx) => {
        // Calculate color based on distance from center
        const normalizedRadius = ring.radius / centerX;
        
        let ringColor;
        if (normalizedRadius < 0.2) ringColor = { r: 255, g: 0, b: 110 }; // Magenta
        else if (normalizedRadius < 0.4) ringColor = { r: 251, g: 86, b: 7 }; // Orange
        else if (normalizedRadius < 0.6) ringColor = { r: 255, g: 190, b: 11 }; // Yellow
        else if (normalizedRadius < 0.8) ringColor = { r: 6, g: 255, b: 165 }; // Cyan
        else ringColor = { r: 58, g: 134, b: 255 }; // Blue

        const colorStr = `rgb(${ringColor.r}, ${ringColor.g}, ${ringColor.b})`;
        ctx.strokeStyle = colorStr;

        // Only add glow to close rings for performance
        if (normalizedRadius < 0.5) {
          ctx.shadowBlur = 5 + average * 10;
          ctx.shadowColor = colorStr;
        } else {
          ctx.shadowBlur = 0;
        }

        // Draw concentric circle
        ctx.lineWidth = ring.thickness;
        ctx.globalAlpha = Math.max(0.4, 1.2 - normalizedRadius);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw spiral segments only on every 3rd ring for performance
        if (idx % 3 === 0 && ring.radius > 10) {
          const spiralSegments = 8; // Reduced from 16
          ctx.shadowBlur = 0; // No glow on spiral segments
          
          for (let i = 0; i < spiralSegments; i++) {
            const angle = (Math.PI * 2 * i) / spiralSegments + ring.rotation;
            const nextAngle = (Math.PI * 2 * (i + 1)) / spiralSegments + ring.rotation;
            
            ctx.lineWidth = ring.thickness * 0.5;
            ctx.globalAlpha = Math.max(0.2, 0.6 - normalizedRadius);
            
            ctx.beginPath();
            ctx.moveTo(
              centerX + Math.cos(angle) * ring.radius,
              centerY + Math.sin(angle) * ring.radius
            );
            ctx.lineTo(
              centerX + Math.cos(nextAngle) * ring.radius,
              centerY + Math.sin(nextAngle) * ring.radius
            );
            ctx.stroke();
          }
        }

        // Expand ring
        ring.radius += ring.speed;
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Draw enhanced center vortex
      const vortexRadius = 25 + average * 25 + bassAvg * 15;
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, vortexRadius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Bright white center
      gradient.addColorStop(0.2, '#ff006e'); // Magenta
      gradient.addColorStop(0.5, '#8b2fc9'); // Purple
      gradient.addColorStop(0.8, '#3a86ff'); // Blue
      gradient.addColorStop(1, 'rgba(58, 134, 255, 0.3)'); // Fade out
      
      // Add intense glow to vortex
      ctx.shadowBlur = 30 + average * 40;
      ctx.shadowColor = '#ff006e';
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, vortexRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Outer ring with pulse
      ctx.shadowBlur = 20;
      ctx.strokeStyle = `rgba(255, 0, 110, ${0.6 + average * 0.4})`;
      ctx.lineWidth = 2 + average * 3;
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

export default WormholeVisualizer;
