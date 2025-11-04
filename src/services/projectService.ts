
import { Project, GeminiVpEntry, PdfCoverageRow } from "../types";

// --- MOCK DATABASE ---

const mockGeminiVpFeature1: GeminiVpEntry = {
    "Feature ID": "F001",
    "Feature Name": "Baud Rate Generation",
    "Sub Feature": "Baud Rate Divisor Configuration",
    "Spec Version": "1.2",
    "Requirement Location": "spec.pdf#page=12",
    "Description": "The UART contains a programmable baud rate generator. The baud rate is configured by writing a 16-bit divisor value to the BAUD_DIV register.",
    "Verification Goal": "Verify that the baud rate generator produces the correct clock signal for various divisor values, including minimum, maximum, and typical settings.",
    "Test Type": "constrained random",
    "Coverage Method": "functional, covergroups on BAUD_DIV register values, assertion checks for timing",
    "UVM Components Involved": "uart_agent, uart_driver, uart_monitor, uart_sequencer, scoreboard",
    "Pass/Fail Criteria": "The measured output baud rate must be within 2% of the expected baud rate calculated from the divisor.",
    "Sequences Coverage": "write_baud_rate_sequence, check_baud_rate_sequence",
    "Link to Register Value Coverage": "RVC-F001",
    "Link to Register Coverage Information": "RCI-F001",
    "Traceability": { "test_name": "baud_rate_tests", "sequence_name": "write_baud_rate_sequence", "agent_name": "uart_agent", "covergroup_name": "baud_div_cg" },
    "Test Case Coverage": "baud_rate_min_max_test, baud_rate_random_test",
    "Target Register and Justification": "BAUD_DIV: To configure the baud rate for testing.",
    "Link to Coverage": "coverage_report.html#baud_div_cg",
    "Testcase Range": { "min": "Divisor=2", "mid": "Divisor=104", "max": "Divisor=65535" },
    "Testcase Design": "Write-read-verify approach on the configuration register, followed by functional check of the output.",
    "Testcase Steps": "Configure divisor, send data, measure output bit rate.",
    "Testcase Inputs": "Divisor values.",
    "Testcase Outputs": "Serial data stream tx_o.",
    "Constraints": "Divisor must be >= 2.",
    "Randomization Constraints and Rationale": "Constrain divisor to valid range [2:65535] to avoid DUT entering an undefined state.",
    "Sequence Implementation Notes": "Sequence should have a parameter for the divisor value.",
    "Scoreboard and Checker": { "scoreboard_checks": "N/A for this test.", "new_checkers": "baud_rate_checker: Measures bit period on tx_o and compares against expected value." },
    "Link to Test Cases": "TC-F001",
    "Link to Ports": "PI-F001",
    "Link to PDF Coverage": "PDF-F001",
    "Port Information": [
        { "Feature ID": "F001", "Feature Name": "Baud Rate Generation", "Sub Feature": "Baud Rate Divisor Configuration", "Port Name": "wb_clk_i", "Direction": "input", "Width": "1", "Description": "Wishbone clock", "Randomization": "no", "Constraints": "N/A", "Related Test Types": "all" },
        { "Feature ID": "F001", "Feature Name": "Baud Rate Generation", "Sub Feature": "Baud Rate Divisor Configuration", "Port Name": "tx_o", "Direction": "output", "Width": "1", "Description": "UART transmit data", "Randomization": "N/A", "Constraints": "N/A", "Related Test Types": "all" }
    ],
    "Test Cases": [{
        "Feature ID": "F001", "Feature Name": "Baud Rate Generation", "Sub Feature": "Baud Rate Divisor Configuration", "TestCaseName": "baud_rate_min_max_test",
        "Scenario": "Write min and max valid values to BAUD_DIV and measure output frequency.",
        "Traceability.TestName": "baud_rate_tests", "Traceability.SequenceName": "write_baud_rate_sequence", "Traceability.AgentName": "uart_agent", "Traceability.CovergroupName": "baud_div_cg",
        "Inputs": "BAUD_DIV = 0x0002, BAUD_DIV = 0xFFFF", "ExpectedOutputs": "Correct baud rate on tx_o within 2% tolerance.",
        "Steps": "1. Write 0x0002 to BAUD_DIV. 2. Transmit data. 3. Monitor tx_o and measure bit period. 4. Write 0xFFFF to BAUD_DIV. 5. Transmit data. 6. Monitor tx_o and measure bit period.",
        "Constraints": "N/A", "ScoreboardChecks": "Timing check on tx_o bit transitions."
    }],
    "Register Coverage Information": [{
        "Feature ID": "F001", "Feature Name": "Baud Rate Generation", "Sub Feature": "Baud Rate Divisor Configuration", "Register Name": "BAUD_DIV",
        "Address": "0x04", "Access": "R/W", "Reset Value": "0x0068", "Fields": "DIVISOR[15:0]",
        "Description": "Sets the divisor for baud rate generation.", "Related Test Cases": "baud_rate_min_max_test, baud_rate_random_test"
    }],
    "Register Value Coverage": [
        {"Feature ID": "F001", "Feature Name": "Baud Rate Generation", "Sub Feature": "Baud Rate Divisor Configuration", "Register Names": "BAUD_DIV", "Covergroups": "baud_div_cg", "Valid Values": "[0x0002 : 0xFFFF]", "Invalid Values": "[0x0000, 0x0001]", "Bin Name": "low_range", "Bin Values": "[2:1023]", "Bin Type": "range", "Bin Description": "Verify high baud rates", "Cross Name": "", "Cross Description": ""},
        {"Feature ID": "F001", "Feature Name": "Baud Rate Generation", "Sub Feature": "Baud Rate Divisor Configuration", "Register Names": "BAUD_DIV", "Covergroups": "baud_div_cg", "Valid Values": "[0x0002 : 0xFFFF]", "Invalid Values": "[0x0000, 0x0001]", "Bin Name": "edge_case_min", "Bin Values": "[2:3]", "Bin Type": "range", "Bin Description": "Verify minimum valid divisor", "Cross Name": "", "Cross Description": ""}
    ],
};

const mockGeminiVpFeature2: GeminiVpEntry = {
    ...mockGeminiVpFeature1,
    "Feature ID": "F002",
    "Feature Name": "TX FIFO",
    "Sub Feature": "FIFO Watermark Interrupt",
    "Requirement Location": "spec.pdf#page=25",
    "Description": "The transmit FIFO can generate an interrupt when its level drops below a programmable watermark level.",
    "Verification Goal": "Verify that the interrupt is correctly asserted when the TX FIFO level crosses the configured watermark.",
    "Test Case Coverage": "tx_fifo_watermark_test",
    "Register Coverage Information": [{
        "Feature ID": "F002", "Feature Name": "TX FIFO", "Sub Feature": "FIFO Watermark Interrupt", "Register Name": "TX_CTRL",
        "Address": "0x08", "Access": "R/W", "Reset Value": "0x00", "Fields": "WM_EN[0], WM_LEVEL[3:1]",
        "Description": "Controls TX FIFO watermark interrupt.", "Related Test Cases": "tx_fifo_watermark_test"
    }],
    "Test Cases": [{
        "Feature ID": "F002", "Feature Name": "TX FIFO", "Sub Feature": "FIFO Watermark Interrupt", "TestCaseName": "tx_fifo_watermark_test",
        "Scenario": "Configure watermark, fill FIFO above watermark, then read until interrupt asserts.",
        "Traceability.TestName": "fifo_tests", "Traceability.SequenceName": "tx_watermark_sequence", "Traceability.AgentName": "uart_agent", "Traceability.CovergroupName": "tx_ctrl_cg",
        "Inputs": "TX_CTRL watermark level, data written to TX FIFO.", "ExpectedOutputs": "Interrupt signal asserts when FIFO level drops below watermark.",
        "Steps": "1. Configure watermark level in TX_CTRL. 2. Enable watermark interrupt. 3. Fill FIFO with data. 4. Enable transmission. 5. Wait for interrupt to assert. 6. Read FIFO level and verify it is below watermark.",
        "Constraints": "N/A", "ScoreboardChecks": "Interrupt assertion check."
    }],
    "Port Information": [],
    "Register Value Coverage": [],
};

const mockGeminiVpData = [mockGeminiVpFeature1, mockGeminiVpFeature2];
const mockPdfCoverageData: PdfCoverageRow[] = [
    { "Chunk ID": 1, "Page": 12, "Lines": "10-15", "Text": "The baud rate is determined by the 16-bit divisor in the BAUD_DIV register...", "Features Covered": "Baud Rate Generation" },
    { "Chunk ID": 2, "Page": 25, "Lines": "22-30", "Text": "A transmit FIFO watermark interrupt can be enabled by setting the WM_EN bit in the TX_CTRL register...", "Features Covered": "TX FIFO" }
];


// --- Helper for rehydrating dates after JSON stringification ---
const rehydrateProject = (project: any): Project => {
    if (project.history) {
        project.history.forEach((h: any) => { h.timestamp = new Date(h.timestamp) });
    }
    if (project.logs) {
        project.logs.forEach((l: any) => { l.timestamp = new Date(l.timestamp) });
    }
    return project;
};


// --- API-LIKE SERVICE FUNCTIONS ---

/**
 * Fetches a list of all existing projects.
 */
export const getProjects = async (): Promise<Project[]> => {
    console.log("SERVICE: Fetching projects...");
    await new Promise(resolve => setTimeout(resolve, 500)); 
    // Deep copy and rehydrate dates
    const projects = JSON.parse(JSON.stringify(mockProjects));
    return projects.map(rehydrateProject);
};

/**
 * Fetches detailed information for a single project.
 */
export const getProjectDetails = async (projectName: string): Promise<Project> => {
    console.log(`SERVICE: Fetching details for ${projectName}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const project = mockProjects.find(p => p.name === projectName);
    if (!project) {
        throw new Error("Project not found");
    }
    // Deep copy and rehydrate dates
    const projectCopy = JSON.parse(JSON.stringify(project));
    return rehydrateProject(projectCopy);
};

/**
 * Creates a new project.
 */
export const createProject = async (name: string): Promise<Project> => {
    console.log(`SERVICE: Creating project "${name}"...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    const location = `C:\\Users\\user\\Documents\\NexVer_Projects\\${name}`;
    const newProject: Project = {
        name,
        location,
        specFiles: [],
        history: [{ id: Date.now(), event: `Project "${name}" created.`, timestamp: new Date() }],
        logs: [{ id: Date.now(), message: `Project created. Waiting for file uploads.`, type: 'info', timestamp: new Date() }]
    };
    mockProjects.push(newProject);
    const projectCopy = JSON.parse(JSON.stringify(newProject));
    return rehydrateProject(projectCopy);
};

/**
 * Simulates uploading files to a project.
 */
export const uploadFiles = async (projectName: string, files: {name: string, type: 'Spec'}[]): Promise<Project> => {
    console.log(`SERVICE: Uploading ${files.length} files to ${projectName}...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    const project = mockProjects.find(p => p.name === projectName);
    if (!project) throw new Error("Project not found");
    
    project.specFiles.push(...files);
    return rehydrateProject(JSON.parse(JSON.stringify(project)));
};

/**
 * Simulates the AI generation of a Verification Plan.
 */
export const generateVerificationPlan = async (projectName: string): Promise<Pick<Project, 'geminiVpData' | 'pdfCoverageData'>> => {
    console.log(`SERVICE: Generating Verification Plan for ${projectName}...`);
    await new Promise(resolve => setTimeout(resolve, 2500));
    const project = mockProjects.find(p => p.name === projectName);
    if(project) {
        project.geminiVpData = mockGeminiVpData;
        project.pdfCoverageData = mockPdfCoverageData;
    }
    return {
        geminiVpData: mockGeminiVpData,
        pdfCoverageData: mockPdfCoverageData
    }
}

/**
 * Simulates the AI generation of a Testbench.
 */
export const generateTestbench = async (projectName: string): Promise<boolean> => {
    console.log(`SERVICE: Generating Testbench for ${projectName}...`);
    await new Promise(resolve => setTimeout(resolve, 2500));
    return true;
}


// --- In-memory mock data (replace with API calls) ---

const mockProjects: Project[] = [
    {
        name: 'RISC-V_Core_Verification',
        location: 'D:\\projects\\riscv_core',
        specFiles: [{ name: 'ISA_Spec_v2.2.pdf', type: 'Spec' }],
        history: [
            { id: 1, event: 'Project "RISC-V_Core_Verification" created.', timestamp: new Date('2023-10-26T10:00:00Z') },
        ],
        logs: [
            { id: 1, message: 'Project initialized successfully.', type: 'success', timestamp: new Date('2023-10-26T10:00:00Z') },
        ],
        geminiVpData: mockGeminiVpData,
        pdfCoverageData: mockPdfCoverageData,
    },
    {
        name: 'AXI_Bus_Interconnect_Test',
        location: 'C:\\verification\\axi_bus',
        specFiles: [{ name: 'AXI4_spec.pdf', type: 'Spec' }],
        history: [
             { id: 1, event: 'Project "AXI_Bus_Interconnect_Test" created.', timestamp: new Date('2023-11-15T14:30:00Z') },
        ],
        logs: [
            { id: 1, message: 'Waiting for files to be uploaded.', type: 'info', timestamp: new Date() }
        ],
    }
];

export const mockTestbenchCode = `
// Generated by NexVer
// Testbench Top: tb_top.sv
\`include "uvm_macros.svh"
import uvm_pkg::*;
// ... more code
`;

export const mockTestcaseCode = `
// Generated by NexVer
// Testcase: alu_add_test.sv
class alu_add_test extends base_test;
  \`uvm_component_utils(alu_add_test)
// ... more code
`;

export const mockSpecificationContent: Record<string, string> = {
    'spec.pdf#page=12': `**Section 3.1: Reset**\n\nUpon power-on reset (POR), the system must initialize to a known default state. The 'rst_n' signal, when asserted low, will asynchronously reset all control registers and state machines. All registers listed in Appendix A must return to their specified default values on the first rising edge of 'clk' after 'rst_n' is de-asserted.`,
    'spec.pdf#page=25': `**Section 5.2: FIFO Buffer**\n\nThe main data path includes a 32-word deep, 32-bit wide synchronous FIFO buffer. Data is written on the rising edge of 'clk' when 'wr_en' is high and 'full' is low. Data is read on the rising edge of 'clk' when 'rd_en' is high and 'empty' is low. The FIFO must maintain the order of data written.`,
    'spec.pdf#page=27': `**Section 5.4: Backpressure Mechanism**\n\nThe system supports backpressure from downstream modules using the 'ready' signal. When the 'ready' input is de-asserted (low) by a downstream module, the data path must stall and hold the current data word and 'valid' signal high. No data should be dropped during a stall.`,
    'spec.pdf#page=18': `**Section 4.1: Control FSM**\n\nThe main controller is a finite state machine (FSM) with the following states: IDLE, DECODE, EXECUTE, MEM_ACCESS, WRITEBACK. Legal transitions are defined in Figure 4-2. For example, from DECODE, the FSM can only transition to EXECUTE or MEM_ACCESS depending on the instruction type.`,
    'spec.pdf#page=31': `**Section 6.1: Arithmetic Logic Unit (ALU)**\n\nThe ALU shall perform 32-bit two's complement arithmetic operations including ADD, SUB, MUL, and DIV. Overflow and carry-out flags must be set appropriately based on the operation's result.`,
    'spec.pdf#page=32': `**Section 6.2: Logical Operations**\n\nThe ALU supports bitwise logical operations including AND, OR, XOR, and NOT. These operations are performed on 32-bit vectors.`,
    'spec.pdf#page=45': `**Section 8.2: Interrupt Controller**\n\nThe interrupt controller can handle up to 16 external interrupt sources. Each interrupt has a programmable priority level from 0 (lowest) to 15 (highest). If multiple interrupts are asserted simultaneously, the controller must service the interrupt with the highest priority level first.`,
};
