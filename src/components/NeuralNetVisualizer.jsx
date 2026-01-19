import React, { useRef, useEffect } from 'react';
import './Visualizer.css';

const NeuralNetVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Neural network nodes (mobile optimized: 25 nodes)
    const nodeCount = 25;
    const nodes = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Initialize nodes in organic pattern
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 80 + Math.random() * 120;
      
      nodes.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        baseX: centerX + Math.cos(angle) * radius,
        baseY: centerY + Math.sin(angle) * radius,
        connections: [],
        energy: 0,
        lastPulseTime: 0,
        pulseActive: false
      });
    }

    // Create connections (each node connects to 2-4 nearby nodes)
    nodes.forEach((node, idx) => {
      const connectionCount = 2 + Math.floor(Math.random() * 3);
      const distances = nodes.map((other, otherIdx) => {
        if (idx === otherIdx) return { idx: otherIdx, dist: Infinity };
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        return { idx: otherIdx, dist: Math.sqrt(dx * dx + dy * dy) };
      });
      
      distances.sort((a, b) => a.dist - b.dist);
      
      for (let i = 0; i < connectionCount && i < distances.length; i++) {
        const targetIdx = distances[i].idx;
        if (!node.connections.includes(targetIdx)) {
          node.connections.push(targetIdx);
        }
      }
    });

    // Pulse system (with limits to prevent lag)
    const pulses = [];
    const maxPulses = 3; // Limit concurrent pulses
    let lastBeatTime = 0;
    let smoothedBass = 0;

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

      const bassEnergy = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length / 255;
      const midEnergy = midRange.reduce((sum, val) => sum + val, 0) / midRange.length / 255;
      const highEnergy = highRange.reduce((sum, val) => sum + val, 0) / highRange.length / 255;

      // Smooth bass for more consistent detection
      smoothedBass = smoothedBass * 0.7 + bassEnergy * 0.3;

      // Clear with fade for bioluminescent effect
      ctx.fillStyle = 'rgba(5, 5, 15, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Detect beats (improved threshold and cooldown)
      const currentTime = Date.now();
      if (smoothedBass > 0.5 && currentTime - lastBeatTime > 400 && pulses.length < maxPulses) {
        // Start pulse from random node for variety
        const startNode = Math.floor(Math.random() * Math.min(5, nodeCount)); // Use first 5 nodes only
        
        pulses.push({
          nodeIdx: startNode,
          visitedNodes: new Set([startNode]),
          travelQueue: nodes[startNode].connections.map(targetIdx => ({
            fromIdx: startNode,
            toIdx: targetIdx,
            progress: 0
          })),
          energy: smoothedBass,
          hue: 160 + Math.random() * 80 // Constrain to blue-cyan-green range
        });
        lastBeatTime = currentTime;
      }

      // Update nodes with floating animation
      const time = Date.now() / 1000;
      nodes.forEach((node, idx) => {
        const freqIdx = Math.floor((idx / nodeCount) * bufferLength);
        const frequency = dataArray[freqIdx] / 255;
        
        // Gentle floating motion
        const floatX = Math.sin(time + idx) * 15 * (0.5 + frequency * 0.5);
        const floatY = Math.cos(time * 0.8 + idx) * 15 * (0.5 + frequency * 0.5);
        
        node.x = node.baseX + floatX;
        node.y = node.baseY + floatY;
        
        // Decay energy
        node.energy *= 0.95;
      });

      // Draw connections (dimmed base state)
      nodes.forEach((node, idx) => {
        node.connections.forEach(targetIdx => {
          const target = nodes[targetIdx];
          
          ctx.strokeStyle = `rgba(6, 255, 165, 0.08)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        });
      });

      // Update and draw pulses (with performance limits)
      const maxTravelsPerPulse = 8; // Limit concurrent travels per pulse
      
      pulses.forEach((pulse, pulseIdx) => {
        // Process only first maxTravels for performance
        const travelsToProcess = pulse.travelQueue.slice(0, maxTravelsPerPulse);
        
        travelsToProcess.forEach((travel, travelIdx) => {
          travel.progress += 0.1; // Slightly faster pulse speed

          if (travel.progress >= 1) {
            // Pulse reached node
            const targetNode = nodes[travel.toIdx];
            targetNode.energy = Math.max(targetNode.energy, pulse.energy * 0.8); // Accumulate energy
            pulse.visitedNodes.add(travel.toIdx);

            // Continue pulse to connected nodes (limit propagation)
            if (pulse.visitedNodes.size < 15) { // Max 15 nodes per pulse
              targetNode.connections.forEach(nextIdx => {
                if (!pulse.visitedNodes.has(nextIdx)) {
                  pulse.travelQueue.push({
                    fromIdx: travel.toIdx,
                    toIdx: nextIdx,
                    progress: 0
                  });
                }
              });
            }
          } else {
            // Draw traveling pulse
            const fromNode = nodes[travel.fromIdx];
            const toNode = nodes[travel.toIdx];
            
            const x = fromNode.x + (toNode.x - fromNode.x) * travel.progress;
            const y = fromNode.y + (toNode.y - fromNode.y) * travel.progress;

            // Draw glowing connection
            const alpha = (1 - travel.progress * 0.3) * pulse.energy;
            ctx.strokeStyle = `hsla(${pulse.hue}, 100%, 70%, ${alpha})`;
            ctx.lineWidth = 1.5 + pulse.energy * 1.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Draw pulse point
            ctx.fillStyle = `hsla(${pulse.hue}, 100%, 80%, ${alpha})`;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(x, y, 2.5 + pulse.energy * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Remove completed travels
        pulse.travelQueue = pulse.travelQueue.filter(t => t.progress < 1);
      });

      // Remove completed pulses
      pulses.splice(0, pulses.length, ...pulses.filter(p => p.travelQueue.length > 0));

      ctx.shadowBlur = 0;

      // Draw nodes
      nodes.forEach((node, idx) => {
        const freqIdx = Math.floor((idx / nodeCount) * bufferLength * 0.6); // Use lower frequency range for more response
        const frequency = dataArray[freqIdx] / 255;
        
        const baseSize = 3 + frequency * 5; // Slightly larger base size
        const energyBoost = node.energy * 6; // Reduced boost to prevent huge nodes
        const nodeSize = baseSize + energyBoost;

        // Bioluminescent glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, nodeSize * 2
        );
        
        const hue = 180 + frequency * 60;
        const brightness = 50 + node.energy * 25; // Reduced for subtler effect
        
        gradient.addColorStop(0, `hsla(${hue}, 90%, ${brightness + 30}%, ${0.9 + node.energy * 0.5})`);
        gradient.addColorStop(0.5, `hsla(${hue}, 85%, ${brightness}%, ${0.6 + node.energy * 0.3})`);
        gradient.addColorStop(1, `hsla(${hue}, 70%, ${brightness - 20}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `hsla(${hue}, 100%, ${70 + node.energy * 20}%, 1)`;
        ctx.shadowBlur = 8 + node.energy * 12; // Reduced glow
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();
      });

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
    <canvas ref={canvasRef} width={800} height={400} className="visualizer-canvas" />
  );
};

export default NeuralNetVisualizer;
