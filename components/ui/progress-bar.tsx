import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
  return (
    <div>
      <div style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  );
};
