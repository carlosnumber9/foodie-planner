import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";

import { AppRoutes } from "./App";
import { DraftStateProvider } from "./draft-state";
import { ErrorBoundary } from "./ErrorBoundary";
import { UpdatePrompt } from "./pwa/UpdatePrompt";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <DraftStateProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <AppRoutes />
            <UpdatePrompt />
          </BrowserRouter>
        </ErrorBoundary>
      </DraftStateProvider>
    </QueryClientProvider>
  );
}
