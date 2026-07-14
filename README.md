# Tool Collection Application

This is a comprehensive desktop tool collection application built with Tauri, React, and TypeScript. It supports integrating tools written in both Rust and Python, provides a searchable and collapsible sidebar navigation, and a grid overview for easy browsing of tools.

## Features

- **Cross-platform**: Built with Tauri for Windows, macOS, and Linux.
- **Modern UI**: Developed with React and TypeScript, styled with Tailwind CSS.
- **Flexible Backend**: Easily integrate tools written in Rust (native) or Python (via Sidecar).
- **Intuitive Navigation**: Searchable and collapsible sidebar for quick access to tools.
- **Tool Overview Grid**: A dashboard-like view to efficiently browse all available tools.
- **Network Access**: Configured to allow web-based tools and network requests.

## Project Structure

```
tool-collection/
├── src/                # Frontend (React, TypeScript, Tailwind CSS)
│   ├── components/     # Reusable UI components (Sidebar, ToolGrid, ToolDetail)
│   ├── pages/          # Individual tool pages (will be added here)
│   ├── utils/          # Utility functions (e.g., icon mapping)
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Entry point for React app
│   ├── App.css         # Tailwind CSS imports and custom styles
│   └── types.ts        # TypeScript type definitions
├── src-tauri/          # Tauri backend (Rust)
│   ├── src/            # Rust source code (main.rs, lib.rs)
│   ├── capabilities/   # Tauri capability definitions (permissions)
│   ├── icons/          # Application icons
│   ├── tauri.conf.json # Tauri configuration file
│   └── Cargo.toml      # Rust package manifest
├── src-python/         # Python tool scripts
│   ├── json_formatter.py
│   ├── uuid_generator.py
│   └── base64_encoder.py
├── public/             # Static assets
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── package.json        # Frontend dependencies and scripts
├── pnpm-lock.yaml      # pnpm lock file
└── README.md           # Project README
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)
- Rust (with `rustup`)
- Python (v3.8 or higher)
- Tauri prerequisites for your OS (e.g., `build-essential`, `libwebkit2gtk-4.1-dev` on Linux)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-github-repo-url>
    cd tool-collection
    ```

2.  **Install frontend dependencies:**
    ```bash
    pnpm install
    ```

3.  **Install Rust toolchain (if not already installed):**
    ```bash
    curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source $HOME/.cargo/env
    ```

4.  **Install Tauri system dependencies (example for Ubuntu/Debian):**
    ```bash
    sudo apt-get update
    sudo apt-get install -y build-essential libssl-dev pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
    ```

### Running the Application

To run the application in development mode:

```bash
pnpm tauri dev
```

To build the application for production:

```bash
pnpm tauri build
```

## Adding New Tools

### Adding a Rust Tool

1.  **Define the tool in `src-tauri/src/lib.rs`:**
    Add a new `Tool` struct instance to the `get_tools` function. Make sure to assign a unique `id` and an appropriate `icon` (from `lucide-react` or a custom one).

    ```rust
    // Example:
    Tool {
        id: "my_new_rust_tool".to_string(),
        name: "My New Rust Tool".to_string(),
        description: "A description of my new Rust tool.".to_string(),
        category: "Custom".to_string(),
        icon: "Settings".to_string(),
        enabled: true,
    },
    ```

2.  **Implement the Rust logic:**
    Create a new Rust function in `src-tauri/src/lib.rs` (or a new module) and annotate it with `#[tauri::command]`. This function will contain the core logic of your tool.

    ```rust
    #[tauri::command]
    fn my_new_rust_command(input: String) -> String {
        // Your Rust logic here
        format!("Hello from Rust: {}", input)
    }
    ```

3.  **Register the command:**
    Add your new command to `tauri::generate_handler!` in the `run` function in `src-tauri/src/lib.rs`.

    ```rust
    .invoke_handler(tauri::generate_handler![
        // ... existing commands
        my_new_rust_command
    ])
    ```

4.  **Create a frontend page:**
    Create a new React component in `src/pages/` (e.g., `src/pages/MyNewRustToolPage.tsx`) that calls your Rust command using `invoke` from `@tauri-apps/api/core`.

    ```typescript
    import React, { useState } from 'react';
    import { invoke } from '@tauri-apps/api/core';

    const MyNewRustToolPage: React.FC = () => {
      const [input, setInput] = useState('');
      const [output, setOutput] = useState('');

      const handleRunTool = async () => {
        try {
          const result = await invoke<string>('my_new_rust_command', { input });
          setOutput(result);
        } catch (error) {
          console.error('Error calling Rust command:', error);
          setOutput(`Error: ${error}`);
        }
      };

      return (
        <div>
          <h2>My New Rust Tool</h2>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
          <button onClick={handleRunTool}>Run Rust Tool</button>
          <p>Output: {output}</p>
        </div>
      );
    };

    export default MyNewRustToolPage;
    ```

5.  **Integrate into `ToolDetail.tsx`:**
    Update `src/components/ToolDetail.tsx` to render your new tool's component based on `tool.id`.

### Adding a Python Tool

1.  **Define the tool in `src-tauri/src/lib.rs`:**
    Similar to Rust tools, add a new `Tool` struct instance to the `get_tools` function.

    ```rust
    // Example:
    Tool {
        id: "my_new_python_tool".to_string(),
        name: "My New Python Tool".to_string(),
        description: "A description of my new Python tool.".to_string(),
        category: "Scripting".to_string(),
        icon: "Python".to_string(), // Assuming you add a Python icon
        enabled: true,
    },
    ```

2.  **Create the Python script:**
    Create a new Python file in `src-python/` (e.g., `src-python/my_new_python_tool.py`). This script should accept arguments from the command line and print its output to `stdout`.

    ```python
    # src-python/my_new_python_tool.py
    import sys

    if __name__ == "__main__":
        if len(sys.argv) > 1:
            input_arg = sys.argv[1]
            print(f"Hello from Python: {input_arg.upper()}")
        else:
            print("Hello from Python!")
    ```

3.  **Create a frontend page:**
    Create a new React component in `src/pages/` (e.g., `src/pages/MyNewPythonToolPage.tsx`) that calls the `execute_python` Rust command with your script name and arguments.

    ```typescript
    import React, { useState } from 'react';
    import { invoke } from '@tauri-apps/api/core';

    const MyNewPythonToolPage: React.FC = () => {
      const [input, setInput] = useState('');
      const [output, setOutput] = useState('');

      const handleRunPythonTool = async () => {
        try {
          const result = await invoke<string>('execute_python', {
            scriptName: 'my_new_python_tool',
            args: [input],
          });
          setOutput(result);
        } catch (error) {
          console.error('Error calling Python script:', error);
          setOutput(`Error: ${error}`);
        }
      };

      return (
        <div>
          <h2>My New Python Tool</h2>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
          <button onClick={handleRunPythonTool}>Run Python Tool</button>
          <p>Output: {output}</p>
        </div>
      );
    };

    export default MyNewPythonToolPage;
    ```

4.  **Integrate into `ToolDetail.tsx`:**
    Update `src/components/ToolDetail.tsx` to render your new tool's component based on `tool.id`.

## Contributing

Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
