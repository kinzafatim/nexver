import React from 'react';
import { PageHeader } from './components/PageHeader';
import CodeViewer from '../../../components/CodeViewer';
import { mockTestbenchCode, mockTestcaseCode } from '../../../services/projectService';
import { ProjectState, AppStatus } from '../../../types';

interface TestbenchTabProps {
    projectState: ProjectState;
    isSimulating: boolean;
    onRunSimulation: () => Promise<void>;
}

const TestbenchTab: React.FC<TestbenchTabProps> = ({ projectState, isSimulating, onRunSimulation }) => {
    const isBusy = isSimulating;

    return (
        <div className="p-6 h-full flex flex-col">
            <PageHeader title="UVM Testbench & Tests">
                <button onClick={() => alert('Downloading files...')} className="px-4 py-2 text-sm font-semibold bg-secondary-200 dark:bg-secondary-700 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition">Download All Files</button>
                <button
                    onClick={onRunSimulation}
                    disabled={projectState.status < AppStatus.TBAndTestsGenerated || isBusy}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Run Simulation &rarr;
                </button>
            </PageHeader>
            <div className="flex-grow overflow-auto space-y-8 pr-2">
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-secondary-800 dark:text-secondary-100">Testbench Skeleton</h3>
                    <div className="h-96">
                        <CodeViewer code={mockTestbenchCode} />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-secondary-800 dark:text-secondary-100">Example Test Case & Sequence</h3>
                    <div className="h-96">
                        <CodeViewer code={mockTestcaseCode} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestbenchTab;
