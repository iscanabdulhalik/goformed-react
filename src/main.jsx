// src/main.jsx - Router hatası düzeltilmiş versiyon
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./index.css";

// Development modunda debug araçlarını yükle
if (import.meta.env.DEV) {
  // Debug araçlarını yükle - hata olursa devam et
  Promise.all([
    import("./utils/shopify-debug.js").catch(() => null),
    import("./utils/debug.js").catch(() => null),
  ]).then(([shopifyModule, debugModule]) => {
    if (shopifyModule) {
      console.log(
        "🛠️ Shopify debug tools loaded! Try: testShopify.connection()"
      );
    }
    if (debugModule) {
      console.log(
        "🔧 GoFormed debug tools loaded! Try: goformedDebug.runAllTests()"
      );
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
