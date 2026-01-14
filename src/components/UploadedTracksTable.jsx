import React from 'react';

const UploadedTracksTable = ({ tracks, currentBeatId, onPlayTrack, onDeleteTrack }) => {
  if (tracks.length === 0) return null;

  return (
    <div className="nes-container is-rounded" style={{marginBottom: '2rem', maxWidth: '100%'}}>
      <h3 style={{marginTop: 0, marginBottom: '1rem'}}>Your Uploads ({tracks.length})</h3>
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
                    className="nes-btn"
                    onClick={() => onPlayTrack(track)}
                    style={{
                      color: currentBeatId === track.id ? '#92cc41' : 'inherit'
                    }}
                  >
                    {currentBeatId === track.id ? 'PLAYING' : 'SELECT'}
                  </button>
                </td>
                <td>
                  <button 
                    type="button" 
                    className="nes-btn is-error"
                    onClick={() => onDeleteTrack(track.id)}
                    style={{fontSize: '0.8em', padding: '0.3em 0.6em'}}
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
