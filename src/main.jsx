import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global styles
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #07080a;
    color: #e2dfd8;
    font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace;
    -webkit-font-smoothing: antialiased;
  }
  a { color: #c9a84c; text-decoration: none; }
  a:hover { text-decoration: underline; }
  ::selection { background: #c9a84c30; color: #e8c85a; }
  input, select, textarea, button { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0d0f12; }
  ::-webkit-scrollbar-thumb { background: #1c2028; border-radius: 3px; }
`;
document.head.appendChild(style);

// Fonts
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Cinzel:wght@400;500;600;700;800&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
