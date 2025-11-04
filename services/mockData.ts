import { AppStatus, Project, VPSheet } from "../types";

export const mockVerificationPlanHTML = `
<div class="p-8 bg-white dark:bg-secondary-900 rounded-lg shadow-inner font-sans text-sm text-gray-800 dark:text-gray-200">
    <h1 class="text-2xl font-bold border-b-2 border-primary-500 pb-2 mb-4 text-primary-700 dark:text-primary-300">Verification Plan: PicoCPU Core</h1>
    <p class="mb-4 text-xs text-gray-500 dark:text-gray-400">Document Version: 1.0 | Generated: ${new Date().toLocaleDateString()}</p>
    
    <h2 class="text-lg font-semibold mt-6 mb-2 text-primary-600 dark:text-primary-400">1. Overview</h2>
    <p>This document outlines the verification strategy for the PicoCPU core. The primary objective is to ensure functional correctness and adherence to the specification document.</p>
    
    <h2 class="text-lg font-semibold mt-6 mb-2 text-primary-600 dark:text-primary-400">2. Key Features to Verify</h2>
    <ul class="list-disc list-inside space-y-2 pl-4">
        <li><span class="font-semibold bg-yellow-100 text-yellow-900 dark:bg-yellow-700/80 dark:text-yellow-100 px-1 rounded">Instruction Set Architecture (ISA):</span> All opcodes and addressing modes must be tested.</li>
        <li><span class="font-semibold">Register File:</span> Read/write operations, reset values, and concurrent access.</li>
        <li><span class="font-semibold">ALU:</span> All arithmetic and logical operations, including corner cases for flags (zero, carry, overflow).</li>
        <li><span class="font-semibold bg-yellow-100 text-yellow-900 dark:bg-yellow-700/80 dark:text-yellow-100 px-1 rounded">Memory Interface:</span> Load/store operations, aligned and unaligned access, bus protocol adherence.</li>
        <li><span class="font-semibold">Interrupt Handling:</span> Interrupt request, acknowledge, and return from interrupt sequences.</li>
    </ul>

    <h2 class="text-lg font-semibold mt-6 mb-2 text-primary-600 dark:text-primary-400">3. Verification Environment (UVM)</h2>
    <p>A UVM-based testbench will be used. It will consist of an agent for the memory interface, a scoreboard for checking results, and a virtual sequencer to coordinate stimulus.</p>
    <div class="mt-4 p-4 border-l-4 border-primary-500 bg-secondary-50 dark:bg-secondary-800 rounded-r-lg">
        <h3 class="font-semibold text-md text-primary-700 dark:text-primary-300">Coverage Goals:</h3>
        <ul class="list-decimal list-inside text-xs mt-2 space-y-1">
            <li><span class="bg-red-100 text-red-900 dark:bg-red-800/80 dark:text-red-100 px-1 rounded font-mono">CODE COVERAGE:</span> > 95% statement and branch coverage.</li>
            <li><span class="bg-green-100 text-green-900 dark:bg-green-800/80 dark:text-green-100 px-1 rounded font-mono">FUNCTIONAL COVERAGE:</span> 100% for all defined covergroups on instructions, ALU ops, and interrupt types.</li>
            <li><span class="font-mono">ASSERTION COVERAGE:</span> 100% pass rate for all SVA properties.</li>
        </ul>
    </div>
</div>
`;

export const mockVerificationPlanMarkdown = `
# Verification Plan: PicoCPU Core

**Version: 1.0 | Generated: ${new Date().toLocaleDateString()}**

## 1. Overview
This document outlines the verification strategy for the PicoCPU core. The primary objective is to ensure functional correctness and adherence to the specification document.

## 2. Key Features to Verify
- **Instruction Set Architecture (ISA):** All opcodes and addressing modes must be tested.
- **Register File:** Read/write operations, reset values, and concurrent access.
- **ALU:** All arithmetic and logical operations, including corner cases for flags (zero, carry, overflow).
- **Memory Interface:** Load/store operations, aligned and unaligned access, bus protocol adherence.
- **Interrupt Handling:** Interrupt request, acknowledge, and return from interrupt sequences.

## 3. Verification Environment (UVM)
A UVM-based testbench will be used. It will consist of an agent for the memory interface, a scoreboard for checking results, and a virtual sequencer to coordinate stimulus.

### Coverage Goals:
1.  **CODE COVERAGE:** > 95% statement and branch coverage.
2.  **FUNCTIONAL COVERAGE:** 100% for all defined covergroups on instructions, ALU ops, and interrupt types.
3.  **ASSERTION COVERAGE:** 100% pass rate for all SVA properties.
`;

export const mockVerificationPlanExtraSheets: VPSheet[] = [
    {
        name: 'Coverage Goals',
        headers: ['Coverage Type', 'Goal', 'Exclusions', 'Current'],
        rows: [
            ['Code Coverage', '> 95% statement & branch', 'Reset sequence', '96%'],
            ['Functional Coverage', '100% for all covergroups', 'N/A', '92%'],
            ['Assertion Coverage', '100% pass rate', 'N/A', '100%'],
        ]
    },
    {
        name: 'Test Plan',
        headers: ['Test ID', 'Description', 'Features Covered', 'Status'],
        rows: [
            ['TEST-001', 'ALU add/sub random', 'FEAT-003', 'Pass'],
            ['TEST-002', 'ALU logic ops random', 'FEAT-003', 'Pass'],
            ['TEST-003', 'Register file access', 'FEAT-002', 'Fail'],
            ['TEST-004', 'Memory unaligned access', 'FEAT-004', 'Not Run'],
        ]
    }
];

export const mockVerificationPlanTableData = [
    {
      id: 1,
      feature: 'Reset',
      subFeature: 'Power-on Reset',
      description: 'Check that all registers and state machines go to their default values upon power-on.',
      verificationGoal: 'Ensure all specified registers are at their default values after the first clock cycle following de-assertion of reset.',
      source: 'spec.pdf#page=12',
    },
    {
      id: 2,
      feature: 'Data Path',
      subFeature: 'FIFO Operation',
      description: 'Verify the First-In-First-Out behavior of the main data buffer.',
      verificationGoal: 'Write a sequence of unique data words and read them back to confirm order and integrity.',
      source: 'spec.pdf#page=25',
    },
    {
      id: 3,
      feature: 'Data Path',
      subFeature: 'Backpressure',
      description: 'Test the system\'s ability to handle downstream stalls without data loss.',
      verificationGoal: 'Assert the \'ready\' signal low for multiple cycles during a transfer and verify no data is dropped.',
      source: 'spec.pdf#page=27',
    },
    {
      id: 4,
      feature: 'Control',
      subFeature: 'FSM State Transitions',
      description: 'Verify all legal state transitions in the main control FSM.',
      verificationGoal: 'Create directed tests to force each transition and check for correct state updates.',
      source: 'spec.pdf#page=18',
    },
     {
      id: 5,
      feature: 'ALU',
      subFeature: 'Arithmetic Operations',
      description: 'Verify all arithmetic operations (ADD, SUB, MUL, DIV).',
      verificationGoal: 'Test with a wide range of positive, negative, and zero-value operands. Check corner cases for overflow and underflow.',
      source: 'spec.pdf#page=31',
    },
     {
      id: 6,
      feature: 'ALU',
      subFeature: 'Logical Operations',
      description: 'Verify all logical operations (AND, OR, XOR, NOT).',
      verificationGoal: 'Use constrained-random stimulus to cover a wide variety of input data patterns.',
      source: 'spec.pdf#page=32',
    },
     {
      id: 7,
      feature: 'Interrupts',
      subFeature: 'Interrupt Prioritization',
      description: 'Ensure that higher priority interrupts are serviced before lower priority ones.',
      verificationGoal: 'Generate multiple simultaneous interrupt requests and verify the correct ISR is executed.',
      source: 'spec.pdf#page=45',
    },
];

export const mockSpecificationContent: Record<string, string> = {
    'spec.pdf#page=12': `**Section 3.1: Reset**\n\nUpon power-on reset (POR), the system must initialize to a known default state. The 'rst_n' signal, when asserted low, will asynchronously reset all control registers and state machines. All registers listed in Appendix A must return to their specified default values on the first rising edge of 'clk' after 'rst_n' is de-asserted.`,
    'spec.pdf#page=25': `**Section 5.2: FIFO Buffer**\n\nThe main data path includes a 32-word deep, 32-bit wide synchronous FIFO buffer. Data is written on the rising edge of 'clk' when 'wr_en' is high and 'full' is low. Data is read on the rising edge of 'clk' when 'rd_en' is high and 'empty' is low. The FIFO must maintain the order of data written.`,
    'spec.pdf#page=27': `**Section 5.4: Backpressure Mechanism**\n\nThe system supports backpressure from downstream modules using the 'ready' signal. When the 'ready' input is de-asserted (low) by a downstream module, the data path must stall and hold the current data word and 'valid' signal high. No data should be dropped during a stall.`,
    'spec.pdf#page=18': `**Section 4.1: Control FSM**\n\nThe main controller is a finite state machine (FSM) with the following states: IDLE, DECODE, EXECUTE, MEM_ACCESS, WRITEBACK. Legal transitions are defined in Figure 4-2. For example, from DECODE, the FSM can only transition to EXECUTE or MEM_ACCESS depending on the instruction type.`,
    'spec.pdf#page=31': `**Section 6.1: Arithmetic Logic Unit (ALU)**\n\nThe ALU shall perform 32-bit two's complement arithmetic operations including ADD, SUB, MUL, and DIV. Overflow and carry-out flags must be set appropriately based on the operation's result.`,
    'spec.pdf#page=32': `**Section 6.2: Logical Operations**\n\nThe ALU supports bitwise logical operations including AND, OR, XOR, and NOT. These operations are performed on 32-bit vectors.`,
    'spec.pdf#page=45': `**Section 8.2: Interrupt Controller**\n\nThe interrupt controller can handle up to 16 external interrupt sources. Each interrupt has a programmable priority level from 0 (lowest) to 15 (highest). If multiple interrupts are asserted simultaneously, the controller must service the interrupt with the highest priority level first.`,
};

export const mockTestbenchCode = `
// Generated by NexVer
// Testbench Top: tb_top.sv

\`include "uvm_macros.svh"
import uvm_pkg::*;

module tb_top;
  
  // Clock and Reset Generation
  bit clk;
  bit rst_n;

  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end

  initial begin
    rst_n = 0;
    #20;
    rst_n = 1;
  end

  // DUT Instantiation
  picocpu_dut dut (
    .clk(clk),
    .rst_n(rst_n)
    // ... other ports
  );

  // UVM Test Start
  initial begin
    run_test("base_test");
  end

endmodule

// Base Test: base_test.sv
class base_test extends uvm_test;
  \`uvm_component_utils(base_test)

  picocpu_env env;

  function new(string name, uvm_component parent);
    super.new(name, parent);
  endfunction

  function void build_phase(uvm_phase phase);
    super.build_phase(phase);
    env = picocpu_env::type_id::create("env", this);
  endfunction

  task run_phase(uvm_phase phase);
    phase.raise_objection(this);
    // Main test sequence will be started here
    phase.drop_objection(this);
  endtask

endclass
`;

export const mockTestcaseCode = `
// Generated by NexVer
// Testcase: alu_add_test.sv

class alu_add_test extends base_test;
  \`uvm_component_utils(alu_add_test)

  function new(string name, uvm_component parent);
    super.new(name, parent);
  endfunction

  task run_phase(uvm_phase phase);
    alu_add_sequence seq;
    phase.raise_objection(this);
    
    seq = alu_add_sequence::type_id::create("seq");
    seq.start(env.v_sequencer);
    
    phase.drop_objection(this);
  endtask
endclass


// Sequence: alu_add_sequence.sv
class alu_add_sequence extends uvm_sequence #(mem_transaction);
  \`uvm_object_utils(alu_add_sequence)

  function new(string name="alu_add_sequence");
    super.new(name);
  endfunction

  task body();
    // Generate sequence of ADD instructions with random operands
    repeat (100) begin
      \`uvm_do_with(req, {
        req.opcode == ADD;
        req.operand_a inside {[0:1000]};
        req.operand_b inside {[0:1000]};
      })
    end
  endtask
endclass
`;

export const mockProjects: Project[] = [
    {
        name: 'RISC-V_Core_Verification',
        location: 'D:\\projects\\riscv_core',
        specFiles: [{ name: 'ISA_Spec_v2.2.pdf', type: 'Spec' }],
        history: [
            { id: 1, event: 'Project "RISC-V_Core_Verification" created.', timestamp: new Date('2023-10-26T10:00:00Z') },
            { id: 2, event: 'Uploaded files: ISA_Spec_v2.2.pdf', timestamp: new Date('2023-10-26T10:05:00Z') },
            { id: 3, event: 'Verification Plan generated.', timestamp: new Date('2023-10-26T10:06:00Z') },
        ],
        logs: [
            { id: 1, message: 'Project initialized successfully.', type: 'success', timestamp: new Date('2023-10-26T10:00:00Z') },
            { id: 2, message: 'Parsing spec files... Done.', type: 'info', timestamp: new Date('2023-10-26T10:05:10Z') },
            { id: 3, message: 'Generating Verification Plan from specification...', type: 'info', timestamp: new Date('2023-10-26T10:05:50Z') },
            { id: 4, message: 'Verification Plan generated.', type: 'success', timestamp: new Date('2023-10-26T10:06:00Z') },
        ],
        verificationPlan: mockVerificationPlanMarkdown,
        verificationPlanData: mockVerificationPlanTableData,
        verificationPlanSheets: mockVerificationPlanExtraSheets,
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
        verificationPlan: undefined
    }
];
