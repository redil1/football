'use client';

import React, { useState } from 'react';

interface FAQBlockProps {
  value: {
    question: string;
    answer: string;
    _type?: string;
  };
}

const FAQBlock: React.FC<FAQBlockProps> = ({ value }) => {
  const { question, answer } = value;
  const [isOpen, setIsOpen] = useState(false);

  // Debug logging
  console.log('FAQBlock received:', { question, answer, value });

  if (!question || !answer) {
    console.log('Missing question or answer in FAQBlock');
    return null;
  }

  return (
    <div className="my-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-4 text-left font-medium text-gray-900 dark:text-white focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold">{question}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div 
        className={`px-4 pb-4 ${isOpen ? 'block' : 'hidden'}`}
      >
        <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default FAQBlock;
