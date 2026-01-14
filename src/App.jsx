import './App.css'
import React from 'react';
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useUploadedTracks } from './hooks/useUploadedTracks'
import Header from './components/Header'
import ErrorDisplay from './components/ErrorDisplay'
import VisualizerContainer from './components/VisualizerContainer'
import DrumMachine from './components/DrumMachine'
import PlayerControls from './components/PlayerControls'
import FileUploadSection from './components/FileUploadSection'
import UploadedTracksTable from './components/UploadedTracksTable'
import BeatsTable from './components/BeatsTable'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'

const BEATS = [
  { id: 1, title: "Crystal Cave", bpm: 120, author: "cynicmusic", src: "/sounds/song18.mp3" },
  { id: 2, title: "High Stakes, Low Chances", bpm: 140, author: "Ove Meela", src: "/sounds/HighStakes.mp3" }
];

function App() {
  const audioPlayer = useAudioPlayer();
  const { uploadedTracks, handleFileUpload, deleteUploadedTrack } = useUploadedTracks();
  const displayError = audioPlayer.error;

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
      
      <VisualizerContainer analyser={audioPlayer.analyser} />
      <div className="container" style={{maxWidth: '600px', margin: '0 auto'}}>
        <DrumMachine />
      </div>

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

      <hr className="nes-separator" style={{margin: '2rem 0'}} />

      <FileUploadSection onFileUpload={handleFileUpload} />

      <UploadedTracksTable
        tracks={uploadedTracks}
        currentBeatId={audioPlayer.currentBeat?.id}
        onPlayTrack={audioPlayer.playTrack}
        onDeleteTrack={handlePlayTrackWithDeletion}
      />

      <hr className="nes-separator" style={{margin: '2rem 0'}} />
      
      <BeatsTable
        beats={BEATS}
        currentBeatId={audioPlayer.currentBeat?.id}
        onPlayTrack={audioPlayer.playTrack}
      />

      <ContactSection />
      <Footer />
    </div>
  );
}

export default App;