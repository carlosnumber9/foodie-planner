import { useEffect } from "react";
import { BrowserRouter } from "react-router";

import { AppRoutes } from "./App";
import { DraftStateProvider } from "./draft-state";
import { ErrorBoundary } from "./ErrorBoundary";
import { UpdatePrompt } from "./pwa/UpdatePrompt";

export function AppRoot() {
  useEffect(() => {
    if (navigator.storage?.persist)
      void navigator.storage.persist().catch(() => undefined);
  }, []);
  return (
    <DraftStateProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AppRoutes />
          <UpdatePrompt />
        </BrowserRouter>
      </ErrorBoundary>
    </DraftStateProvider>
  );
}
