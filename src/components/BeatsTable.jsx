import React from 'react';

const BeatsTable = ({ beats, currentBeatId, onPlayTrack }) => {
  return (
    <div className="nes-table-responsive">
      <table className="nes-table is-bordered is-centered is-dark" style={{width: '100%'}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titel</th>
            <th>BPM</th>
            <th>Author</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {beats.map((beat) => (
            <tr key={beat.id}>
              <td>{beat.id}</td>
              <td>{beat.title}</td>
              <td>{beat.bpm}</td>
              <td>{beat.author}</td>
              <td>
                <button 
                  type="button" 
                  className="nes-btn"
                  onClick={() => onPlayTrack(beat)}
                  style={{
                    color: currentBeatId === beat.id ? '#92cc41' : 'inherit'
                  }}
                >
                  {currentBeatId === beat.id ? 'PLAYING' : 'SELECT'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BeatsTable;
