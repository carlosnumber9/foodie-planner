import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppRoot } from "./AppRoot";
import "./styles.css";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Application root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
);
