# Z16 Assembly Simulator

A web-based simulator for executing Z16 assembly instructions, built with Next.js and TypeScript. This project features a syntax-highlighted editor, register display, and step-by-step execution of Z16 instructions.

## Features
- **Syntax Highlighting**: Custom highlighting for Z16 assembly code using CodeMirror.
- **Execution Engine**: Step-by-step execution of instructions.
- **Register Display**: Real-time updates of register values (x0 - x7) with selectable formats (decimal, binary, hex).
- **Control Options**: "Step" and "Run" buttons to execute instructions sequentially or all at once.

## Technologies Used
- **Next.js** (React framework for SSR and static site generation)
- **TypeScript** (Strongly typed JavaScript for maintainability)
- **CodeMirror** (Code editor with syntax highlighting)
- **TailwindCSS** (For styling the UI)

## Installation

Clone the repository and install dependencies:

```sh
npm install
```

## Running the Project

Start the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── components/          # Reusable UI components
├── pages/               # Next.js pages
├── styles/              # Global styles
├── utils/               # Helper functions (parsing, execution logic)
├── public/              # Static assets
├── README.md            # Project documentation
└── package.json         # Dependencies and scripts
```

## Usage
1. **Write Z16 Assembly Code** in the editor.
2. **Click "Step"** to execute the next instruction.
3. **Click "Run"** to execute all instructions.
4. **View Register Changes** on the right panel.

## License
This project is open-source under the MIT License.
