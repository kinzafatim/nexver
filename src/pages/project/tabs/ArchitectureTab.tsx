import React, { useEffect } from 'react';
import { PageHeader } from './components/PageHeader';

declare const mermaid: any;

const uvmMermaidDiagram = `
graph TD
    subgraph tb_top ["tb_top (Testbench Top)"]
        direction LR
        UVM_TEST("UVM Test (base_test)") --> UVM_ENV("UVM Environment (picocpu_env)")
        DUT(PicoCPU DUT)
    end

    subgraph UVM_ENV
        direction LR
        V_SEQUENCER("Virtual Sequencer") --> UVM_AGENT("Memory Agent")
        SCOREBOARD(Scoreboard)
    end
    
    subgraph UVM_AGENT
        direction TB
        SEQUENCER(Sequencer) --> DRIVER(Driver)
        MONITOR(Monitor)
    end
    
    DRIVER -- "Drives mem_transaction" --> DUT
    DUT -- "Monitors Bus" --> MONITOR
    MONITOR -- "Sends collected data" --> SCOREBOARD

    style DUT fill:#1e427a,stroke:#3b92e8,stroke-width:2px,color:#fff
    style UVM_TEST fill:#1e4d94,stroke:#3b92e8,stroke-width:2px,color:#fff
`;

const ArchitectureTab: React.FC = () => {
    useEffect(() => {
        mermaid.contentLoaded();
    }, []);

    return (
        <div className="p-6 h-full flex flex-col">
            <PageHeader title="UVM Testbench Architecture" />
            <div className="flex-grow overflow-auto bg-white dark:bg-secondary-900 rounded-lg p-4 flex items-center justify-center">
                <pre className="mermaid w-full h-full">
                    {uvmMermaidDiagram}
                </pre>
            </div>
        </div>
    );
};

export default ArchitectureTab;
