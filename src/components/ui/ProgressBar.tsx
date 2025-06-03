import { motion } from 'framer-motion';

type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
  className?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'success';
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
};

export default function ProgressBar({
  value,
  max,
  label,
  className = "",
  color = 'primary',
  showPercentage = false,
  height = 'md',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const heightClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const colorClass = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    success: 'bg-success',
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-1 text-sm">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass[height]}`}>
        <motion.div 
          className={`${heightClass[height]} ${colorClass[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {!label && showPercentage && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}