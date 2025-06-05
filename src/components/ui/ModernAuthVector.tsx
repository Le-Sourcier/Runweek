import React from 'react';

interface ModernAuthVectorProps {
  className?: string;
}

const ModernAuthVector: React.FC<ModernAuthVectorProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 200 200" // Adjusted viewBox for a potentially more complex design
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      // Consider adding a base color class if not always relying on parent
      // e.g., `text-sky-400 dark:text-sky-300` can be a default here or set by parent
    >
      <defs>
        <linearGradient id="authVectorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" className="text-sky-500 dark:text-sky-400" />
          <stop offset="100%" stopColor="currentColor" className="text-blue-600 dark:text-blue-500" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
         <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
         <feMerge>
             <feMergeNode in="coloredBlur"/>
             <feMergeNode in="SourceGraphic"/>
         </feMerge>
        </filter>
      </defs>

      {/* Abstract Design Example: Overlapping transparent circles with gradient */}
      <circle cx="70" cy="70" r="50" fill="url(#authVectorGradient)" opacity="0.3" />
      <circle cx="130" cy="100" r="60" fill="url(#authVectorGradient)" opacity="0.4" filter="url(#glow)" />
      <path d="M 30 170 Q 100 30 170 170" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.5" className="text-indigo-400 dark:text-indigo-300" />
      <rect x="100" y="50" width="80" height="80" rx="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" className="text-teal-400 dark:text-teal-300" transform="rotate(15 140 90)" />

    </svg>
  );
};

export default ModernAuthVector;
