import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./app/App";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "./styles/tokens.css";
import "./styles/globals.css";
const container = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
let hasSavedProgress = false;
try {
  hasSavedProgress = !!localStorage.getItem("osintdoku_progress_v5");
} catch {
  /* Play without persistence. */
}
const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
const matchesPrerender = container.dataset.prerenderPath === currentPath;
if (container.hasChildNodes() && matchesPrerender && !hasSavedProgress)
  hydrateRoot(container, app);
else createRoot(container).render(app);
