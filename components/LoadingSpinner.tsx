import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Chargement...",
  size = 'md',
  color = 'text-violet-500'
}) => {
  const spinnerSizeClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  }[size];

  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  return (
    <div className="flex items-center justify-center p-2">
      <div
        className={`inline-block animate-spin rounded-full border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${spinnerSizeClass} ${color}`}
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Chargement...
        </span>
      </div>
      {message && <p className={`ml-3 ${textSizeClass} text-gray-400`}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
