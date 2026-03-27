// App.tsx
// The root application component.
//
// App is intentionally thin — all provider setup lives in AppProviders
// and all routing logic lives in AppRouter. This keeps the responsibility
// of each file clear and easy to find.

import { AppRouter } from "./router";

function App() {
  // Render the full route tree. BrowserRouter and AuthProvider are already
  // wrapping this component from main.tsx via AppProviders.
  return <AppRouter />;
}

export default App;
