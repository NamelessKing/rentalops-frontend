import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./index.css";
import App from "./App.tsx";
import { AppProviders } from "./app/AppProviders";

// Mount the React app.
// AppProviders sets up BrowserRouter and AuthProvider before <App />,
// so every component in the tree can use routing hooks and useAuth().
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
