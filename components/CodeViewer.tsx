

import React from 'react';

interface CodeViewerProps {
  code: string;
  language?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, language = 'systemverilog' }) => {
  const keywords = ['module', 'class', 'import', 'bit', 'logic', 'initial', 'forever', 'task', 'function', 'super', 'extends', 'virtual', 'endmodule', 'endclass', 'begin', 'end', 'repeat'];
  const types = ['uvm_test', 'uvm_component', 'uvm_phase', 'uvm_sequence', 'string', 'int'];
  
  const highlight = (line: string) => {
    // Handle comments first
    if (line.trim().startsWith('//')) {
      return <span className="text-green-500">{line}</span>;
    }

    return line.split(/(\s+|[;()\[\]{}])/)
      .map((word, index) => {
        if (keywords.includes(word)) {
          return <span key={index} className="text-primary-400 font-semibold">{word}</span>;
        }
        if (types.includes(word)) {
          return <span key={index} className="text-secondary-400">{word}</span>;
        }
        if (line.includes(`\`include`) && word.startsWith('"')) {
            return <span key={index} className="text-amber-400">{word}</span>
        }
        if (!isNaN(Number(word))) {
          return <span key={index} className="text-secondary-400">{word}</span>;
        }
        return <span key={index}>{word}</span>;
      });
  };

  return (
    <div className="bg-secondary-900 rounded-lg p-4 font-mono text-sm text-secondary-300 overflow-auto h-full">
      <pre>
        <code>
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-secondary-600 w-10 text-right pr-4 select-none">{i + 1}</span>
              <span className="flex-1">{highlight(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default CodeViewer;