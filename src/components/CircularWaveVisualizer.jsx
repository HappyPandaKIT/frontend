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

    // Previous frame data for smoothing
    const smoothedData = new Array(bufferLength).fill(0);
    const smoothingFactor = 0.65;

    // Beat detection variables
    let lastBeatTime = 0;
    let beatPulse = 0;
    let rotation = 0; // Rotation angle

    const points = 256;
    const baseRadius = 100;
    const maxWaveHeight = 80;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Apply temporal smoothing
      for (let i = 0; i < bufferLength; i++) {
        smoothedData[i] = smoothedData[i] * smoothingFactor + dataArray[i] * (1 - smoothingFactor);
      }

      // Beat detection: Check for sudden increase in bass energy
      const bassEnergy = smoothedData.slice(0, Math.floor(bufferLength * 0.15))
        .reduce((sum, val) => sum + val, 0) / Math.floor(bufferLength * 0.15);
      
      const currentTime = Date.now();
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      // Detect beat: strong bass + enough time since last beat
      if (bassEnergy > 180 && timeSinceLastBeat > 300) {
        beatPulse = 1.0;
        lastBeatTime = currentTime;
      }
      
      // Decay the beat pulse over time
      beatPulse *= 0.85;
      
      // Increment rotation for smooth spinning effect
      rotation += 0.01;
      
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply rotation transform
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.translate(-centerX, -centerY);

      // Draw static base circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.fill();

      // Single waveform with logarithmic frequency mapping
      ctx.beginPath();
      
      const wavePoints = [];
      
      // Generate all wave points first
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        
        // Map to only the lower 40% of frequencies
        const progress = i / points;
        const freqProgress = Math.pow(progress, 2) * 0.4;
        
        const freqIndex = Math.floor(freqProgress * bufferLength);
        
        // Get amplitude
        let amplitude = smoothedData[Math.min(freqIndex, bufferLength - 1)] || 0;
        
        // Apply threshold to filter out low values
        if (amplitude < 15) {
          amplitude = 0;
        }
        
        const normalizedAmp = Math.pow(amplitude / 255, 1.2);
        
        // Calculate radius based on frequency content
        const waveRadius = baseRadius + (normalizedAmp * maxWaveHeight);
        
        wavePoints.push({ 
          x: centerX + Math.cos(angle) * waveRadius,
          y: centerY + Math.sin(angle) * waveRadius
        });
      }
      
      // Draw smooth curves using quadratic curves for interpolation
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      
      for (let i = 0; i < wavePoints.length - 1; i++) {
        const current = wavePoints[i];
        const next = wavePoints[i + 1];
        
        const controlX = (current.x + next.x) / 2;
        const controlY = (current.y + next.y) / 2;
        
        ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
      }
      
      // Connect back to start smoothly
      const lastPoint = wavePoints[wavePoints.length - 1];
      const firstPoint = wavePoints[0];
      const controlX = (lastPoint.x + firstPoint.x) / 2;
      const controlY = (lastPoint.y + firstPoint.y) / 2;
      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, controlX, controlY);
      ctx.quadraticCurveTo(controlX, controlY, firstPoint.x, firstPoint.y);

      ctx.closePath();
      
      // Create gradient based on frequency position around circle
      const gradient = ctx.createLinearGradient(centerX - baseRadius, centerY, centerX + baseRadius, centerY);
      gradient.addColorStop(0, '#ff006e');
      gradient.addColorStop(0.25, '#fb5607');
      gradient.addColorStop(0.5, '#ffbe0b');
      gradient.addColorStop(0.75, '#06ffa5');
      gradient.addColorStop(1, '#3a86ff');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#06ffa5';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Restore transform after drawing wave
      ctx.restore();

      // Draw pulsing center based on bass energy
      const centerRadius = 20 + (bassEnergy / 255) * 30 + (beatPulse * 15);
      
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
      centerGradient.addColorStop(0, 'rgba(255, 0, 110, 1)');
      centerGradient.addColorStop(0.5, 'rgba(139, 47, 201, 0.8)');
      centerGradient.addColorStop(1, 'rgba(58, 134, 255, 0.2)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();
      
      // Add center glow ring with beat pulse effect
      const glowIntensity = 0.4 + (bassEnergy / 255) * 0.6 + (beatPulse * 0.4);
      ctx.strokeStyle = `rgba(255, 0, 110, ${glowIntensity})`;
      ctx.lineWidth = 2 + (beatPulse * 3);
      ctx.shadowBlur = 10 + (beatPulse * 20);
      ctx.shadowColor = '#ff006e';
      ctx.stroke();
      ctx.shadowBlur = 0;

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
    <canvas ref={canvasRef} width={400} height={400} className="visualizer-canvas-square" />
  );
};

export default CircularWaveVisualizer;
