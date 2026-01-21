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

const VisualizerContainer = ({ analyser, drumAnalyser }) => {
  const [visualizerType, setVisualizerType] = useState('bars');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Create a merged analyser that combines data from both sources
  // Use state instead of ref to trigger re-renders when analyser is ready
  const [activeAnalyser, setActiveAnalyser] = React.useState(null);
  
  React.useEffect(() => {
    if (!analyser && !drumAnalyser) {
      setActiveAnalyser(null);
      return;
    }

    // Create a virtual analyser object that merges data from both sources
    const mergedAnalyser = {
      frequencyBinCount: (analyser?.frequencyBinCount || drumAnalyser?.frequencyBinCount || 128),
      fftSize: (analyser?.fftSize || drumAnalyser?.fftSize || 256),
      getByteFrequencyData: (dataArray) => {
        const tempArray1 = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
        const tempArray2 = drumAnalyser ? new Uint8Array(drumAnalyser.frequencyBinCount) : null;
        
        if (tempArray1) analyser.getByteFrequencyData(tempArray1);
        if (tempArray2) drumAnalyser.getByteFrequencyData(tempArray2);
        
        // Merge the data by taking the maximum value at each frequency bin
        for (let i = 0; i < dataArray.length; i++) {
          const val1 = tempArray1 ? tempArray1[i] : 0;
          const val2 = tempArray2 ? tempArray2[i] : 0;
          dataArray[i] = Math.max(val1, val2);
        }
      },
      getByteTimeDomainData: (dataArray) => {
        // For time domain, prefer the active analyser or fall back to drum analyser
        if (analyser) {
          analyser.getByteTimeDomainData(dataArray);
        } else if (drumAnalyser) {
          drumAnalyser.getByteTimeDomainData(dataArray);
        }
      }
    };
    
    setActiveAnalyser(mergedAnalyser);
  }, [analyser, drumAnalyser]);

  const visualizers = {
    bars: <BarVisualizer analyser={activeAnalyser} />,
    circle: <CircleVisualizer analyser={activeAnalyser} />,
    waveform: <WaveformVisualizer analyser={activeAnalyser} />,
    matrix: <MatrixRainVisualizer analyser={activeAnalyser} />,
    pulse: <PulseRingsVisualizer analyser={activeAnalyser} />,
    wormhole: <WormholeVisualizer analyser={activeAnalyser} />,
    blocks: <BlocksVisualizer analyser={activeAnalyser} />,
    particles: <OrbitingParticlesVisualizer analyser={activeAnalyser} />,
    neon: <NeonGridVisualizer analyser={activeAnalyser} />,
    scope: <OscilloscopeVisualizer analyser={activeAnalyser} />,
    circwave: <CircularWaveVisualizer analyser={activeAnalyser} />,
    sun: <SunVisualizer analyser={activeAnalyser} />,
    voronoi: <VoronoiVisualizer analyser={activeAnalyser} />,
    fractal: <FractalVisualizer analyser={activeAnalyser} />,
    attractor: <AttractorVisualizer analyser={activeAnalyser} />,
    flow: <FlowFieldVisualizer analyser={activeAnalyser} />,
    ink: <InkWaterVisualizer analyser={activeAnalyser} />,
    neural: <NeuralNetVisualizer analyser={activeAnalyser} />,
    rings: <ExpandingRingsVisualizer analyser={activeAnalyser} />
  };

  // Main visualizers shown as buttons
  const mainVisualizers = ['bars', 'circle', 'waveform', 'matrix', 'blocks', 'attractor'];
  
  // Other visualizers in dropdown
  const otherVisualizers = ['neon', 'pulse', 'wormhole', 'particles', 'scope', 'circwave', 'sun', 'voronoi', 'fractal', 'flow', 'ink', 'neural', 'rings'];

  // Custom display names for visualizers
  const visualizerNames = {
    'neon': 'GRID',
    'circwave': 'CIRCWAVE',
    'scope': 'SCOPE',
    'voronoi': 'CONSTELLATION'
  };

  const getVisualizerName = (type) => {
    return visualizerNames[type] || type.toUpperCase();
  };

  return (
    <div className="nes-container is-dark visualizer-container">
      <div className="visualizer-controls">
        {mainVisualizers.map((type) => (
          <button
            key={type}
            type="button"
            className={`nes-btn visualizer-button ${visualizerType === type ? 'is-primary' : ''}`}
            onClick={() => setVisualizerType(type)}
          >
            {getVisualizerName(type)}
          </button>
        ))}
        
        <div className="visualizer-dropdown-container">
          <button
            type="button"
            className={`nes-btn visualizer-button ${otherVisualizers.includes(visualizerType) ? 'is-primary' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            ▼
          </button>
          {dropdownOpen && (
            <div className="visualizer-dropdown-menu">
              {otherVisualizers.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`visualizer-dropdown-item ${visualizerType === type ? 'is-selected' : ''}`}
                  onClick={() => {
                    setVisualizerType(type);
                    setDropdownOpen(false);
                  }}
                >
                  {getVisualizerName(type)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {visualizers[visualizerType]}
    </div>
  );
};

export default VisualizerContainer;
