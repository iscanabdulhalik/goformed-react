// src/main.jsx - Düzeltilmiş versiyon
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Development modunda debug araçlarını yükle
if (import.meta.env.DEV) {
  import("./utils/debug.js").catch(() => {});
  import("./utils/shopify-debug.js").catch(() => {});
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ DÜZELTME: BrowserRouter tüm App bileşenini burada sarmalıdır. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
