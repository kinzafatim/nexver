import React from 'react';

interface SimpleTableProps {
  headers: string[];
  rows: (string | number)[][];
}

const SimpleTable: React.FC<SimpleTableProps> = ({ headers, rows }) => {
  return (
    <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm overflow-auto h-full">
      <table className="w-full text-sm text-left text-secondary-600 dark:text-secondary-300">
        <thead className="bg-secondary-50 dark:bg-secondary-800/50 sticky top-0 uppercase text-xs text-secondary-500 dark:text-secondary-400">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="p-3 font-semibold tracking-wider">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/40">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleTable;