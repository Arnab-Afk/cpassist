import React from 'react';
import Squares from './square';

const BackgroundSquares: React.FC = () => {
  return (
    <div className="background-squares-container">
      <Squares 
        speed={0.2}
        squareSize={80}
        direction="diagonal"
        borderColor="rgba(255, 255, 255, 0.3)" // Increased opacity from 0.15 to 0.3
        hoverFillColor="rgba(100, 100, 100, 0.3)" // Slightly stronger hover effect
      />
    </div>
  );
};

export default BackgroundSquares;