import React from 'react';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="nes-container is-error" style={{marginBottom: '1rem'}}>
      <p>{error}</p>
    </div>
  );
};

export default ErrorDisplay;
