import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { StreamLanguage } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, Decoration, ViewPlugin } from "@codemirror/view";
import { RangeSet } from "@codemirror/state";

export default function Home() {

  const initialAssemblyCode = `# Initialize registers
    LI 0x0, 5        # Load immediate 5 into 0x0
    LI 0x1, 10       # Load immediate 10 into 0x1

    # Arithmetic operations (two-register format)
    ADD 0x2, 0x0     # 0x2 = 0x2 + 0x0 (assumes 0x2 initially 0)
    ADD 0x2, 0x1     # 0x2 = 0x2 + 0x1 (5 + 10 = 15)

    SUB 0x3, 0x2     # 0x3 = 0x3 - 0x2 (assumes 0x3 initially 0)
    ADD 0x3, 0x1     # 0x3 = 0x3 + 0x1 (0 - 15 + 10 = -5)

    # Branching
    LI 0x4, 2        # Load immediate 2 into 0x4
    BEQ 0x0, 0x4, 2  # If 0x0 == 0x4, jump 2 instructions ahead
    LI 0x5, 100      # (Skipped if BEQ is taken)
    J 1              # Unconditional jump (skips the next instruction)
    LI 0x5, 200      # This is executed if BEQ was taken

    # Function call simulation
    LI 0x6, 4        # Load immediate 4 into 0x6
    JAL 3            # Jump and link to the instruction 3 steps ahead
    LI 0x7, 50       # This instruction is skipped due to the jump

    # Function return (simulated)
    LI 0x6, 99       # Function body
    JALR 0x7         # Return to saved address in 0x7

    # System call
    ECALL 0x2        # Print value in 0x2`;

  const [assemblyCode, setAssemblyCode] = useState(initialAssemblyCode);
  const [registers, setRegisters] = useState(Array(8).fill(0));
  const [displayFormat, setDisplayFormat] = useState("decimal");
  const [PC, setPC] = useState(0);

  // Define Z16 Assembly Syntax Highlighting
const z16Language = StreamLanguage.define({
  startState: () => ({}),
  token: (stream) => {
    if (stream.eatSpace()) return null;

    // Highlight Comments (Starts with ';' or '#')
    if (stream.match(/(;|#).*/)) {
      return "comment";
    }

    // Highlight Instructions (Z16 opcodes)
    if (stream.match(/\b(ADD|SUB|JALR|JR|ADDI|SLTI|XORI|ANDI|ORI|LI|BEQ|BNE|BZ|BNZ|BLT|BGE|BLTU|BGEU|LUI|AUIPC|J|JAL|ECALL|LB|LW|LBU)\b/)) {
      return "keyword";
    }

    // Highlight Registers (x0 - x7)
    if (stream.match(/\b0x[0-7]\b/)) {
      return "variableName";
    }

    // Highlight Immediate Values (Hex, Binary, Decimal)
    if (stream.match(/\b(0x[0-9A-Fa-f]+|0b[01]+|\d+)\b/)) {
      return "number";
    }

    stream.next();
    return null;
  },
});

  const z16Highlighting = syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.keyword, color: "#ff9800", fontWeight: "bold" }, // Instructions (Orange)
      { tag: t.variableName, color: "#2196F3", fontWeight: "bold" }, // Registers (Blue)
      { tag: t.number, color: "#4CAF50" }, // Immediate values (Green)
      { tag: t.comment, color: "#9E9E9E", fontStyle: "italic" }, // Comments (Gray Italic)
    ])
  );
  
  const highlightCurrentInstruction = ViewPlugin.fromClass(
    class {
      decorations: RangeSet<Decoration>;
  
      constructor(view) {
        this.decorations = this.getDecorations(view);
      }
  
      update(update) {
        this.decorations = this.getDecorations(update.view);
      }
  
      getDecorations(view) {
        const lines = assemblyCode
          .split("\n")
          .map((line, index) => ({ text: line.split("#")[0].trim(), index }))
          .filter((line) => line.text !== ""); // Remove empty/comment-only lines
  
        if (PC >= lines.length) return Decoration.none;
  
        // Find the actual instruction line in the document
        let instructionLine = view.state.doc.line(lines[PC].index + 1);
  
        return Decoration.set([
          Decoration.line({
            attributes: { style: "background-color: rgba(255, 255, 0, 0.3);" },
          }).range(instructionLine.from),
        ]);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
  

  // Function to format values based on the selected display format
  const formatValue = (value: number) => {
    switch (displayFormat) {
      case "binary":
        return "0b" + value.toString(2).padStart(8, "0"); // 8-bit binary
      case "hex":
        return "0x" + value.toString(16).toUpperCase(); // Uppercase hex
      default:
        return value.toString(); // Decimal
    }
  };

  const executeInstructions = (step = false) => {
    if (!step) {
        setPC(0);
        setRegisters(Array(8).fill(0));
    }

    const lines = assemblyCode
        .split("\n")
        .map((line) => line.split("#")[0].trim()) // Remove comments
        .filter((line) => line); // Ignore empty lines

    if (PC >= lines.length) return;

    console.log(`Executing instruction at PC ${PC}: ${lines[PC]}`);

    let newRegisters = [...registers];
    let newPC = PC;

    // Manual parsing without regex
    const parseInstruction = (line: string) => {
      let parts = [];
      let currentPart = "";
      let insideWhitespace = false;

      for (let char of line) {
          if (char === " " || char === ",") {
              if (!insideWhitespace) {
                  parts.push(currentPart);
                  currentPart = "";
                  insideWhitespace = true;
              }
          } else {
              currentPart += char;
              insideWhitespace = false;
          }
      }

      if (currentPart) parts.push(currentPart); // Add last part if any
      return parts;
  };

  const parts = parseInstruction(lines[newPC]);
  console.log(parts);
  if (parts.length === 0) return;

    const instr = parts[0].toUpperCase();
    let rd : number;
    let rs : number;
    let imm : number;

    // Instruction execution logic
    switch (instr) {
        case "ADD":
        case "SUB":
            rd = parseInt(parts[1]);
            rs = parseInt(parts[2]);
            if (rd === null || rs === null) {
                console.error(`${instr} requires two registers`);
                return;
            }
            newRegisters[rd] = instr === "ADD" ? newRegisters[rd] + newRegisters[rs] : newRegisters[rd] - newRegisters[rs];
            break;
        case "ADDI":
            rd = parseInt(parts[1]);
            imm = parseInt(parts[2]);
            if (rd === null || imm === null) {
                console.error("ADDI requires a register and an immediate value");
                return;
            }
            newRegisters[rd] += imm;
            break;
        case "LI":
            rd = parseInt(parts[1]);
            imm = parseInt(parts[2]);
            if (rd === null || imm === null) {
                console.error("LI requires a register and an immediate value");
                return;
            }
            newRegisters[rd] = imm;
            break;
        case "BEQ":
            rd = parseInt(parts[1]);
            rs = parseInt(parts[2]);
            imm = parseInt(parts[3]);
            if (rd === null || rs === null || imm === null) {
                console.error("BEQ requires two registers and an immediate offset");
                return;
            }
            if (newRegisters[rd] === newRegisters[rs]) newPC += imm;
            break;
        case "J":
            imm = parseInt(parts[1]);
            if (imm === null) {
                console.error("J requires an immediate offset");
                return;
            }
            newPC += imm;
            break;
        case "JAL":
            imm = parseInt(parts[1]);
            if (imm === null) {
                console.error("JAL requires an immediate offset");
                return;
            }
            newRegisters[7] = newPC + 1;
            newPC += imm;
            break;
        case "ECALL":
            rd = parseInt(parts[1]);
            if (rd !== null) {
              console.log(`ECALL at PC ${newPC}: x${rd} = ${newRegisters[rd]}`);
            } else {
              console.error("ECALL requires a valid register index");
            }
            break;
        default:
            console.error(`Unknown instruction: ${instr}`);
            return;
    }

    if (!step) newPC++;
    setRegisters(newRegisters);
    setPC(newPC);

    console.log("Registers:", newRegisters);
};

  const Reset = () => {
    setPC(0);
    setRegisters(Array(8).fill(0));
  };


  return (
          <div className="flex min-h-screen text-black items-start justify-center pt-12 lg:pt-40 bg-gray-800">
        {/* Left: Assembly Code Input */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl text-gray-200 font-bold mb-2">Z16 Assembly Simulator</h2>

        <div className="w-full p-2 border rounded-lg shadow-sm focus:outline-none bg-gray-200 overflow-y-auto">
        {/* CodeMirror Editor */}
        <CodeMirror
          value={assemblyCode}
          onChange={(value) => setAssemblyCode(value)}
          extensions={[z16Language, z16Highlighting, highlightCurrentInstruction]}
          theme={oneDark}
          className="w-full h-auto p-2 border rounded-lg shadow-sm bg-gray-200"
          style={{ backgroundColor: "#2a313d" }} // Ensures full gray background
        />
        </div>
        </div>

      {/* Right: Register Table */}
      <div className="w-1/3 p-4 bg-gray-200 mt-14 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-2">Registers</h2>

        {/* Dropdown to select display format */}
        <div className="mb-2">
          <label className="text-sm font-semibold">Display Format:</label>
          <select
            className="ml-2 p-1 border rounded-lg bg-gray-100"
            value={displayFormat}
            onChange={(e) => setDisplayFormat(e.target.value)}
          >
            <option value="decimal">Decimal</option>
            <option value="binary">Binary</option>
            <option value="hex">Hexadecimal</option>
          </select>
        </div>

        {/* Register Table */}
        <table className="w-full border-collapse border bg-gray-300 border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Register</th>
              <th className="border p-2">Value</th>
            </tr>
          </thead>
          <tbody>
          <tr className="text-center bg-orange-200">
              <td className="border p-2">PC</td>
              <td className="border p-2">{formatValue(PC)}</td>
            </tr>
            {registers.map((value, index) => (
              <tr key={index} className="text-center bg-gray-100">
                <td className="border p-2">{`0x${index}`}</td>
                <td className="border p-2">{formatValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Buttons for Execution */}
        <div className="mt-4 flex space-x-2">
          <button onClick={() => executeInstructions(false)}
          className="px-4 font-semibold py-2 bg-green-500 text-gray-200 rounded-lg shadow hover:bg-green-600">
            Step
          </button>
          <button onClick={() => Reset()}
          className="px-4 font-semibold py-2 bg-blue-500 text-gray-200 rounded-lg shadow hover:bg-blue-600">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
