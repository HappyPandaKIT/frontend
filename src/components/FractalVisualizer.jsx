import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const FractalVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Smoothing for stable animation (less smoothing = more responsive)
    let smoothedIntensity = 0;
    let smoothedBass = 0;
    const smoothingFactor = 0.5; // Reduced for more responsiveness

    // Julia set parameters
    let zoom = 1;
    let cX = -0.7;
    let cY = 0.27015;
    let moveX = 0;
    let moveY = 0;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate overall intensity
      const avgIntensity = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength / 255;
      smoothedIntensity = smoothedIntensity * smoothingFactor + avgIntensity * (1 - smoothingFactor);

      // Calculate bass for zoom control
      const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.15));
      const bassEnergy = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length / 255;
      smoothedBass = smoothedBass * smoothingFactor + bassEnergy * (1 - smoothingFactor);

      // Adjust fractal parameters based on audio (more dramatic)
      zoom = 0.9 + smoothedBass * 1.5; // Zoom in with bass (0.9 - 2.4x)
      const maxIterations = Math.floor(20 + smoothedIntensity * 30); // 20-50 iterations (reduced for performance and simplicity)

      // Slowly rotate Julia set parameters (faster rotation)
      const time = Date.now() / 3000; // Faster rotation
      cX = -0.7 + Math.cos(time) * 0.3 * smoothedIntensity; // Larger movement
      cY = 0.27015 + Math.sin(time) * 0.3 * smoothedIntensity;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Render at lower resolution for better performance (every 2 pixels)
      const pixelStep = 2;

      for (let x = 0; x < canvas.width; x += pixelStep) {
        for (let y = 0; y < canvas.height; y += pixelStep) {
          // Map pixel to complex plane
          let zx = (x - canvas.width / 2) / (0.5 * zoom * canvas.width) + moveX;
          let zy = (y - canvas.height / 2) / (0.5 * zoom * canvas.height) + moveY;

          let iteration = 0;
          const maxBailout = 4;

          // Julia set iteration
          while (zx * zx + zy * zy < maxBailout && iteration < maxIterations) {
            const tmp = zx * zx - zy * zy + cX;
            zy = 2.0 * zx * zy + cY;
            zx = tmp;
            iteration++;
          }

          // Color based on iterations and audio
          const idx = (y * canvas.width + x) * 4;
          
          if (iteration === maxIterations) {
            // Inside set - dark
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
            data[idx + 3] = 255;
          } else {
            // Outside set - icy color scheme (blues, whites, cyans)
            const ratio = iteration / maxIterations;
            
            // Ice color palette: deep blue to bright cyan to white
            const hue = 180 + ratio * 60; // Cyan (180°) to light blue (240°)
            const saturation = 70 - ratio * 40; // High saturation to lower (more white)
            const lightness = 60 + ratio * 35; // Medium to very bright (ice crystals)

            // Convert HSL to RGB
            const h = hue / 360;
            const s = saturation / 100;
            const l = lightness / 100;
            
            let r, g, b;
            if (s === 0) {
              r = g = b = l;
            } else {
              const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
              };
              const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
              const p = 2 * l - q;
              r = hue2rgb(p, q, h + 1/3);
              g = hue2rgb(p, q, h);
              b = hue2rgb(p, q, h - 1/3);
            }

            // Fill the pixel block
            for (let dy = 0; dy < pixelStep && y + dy < canvas.height; dy++) {
              for (let dx = 0; dx < pixelStep && x + dx < canvas.width; dx++) {
                const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                data[idx] = r * 255;
                data[idx + 1] = g * 255;
                data[idx + 2] = b * 255;
                data[idx + 3] = 255;
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Stronger glow overlay for high intensity moments (ice glow)
      if (smoothedIntensity > 0.5) {
        ctx.globalAlpha = (smoothedIntensity - 0.5) * 0.8; // More visible glow
        ctx.fillStyle = `hsl(190, 90%, 80%)`; // Bright icy cyan-white
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

export default FractalVisualizer;
