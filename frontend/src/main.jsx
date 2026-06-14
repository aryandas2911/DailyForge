import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AuthProvider from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);