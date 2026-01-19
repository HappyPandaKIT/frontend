import React, { useState } from 'react';
import './VisualizerContainer.css';
import BarVisualizer from './BarVisualizer';
import CircleVisualizer from './CircleVisualizer';
import WaveformVisualizer from './WaveformVisualizer';
import MatrixRainVisualizer from './MatrixRainVisualizer';
import PulseRingsVisualizer from './PulseRingsVisualizer';
import WormholeVisualizer from './WormholeVisualizer';
import BlocksVisualizer from './BlocksVisualizer';
import OrbitingParticlesVisualizer from './OrbitingParticlesVisualizer';
import NeonGridVisualizer from './NeonGridVisualizer';
import OscilloscopeVisualizer from './OscilloscopeVisualizer';
import CircularWaveVisualizer from './CircularWaveVisualizer';
import SunVisualizer from './SunVisualizer';
import VoronoiVisualizer from './VoronoiVisualizer';
import FractalVisualizer from './FractalVisualizer';
import AttractorVisualizer from './AttractorVisualizer';
import FlowFieldVisualizer from './FlowFieldVisualizer';
import InkWaterVisualizer from './InkWaterVisualizer';
import NeuralNetVisualizer from './NeuralNetVisualizer';
import ExpandingRingsVisualizer from './ExpandingRingsVisualizer';

const VisualizerContainer = ({ analyser }) => {
  const [visualizerType, setVisualizerType] = useState('bars');

  const visualizers = {
    bars: <BarVisualizer analyser={analyser} />,
    circle: <CircleVisualizer analyser={analyser} />,
    waveform: <WaveformVisualizer analyser={analyser} />,
    matrix: <MatrixRainVisualizer analyser={analyser} />,
    pulse: <PulseRingsVisualizer analyser={analyser} />,
    wormhole: <WormholeVisualizer analyser={analyser} />,
    blocks: <BlocksVisualizer analyser={analyser} />,
    particles: <OrbitingParticlesVisualizer analyser={analyser} />,
    neon: <NeonGridVisualizer analyser={analyser} />,
    scope: <OscilloscopeVisualizer analyser={analyser} />,
    circwave: <CircularWaveVisualizer analyser={analyser} />,
    sun: <SunVisualizer analyser={analyser} />,
    voronoi: <VoronoiVisualizer analyser={analyser} />,
    fractal: <FractalVisualizer analyser={analyser} />,
    attractor: <AttractorVisualizer analyser={analyser} />,
    flow: <FlowFieldVisualizer analyser={analyser} />,
    ink: <InkWaterVisualizer analyser={analyser} />,
    neural: <NeuralNetVisualizer analyser={analyser} />,
    rings: <ExpandingRingsVisualizer analyser={analyser} />
  };

  return (
    <div className="nes-container is-dark visualizer-container">
      <div className="visualizer-controls">
        {['bars', 'circle', 'waveform', 'matrix', 'pulse', 'wormhole', 'blocks', 'particles', 'neon', 'scope', 'circwave', 'sun', 'voronoi', 'fractal', 'attractor', 'flow', 'ink', 'neural', 'rings'].map((type) => (
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
