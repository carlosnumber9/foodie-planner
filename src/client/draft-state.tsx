import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [hasUnsavedChanges]);
  const value = useMemo(
    () => ({ hasUnsavedChanges, setHasUnsavedChanges }),
    [hasUnsavedChanges],
  );
  return (
    <DraftStateContext.Provider value={value}>
      {children}
    </DraftStateContext.Provider>
  );
}

export function useDraftState(): DraftState {
  return useContext(DraftStateContext);
}
