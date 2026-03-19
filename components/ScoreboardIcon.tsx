
import React from 'react';

export const ScoreboardIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a2.25 2.25 0 0 0-2.25 2.25v.01c0 .317.257.569.57.569h12.36a.57.57 0 0 0 .57-.569v-.01a2.25 2.25 0 0 0-2.25-2.25h-1.5Zm-9 0V9.75a2.25 2.25 0 0 1 2.25-2.25h4.5a2.25 2.25 0 0 1 2.25 2.25v9M15 9.75V3s0-1.5-1.5-1.5H10.5S9 1.5 9 3v6.75" />
    </svg>
);
