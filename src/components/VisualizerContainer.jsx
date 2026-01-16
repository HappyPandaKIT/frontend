import React, { useState } from 'react';
import './VisualizerContainer.css';
import BarVisualizer from './BarVisualizer';
import CircleVisualizer from './CircleVisualizer';
import Circle2Visualizer from './Circle2Visualizer';
import WaveformVisualizer from './WaveformVisualizer';
import MatrixRainVisualizer from './MatrixRainVisualizer';
import PulseRingsVisualizer from './PulseRingsVisualizer';
import WormholeVisualizer from './WormholeVisualizer';
import BlocksVisualizer from './BlocksVisualizer';
import OrbitingParticlesVisualizer from './OrbitingParticlesVisualizer';
import NeonGridVisualizer from './NeonGridVisualizer';
import OscilloscopeVisualizer from './OscilloscopeVisualizer';
import CircularWaveVisualizer from './CircularWaveVisualizer';

const VisualizerContainer = ({ analyser }) => {
  const [visualizerType, setVisualizerType] = useState('bars');

  const visualizers = {
    bars: <BarVisualizer analyser={analyser} />,
    circle: <CircleVisualizer analyser={analyser} />,
    circle2: <Circle2Visualizer analyser={analyser} />,
    waveform: <WaveformVisualizer analyser={analyser} />,
    matrix: <MatrixRainVisualizer analyser={analyser} />,
    pulse: <PulseRingsVisualizer analyser={analyser} />,
    wormhole: <WormholeVisualizer analyser={analyser} />,
    blocks: <BlocksVisualizer analyser={analyser} />,
    particles: <OrbitingParticlesVisualizer analyser={analyser} />,
    neon: <NeonGridVisualizer analyser={analyser} />,
    scope: <OscilloscopeVisualizer analyser={analyser} />,
    circwave: <CircularWaveVisualizer analyser={analyser} />
  };

  return (
    <div className="nes-container is-dark visualizer-container">
      <div className="visualizer-controls">
        {['bars', 'circle', 'circle2', 'waveform', 'matrix', 'pulse', 'wormhole', 'blocks', 'particles', 'neon', 'scope', 'circwave'].map((type) => (
          <button
            key={type}
            type="button"
            className={`nes-btn visualizer-button ${visualizerType === type ? 'is-primary' : ''}`}
            onClick={() => setVisualizerType(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {visualizers[visualizerType]}
    </div>
  );
};

export default VisualizerContainer;
