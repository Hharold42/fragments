import React from "react";
import { BlockColor } from "@/lib/data/types";

interface PieceProps {
  color: BlockColor;
  size?: number | string;
  inset?: number;
  radius?: number;
}

const COLOR_GRADIENTS = {
  red: {
    inner: { start: "#D03024", end: "#FF3C2D" },
    outer: { start: "#FF6955", end: "#9C140A" },
    border: { start: "#FF8B82", end: "#880900" },
  },
  blue: {
    inner: { start: "#2968EA", end: "#4581FD" },
    outer: { start: "#528BFF", end: "#0045D4" },
    border: { start: "#88AFFF", end: "#003EBF" },
  },
  green: {
    inner: { start: "#6AD469", end: "#8FE98E" },
    outer: { start: "#A9FFA8", end: "#2FA72E" },
    border: { start: "#CCFFCC", end: "#1C9A1B" },
  },
  yellow: {
    inner: { start: "#FFC832", end: "#FFDA73" },
    outer: { start: "#FFE191", end: "#E6A900" },
    border: { start: "#FFECB8", end: "#C99300" },
  },
  purple: {
    inner: { start: "#8329C6", end: "#A84DEB" },
    outer: { start: "#C373FF", end: "#6C12AF" },
    border: { start: "#D49AFF", end: "#5D00A3" },
  },
  orange: {
    inner: { start: "#FF9D28", end: "#FFAB48" },
    outer: { start: "#FFC177", end: "#E97E00" },
    border: { start: "#FF9D28", end: "#FFAB48" },
  },
  cyan: {
    inner: { start: "#4FC4D3", end: "#7BF0FF" },
    outer: { start: "#6FE6F5", end: "#00AABF" },
    border: { start: "#92F3FF", end: "#0E95A7" },
  },
};

export const Piece: React.FC<PieceProps> = ({ color, size = 32 }) => {
  // Convert size to number if it's a string like "100%" for calculations
  const numericSize = typeof size === "number" ? size : 32;

  // Calculate proportional inset and radius based on the 96px Figma reference
  const inset = numericSize * (10 / 96); // 10px inset for 96px size
  const radius = numericSize * (5 / 96); // 5px radius for 96px size

  const gradients = COLOR_GRADIENTS[color];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer square with gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${gradients.outer.start}, ${gradients.outer.end})`,
          borderRadius: radius,
        }}
      />
      <div
        className="absolute"
        style={{
          inset: 3,
          background: `linear-gradient(135deg, ${gradients.border.start}, ${gradients.border.end})`,
          borderRadius: radius,
        }}
      >
        <div
          className="absolute"
          style={{
            inset: 2,
            background: `linear-gradient(135deg, ${gradients.inner.start}, ${gradients.inner.end})`,
            borderRadius: radius,
          }}
        />
      </div>
    </div>
  );
};
