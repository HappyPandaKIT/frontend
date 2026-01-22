import React from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import './PlayerControls.css';

const formatTime = (time) => {
  if (!isFinite(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const PlayerControls = ({ 
  isPlaying, 
  onTogglePlayPause, 
  currentTime, 
  duration, 
  onProgressClick, 
  volume, 
  onVolumeChange,
  songTitle
}) => {
  return (
    <div className="player-controls-container">
      <div className="player-controls-main">
        <button
          type="button"
          className={`nes-btn player-controls-button ${isPlaying ? 'is-error' : 'is-success'}`}
          onClick={onTogglePlayPause}
        >
          <span className="btn-icon">{isPlaying ? <PauseIcon /> : <PlayArrowIcon />}</span>
        </button>
        <div className="player-controls-progress" onClick={onProgressClick}>
          <div 
            className="player-controls-progress-bar"
            style={{width: `${duration ? (currentTime / duration) * 100 : 0}%`}}
          />
        </div>
      </div>
      <div className="player-controls-time">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="player-controls-volume">
        <span className="player-controls-volume-label">VOL:</span>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="player-controls-volume-slider"
        />
      </div>
      {songTitle && (
        <div className="player-controls-song-title">
          {songTitle}
        </div>
      )}
    </div>
  );
};

export default PlayerControls;
