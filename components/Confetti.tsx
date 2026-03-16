import React, { useEffect, useState } from 'react';

const CONFETTI_COUNT = 150;
const COLORS = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

interface ConfettiPiece {
  id: number;
  style: React.CSSProperties;
}

const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`,
        backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: `${Math.random() * 8 + 6}px`,
        height: `${Math.random() * 8 + 6}px`,
        opacity: Math.random() + 0.5,
        transform: `rotate(${Math.random() * 360}deg)`,
        animationName: `fall`,
        animationDuration: `${Math.random() * 2 + 3}s`,
        animationDelay: `${Math.random() * 2}s`,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      };
      return { id: i, style };
    });
    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {pieces.map(piece => (
        <div key={piece.id} className="confetti-piece" style={piece.style} />
      ))}
    </div>
  );
};

export default Confetti;
