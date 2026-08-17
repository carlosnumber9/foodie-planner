import { useRegisterSW } from "virtual:pwa-register/react";

import { useDraftState } from "../draft-state";

export function UpdatePrompt() {
  const { hasUnsavedChanges } = useDraftState();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) {
    return null;
  }

  return (
    <aside aria-live="polite" className="update-notice">
      <p>
        {hasUnsavedChanges
          ? "Hay una actualización, pero primero guarda o descarta tus cambios."
          : "Hay una nueva versión disponible."}
      </p>
      <div className="update-actions">
        {!hasUnsavedChanges && (
          <button type="button" onClick={() => void updateServiceWorker(true)}>
            Actualizar ahora
          </button>
        )}
        <button type="button" onClick={() => setNeedRefresh(false)}>
          Más tarde
        </button>
      </div>
    </aside>
  );
}
