import React from 'react';

interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const AppleButton: React.FC<AppleButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-normal transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-full';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 h-8',
    md: 'text-sm px-4 py-2 h-10',
    lg: 'text-base px-6 py-3 h-12',
  };

  const variantStyles = {
    primary: 'bg-apple-blue hover:bg-[#0077ED] text-white shadow-sm',
    secondary: 'bg-[#F5F5F7] hover:bg-[#E8E8ED] text-apple-text hover:text-black border border-apple-border/40',
    outline: 'border border-apple-blue text-apple-blue hover:bg-apple-blue hover:text-white',
    danger: 'bg-apple-red hover:bg-red-600 text-white',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
