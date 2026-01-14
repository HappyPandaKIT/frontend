import React, { useState } from 'react';
import Visualizer from './Visualizer';
import CircleVisualizer from './CircleVisualizer';
import WaveformVisualizer from './WaveformVisualizer';
import MatrixRainVisualizer from './MatrixRainVisualizer';
import PulseRingsVisualizer from './PulseRingsVisualizer';
import WormholeVisualizer from './WormholeVisualizer';
import BlocksVisualizer from './BlocksVisualizer';
import OrbitingParticlesVisualizer from './OrbitingParticlesVisualizer';
import NeonGridVisualizer from './NeonGridVisualizer';
import OscilloscopeVisualizer from './OscilloscopeVisualizer';

const VisualizerContainer = ({ analyser }) => {
  const [visualizerType, setVisualizerType] = useState('bars');

  const visualizers = {
    bars: <Visualizer analyser={analyser} />,
    circle: <CircleVisualizer analyser={analyser} />,
    waveform: <WaveformVisualizer analyser={analyser} />,
    matrix: <MatrixRainVisualizer analyser={analyser} />,
    pulse: <PulseRingsVisualizer analyser={analyser} />,
    wormhole: <WormholeVisualizer analyser={analyser} />,
    blocks: <BlocksVisualizer analyser={analyser} />,
    particles: <OrbitingParticlesVisualizer analyser={analyser} />,
    neon: <NeonGridVisualizer analyser={analyser} />,
    scope: <OscilloscopeVisualizer analyser={analyser} />
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem', textAlign: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
        {['bars', 'circle', 'waveform', 'matrix', 'pulse', 'wormhole', 'blocks', 'particles', 'neon', 'scope'].map((type) => (
          <button
            key={type}
            type="button"
            className={`nes-btn ${visualizerType === type ? 'is-primary' : ''}`}
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
