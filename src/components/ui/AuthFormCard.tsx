import React from 'react';
import { motion } from 'framer-motion';

interface AuthFormCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const AuthFormCard: React.FC<AuthFormCardProps> = ({
  children,
  title,
  className,
}) => {
  return (
    <motion.div
      className={`w-full max-w-md px-6 py-8 bg-white shadow-lg rounded-lg ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
    >
      {title && (
        <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      )}
      {children}
    </motion.div>
  );
};

export default AuthFormCard;
