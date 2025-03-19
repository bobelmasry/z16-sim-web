import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { LRLanguage, LanguageSupport, syntaxTree } from "@codemirror/language";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

export default function Home() {
  const [assemblyCode, setAssemblyCode] = useState("ADD x0, x1 # Continue from here");
  const [registers, setRegisters] = useState(Array(8).fill(0));
  const [displayFormat, setDisplayFormat] = useState("decimal");

  const z16Language = LRLanguage.define({
    parser: {
      parse: (input) => syntaxTree(input), // Placeholder (not full parsing)
    },
  });

  const z16Highlighting = HighlightStyle.define([
    { tag: t.keyword, color: "#ff9800" }, // Instructions (e.g., ADD, SUB, JAL)
    { tag: t.variableName, color: "#2196F3" }, // Registers (x0-x7)
    { tag: t.number, color: "#4CAF50" }, // Immediate values
    { tag: t.comment, color: "#9E9E9E", fontStyle: "italic" }, // Comments
  ]);

  const z16Support = new LanguageSupport(z16Language, [syntaxHighlighting(z16Highlighting)]);

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

  return (
          <div className="flex min-h-screen text-black items-start justify-center p-10 bg-gray-800">
        {/* Left: Assembly Code Input */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl text-gray-200 font-bold mb-2">Z16 Assembly Simulator</h2>

        <div className="w-full p-2 border rounded-lg shadow-sm focus:outline-none bg-gray-200 overflow-y-auto">
        {/* CodeMirror Editor */}
        <CodeMirror
          value={assemblyCode}
          onChange={(value) => setAssemblyCode(value)}
          extensions={[z16Support]} // Temporary; you can replace this with custom Z16 syntax rules
          theme={oneDark}
          className="w-full h-96 p-2 border rounded-lg shadow-sm bg-gray-200"
        />
        </div>
        </div>

      {/* Right: Register Table */}
      <div className="w-1/3 p-4 bg-gray-200 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-2">Registers</h2>

        {/* Dropdown to select display format */}
        <div className="mb-2">
          <label className="text-sm font-semibold">Display Format:</label>
          <select
            className="ml-2 p-1 border rounded-lg bg-white"
            value={displayFormat}
            onChange={(e) => setDisplayFormat(e.target.value)}
          >
            <option value="decimal">Decimal</option>
            <option value="binary">Binary</option>
            <option value="hex">Hexadecimal</option>
          </select>
        </div>

        {/* Register Table */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-white">
              <th className="border p-2">Register</th>
              <th className="border p-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {registers.map((value, index) => (
              <tr key={index} className="text-center bg-white">
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
