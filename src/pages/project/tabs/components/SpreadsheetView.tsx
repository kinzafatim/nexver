import React, { useState, useEffect, useRef } from 'react';
import { SheetData } from '../useVerificationPlanData';
import { BoldIcon, RemoveHighlightIcon } from '../../../../components/Icons';

interface SpreadsheetViewProps {
  sheet: SheetData;
  fontSize: string;
  onCellChange: (rowIndex: number, cellIndex: number, value: string) => void;
}

const EditorToolbar: React.FC = () => {
    const exec = (cmd: string) => (e: React.MouseEvent) => {
        e.preventDefault(); // prevent editor from losing focus
        document.execCommand(cmd, false);
    };

    const setBackColor = (color: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        document.execCommand('backColor', false, color);
    };

    return (
        <div className="absolute -top-9 left-0 z-30 bg-secondary-100 dark:bg-secondary-700 p-1 rounded-md shadow-lg border border-secondary-300 dark:border-secondary-600 flex items-center gap-2">
            <button title="Bold" onMouseDown={exec('bold')} className="p-1.5 hover:bg-secondary-300 dark:hover:bg-secondary-600 rounded">
                <BoldIcon className="w-4 h-4" />
            </button>
            <div className="h-5 w-px bg-secondary-300 dark:bg-secondary-600"></div>
            
            <div className="flex items-center gap-1.5" title="Highlight Color">
                <button onMouseDown={setBackColor('#FBBF24')} style={{backgroundColor: '#FBBF24'}} className="w-5 h-5 rounded-sm border border-black/20 hover:scale-110 transition-transform" title="Highlight Yellow"></button>
                <button onMouseDown={setBackColor('#CBCDF5')} style={{backgroundColor: '#CBCDF5'}} className="w-5 h-5 rounded-sm border border-black/20 hover:scale-110 transition-transform" title="Highlight Lavender"></button>
                <button onMouseDown={setBackColor('#A7F3D0')} style={{backgroundColor: '#A7F3D0'}} className="w-5 h-5 rounded-sm border border-black/20 hover:scale-110 transition-transform" title="Highlight Green"></button>
                <button onMouseDown={setBackColor('#FECACA')} style={{backgroundColor: '#FECACA'}} className="w-5 h-5 rounded-sm border border-black/20 hover:scale-110 transition-transform" title="Highlight Pink"></button>
            </div>

            <div className="h-5 w-px bg-secondary-300 dark:bg-secondary-600"></div>

            <button title="Remove Highlight" onMouseDown={setBackColor('transparent')} className="p-1.5 hover:bg-secondary-300 dark:hover:bg-secondary-600 rounded">
                <RemoveHighlightIcon className="w-4 h-4" />
            </button>
        </div>
    );
};


const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({ sheet, fontSize, onCellChange }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const editingDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingCell && editingDivRef.current) {
      editingDivRef.current.focus();
    }
  }, [editingCell]);

  useEffect(() => {
      // When sheet changes, cancel any active edit
      setEditingCell(null);
  }, [sheet])

  if (!sheet || !sheet.headers || !sheet.rows) {
    return <div className="p-8 text-center text-secondary-500">No data available for this view.</div>;
  }
  
  const { headers, rows, descriptions } = sheet;

  const handleDoubleClick = (row: number, col: number) => {
    setEditValue(String(rows[row][col]));
    setEditingCell({ row, col });
  };

  const handleBlur = () => {
    if (editingCell && editingDivRef.current) {
      onCellChange(editingCell.row, editingCell.col, editingDivRef.current.innerHTML);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };


  return (
    <div className="h-full w-full overflow-auto rounded-lg">
      <table className={`min-w-full text-left border-separate border-spacing-0 ${fontSize} text-primary-900 dark:text-secondary-300`}>
        <thead className="sticky top-0 z-20">
          <tr className="bg-secondary-50 dark:bg-secondary-800 uppercase text-xs text-secondary-700 dark:text-secondary-400">
            {headers.map((header, index) => (
              <th 
                key={header} 
                className={`p-3 font-semibold tracking-wider border-b border-secondary-200 dark:border-secondary-700 whitespace-nowrap ${index === 0 ? 'sticky left-0 z-10 bg-secondary-50 dark:bg-secondary-800' : ''}`}
                style={{minWidth: '200px'}}
                title={descriptions[header]}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="group hover:bg-secondary-50 dark:hover:bg-secondary-800/40">
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className={`p-0 align-top border-b border-secondary-200 dark:border-secondary-800 relative ${cellIndex === 0 ? 'sticky left-0 z-10 bg-white dark:bg-secondary-900 group-hover:bg-secondary-50 dark:group-hover:bg-secondary-800/40' : 'bg-white dark:bg-secondary-900 group-hover:bg-secondary-50 dark:group-hover:bg-secondary-800/40'}`}
                >
                  {editingCell && editingCell.row === rowIndex && editingCell.col === cellIndex ? (
                     <div className="absolute inset-0 z-20 flex flex-col">
                        <EditorToolbar />
                        <div
                            ref={editingDivRef}
                            contentEditable={true}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            dangerouslySetInnerHTML={{ __html: editValue }}
                            className="flex-grow w-full h-full p-3 bg-primary-100 dark:bg-primary-950 border-2 border-primary-500 outline-none overflow-auto"
                        />
                    </div>
                  ) : (
                    <div 
                        className="p-3 w-full h-full min-h-[40px]"
                        onDoubleClick={() => handleDoubleClick(rowIndex, cellIndex)} 
                        dangerouslySetInnerHTML={{ __html: String(cell) }} 
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpreadsheetView;