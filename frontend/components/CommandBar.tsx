import React, { useState, useEffect, useRef } from 'react';
import { 
    ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon, NewProjectIcon, 
    FolderIcon, SaveIcon, SettingsIcon, LogOutIcon, DownloadIcon, 
    PdfIcon, ExcelIcon, MarkdownIcon, CutIcon, CopyIcon, PasteIcon,
    GenerateIcon, PlayIcon
} from './Icons';

interface CommandBarProps {
    onNewProject: () => void;
    onOpenProject: () => void;
    onSaveProject: () => void;
    onOpenSettings: () => void;
    onExport: (format: 'pdf' | 'xlsx' | 'md') => void;
    onGenerateVP: () => void;
    onGenerateTB: () => void;
    onRunSim: () => void;
}

const CommandBar: React.FC<CommandBarProps> = (props) => {
    const { onNewProject, onOpenProject, onSaveProject, onOpenSettings, onExport, onGenerateVP, onGenerateTB, onRunSim } = props;
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuBarRef.current && !menuBarRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (menu: string) => {
        setOpenMenu(prev => (prev === menu ? null : menu));
    };

    const MenuItem: React.FC<{
        icon: React.ReactNode, 
        label: string, 
        shortcut?: string, 
        onClick?: () => void,
        hasSubmenu?: boolean
    }> = ({ icon, label, shortcut, onClick, hasSubmenu }) => (
        <button 
            onClick={onClick ? () => { onClick(); setOpenMenu(null); } : undefined} 
            className="w-full flex items-center justify-between text-left px-3 py-1.5 text-sm rounded hover:bg-primary-500 hover:text-white transition-colors group"
        >
            <div className="flex items-center gap-2">
                {icon}
                <span>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {shortcut && <span className="text-xs text-secondary-500 dark:text-secondary-400 group-hover:text-white">{shortcut}</span>}
                {hasSubmenu && <ChevronRightIcon className="w-4 h-4" />}
            </div>
        </button>
    );

    const menuDefs = {
        file: {
            label: 'File',
            items: [
                { icon: <NewProjectIcon className="w-4 h-4" />, label: "New Project...", onClick: onNewProject },
                { icon: <FolderIcon className="w-4 h-4" />, label: "Open Project...", onClick: onOpenProject },
                { type: 'divider' },
                { icon: <SaveIcon className="w-4 h-4" />, label: "Save Project", shortcut: "Ctrl+S", onClick: onSaveProject },
                { label: "Save As...", onClick: () => alert('Save As...') },
                { type: 'divider' },
                { 
                    icon: <DownloadIcon className="w-4 h-4" />,
                    label: "Export", 
                    submenu: [
                        { icon: <PdfIcon className="w-4 h-4" />, label: "Verification Plan as PDF", onClick: () => onExport('pdf') },
                        { icon: <ExcelIcon className="w-4 h-4" />, label: "Verification Plan as XLSX", onClick: () => onExport('xlsx') },
                        { icon: <MarkdownIcon className="w-4 h-4" />, label: "Verification Plan as MD", onClick: () => onExport('md') },
                    ]
                },
                { type: 'divider' },
                { icon: <SettingsIcon className="w-4 h-4" />, label: "Settings...", onClick: onOpenSettings },
                { icon: <LogOutIcon className="w-4 h-4" />, label: "Exit", onClick: () => alert("Exit application") }
            ]
        },
        edit: {
            label: 'Edit',
            items: [
                { label: "Undo", shortcut: "Ctrl+Z", onClick: () => alert('Undo') },
                { label: "Redo", shortcut: "Ctrl+Y", onClick: () => alert('Redo') },
                { type: 'divider' },
                { icon: <CutIcon className="w-4 h-4" />, label: "Cut", shortcut: "Ctrl+X", onClick: () => alert('Cut') },
                { icon: <CopyIcon className="w-4 h-4" />, label: "Copy", shortcut: "Ctrl+C", onClick: () => alert('Copy') },
                { icon: <PasteIcon className="w-4 h-4" />, label: "Paste", shortcut: "Ctrl+V", onClick: () => alert('Paste') }
            ]
        },
        view: {
            label: 'View',
            items: [
                { label: "Toggle Sidebar", onClick: () => alert('Toggle Sidebar') },
                { label: "Toggle Terminal", onClick: () => alert('Toggle Terminal') }
            ]
        },
        run: {
            label: 'Run',
            items: [
                 { icon: <GenerateIcon className="w-4 h-4" />, label: "Generate Verification Plan", onClick: onGenerateVP },
                 { icon: <GenerateIcon className="w-4 h-4" />, label: "Generate Testbench & Tests", onClick: onGenerateTB },
                 { icon: <PlayIcon className="w-4 h-4" />, label: "Run Simulation", onClick: onRunSim },
            ]
        }
    };

    return (
        <div ref={menuBarRef} className="flex-shrink-0 bg-secondary-200 dark:bg-secondary-800 h-10 flex items-center px-4 text-secondary-700 dark:text-secondary-300 text-sm">
            <div className="flex items-center gap-1">
                {Object.entries(menuDefs).map(([key, menu]) => (
                    <div className="relative" key={key}>
                        <button onClick={() => handleMenuClick(key)} className={`px-2 py-0.5 rounded transition-colors ${openMenu === key ? 'bg-secondary-300 dark:bg-secondary-700' : 'hover:bg-secondary-300 dark:hover:bg-secondary-700/60'}`}>
                            {menu.label}
                        </button>
                        {openMenu === key && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-secondary-800 rounded-md shadow-lg z-20 border border-secondary-300 dark:border-secondary-700 p-1">
                                {menu.items.map((item, index) => {
                                    if (item.type === 'divider') return <div key={index} className="my-1 h-px bg-secondary-200 dark:bg-secondary-700"></div>
                                    
                                    if(item.submenu) {
                                        return (
                                            <div key={index} className="relative group/submenu">
                                                <MenuItem icon={item.icon} label={item.label} hasSubmenu />
                                                <div className="absolute left-full top-0 -mt-1 ml-1 w-72 bg-white dark:bg-secondary-800 rounded-md shadow-lg z-20 border border-secondary-300 dark:border-secondary-700 p-1 hidden group-hover/submenu:block">
                                                    {item.submenu.map((subItem, subIndex) => (
                                                         <MenuItem key={subIndex} icon={subItem.icon} label={subItem.label} onClick={subItem.onClick}/>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }
                                    return <MenuItem key={index} {...item} />
                                })}
                            </div>
                        )}
                    </div>
                ))}
                {['Selection', 'Go'].map(item => (
                    <button key={item} className="px-2 py-0.5 rounded hover:bg-secondary-300 dark:hover:bg-secondary-700/60 transition-colors">
                        {item}
                    </button>
                ))}
            </div>
            <div className="flex-1"></div>
        </div>
    );
};

export default CommandBar;