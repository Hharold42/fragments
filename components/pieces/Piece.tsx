import React from 'react';
import { BlockColor } from '@/lib/data/types';

interface PieceProps {
  color: BlockColor;
  size?: number | string;
}

const COLOR_GRADIENTS = {
  red: {
    inner: { start: '#FF3C2D', end: '#D03024' },
    outer: { start: '#FF6955', end: '#9C140A' }
  },
  blue: {
    inner: { start: '#4581FD', end: '#2968EA' },
    outer: { start: '#528BFF', end: '#0045D4' }
  },
  green: {
    inner: { start: '#8FE98E', end: '#6AD469' },
    outer: { start: '#A9FFA8', end: '#2FA72E' }
  },
  yellow: {
    inner: { start: '#FFDA73', end: '#FFC832' },
    outer: { start: '#FFE191', end: '#E6A900' }
  },
  purple: {
    inner: { start: '#B388FF', end: '#7C4DFF' },
    outer: { start: '#D1B2FF', end: '#5E35B1' }
  },
  orange: {
    inner: { start: '#FFAB48', end: '#FF9D28' },
    outer: { start: '#FFC177', end: '#E97E00' }
  }
};

export const Piece: React.FC<PieceProps> = ({ color, size = 32 }) => {
  // Convert size to number if it's a string like "100%" for calculations
  const numericSize = typeof size === 'number' ? size : 32; // Use a default if size is not a number for calculations

  // Calculate proportional inset and radius based on the 96px Figma reference
  const inset = numericSize * (10 / 96); // 10px inset for 96px size
  const radius = numericSize * (5 / 96); // 5px radius for 96px size

  const gradients = COLOR_GRADIENTS[color];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer square with gradient */}
      <div
        className="absolute inset-0" // Use inset-0 and style for radius
        style={{
          background: `linear-gradient(135deg, ${gradients.outer.start}, ${gradients.outer.end})`,
          borderRadius: radius, // Apply calculated radius
        }}
      />
      {/* Inner square with gradient */}
      <div
        className="absolute" // Use style for inset and radius
        style={{
          inset: inset, // Apply calculated inset
          background: `linear-gradient(135deg, ${gradients.inner.start}, ${gradients.inner.end})`,
          borderRadius: radius, // Apply calculated radius (same as outer for Figma example)
        }}
      />
    </div>
  );
};
