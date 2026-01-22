import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const CometShowerVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Pre-calculated color palette for performance
    const colorPalette = [
      { r: 255, g: 0, b: 110 },   // Bass: Magenta
      { r: 251, g: 86, b: 7 },    // Low-Mid: Orange
      { r: 255, g: 190, b: 11 },  // Mid: Yellow
      { r: 6, g: 255, b: 165 },   // High-Mid: Cyan
      { r: 58, g: 134, b: 255 }   // High/Treble: Blue
    ];

    const getColorByFrequency = (freqIndex, totalBins) => {
      const normalized = freqIndex / totalBins;
      const colorIndex = Math.min(Math.floor(normalized * 5), 4);
      return colorPalette[colorIndex];
    };

    const comets = [];
    const maxComets = 10;
    let lastBeatTime = 0;

    class Comet {
      constructor(x, freqIndex, frequency) {
        // All spawn at top, horizontal position based on frequency
        const normalizedFreq = freqIndex / dataArray.length;
        this.x = canvas.width * 0.1 + (canvas.width * 0.8 * normalizedFreq); // Bass left, treble right
        this.y = -20; // All start at top
        this.vx = -12; // Doubled speed
        this.vy = 12;  // Doubled speed
        this.freqIndex = freqIndex;
        this.color = getColorByFrequency(freqIndex, dataArray.length); // Color by frequency
        this.trail = [];
        this.maxTrailLength = 5; // Reduced for performance
        this.baseSize = 3;
        this.life = 1;
        this.initialAmplitude = frequency; // Store initial amplitude for scaling
      }

      update(frequency) {
        // Fixed diagonal trajectory
        const speedMultiplier = 1 + frequency * 0.3;
        this.x += this.vx * speedMultiplier;
        this.y += this.vy * speedMultiplier;

        // Store trail position
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
          this.trail.shift();
        }

        // Fade out when leaving screen
        if (this.y > canvas.height - 100 || this.x < -50) {
          this.life -= 0.03;
        }

        return this.y < canvas.height + 20 && this.x > -100 && this.life > 0;
      }

      draw(ctx, frequency) {
        // Size based on frequency range - bass = larger
        const normalizedFreq = this.freqIndex / dataArray.length;
        const baseSize = this.baseSize + (1 - normalizedFreq) * 4;
        
        // Size also scales with amplitude
        const size = baseSize * (0.7 + frequency * 0.6);
        
        // Brightness based on amplitude
        const brightness = 0.5 + frequency * 0.5;
        const color = this.color; // Use frequency-mapped color

        // Simplified trail - just a line
        if (this.trail.length > 1) {
          ctx.strokeStyle = `rgba(${color.r * brightness}, ${color.g * brightness}, ${color.b * brightness}, ${this.life * 0.4})`;
          ctx.lineWidth = size * 0.5;
          ctx.beginPath();
          ctx.moveTo(this.trail[0].x, this.trail[0].y);
          for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
          }
          ctx.stroke();
        }

        // Simple comet head - no blur for performance
        ctx.fillStyle = `rgba(${color.r * brightness}, ${color.g * brightness}, ${color.b * brightness}, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get bass frequency for beat detection
      const bassSum = dataArray.slice(0, Math.floor(dataArray.length * 0.15))
        .reduce((s, v) => s + v, 0);
      const bassAvg = bassSum / Math.floor(dataArray.length * 0.15) / 255;

      // Spawn exactly 1 comet per beat
      const currentTime = Date.now();
      if (bassAvg > 0.35 && currentTime - lastBeatTime > 10 && comets.length < maxComets) {
        // One beat = one comet, position based on frequency
        const freqIndex = Math.floor(Math.random() * dataArray.length);
        const frequency = dataArray[freqIndex] / 255;
        comets.push(new Comet(0, freqIndex, frequency)); // x parameter unused now
        lastBeatTime = currentTime;
      }

      // Update and draw comets
      for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        const frequency = dataArray[comet.freqIndex] / 255;
        
        const alive = comet.update(frequency);
        if (!alive) {
          comets.splice(i, 1);
          continue;
        }
        
        comet.draw(ctx, frequency);
      }
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

export default CometShowerVisualizer;
