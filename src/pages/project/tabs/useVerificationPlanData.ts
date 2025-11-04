

import { useMemo } from 'react';
import { Project, GeminiVpEntry, SheetName, VpDataSheets, SheetData } from '../../../types';

// FIX: Re-export types to make them available to other modules importing from this file.
export type { SheetName, SheetData };

export const column_defs: Record<SheetName, Record<string,string>> = {
    "Verification Plan": {
        "Feature ID": "Unique internal ID for this feature (e.g., F001).",
        "Feature Name": "Human-readable name of the feature being verified.",
        "Sub Feature": "Optional more specific area or sub-feature of the feature.",
        "Spec Version": "Specification revision/version referenced.",
        "Requirement Location": "Where the requirement appears in the spec (section/page/line).",
        "Description": "Brief technical description of the feature.",
        "Verification Goal": "What the testbench must prove about the feature.",
        "Test Type": "Type of tests to use (e.g., constrained random or directed).",
        "Coverage Method": "Primary coverage techniques (functional, covergroups, assertions).",
        "UVM Components Involved": "UVM components needed (agents, env, scoreboard, sequences).",
        "Pass/Fail Criteria": "Concrete criteria that determine test pass or fail.",
        "Sequences Coverage": "List of UVM sequences or scenarios required to cover this feature.",
        "Link to Register Value Coverage": "Clickable link to Register Value Coverage sheet rows.",
        "Link to Register Coverage Information": "Clickable link to Register Coverage Information sheet rows.",
        "Traceability.TestName": "Test name from traceability block.",
        "Traceability.SequenceName": "Sequence name from traceability block.",
        "Traceability.AgentName": "Agent name from traceability block.",
        "Traceability.CovergroupName": "Covergroup name from traceability block.",
        "Test Case Coverage": "Comma-separated names of test cases that cover this feature.",
        "Target Register and Justification": "Registers to configure or inspect and why.",
        "Link to Coverage": "Reference or link to a coverage report or tag.",
        "Testcase Range.Min": "Min input range for test design.",
        "Testcase Range.Mid": "Mid input range for test design.",
        "Testcase Range.Max": "Max input range for test design.",
        "Testcase Design": "How tests are designed to exercise the feature (approach).",
        "Testcase Steps": "High-level steps to execute a representative test.",
        "Testcase Inputs": "Inputs or stimulus used for the testcase.",
        "Testcase Outputs": "Expected outputs or observed signals for the testcase.",
        "Constraints": "Constraints that must be applied to inputs or environment.",
        "Randomization Constraints and Rationale": "Randomization restrictions and why they exist.",
        "Sequence Implementation Notes": "Implementation notes for UVM sequences targeting the feature.",
        "Scoreboard and Checker.ScoreboardChecks": "Summary of scoreboard checks.",
        "Scoreboard and Checker.NewCheckers": "Special checkers to implement.",
        "Link to Test Cases": "Clickable link to corresponding rows in Test Cases sheet.",
        "Link to Ports": "Clickable link to corresponding rows in Port Information sheet.",
        "Link to PDF Coverage": "Clickable link to corresponding rows in PDF Coverage sheet."
    },
    "Port Information": {
        "Feature ID": "Feature ID this port belongs to (for cross-reference).",
        "Feature Name": "Feature name this port is associated with.",
        "Sub Feature": "Sub-feature associated with this port (if any).",
        "Port Name": "Signal name in the RTL or interface.",
        "Direction": "Signal direction relative to DUT (input/output/inout).",
        "Width": "Bit width of the signal (numeric).",
        "Description": "Short description of the signal's function.",
        "Randomization": "Whether the signal is randomized in tests (yes/no/constraints).",
        "Constraints": "Value constraints or illegal values for the port.",
        "Related Test Types": "Which test types use this port (e.g., functional, error)."
    },
    "Test Cases": {
        "Feature ID": "Feature ID this test case maps to.",
        "Feature Name": "Feature name this test case exercises.",
        "Sub Feature": "Sub-feature targeted by this test (if any).",
        "TestCaseName": "Unique, descriptive name for the test case.",
        "Scenario": "Description of the scenario or condition being tested.",
        "Traceability.TestName": "Name of the higher-level test this case maps to.",
        "Traceability.SequenceName": "Sequence used to exercise the test (UVM sequence name).",
        "Traceability.AgentName": "Agent responsible for driving/checking during the test.",
        "Traceability.CovergroupName": "Covergroup that collects coverage for this test.",
        "Inputs": "Inputs or configuration applied for the test.",
        "ExpectedOutputs": "What outputs/behavior are expected for test success.",
        "Steps": "Step-by-step execution plan for the test case.",
        "Constraints": "Any constraints on inputs or timing for the test.",
        "ScoreboardChecks": "Specific checks the scoreboard should perform for this test."
    },
    "PDF Coverage": {
        "Chunk ID": "Internal chunk index referencing the source PDF text chunk.",
        "Page": "Page number in the PDF containing the chunk.",
        "Lines": "Start–end line numbers on the page for the chunk.",
        "Text": "Text excerpt of the chunk (source from the PDF).",
        "Features Covered": "Comma-separated features that map to this chunk."
    },
    "Register Value Coverage": {
        "Feature ID": "Feature ID this register coverage entry maps to.",
        "Feature Name": "Feature name associated with these register coverage items.",
        "Sub Feature": "Sub-feature (if applicable).",
        "Register Names": "Comma-separated register names involved in this coverage.",
        "Covergroups": "Covergroup(s) used to collect this register coverage.",
        "Valid Values": "List or range of valid register values to test.",
        "Invalid Values": "Values considered invalid and to be tested.",
        "Bin Name": "Name of a coverage bin (e.g., low_range).",
        "Bin Values": "Values or ranges represented by the bin.",
        "Bin Type": "Type of bin (single, range, enumerated).",
        "Bin Description": "Purpose of this bin (why it exists).",
        "Cross Name": "Cross coverage name combining two coverpoints.",
        "Cross Description": "What behavior the cross coverage verifies."
    },
    "Register Coverage Information": {
        "Feature ID": "Feature ID this register info belongs to.",
        "Feature Name": "Feature name linked to this register.",
        "Sub Feature": "Sub-feature (if any).",
        "Register Name": "Register identifier/name.",
        "Address": "Register address (hex or decimal) if available.",
        "Access": "Access type (R/W/RO/WO) for the register.",
        "Reset Value": "Default register reset value.",
        "Fields": "Important bit fields within the register and bit positions.",
        "Description": "Brief explanation of the register's function.",
        "Related Test Cases": "Test cases that verify or rely on this register."
    }
};

export const sheetNames = Object.keys(column_defs) as SheetName[];

const get = (obj: any, path: string, defValue: any = '') => {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj) || defValue;
}


export const useVerificationPlanData = (project?: Project): VpDataSheets => {
    return useMemo(() => {
        if (project?.editedVpSheets) {
            return project.editedVpSheets;
        }

        const emptyData = {} as VpDataSheets;
        sheetNames.forEach(name => {
            emptyData[name] = { headers: Object.keys(column_defs[name]), rows: [], descriptions: column_defs[name] };
        });

        if (!project || !project.geminiVpData) {
            return emptyData;
        }

        const data = project.geminiVpData;
        
        // Verification Plan
        const vpSheet: SheetData = {
            headers: Object.keys(column_defs["Verification Plan"]),
            rows: data.map(entry => [
                entry["Feature ID"], entry["Feature Name"], entry["Sub Feature"], entry["Spec Version"],
                entry["Requirement Location"], entry["Description"], entry["Verification Goal"], entry["Test Type"],
                entry["Coverage Method"], entry["UVM Components Involved"], entry["Pass/Fail Criteria"],
                entry["Sequences Coverage"], entry["Link to Register Value Coverage"], entry["Link to Register Coverage Information"],
                get(entry, "Traceability.test_name"), get(entry, "Traceability.sequence_name"), get(entry, "Traceability.agent_name"), get(entry, "Traceability.covergroup_name"),
                entry["Test Case Coverage"], entry["Target Register and Justification"], entry["Link to Coverage"],
                get(entry, "Testcase Range.min"), get(entry, "Testcase Range.mid"), get(entry, "Testcase Range.max"),
                entry["Testcase Design"], entry["Testcase Steps"], entry["Testcase Inputs"], entry["Testcase Outputs"],
                entry["Constraints"], entry["Randomization Constraints and Rationale"], entry["Sequence Implementation Notes"],
                get(entry, "Scoreboard and Checker.scoreboard_checks"), get(entry, "Scoreboard and Checker.new_checkers"),
                entry["Link to Test Cases"], entry["Link to Ports"], entry["Link to PDF Coverage"]
            ]),
            descriptions: column_defs["Verification Plan"]
        };

        // Port Information
        const portInfoSheet: SheetData = {
            headers: Object.keys(column_defs["Port Information"]),
            rows: data.flatMap(entry => entry["Port Information"]?.map(port => [
                port["Feature ID"], port["Feature Name"], port["Sub Feature"], port["Port Name"], port["Direction"],
                port["Width"], port["Description"], port["Randomization"], port["Constraints"], port["Related Test Types"]
            ]) || []),
            descriptions: column_defs["Port Information"]
        };

        // Test Cases
        const testCasesSheet: SheetData = {
            headers: Object.keys(column_defs["Test Cases"]),
            rows: data.flatMap(entry => entry["Test Cases"]?.map(tc => [
                tc["Feature ID"], tc["Feature Name"], tc["Sub Feature"], tc["TestCaseName"], tc["Scenario"],
                tc["Traceability.TestName"], tc["Traceability.SequenceName"], tc["Traceability.AgentName"], tc["Traceability.CovergroupName"],
                tc["Inputs"], tc["ExpectedOutputs"], tc["Steps"], tc["Constraints"], tc["ScoreboardChecks"]
            ]) || []),
            descriptions: column_defs["Test Cases"]
        };

        // PDF Coverage
        const pdfCoverageSheet: SheetData = {
            headers: Object.keys(column_defs["PDF Coverage"]),
            rows: project.pdfCoverageData?.map(row => [
                row["Chunk ID"], row["Page"], row["Lines"], row["Text"], row["Features Covered"]
            ]) || [],
            descriptions: column_defs["PDF Coverage"]
        };

        // Register Value Coverage
        const regValCovSheet: SheetData = {
            headers: Object.keys(column_defs["Register Value Coverage"]),
            rows: data.flatMap(entry => entry["Register Value Coverage"]?.map(rvc => [
                rvc["Feature ID"], rvc["Feature Name"], rvc["Sub Feature"], rvc["Register Names"], rvc["Covergroups"],
                rvc["Valid Values"], rvc["Invalid Values"], rvc["Bin Name"], rvc["Bin Values"], rvc["Bin Type"],
                rvc["Bin Description"], rvc["Cross Name"], rvc["Cross Description"]
            ]) || []),
            descriptions: column_defs["Register Value Coverage"]
        };
        
        // Register Coverage Information
        const regInfoSheet: SheetData = {
            headers: Object.keys(column_defs["Register Coverage Information"]),
            rows: data.flatMap(entry => entry["Register Coverage Information"]?.map(ri => [
                ri["Feature ID"], ri["Feature Name"], ri["Sub Feature"], ri["Register Name"], ri["Address"],
                ri["Access"], ri["Reset Value"], ri["Fields"], ri["Description"], ri["Related Test Cases"]
            ]) || []),
            descriptions: column_defs["Register Coverage Information"]
        };
        
        return {
            "Verification Plan": vpSheet,
            "Port Information": portInfoSheet,
            "Test Cases": testCasesSheet,
            "PDF Coverage": pdfCoverageSheet,
            "Register Value Coverage": regValCovSheet,
            "Register Coverage Information": regInfoSheet
        };

    }, [project]);
};
