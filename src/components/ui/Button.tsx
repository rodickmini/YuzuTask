import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'accent' | 'ghost' | 'mint';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-soft',
  accent: 'bg-accent text-white hover:bg-accent/90 shadow-soft',
  ghost: 'bg-transparent text-text-sub hover:bg-warm-dark',
  mint: 'bg-mint text-white hover:bg-mint/90 shadow-soft',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2 text-sm rounded-2xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
};

export default function Button({ variant = 'primary', size = 'md', icon, children, className = '', onClick, type = 'button', disabled }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </motion.button>
  );
}
