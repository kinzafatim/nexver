import React from 'react';

export const PageHeader: React.FC<{
    title: string;
    children?: React.ReactNode;
}> = ({ title, children }) => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-secondary-200 dark:border-secondary-800">
        <h2 className="text-2xl font-bold text-secondary-800 dark:text-secondary-100">{title}</h2>
        <div className="flex items-center gap-2">
            {children}
        </div>
    </div>
);
