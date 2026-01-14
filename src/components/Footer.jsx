import React from 'react';

const Footer = () => {
  return (
    <footer style={{marginTop: '3rem'}}>
      <span>System Status:</span>
      <progress className="nes-progress is-pattern" value="100" max="100"></progress>
    </footer>
  );
};

export default Footer;
