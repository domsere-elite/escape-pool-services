import React from "react";
import { renderToString } from "react-dom/server";
import V2Page from "./v2.jsx";

// Build-time prerender entry (see scripts/prerender.mjs). Renders the page
// with the default headline angle; non-default angles re-render client-side.
export function render() {
  return renderToString(<V2Page />);
}
