import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import './Beatmaker.css';

const BeatmakerContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #cecece;
  border: 4px solid #000;
  box-shadow: 8px 8px 0px #212529;
  position: relative;

  @media (max-width: 768px) {
    margin-top: 1rem;
    padding: 0.5rem;
    border: 3px solid #000;
    box-shadow: 4px 4px 0px #212529;
  }
`;

const Screen = styled.div`
  background-color: #8bac0f;
  color: #0f380f;
  padding: 15px;
  font-size: 14px;
  margin-bottom: 20px;
  border: 4px solid #0f380f;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  box-shadow: inset 4px 4px 0px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 10px;
    min-height: 40px;
  }
`;

const TransportControls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const BPMControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
`;

const SequencerGrid = styled.div`
  overflow-x: auto;
  margin-bottom: 1rem;
  background-color: #212529;
  padding: 10px;
  border: 3px solid #000;

  @media (max-width: 768px) {
    padding: 5px;
  }
`;

const GridTable = styled.div`
  display: grid;
  grid-template-columns: 80px repeat(16, 1fr);
  gap: 2px;
  min-width: 800px;

  @media (max-width: 768px) {
    grid-template-columns: 60px repeat(16, 1fr);
    min-width: 600px;
  }
`;

const TrackLabel = styled.div`
  background-color: #cecece;
  color: #000;
  padding: 8px;
  border: 2px solid #000;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 9px;
    padding: 6px;
  }
`;

const StepCell = styled.div`
  background-color: ${props => props.active ? '#92cc41' : props.highlighted ? '#555' : '#333'};
  border: 2px solid ${props => props.active ? '#76c442' : '#000'};
  cursor: pointer;
  transition: background-color 0.05s;
  aspect-ratio: 1;
  min-width: 30px;
  min-height: 30px;

  &:hover {
    background-color: ${props => props.active ? '#76c442' : '#666'};
  }

  &.playing {
    border-color: #ff006e;
    box-shadow: inset 0 0 10px rgba(255, 0, 110, 0.5);
  }

  @media (max-width: 768px) {
    min-width: 25px;
    min-height: 25px;
  }
`;

const PatternControls = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

// Available drum sounds from DrumMachine
const TRACKS = [
  'Kick',
  'Snare',
  'HiHat',
  'Clap',
  'Tom',
  'Cowbell',
  'Blip',
  'Perc'
];

const STEPS = 16;

const Beatmaker = ({ audioCtx, playSound }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [pattern, setPattern] = useState(() => {
    // Initialize empty pattern
    const initialPattern = {};
    TRACKS.forEach(track => {
      initialPattern[track] = Array(STEPS).fill(false);
    });
    return initialPattern;
  });
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [patternName, setPatternName] = useState('');

  const intervalRef = useRef(null);
  const nextStepTimeRef = useRef(0);
  const audioCtxRef = useRef(null);

  // Store audioCtx reference
  useEffect(() => {
    audioCtxRef.current = audioCtx;
  }, [audioCtx]);

  // Calculate step interval based on BPM (16th notes)
  const stepInterval = (60 / bpm / 4) * 1000; // in milliseconds

  // Toggle step on/off
  const toggleStep = useCallback((track, step) => {
    setPattern(prev => ({
      ...prev,
      [track]: prev[track].map((val, idx) => idx === step ? !val : val)
    }));
  }, []);

  // Clear pattern
  const clearPattern = useCallback(() => {
    const emptyPattern = {};
    TRACKS.forEach(track => {
      emptyPattern[track] = Array(STEPS).fill(false);
    });
    setPattern(emptyPattern);
    setCurrentStep(0);
  }, []);

  // Play current step
  const playCurrentStep = useCallback(() => {
    if (!playSound) return;

    TRACKS.forEach(track => {
      if (pattern[track][currentStep]) {
        playSound(track);
      }
    });
  }, [currentStep, pattern, playSound]);

  // Sequencer loop with precise timing
  useEffect(() => {
    if (!isPlaying) return;

    // Initialize timing
    if (!nextStepTimeRef.current) {
      nextStepTimeRef.current = Date.now();
    }

    const scheduleStep = () => {
      const now = Date.now();
      
      // If we're past the next step time, advance
      if (now >= nextStepTimeRef.current) {
        playCurrentStep();
        setCurrentStep(prev => (prev + 1) % STEPS);
        nextStepTimeRef.current = now + stepInterval;
      }

      intervalRef.current = requestAnimationFrame(scheduleStep);
    };

    intervalRef.current = requestAnimationFrame(scheduleStep);

    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
      }
    };
  }, [isPlaying, playCurrentStep, stepInterval]);

  // Play/Pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      nextStepTimeRef.current = 0;
    } else {
      nextStepTimeRef.current = Date.now();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Stop (pause and reset)
  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    nextStepTimeRef.current = 0;
  }, []);

  // Save pattern
  const savePattern = useCallback(() => {
    if (!patternName.trim()) {
      alert('Please enter a pattern name');
      return;
    }

    const newPattern = {
      id: Date.now(),
      name: patternName,
      bpm: bpm,
      data: { ...pattern }
    };

    setSavedPatterns(prev => [...prev, newPattern]);
    setPatternName('');
    
    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('beatPatterns') || '[]');
    saved.push(newPattern);
    localStorage.setItem('beatPatterns', JSON.stringify(saved));
  }, [pattern, bpm, patternName]);

  // Load pattern
  const loadPattern = useCallback((savedPattern) => {
    setPattern(savedPattern.data);
    setBpm(savedPattern.bpm);
    setCurrentStep(0);
    setIsPlaying(false);
    nextStepTimeRef.current = 0;
  }, []);

  // Delete saved pattern
  const deletePattern = useCallback((patternId) => {
    setSavedPatterns(prev => prev.filter(p => p.id !== patternId));
    
    // Update localStorage
    const saved = JSON.parse(localStorage.getItem('beatPatterns') || '[]');
    const filtered = saved.filter(p => p.id !== patternId);
    localStorage.setItem('beatPatterns', JSON.stringify(filtered));
  }, []);

  // Load saved patterns from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('beatPatterns') || '[]');
    setSavedPatterns(saved);
  }, []);

  // Random pattern generator
  const generateRandomPattern = useCallback(() => {
    const newPattern = {};
    TRACKS.forEach(track => {
      newPattern[track] = Array(STEPS).fill(false).map(() => Math.random() > 0.7);
    });
    setPattern(newPattern);
  }, []);

  return (
    <BeatmakerContainer>
      <Screen>
        {isPlaying ? `PLAYING - STEP ${currentStep + 1}/${STEPS}` : 'BEATMAKER - READY'}
      </Screen>

      <TransportControls>
        <button 
          className={`nes-btn ${isPlaying ? 'is-error' : 'is-success'}`}
          onClick={togglePlay}
        >
          {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
        </button>
        
        <button 
          className="nes-btn is-warning"
          onClick={stop}
        >
          ⏹ STOP
        </button>

        <button 
          className="nes-btn"
          onClick={clearPattern}
        >
          🗑 CLEAR
        </button>

        <button 
          className="nes-btn is-primary"
          onClick={generateRandomPattern}
        >
          🎲 RANDOM
        </button>

        <BPMControl>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>BPM:</label>
          <input
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            style={{ width: '120px' }}
          />
          <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '45px' }}>{bpm}</span>
        </BPMControl>
      </TransportControls>

      <SequencerGrid>
        <GridTable>
          {/* Header - Step numbers */}
          <TrackLabel style={{ backgroundColor: '#212529', color: '#92cc41' }}>TRACK</TrackLabel>
          {Array.from({ length: STEPS }, (_, i) => (
            <TrackLabel 
              key={`step-${i}`}
              style={{ 
                backgroundColor: i % 4 === 0 ? '#92cc41' : '#cecece',
                color: i % 4 === 0 ? '#000' : '#333',
                fontSize: '10px'
              }}
            >
              {i + 1}
            </TrackLabel>
          ))}

          {/* Track rows */}
          {TRACKS.map(track => (
            <React.Fragment key={track}>
              <TrackLabel>{track}</TrackLabel>
              {Array.from({ length: STEPS }, (_, step) => (
                <StepCell
                  key={`${track}-${step}`}
                  active={pattern[track][step]}
                  highlighted={step % 4 === 0}
                  className={isPlaying && step === currentStep ? 'playing' : ''}
                  onClick={() => toggleStep(track, step)}
                />
              ))}
            </React.Fragment>
          ))}
        </GridTable>
      </SequencerGrid>

      <PatternControls>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="nes-input"
            placeholder="Pattern name..."
            value={patternName}
            onChange={(e) => setPatternName(e.target.value)}
            style={{ width: '200px', fontSize: '12px' }}
          />
          <button 
            className="nes-btn is-success"
            onClick={savePattern}
          >
            💾 SAVE
          </button>
        </div>
      </PatternControls>

      {savedPatterns.length > 0 && (
        <div className="saved-patterns">
          <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>SAVED PATTERNS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {savedPatterns.map(saved => (
              <div 
                key={saved.id}
                style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  padding: '8px',
                  border: '2px solid #000'
                }}
              >
                <span style={{ flex: 1, fontSize: '12px', fontWeight: 'bold', color: '#000' }}>
                  {saved.name} ({saved.bpm} BPM)
                </span>
                <button 
                  className="nes-btn is-primary"
                  style={{ fontSize: '10px' }}
                  onClick={() => loadPattern(saved)}
                >
                  LOAD
                </button>
                <button 
                  className="nes-btn is-error"
                  style={{ fontSize: '10px' }}
                  onClick={() => deletePattern(saved.id)}
                >
                  DEL
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </BeatmakerContainer>
  );
};

export default Beatmaker;
