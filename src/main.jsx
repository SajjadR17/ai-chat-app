import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/authContext.jsx";
import { AiProvider } from "./contexts/aiContext.jsx";
import "@fontsource/vazirmatn";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AiProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AiProvider>
    </AuthProvider>
  </StrictMode>,
);
