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
  Dashboard = 'Upload Files',
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

export interface VerificationPlanRow {
  id: number;
  feature: string;
  subFeature: string;
  description: string;
  verificationGoal: string;
  source: string;
}

export interface VPSheet {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}


export interface Project {
  name:string;
  location: string;
  specFiles: UploadedFile[];
  history: HistoryEntry[];
  logs: LogEntry[];
  verificationPlan?: string;
  verificationPlanData?: VerificationPlanRow[];
  verificationPlanSheets?: VPSheet[];
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