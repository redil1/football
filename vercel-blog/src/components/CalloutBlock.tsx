'use client';

import React from 'react';

interface CalloutBlockProps {
  value: {
    title: string;
    content: string;
    type: 'tip' | 'warning' | 'info' | 'success' | 'error';
  };
}

const CalloutBlock: React.FC<CalloutBlockProps> = ({ value }) => {
  const { title, content, type } = value;
  
  // Define styles based on callout type
  const typeStyles = {
    tip: { 
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-300 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: '💡',
    },
    warning: { 
      bg: 'bg-amber-50 dark:bg-amber-950',
      border: 'border-amber-300 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-200',
      icon: '⚠️',
    },
    info: { 
      bg: 'bg-gray-50 dark:bg-gray-800',
      border: 'border-gray-300 dark:border-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
      icon: 'ℹ️',
    },
    success: { 
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      border: 'border-emerald-300 dark:border-emerald-800',
      text: 'text-emerald-800 dark:text-emerald-200',
      icon: '✅',
    },
    error: { 
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-300 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: '❌',
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className={`my-6 p-4 rounded-lg border ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl" role="img" aria-hidden="true">
          {style.icon}
        </span>
        <div>
          <h3 className={`font-bold text-lg mb-2 ${style.text}`}>
            {title}
          </h3>
          <div className={`${style.text}`}>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalloutBlock;
