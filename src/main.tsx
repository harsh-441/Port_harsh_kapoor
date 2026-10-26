import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("The portfolio root element is missing.");
const portraitAvailable = container.dataset.portraitAvailable !== "false";

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <App portraitAvailable={portraitAvailable} />
    </HelmetProvider>
  </React.StrictMode>
);

if (container.childElementCount === 0) {
  ReactDOM.createRoot(container).render(app);
} else {
  ReactDOM.hydrateRoot(container, app);
}
