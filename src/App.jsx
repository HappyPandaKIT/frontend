import './App.css'
import React, { useState, useCallback } from 'react';
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useUploadedTracks } from './hooks/useUploadedTracks'
import Header from './components/Header'
import ErrorDisplay from './components/ErrorDisplay'
import VisualizerContainer from './components/VisualizerContainer'
import DrumMachine from './components/DrumMachine'
import Beatmaker from './components/Beatmaker'
import PlayerControls from './components/PlayerControls'
import FileUploadSection from './components/FileUploadSection'
import Playlist from './components/Playlist'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'

const BEATS = [
  { id: 1, title: "Crystal Cave", bpm: 120, author: "cynicmusic", src: `${import.meta.env.BASE_URL}sounds/song18.mp3` },
  { id: 2, title: "High Stakes, Low Chances", bpm: 140, author: "Ove Meela", src: `${import.meta.env.BASE_URL}sounds/HighStakes.mp3` }
];

function App() {
  const audioPlayer = useAudioPlayer();
  const { uploadedTracks, handleFileUpload, deleteUploadedTrack } = useUploadedTracks();
  const displayError = audioPlayer.error;
  
  // State for sharing audio context and playSound between DrumMachine and Beatmaker
  const [drumAudioContext, setDrumAudioContext] = useState(null);
  const [drumPlaySound, setDrumPlaySound] = useState(null);
  const [drumSetVolume, setDrumSetVolume] = useState(null);
  const [drumAnalyser, setDrumAnalyser] = useState(null);
  const [sharedVolume, setSharedVolume] = useState(0.8); // Shared volume state
  
  // State for switching between DrumMachine, Beatmaker, and Playlist
  const [activeMode, setActiveMode] = useState('drum'); // 'drum', 'beat', or 'playlist'
  const beatmakerRef = React.useRef(null);

  const handleAudioContextReady = useCallback((audioCtx, playSound, setVolume, analyser) => {
    setDrumAudioContext(audioCtx);
    setDrumPlaySound(() => playSound); // Wrap in arrow function to store function reference
    setDrumSetVolume(() => setVolume); // Store the setVolume function
    setDrumAnalyser(analyser); // Store the analyser node
  }, []);

  const handlePlayTrackWithDeletion = (trackId) => {
    if (audioPlayer.currentBeat?.id === trackId) {
      audioPlayer.togglePlayPause();
    }
    deleteUploadedTrack(trackId);
  };

  return (
    <div className="container">
      <Header />
      <ErrorDisplay error={displayError} />
      
      <VisualizerContainer 
        analyser={audioPlayer.analyser} 
        drumAnalyser={drumAnalyser} 
      />
      
      {audioPlayer.currentBeat && (
        <PlayerControls
          isPlaying={audioPlayer.isPlaying}
          onTogglePlayPause={audioPlayer.togglePlayPause}
          currentTime={audioPlayer.currentTime}
          duration={audioPlayer.duration}
          onProgressClick={audioPlayer.handleProgressBarClick}
          volume={audioPlayer.volume}
          onVolumeChange={audioPlayer.setVolume}
        />
      )}
      
      {/* Mode Switcher */}
      <div className="container" style={{ marginBottom: '2rem' }}>
        <div className="nes-container is-rounded is-dark" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1rem', textAlign: 'center', letterSpacing: '2px' }}>
            <i className="nes-icon trophy is-small"></i> CHOOSE YOUR BEAT
          </h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`nes-btn ${activeMode === 'drum' ? 'is-primary' : ''}`}
              onClick={() => {
                if (beatmakerRef.current) {
                  beatmakerRef.current.stop();
                }
                setActiveMode('drum');
              }}
              style={{ 
                minWidth: '160px',
                fontSize: '0.9rem',
                padding: '0.75rem 1.5rem',
                transition: 'all 0.3s ease',
                transform: activeMode === 'drum' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: activeMode === 'drum' ? '0 0 20px rgba(146, 204, 65, 0.6)' : '4px 4px 0px #000'
              }}
            >
              {activeMode === 'drum' && '♪ '}DRUM PAD{activeMode === 'drum' && ' ♪'}
            </button>
            <button
              type="button"
              className={`nes-btn ${activeMode === 'beat' ? 'is-success' : ''}`}
              onClick={() => setActiveMode('beat')}
              style={{ 
                minWidth: '160px',
                fontSize: '0.9rem',
                padding: '0.75rem 1.5rem',
                transition: 'all 0.3s ease',
                transform: activeMode === 'beat' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: activeMode === 'beat' ? '0 0 20px rgba(146, 204, 65, 0.6)' : '4px 4px 0px #000'
              }}
            >
              {activeMode === 'beat' && '♪ '}SEQUENCER{activeMode === 'beat' && ' ♪'}
            </button>
            <button
              type="button"
              className={`nes-btn ${activeMode === 'playlist' ? 'is-warning' : ''}`}
              onClick={() => {
                if (beatmakerRef.current) {
                  beatmakerRef.current.stop();
                }
                setActiveMode('playlist');
              }}
              style={{ 
                minWidth: '160px',
                fontSize: '0.9rem',
                padding: '0.75rem 1.5rem',
                transition: 'all 0.3s ease',
                transform: activeMode === 'playlist' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: activeMode === 'playlist' ? '0 0 20px rgba(146, 204, 65, 0.6)' : '4px 4px 0px #000'
              }}
            >
              {activeMode === 'playlist' && '♪ '}TRACKS{activeMode === 'playlist' && ' ♪'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Keep DrumMachine mounted to maintain audio context, but hide when not active */}
      <div className="container drum-machine-wrapper" style={{ display: activeMode === 'drum' ? 'block' : 'none' }}>
        <DrumMachine 
          onAudioContextReady={handleAudioContextReady} 
          isActive={activeMode === 'drum'}
          sharedVolume={sharedVolume}
          onVolumeChange={setSharedVolume}
        />
      </div>
      
      <div className="container drum-machine-wrapper" style={{ display: activeMode === 'beat' ? 'block' : 'none' }}>
        <Beatmaker 
          ref={beatmakerRef} 
          audioCtx={drumAudioContext} 
          playSound={drumPlaySound} 
          setVolume={drumSetVolume}
          sharedVolume={sharedVolume}
          onVolumeChange={setSharedVolume}
        />
      </div>

      <div className="container" style={{ display: activeMode === 'playlist' ? 'block' : 'none', maxWidth: '800px' }}>
        <Playlist
          beats={BEATS}
          uploadedTracks={uploadedTracks}
          currentBeatId={audioPlayer.currentBeat?.id}
          isPlaying={audioPlayer.isPlaying}
          onPlayTrack={audioPlayer.playTrack}
          onTogglePlayPause={audioPlayer.togglePlayPause}
          onDeleteTrack={handlePlayTrackWithDeletion}
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
}

export default App;