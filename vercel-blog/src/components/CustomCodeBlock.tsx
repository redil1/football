'use client';

import React from 'react';

interface CustomCodeBlockProps {
  value: {
    code: string;
    language?: string;
    filename?: string;
  };
}

const CustomCodeBlock: React.FC<CustomCodeBlockProps> = ({ value }) => {
  const { code, language, filename } = value;

  // Debug logging to see what we're getting from Sanity
  console.log('CustomCodeBlock received:', { code, language, filename, value });

  if (!code) {
    console.log('No code provided to CustomCodeBlock');
    return null;
  }

  // Check if this is executable HTML/JavaScript that should be rendered
  const isExecutable = language === 'html' || 
                      (language === 'javascript' && code.trim().startsWith('<script')) ||
                      (language === 'json' && filename?.toLowerCase().includes('json-ld')) ||
                      code.trim().startsWith('<script');

  // If it's executable HTML/JavaScript (like JSON-LD script), render it directly
  if (isExecutable) {
    console.log('Rendering executable code:', { language, filename, code: code.substring(0, 100) });
    return (
      <div className="my-6" dangerouslySetInnerHTML={{ __html: code }} />
    );
  }

  // Determine the language for syntax highlighting
  // Fallback to 'text' if no language is specified
  const lang = language || 'text';

  return (
    <div className="my-6 rounded-md overflow-hidden shadow-lg bg-gray-900 group">
      {filename && (
        <div className="text-xs text-gray-400 bg-gray-800 px-4 py-2 select-none border-b border-gray-700">
          📄 {filename}
        </div>
      )}
      <div className="relative">
        <pre className="overflow-auto p-5 m-0 bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed">
          <code className={`language-${lang} text-gray-100`} style={{ 
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
          }}>
            {code}
          </code>
        </pre>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              // Optional: You could add a toast notification here
            } catch (err) {
              console.error('Failed to copy code:', err);
            }
          }}
          className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1"
          aria-label="Copy code to clipboard"
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
};

export default CustomCodeBlock;
