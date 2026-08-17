import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface DraftState {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges(value: boolean): void;
}

const DraftStateContext = createContext<DraftState>({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: () => undefined,
});

export function DraftStateProvider({ children }: { children: ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const value = useMemo(
    () => ({ hasUnsavedChanges, setHasUnsavedChanges }),
    [hasUnsavedChanges],
  );
  return <DraftStateContext.Provider value={value}>{children}</DraftStateContext.Provider>;
}

export function useDraftState(): DraftState {
  return useContext(DraftStateContext);
}
