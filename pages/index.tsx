import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { StreamLanguage } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";

export default function Home() {
  const [assemblyCode, setAssemblyCode] = useState("ADDI x0, x1, 10 # Continue from here");
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
    if (stream.match(/\bx[0-7]\b/)) {
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
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    if (PC >= lines.length) return;

    console.log(`Executing instruction at PC ${PC}: ${lines[PC]}`);

    let newRegisters = [...registers];
    let newPC = PC;

    const instructionRegex = /^(\w+)\s+x(\d),\s*x?(\d*)?,?\s*(-?\d*)?/;
    const match = lines[newPC].match(instructionRegex);
    if (!match) {
      console.error(`Invalid instruction at line ${newPC}: ${lines[newPC]}`);
      return;
    }

    const [, instr, rd, rs, imm] = match;
    const regD = parseInt(rd);
    const regS = parseInt(rs);
    const immediate = parseInt(imm);

    console.log(`Instruction: ${instr}, rd: x${regD}, rs: x${regS}, imm: ${immediate}`);

    switch (instr.toUpperCase()) {
      case "ADD":
        newRegisters[regD] = newRegisters[regD] + newRegisters[regS];
        break;
      case "SUB":
        newRegisters[regD] = newRegisters[regD] - newRegisters[regS];
        break;
      case "ADDI":
        newRegisters[regD] = newRegisters[regD] + immediate;
        break;
      case "BEQ":
        if (newRegisters[regD] === newRegisters[regS]) newPC += immediate;
        break;
      case "J":
        newPC += immediate;
        break;
      case "JAL":
        newRegisters[7] = newPC + 1;
        newPC += immediate;
        break;
      case "ECALL":
        console.log(`ECALL at PC ${newPC}: x${regD} = ${newRegisters[regD]}`);
        break;
      default:
        console.error(`Unknown instruction: ${instr}`);
    }

    if (!step) newPC++;
    setRegisters(newRegisters);
    setPC(newPC);

    console.log("Registers:", newRegisters);
  };

  return (
          <div className="flex min-h-screen text-black items-start justify-center p-10 lg:p-40 bg-gray-800">
        {/* Left: Assembly Code Input */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl text-gray-200 font-bold mb-2">Z16 Assembly Simulator</h2>

        <div className="w-full p-2 border rounded-lg shadow-sm focus:outline-none bg-gray-200 overflow-y-auto">
        {/* CodeMirror Editor */}
        <CodeMirror
          value={assemblyCode}
          onChange={(value) => setAssemblyCode(value)}
          extensions={[z16Language, z16Highlighting]}
          theme={oneDark}
          className="w-full h-96 p-2 border rounded-lg shadow-sm bg-gray-200"
          style={{ backgroundColor: "#2a313d" }} // Ensures full gray background
        />
        </div>
        {/* Buttons for Execution */}
        <div className="mt-4 flex space-x-2">
          <button onClick={() => executeInstructions(true)}
          className="px-4 py-2 font-semibold bg-blue-500 text-gray-200 rounded-lg shadow hover:bg-blue-600">
            Step
          </button>
          <button onClick={() => executeInstructions(false)}
          className="px-4 font-semibold py-2 bg-green-500 text-gray-200 rounded-lg shadow hover:bg-green-600">
            Run
          </button>
        </div>
        </div>

      {/* Right: Register Table */}
      <div className="w-1/3 p-4 bg-gray-200 shadow-lg rounded-lg">
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
            {registers.map((value, index) => (
              <tr key={index} className="text-center bg-gray-100">
                <td className="border p-2">{`x${index}`}</td>
                <td className="border p-2">{formatValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
