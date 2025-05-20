'use client'; // This component might be used in Server Components, but syntax highlighting itself is client-side heavy

import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// You can choose any style you like from 'react-syntax-highlighter/dist/esm/styles/prism'
// For example, atomOneDark, coy, dracula, nord, okaidia, solarizedlight, tomorrow, twilight, vs, vs2015 etc.
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Optional: Register only the languages you need to reduce bundle size
// import { jsx, typescript, bash, json, markdown } from 'react-syntax-highlighter/dist/esm/languages/prism';
// SyntaxHighlighter.registerLanguage('jsx', jsx);
// SyntaxHighlighter.registerLanguage('typescript', typescript);
// SyntaxHighlighter.registerLanguage('bash', bash);
// SyntaxHighlighter.registerLanguage('json', json);
// SyntaxHighlighter.registerLanguage('markdown', markdown);

interface CodeBlockProps {
  value: {
    code: string;
    language?: string;
    filename?: string; // If you have a filename field in your Sanity schema
    highlightedLines?: number[]; // If you support line highlighting
  };
}

const CodeBlock: React.FC<CodeBlockProps> = ({ value }) => {
  const { code, language, filename } = value; // _highlightedLines removed as it's unused

  if (!code) {
    return null;
  }

  // Determine the language for syntax highlighting
  // Fallback to 'text' if no language is specified
  const lang = language || 'text';

  return (
    <div className="my-6 rounded-md overflow-hidden shadow-lg bg-[#282c34] group">
      {filename && (
        <div className="text-xs text-gray-400 bg-gray-700 px-4 py-2 select-none">
          {filename}
        </div>
      )}
      <div className="relative">
        <SyntaxHighlighter
          language={lang}
          style={atomDark} // Your chosen style
          customStyle={{
            padding: '1.25rem', // 20px
            margin: '0', // Remove default margin from highlighter itself
            borderRadius: '0', // No rounded corners on the highlighter if the parent div handles it
            backgroundColor: 'transparent', // Use parent's bg
          }}
          codeTagProps={{ style: { fontFamily: 'var(--font-geist-mono)' } }} // Consistent mono font
          showLineNumbers={false} // Set to true to show line numbers
          wrapLines={true}
          // lineProps can be used for line highlighting if 'highlightedLines' is provided
          // lineProps={(lineNumber) => {
          //   const style: React.CSSProperties = { display: 'block' };
          //   if (highlightedLines?.includes(lineNumber)) {
          //     style.backgroundColor = '#00000030'; // Example highlight color
          //   }
          //   return { style };
          // }}
        >
          {String(code).replace(/\n$/, '')} 
        </SyntaxHighlighter>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            // Optional: Show a 'Copied!' toast/message
            // console.log('Code copied to clipboard!');
          }}
          className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Copy code to clipboard"
        >
          Copy
        </button>
      </div>
    </div>
  );
};

export default CodeBlock;
