import React from "react";
import { renderToString } from "react-dom/server";
import V2Page from "./v2.jsx";
import { SKAGS } from "./skags.js";

// Build-time prerender entry (see scripts/prerender.mjs).
// render()      → homepage (default headline angle).
// render(skag)  → a message-matched STAG landing page.
export function render(skag) {
  return renderToString(<V2Page skag={skag} />);
}

// Re-exported so the prerender script can read the registry from the
// built server bundle (one import path, no JSX in node).
export { SKAGS };
