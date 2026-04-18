import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n/i18n";

// Signal the Telegram Mini App WebApp that the app is ready
try {
  window.Telegram?.WebApp?.ready();
  window.Telegram?.WebApp?.expand();
} catch {
}

createRoot(document.getElementById("root")!).render(<App />);
