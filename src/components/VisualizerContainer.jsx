import React, { useState } from 'react';
import Visualizer from './Visualizer';
import CircleVisualizer from './CircleVisualizer';
import WaveformVisualizer from './WaveformVisualizer';
import MatrixRainVisualizer from './MatrixRainVisualizer';
import PulseRingsVisualizer from './PulseRingsVisualizer';

const VisualizerContainer = ({ analyser }) => {
  const [visualizerType, setVisualizerType] = useState('bars');

  const visualizers = {
    bars: <Visualizer analyser={analyser} />,
    circle: <CircleVisualizer analyser={analyser} />,
    waveform: <WaveformVisualizer analyser={analyser} />,
    matrix: <MatrixRainVisualizer analyser={analyser} />,
    pulse: <PulseRingsVisualizer analyser={analyser} />
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem', textAlign: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
        {['bars', 'circle', 'waveform', 'matrix', 'pulse'].map((type) => (
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
