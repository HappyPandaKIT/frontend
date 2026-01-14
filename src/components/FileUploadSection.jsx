import React from 'react';

const FileUploadSection = ({ onFileUpload }) => {
  return (
    <div className="nes-container with-title is-rounded" style={{marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto'}}>
      <p className="title">Upload Your Tracks</p>
      <div style={{marginBottom: '1rem'}}>
        <label htmlFor="file-upload" style={{display: 'block', marginBottom: '0.5rem'}}>
          Select MP3 files to upload:
        </label>
        <input 
          id="file-upload"
          type="file" 
          accept="audio/mpeg,.mp3"
          multiple 
          onChange={onFileUpload}
          style={{display: 'block', width: '100%', marginBottom: '1rem'}}
        />
        <small style={{opacity: 0.8}}>Upload one or multiple MP3 files. They will appear below and can be played instantly.</small>
      </div>
    </div>
  );
};

export default FileUploadSection;
