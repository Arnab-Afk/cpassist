import React from 'react';
import Squares from './Squares';

const BackgroundSquares: React.FC = () => {
  return (
    <div className="background-squares-container">
      <Squares 
        speed={0.2}
        squareSize={80}
        direction="diagonal"
        borderColor="rgba(255, 255, 255, 0.4)" // Increased opacity for better visibility
        hoverFillColor="rgba(100, 100, 100, 0.3)"
      />
    </div>
  );
};

export default BackgroundSquares;