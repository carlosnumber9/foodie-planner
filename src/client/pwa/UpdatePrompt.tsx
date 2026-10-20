import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

import { useDraftState } from "../draft-state";

export function UpdatePrompt() {
  const [failed, setFailed] = useState(false);
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
      {failed && (
        <p role="alert">
          No se pudo activar la actualización. Inténtalo de nuevo.
        </p>
      )}
      <div className="update-actions">
        {!hasUnsavedChanges && (
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              void updateServiceWorker(true).catch(() => setFailed(true));
            }}
          >
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
