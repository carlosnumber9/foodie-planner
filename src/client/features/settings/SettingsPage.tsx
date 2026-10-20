import { useEffect, useState, type FormEvent } from "react";

import { catalog } from "../../../catalog";
import { measurementTypes } from "../../../domain/measurement";
import { toScaledQuantity } from "../../../domain/quantity";
import { useDraftState } from "../../draft-state";
import {
  createLocalRepository,
  openLocalDatabase,
  type LocalRepository,
} from "../../persistence/local-repository";

type LocalState = Awaited<ReturnType<LocalRepository["load"]>>;
const typeLabels = { mass: "Masa", volume: "Volumen", count: "Cantidad" };

export function SettingsPage() {
  const [repository, setRepository] = useState<LocalRepository | null>(null);
  const [state, setState] = useState<LocalState | null>(null);
  const [timeZone, setTimeZone] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [unitDraft, setUnitDraft] = useState(false);
  const { setHasUnsavedChanges } = useDraftState();
  const dirty =
    unitDraft || (state !== null && timeZone !== state.settings.timeZone);

  useEffect(() => {
    setHasUnsavedChanges(dirty);
    return () => setHasUnsavedChanges(false);
  }, [dirty, setHasUnsavedChanges]);

  useEffect(() => {
    let cancelled = false;
    let localRepository: LocalRepository | undefined;
    void (async () => {
      try {
        const database = await openLocalDatabase();
        localRepository = createLocalRepository(database, catalog.units);
        if (cancelled) {
          localRepository.close();
          return;
        }
        const loaded = await localRepository.load();
        if (cancelled) return;
        setRepository(localRepository);
        setState(loaded);
        setTimeZone(loaded.settings.timeZone);
      } catch {
        if (!cancelled)
          setError(
            "No se pudieron leer los datos locales. Comprueba el almacenamiento del navegador y vuelve a cargar la página.",
          );
      }
    })();
    return () => {
      cancelled = true;
      localRepository?.close();
    };
  }, []);

  async function run(
    operation: (storage: LocalRepository) => Promise<unknown>,
  ): Promise<void> {
    if (!repository || pending) return;
    setPending(true);
    setError("");
    setSaved(false);
    try {
      await operation(repository);
      const loaded = await repository.load();
      setState(loaded);
      setSaved(true);
    } catch {
      setError(
        "No se pudo guardar el cambio en este navegador. Revisa los datos y el espacio disponible e inténtalo de nuevo.",
      );
    } finally {
      setPending(false);
    }
  }

  function addUnit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const fieldText = (name: string): string => {
      const value = fields.get(name);
      return typeof value === "string" ? value.trim() : "";
    };
    const measurementType = measurementTypes.find(
      (type) => type === fields.get("measurementType"),
    );
    if (!measurementType) return;
    void run(async (storage) => {
      await storage.create({
        id: `personal-${crypto.randomUUID()}`,
        code: fieldText("code"),
        symbol: fieldText("symbol"),
        name: fieldText("name"),
        measurementType,
        baseAmountPerUnit: toScaledQuantity(Number(fields.get("factor"))),
        isBuiltIn: false,
        isActive: true,
      });
      form.reset();
      setUnitDraft(false);
    });
  }

  return (
    <section className="page-card">
      <h1>Ajustes</h1>
      <p>
        Los cambios se guardan solo en este navegador. Borrar los datos del
        sitio elimina tu actividad personal.
      </p>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {!state && !error && <p role="status">Leyendo datos locales…</p>}
      {saved && <p role="status">Cambio guardado en este navegador.</p>}
      {state && (
        <>
          <form
            className="settings-form"
            onSubmit={(event) => {
              event.preventDefault();
              void run((storage) => storage.saveSettings({ timeZone }));
            }}
          >
            <label className="field">
              Zona horaria
              <input
                required
                disabled={pending}
                value={timeZone}
                onChange={(event) => {
                  setTimeZone(event.target.value);
                  setSaved(false);
                }}
              />
            </label>
            <p className="field-help">Usa un nombre como Europe/Madrid.</p>
            <button className="primary-button" disabled={pending} type="submit">
              Guardar ajustes
            </button>
          </form>
          <h2>Unidades</h2>
          <ul className="unit-list">
            {state.units.map((unit) => (
              <li key={unit.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={unit.isActive}
                    disabled={pending}
                    onChange={(event) => {
                      const active = event.target.checked;
                      void run((storage) => storage.setActive(unit.id, active));
                    }}
                  />{" "}
                  {unit.name} ({unit.symbol})
                </label>
              </li>
            ))}
          </ul>
          <h2>Nueva unidad personal</h2>
          <form
            className="settings-form"
            onSubmit={addUnit}
            onChange={() => {
              setUnitDraft(true);
              setSaved(false);
            }}
          >
            <label className="field">
              Nombre
              <input disabled={pending} name="name" required maxLength={80} />
            </label>
            <label className="field">
              Código
              <input disabled={pending} name="code" required maxLength={24} />
            </label>
            <label className="field">
              Símbolo
              <input disabled={pending} name="symbol" required maxLength={16} />
            </label>
            <div className="field">
              <label htmlFor="unit-measurement-type">Magnitud</label>
              <select
                disabled={pending}
                id="unit-measurement-type"
                name="measurementType"
              >
                {measurementTypes.map((type) => (
                  <option key={type} value={type}>
                    {typeLabels[type]}
                  </option>
                ))}
              </select>
            </div>
            <label className="field">
              Cantidad por unidad
              <input
                disabled={pending}
                name="factor"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
            </label>
            <p className="field-help">
              Expresada en gramos, mililitros o unidades según la magnitud.
            </p>
            <button className="primary-button" disabled={pending} type="submit">
              Crear unidad
            </button>
            <button
              className="secondary-button"
              disabled={pending}
              type="reset"
              onClick={() => setUnitDraft(false)}
            >
              Descartar unidad
            </button>
          </form>
        </>
      )}
    </section>
  );
}
