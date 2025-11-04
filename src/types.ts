

export enum AppStatus {
  RoleSelection,
  Auth,
  AdminAuth,
  Welcome,
  ProjectCreation,
  Dashboard,
  VPGenerated,
  TBAndTestsGenerated,
  Simulating,
  ReportReady,
  AdminPanel,
}

export enum ActiveTab {
  Dashboard = 'Upload file',
  VerificationPlan = 'Verification Plan',
  TestbenchAndTests = 'Testbench & Tests',
  UVMArchitecture = 'UVM Architecture',
  SimulationReport = 'Simulation & Report',
}

export interface UploadedFile {
  name: string;
  type: 'Spec' | 'Log';
}

export interface HistoryEntry {
  id: number;
  event: string;
  timestamp: Date;
}

export interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

// FIX: Added VerificationPlanRow interface to be used across the new application structure.
export interface VerificationPlanRow {
  id: number;
  feature: string;
  subFeature: string;
  description: string;
  verificationGoal: string;
  source: string;
}

export type SheetName = "Verification Plan" | "Port Information" | "Test Cases" | "PDF Coverage" | "Register Value Coverage" | "Register Coverage Information";

export interface SheetData {
    headers: string[];
    rows: (string | number)[][];
    descriptions: Record<string, string>;
}
export type VpDataSheets = Record<SheetName, SheetData>;


export interface Project {
  name:string;
  location: string;
  specFiles: UploadedFile[];
  history: HistoryEntry[];
  logs: LogEntry[];
  geminiVpData?: GeminiVpEntry[];
  pdfCoverageData?: PdfCoverageRow[];
  // FIX: Added optional verificationPlanData property to Project type.
  verificationPlanData?: VerificationPlanRow[];
  editedVpSheets?: VpDataSheets;
}

export interface SimulatorSettings {
    simulator: 'VCS' | 'QuestaSim' | 'Other';
    apiKey: string;
}

export interface ProjectState {
  status: AppStatus;
  project?: Project;
  settings: SimulatorSettings;
  existingProjects: Project[];
}


// --- New Detailed VP Types ---

export interface VpPortInfo {
    "Feature ID": string;
    "Feature Name": string;
    "Sub Feature": string;
    "Port Name": string;
    "Direction": string;
    "Width": string;
    "Description": string;
    "Randomization": string;
    "Constraints": string;
    "Related Test Types": string;
}

export interface VpTestCase {
    "Feature ID": string;
    "Feature Name": string;
    "Sub Feature": string;
    "TestCaseName": string;
    "Scenario": string;
    "Traceability.TestName": string;
    "Traceability.SequenceName": string;
    "Traceability.AgentName": string;
    "Traceability.CovergroupName": string;
    "Inputs": string;
    "ExpectedOutputs": string;
    "Steps": string;
    "Constraints": string;
    "ScoreboardChecks": string;
}

export interface VpRegisterInfo {
    "Feature ID": string;
    "Feature Name": string;
    "Sub Feature": string;
    "Register Name": string;
    "Address": string;
    "Access": string;
    "Reset Value": string;
    "Fields": string;
    "Description": string;
    "Related Test Cases": string;
}

export interface VpRegisterValueCoverage {
    "Feature ID": string;
    "Feature Name": string;
    "Sub Feature": string;
    "Register Names": string;
    "Covergroups": string;
    "Valid Values": string;
    "Invalid Values": string;
    "Bin Name": string;
    "Bin Values": string;
    "Bin Type": string;
    "Bin Description": string;
    "Cross Name": string;
    "Cross Description": string;
}

export interface GeminiVpEntry {
    "Feature ID": string;
    "Feature Name": string;
    "Sub Feature": string;
    "Spec Version": string;
    "Requirement Location": string;
    "Description": string;
    "Verification Goal": string;
    "Test Type": string;
    "Coverage Method": string;
    "UVM Components Involved": string;
    "Pass/Fail Criteria": string;
    "Sequences Coverage": string;
    "Link to Register Value Coverage": string;
    "Link to Register Coverage Information": string;
    "Traceability": {
        test_name: string;
        sequence_name: string;
        agent_name: string;
        covergroup_name: string;
    };
    "Test Case Coverage": string;
    "Target Register and Justification": string;
    "Link to Coverage": string;
    "Testcase Range": {
        min: string;
        mid: string;
        max: string;
    };
    "Testcase Design": string;
    "Testcase Steps": string;
    "Testcase Inputs": string;
    "Testcase Outputs": string;
    "Constraints": string;
    "Randomization Constraints and Rationale": string;
    "Sequence Implementation Notes": string;
    "Scoreboard and Checker": {
        scoreboard_checks: string;
        new_checkers: string;
    };
    "Link to Test Cases": string;
    "Link to Ports": string;
    "Link to PDF Coverage": string;

    // Nested data that will be extracted into separate sheets
    "Port Information": VpPortInfo[];
    "Test Cases": VpTestCase[];
    "Register Value Coverage": VpRegisterValueCoverage[];
    "Register Coverage Information": VpRegisterInfo[];
}


export interface PdfCoverageRow {
    "Chunk ID": number;
    "Page": number;
    "Lines": string;
    "Text": string;
    "Features Covered": string;
}
