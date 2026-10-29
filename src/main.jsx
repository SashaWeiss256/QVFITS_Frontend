/* Root Render */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";

// Each deploy renames the page files, so a tab opened before it asks for ones that no longer exist.
// Load the new version instead of showing an error; at most once a minute, so a real outage can't loop.
window.addEventListener("vite:preloadError", (event) => {
  const KEY = "qvfits:reloaded-at";
  try {
    if (Date.now() - (Number(sessionStorage.getItem(KEY)) || 0) < 60_000) return;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: reload anyway; the browser's own back-off stops a loop.
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
