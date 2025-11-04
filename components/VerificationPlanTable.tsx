import React, { useState, useEffect } from 'react';
import { VerificationPlanRow } from '../types';
import { DocumentIcon, EditIcon, SaveIcon, XIcon, BoldIcon, HighlighterIcon } from './Icons';

interface VerificationPlanTableProps {
  data: VerificationPlanRow[];
  onViewSource: (sourceLink: string) => void;
  onUpdateData: (data: VerificationPlanRow[]) => void;
  highlightedRows: Set<number>;
  onHighlightChange: (updater: React.SetStateAction<Set<number>>) => void;
}

const EditorToolbar: React.FC<{ editorId: string }> = ({ editorId }) => {
  const applyStyle = (command: string, value: string | null = null) => {
    const editor = document.getElementById(editorId);
    if (editor) {
      editor.focus();
      // Using deprecated execCommand for simplicity in this context
      document.execCommand(command, false, value);
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary-200 dark:bg-secondary-700 rounded-t-md border-b border-secondary-300 dark:border-secondary-600">
      <button title="Bold" onClick={() => applyStyle('bold')} className="p-1.5 hover:bg-secondary-300 dark:hover:bg-secondary-600 rounded">
        <BoldIcon className="w-4 h-4" />
      </button>
      <button title="Highlight" onClick={() => applyStyle('hiliteColor', 'yellow')} className="p-1.5 hover:bg-secondary-300 dark:hover:bg-secondary-600 rounded">
        <HighlighterIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const VerificationPlanTable: React.FC<VerificationPlanTableProps> = ({ data, onViewSource, onUpdateData, highlightedRows, onHighlightChange }) => {
  const [tableData, setTableData] = useState<VerificationPlanRow[]>(data);
  const [editingRow, setEditingRow] = useState<VerificationPlanRow | null>(null);
  const [fontSize, setFontSize] = useState('text-sm');
  
  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleRowHighlight = (rowId: number) => {
    onHighlightChange(prev => {
        const newSet = new Set(prev);
        if (newSet.has(rowId)) {
            newSet.delete(rowId);
        } else {
            newSet.add(rowId);
        }
        return newSet;
    });
  };

  const clearHighlights = () => {
    onHighlightChange(new Set());
  };

  const handleEdit = (row: VerificationPlanRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRow({ ...row });
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRow(null);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingRow) return;
    const newData = tableData.map(row => (row.id === editingRow.id ? editingRow : row));
    onUpdateData(newData);
    setEditingRow(null);
  };
  
  const handleInputChange = (value: string, field: keyof VerificationPlanRow) => {
      if(editingRow) {
          setEditingRow(prev => prev ? {
              ...prev,
              [field]: value
          } : null);
      }
  }

  const renderCell = (row: VerificationPlanRow, field: keyof VerificationPlanRow) => {
    if (editingRow?.id === row.id) {
        const isRichText = field === 'description' || field === 'verificationGoal';
        const editorId = `editor-${field}-${row.id}`;

        if (isRichText) {
            return (
                <td className="p-2 align-top">
                    <div onClick={e => e.stopPropagation()} className="border border-primary-500 rounded-md">
                        <EditorToolbar editorId={editorId}/>
                        <div
                            id={editorId}
                            contentEditable={true}
                            onInput={(e) => handleInputChange(e.currentTarget.innerHTML, field)}
                            dangerouslySetInnerHTML={{ __html: editingRow[field] }}
                            className="w-full bg-secondary-100 dark:bg-secondary-800 p-2 rounded-b-md outline-none resize-y min-h-[80px] max-h-48 overflow-auto"
                        />
                    </div>
                </td>
            )
        }
      
        return (
            <td className="p-2 align-top">
            <input
                onClick={e => e.stopPropagation()}
                value={String(editingRow[field])}
                onChange={(e) => handleInputChange(e.target.value, field)}
                className={`w-full bg-secondary-100 dark:bg-secondary-700 p-2 rounded border border-primary-500 outline-none`}
                autoFocus={field === 'feature'}
            />
            </td>
        );
    }
    const isRichText = field === 'description' || field === 'verificationGoal';
    if(isRichText) {
        return <td className="p-3 align-top" dangerouslySetInnerHTML={{ __html: row[field] }} />;
    }
    return <td className="p-3 align-top">{row[field]}</td>;
  };


  return (
    <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm h-full flex flex-col">
      <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-800/50">
          <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 mr-2">FONT SIZE</span>
              <button onClick={() => setFontSize('text-xs')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${fontSize === 'text-xs' ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200'}`}>Small</button>
              <button onClick={() => setFontSize('text-sm')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${fontSize === 'text-sm' ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200'}`}>Normal</button>
              <button onClick={() => setFontSize('text-base')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${fontSize === 'text-base' ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200'}`}>Large</button>
          </div>
           <button onClick={clearHighlights} className="px-3 py-1 text-xs font-semibold rounded-md bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 transition-colors">Clear Highlights</button>
      </div>
      <div className="flex-grow overflow-auto">
        <table className={`w-full text-left ${fontSize} text-secondary-600 dark:text-secondary-300`}>
            <thead className="bg-secondary-50 dark:bg-secondary-800/50 sticky top-0 uppercase text-xs text-secondary-500 dark:text-secondary-400">
            <tr>
                <th className="p-3 font-semibold tracking-wider w-1/6">Feature</th>
                <th className="p-3 font-semibold tracking-wider w-1/6">Sub Feature</th>
                <th className="p-3 font-semibold tracking-wider w-2/6">Description</th>
                <th className="p-3 font-semibold tracking-wider w-2/6">Verification Goal</th>
                <th className="p-3 font-semibold tracking-wider text-center">Source</th>
                <th className="p-3 font-semibold tracking-wider text-center">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800">
            {tableData.map((row) => (
                <tr 
                    key={row.id}
                    onClick={() => handleRowHighlight(row.id)}
                    className={`transition-colors cursor-pointer ${highlightedRows.has(row.id) ? 'bg-primary-50 dark:bg-primary-500/10' : 'hover:bg-secondary-50 dark:hover:bg-secondary-800/40'}`}
                >
                {renderCell(row, 'feature')}
                {renderCell(row, 'subFeature')}
                {renderCell(row, 'description')}
                {renderCell(row, 'verificationGoal')}
                <td className="p-3 text-center align-top">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onViewSource(row.source); }}
                        className="text-primary-500 hover:text-primary-400" 
                        title={row.source}
                    >
                    <DocumentIcon className="w-5 h-5" />
                    </button>
                </td>
                <td className="p-3 text-center align-top">
                    {editingRow?.id === row.id ? (
                        <div onClick={e => e.stopPropagation()} className="flex items-center justify-center gap-3">
                            <button onClick={handleSave} className="text-green-500 hover:text-green-400" title="Save"> <SaveIcon className="w-5 h-5" /> </button>
                            <button onClick={handleCancel} className="text-red-500 hover:text-red-400" title="Cancel"> <XIcon className="w-5 h-5" /> </button>
                        </div>
                    ) : (
                        <button onClick={(e) => handleEdit(row, e)} className="text-secondary-500 hover:text-primary-400" title="Edit">
                            <EditIcon className="w-5 h-5" />
                        </button>
                    )}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerificationPlanTable;