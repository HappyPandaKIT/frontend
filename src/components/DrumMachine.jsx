import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

// --- STYLING (Styled Components für Layout + NES.css Integration) ---
const MachineContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #cecece; /* Klassisches Gameboy/MPC Grau */
  border: 4px solid #000;
  box-shadow: 8px 8px 0px #212529;
  position: relative;
`;

const PadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 15px;
  margin-bottom: 1rem;
`;

const Screen = styled.div`
  background-color: #8bac0f; /* Gameboy Grün */
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
`;

// --- DATEN: Pad Konfiguration ---
const PADS = [
  // Original pads
  { id: 'Kick', key: 'Q', url: '/drums/kick.wav' },
  { id: 'Snare', key: 'W', url: '/drums/snare.wav' },
  { id: 'HiHat', key: 'E', url: '/drums/hihat.wav' },
  { id: 'Clap',  key: 'A', url: '/drums/clap.wav' },
  { id: 'Tom',   key: 'S', url: '/drums/tom.wav' },
  { id: 'Cowbell', key: 'D', url: '/drums/cowbell.wav' },
  // New 8-bit sounds
  { id: 'Blip', key: '1', url: '/drums/blip.wav' },
  { id: 'Perc', key: '2', url: '/drums/perc.wav' },
  { id: 'Sweep', key: '3', url: '/drums/sweep.wav' },
  { id: 'Buzz', key: '4', url: '/drums/buzz.wav' },
  { id: 'Pluck', key: '5', url: '/drums/pluck.wav' },
  { id: 'Bass', key: '6', url: '/drums/bass.wav' },
  { id: 'Chime', key: '7', url: '/drums/chime.wav' },
  { id: 'Zap', key: '8', url: '/drums/zap.wav' },
];

const DrumMachine = () => {
  const [display, setDisplay] = useState("READY TO PLAY");
  const [activePad, setActivePad] = useState(null);
  const [volume, setVolume] = useState(0.8);
  
  // Refs für Audio Context und Buffer-Speicher
  const audioCtxRef = useRef(null);
  const buffersRef = useRef({}); // Speichert die geladenen Audiodaten
  const gainNodeRef = useRef(null); // Speichert den Gain Node für Volume Control

  // 1. Audio Context Initialisieren und Sounds laden
  useEffect(() => {
    const initAudio = async () => {
      // Cross-Browser Support
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();

      // Create master gain node for volume control
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(audioCtxRef.current.destination);

      // Sounds laden und decodieren (Asynchron)
      const loadPromises = PADS.map(async (pad) => {
        try {
          const response = await fetch(pad.url);
          if (!response.ok) throw new Error(`Failed to load ${pad.id}`);
          
          const arrayBuffer = await response.arrayBuffer();
          // DecodeAudioData ist Callback-basiert in älteren Browsern, Promise in neuen
          const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
          buffersRef.current[pad.id] = audioBuffer;
        } catch (error) {
          console.warn(`Could not load ${pad.id} - use local files in /public/drums/`);
        }
      });

      await Promise.all(loadPromises);
      setDisplay("READY");
    };

    initAudio();

    // Cleanup (Context schließen wenn Komponente unmountet)
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // 2. Funktion zum Abspielen
  const playSound = useCallback((padId) => {
    if (!audioCtxRef.current) return;

    // Context resume (wichtig für Chrome Autoplay Policy)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    switch(padId) {
      case 'Kick':
        playKick(ctx, now);
        break;
      case 'Snare':
        playSnare(ctx, now);
        break;
      case 'HiHat':
        playHiHat(ctx, now);
        break;
      case 'Clap':
        playClap(ctx, now);
        break;
      case 'Tom':
        playTom(ctx, now);
        break;
      case 'Cowbell':
        playCowbell(ctx, now);
        break;
      case 'Blip':
        playBlip(ctx, now);
        break;
      case 'Perc':
        playPerc(ctx, now);
        break;
      case 'Sweep':
        playSweep(ctx, now);
        break;
      case 'Buzz':
        playBuzz(ctx, now);
        break;
      case 'Pluck':
        playPluck(ctx, now);
        break;
      case 'Bass':
        playBass(ctx, now);
        break;
      case 'Chime':
        playChime(ctx, now);
        break;
      case 'Zap':
        playZap(ctx, now);
        break;
      default:
        break;
    }

    setDisplay(`HIT: ${padId}`);
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 100);
  }, []);

  // Drum synthesis functions
  const playKick = (ctx, now) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(gainNodeRef.current);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.6);
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
  };

  const playSnare = (ctx, now) => {
    // More retro snare with bit reduction effect
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    const bitDepth = 4; // 8-bit style
    for (let i = 0; i < noiseBuffer.length; i++) {
      const random = Math.random() * 2 - 1;
      output[i] = Math.round(random * bitDepth) / bitDepth;
    }
    noise.buffer = noiseBuffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    
    const gain = ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(gainNodeRef.current);
    
    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    noise.start(now);
    noise.stop(now + 0.15);
  };

  const playHiHat = (ctx, now) => {
    // Classic 8-bit hi-hat
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(10000, now);
    filter.frequency.exponentialRampToValueAtTime(7000, now + 0.08);
    
    const gain = ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(gainNodeRef.current);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    noise.start(now);
    noise.stop(now + 0.08);
  };

  const playClap = (ctx, now) => {
    // Double clap with bit crushing
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    const bitDepth = 3;
    for (let i = 0; i < noiseBuffer.length; i++) {
      const random = Math.random() * 2 - 1;
      output[i] = Math.round(random * bitDepth) / bitDepth;
    }
    noise.buffer = noiseBuffer;
    
    const gain = ctx.createGain();
    noise.connect(gain);
    gain.connect(gainNodeRef.current);
    
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    noise.start(now);
    noise.stop(now + 0.12);
  };

  const playTom = (ctx, now) => {
    // 8-bit tom sound (more retro)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(gainNodeRef.current);
    
    osc.type = 'triangle'; // Triangle wave for 8-bit feel
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc.start(now);
    osc.stop(now + 0.12);
  };

  const playCowbell = (ctx, now) => {
    // 8-bit style square wave cowbell
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'square';
    osc2.type = 'square';
    
    osc1.frequency.setValueAtTime(700, now);
    osc2.frequency.setValueAtTime(1100, now);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(gainNodeRef.current);
    
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  };

  // NEW 8-BIT SOUNDS
  const playBlip = (ctx, now) => {
    // Short bright sine wave burst
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(gainNodeRef.current);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.05);
  };

  const playPerc = (ctx, now) => {
    // Sharp square wave with fast decay
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(gainNodeRef.current);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
  };

  const playSweep = (ctx, now) => {
    // Frequency sweep up then down
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(gainNodeRef.current);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  };

  const playBuzz = (ctx, now) => {
    // Square wave with slight frequency modulation
    const osc = ctx.createOscillator();
    const modOsc = ctx.createOscillator();
    const gain = ctx.createGain();
    const modGain = ctx.createGain();
    
    modOsc.frequency.setValueAtTime(5, now); // LFO 5Hz
    modGain.gain.setValueAtTime(20, now); // Modulation depth
    
    modOsc.connect(modGain);
    modGain.connect(osc.frequency);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.connect(gain);
    gain.connect(gainNodeRef.current);
    
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.start(now);
    modOsc.start(now);
    osc.stop(now + 0.2);
    modOsc.stop(now + 0.2);
  };

  const playPluck = (ctx, now) => {
    // Triangle wave with resonant filter
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.connect(filter);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(8, now);
    filter.connect(gain);
    gain.connect(gainNodeRef.current);
    
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc.start(now);
    osc.stop(now + 0.25);
  };

  const playBass = (ctx, now) => {
    // Deep sub bass with pulse wave
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(gainNodeRef.current);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  };

  const playChime = (ctx, now) => {
    // Sine wave harmonic cluster (bell/chime tone)
    const freq1 = 440;
    const freq2 = 880;
    const freq3 = 1320;
    
    [freq1, freq2, freq3].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(gain);
      gain.connect(gainNodeRef.current);
      
      gain.gain.setValueAtTime(0.3 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
    });
  };

  const playZap = (ctx, now) => {
    // White noise burst with highpass sweep
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
    
    const gain = ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(gainNodeRef.current);
    
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    noise.start(now);
    noise.stop(now + 0.15);
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      const pad = PADS.find(p => p.key === key);
      if (pad) {
        playSound(pad.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound]);

  return (
    <MachineContainer className="nes-container is-rounded">
      <div style={{marginBottom: '10px', textAlign: 'center', fontWeight: 'bold'}}>
        MPC-2077
      </div>
      
      <Screen>{display}</Screen>

      <div style={{marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <span>VOL:</span>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{height: '20px', width: '100%'}}
        />
      </div>

      <PadGrid>
        {PADS.map((pad) => (
          <button
            key={pad.id}
            className={`nes-btn ${activePad === pad.id ? 'is-primary' : ''}`}
            onClick={() => playSound(pad.id)}
            style={{
              height: '80px',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'transform 0.1s'
            }}
          >
            <span>{pad.key}</span>
            <span style={{fontSize: '0.6em', marginTop: '5px', opacity: 0.7}}>{pad.id}</span>
          </button>
        ))}
      </PadGrid>

      <div style={{textAlign: 'center', fontSize: '10px', marginTop: '10px'}}>
        PRESS KEYS OR TAP PADS
      </div>
    </MachineContainer>
  );
};

export default DrumMachine;