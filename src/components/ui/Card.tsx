import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
};

export default function Card({ children, className = "", title, action }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-medium">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}