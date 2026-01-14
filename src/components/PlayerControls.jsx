import React from 'react';

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
  onVolumeChange 
}) => {
  return (
    <div style={{maxWidth: '600px', margin: '1.5rem auto', padding: '0 1rem'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <button
          type="button"
          className={`nes-btn ${isPlaying ? 'is-error' : 'is-success'}`}
          onClick={onTogglePlayPause}
          style={{padding: '0.3em 0.6em', minWidth: '40px'}}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div style={{
          flex: 1,
          width: '100%',
          height: '8px',
          backgroundColor: '#444',
          border: '2px solid #000',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }} onClick={onProgressClick}>
          <div style={{
            height: '100%',
            backgroundColor: '#92cc41',
            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            transition: 'width 0.1s linear'
          }} />
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.5rem',
        fontSize: '12px',
        color: '#fff',
        marginLeft: '50px'
      }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem', marginLeft: '50px'}}>
        <span style={{fontSize: '12px', minWidth: '30px'}}>VOL:</span>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          style={{height: '6px', flex: 1}}
        />
      </div>
    </div>
  );
};

export default PlayerControls;
