import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white/10 dark:bg-black/20 
        backdrop-blur-xl 
        border border-white/20 dark:border-white/10
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        rounded-2xl 
        p-6 
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:bg-white/20 active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-semibold backdrop-blur-md transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-white shadow-lg hover:shadow-blue-500/30 border border-white/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/20",
    danger: "bg-gradient-to-br from-red-500/80 to-pink-600/80 text-white shadow-lg hover:shadow-red-500/30 border border-white/20"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </div>
      ) : children}
    </button>
  );
};

export const GlassInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`
      w-full bg-black/10 dark:bg-white/5 
      border border-white/10 
      rounded-xl px-4 py-3 
      text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
      backdrop-blur-sm transition-all
      ${props.className || ''}
    `}
  />
);

export const GlassSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className={`
      w-full bg-black/10 dark:bg-white/5 
      border border-white/10 
      rounded-xl px-4 py-3 
      text-gray-800 dark:text-white 
      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
      backdrop-blur-sm transition-all appearance-none
      ${props.className || ''}
    `}
  >
    {props.children}
  </select>
);
