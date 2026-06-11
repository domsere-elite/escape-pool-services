import React from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import V2Page from "./v2.jsx";
import { DEFAULT_ANGLE, VALID_ANGLES } from "./track.js";
import "./index.css";

const container = document.getElementById("root");
const app = (
  <React.StrictMode>
    <V2Page />
  </React.StrictMode>
);

// The build prerenders the page with the default headline angle. When an ad
// requests a different angle (?angle=offer etc.) the static markup won't
// match what React would render, so fall back to a clean client render
// instead of hydrating into a mismatch.
const angleParam = new URLSearchParams(window.location.search).get("angle");
const isDefaultAngle = !angleParam || angleParam === DEFAULT_ANGLE || !VALID_ANGLES.has(angleParam);

if (container.hasChildNodes() && isDefaultAngle) {
  hydrateRoot(container, app);
} else {
  container.innerHTML = "";
  createRoot(container).render(app);
}
