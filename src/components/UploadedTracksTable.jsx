import React from 'react';
import './UploadedTracksTable.css';

const UploadedTracksTable = ({ tracks, currentBeatId, onPlayTrack, onDeleteTrack }) => {
  if (tracks.length === 0) return null;

  return (
    <div className="nes-container is-rounded uploaded-tracks-container">
      <h3 className="uploaded-tracks-title">Your Uploads ({tracks.length})</h3>
      <div className="nes-table-responsive">
        <table className="nes-table is-bordered is-centered is-dark" style={{width: '100%'}}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Action</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr key={track.id}>
                <td>{track.title}</td>
                <td>{track.author}</td>
                <td>
                  <button 
                    type="button" 
                    className={`nes-btn ${currentBeatId === track.id ? 'uploaded-tracks-playing' : ''}`}
                    onClick={() => onPlayTrack(track)}
                  >
                    {currentBeatId === track.id ? 'PLAYING' : 'SELECT'}
                  </button>
                </td>
                <td>
                  <button 
                    type="button" 
                    className="nes-btn is-error uploaded-tracks-delete-btn"
                    onClick={() => onDeleteTrack(track.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadedTracksTable;
