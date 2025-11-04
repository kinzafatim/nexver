import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { InfoIcon, SuccessIcon, WarningIcon, ErrorIcon } from './Icons';

interface TerminalProps {
  style: React.CSSProperties;
  onClose: () => void;
  logs: LogEntry[];
}

const LogIcon: React.FC<{ type: LogEntry['type'] }> = ({ type }) => {
    const className="w-4 h-4 flex-shrink-0";
    switch(type){
        case 'success': return <SuccessIcon className={`${className} text-green-500`} />;
        case 'warning': return <WarningIcon className={`${className} text-yellow-500`} />;
        case 'error': return <ErrorIcon className={`${className} text-red-500`} />;
        case 'info':
        default:
            return <InfoIcon className={`${className} text-primary-500`} />;
    }
}

const Terminal: React.FC<TerminalProps> = ({ style, onClose, logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  return (
    <div
      style={style}
      className="bg-secondary-50 dark:bg-secondary-950 text-secondary-800 dark:text-secondary-300 font-mono text-sm flex flex-col w-full"
    >
      <div className="flex-shrink-0 p-2 bg-secondary-200 dark:bg-secondary-800/50 flex items-center justify-between text-xs border-b border-secondary-300 dark:border-secondary-800">
          <span className="font-semibold text-secondary-700 dark:text-secondary-300">LOGS</span>
          <button onClick={onClose} className="text-secondary-500 hover:text-secondary-900 dark:hover:text-white text-lg leading-none">&times;</button>
      </div>
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 text-xs">
            <LogIcon type={log.type} />
            <span className="text-secondary-700 dark:text-secondary-400 select-none">{formatTimestamp(log.timestamp)}</span>
            <p className="flex-1 whitespace-pre-wrap leading-relaxed">{log.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;