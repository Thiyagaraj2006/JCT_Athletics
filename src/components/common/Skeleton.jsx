import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--border-color)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ...style
      }}
    />
  );
};

export default Skeleton;
