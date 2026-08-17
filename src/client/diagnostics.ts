import { scrubDiagnosticLocation } from "../shared/diagnostic-scrubbing";

interface DiagnosticContext {
  applicationVersion: string;
  route: string;
  location?: string;
}

interface ClientErrorReport {
  applicationVersion: string;
  route: string;
  location?: string;
  stack?: string;
}

export function createClientErrorReport(error: Error, context: DiagnosticContext): ClientErrorReport {
  const locations = error.stack
    ?.split("\n")
    .map(scrubDiagnosticLocation)
    .filter((location): location is string => location !== undefined)
    .slice(0, 20)
    .map((location) => `at ${location}`);

  return {
    applicationVersion: context.applicationVersion,
    route: context.route.split(/[?#]/, 1)[0] ?? "/",
    location: scrubDiagnosticLocation(context.location),
    stack: locations === undefined || locations.length === 0 ? undefined : locations.join("\n"),
  };
}

export function reportClientError(error: Error, location?: string): void {
  const report = createClientErrorReport(error, {
    applicationVersion: __APP_VERSION__,
    route: window.location.pathname,
    location,
  });
  void fetch("/api/diagnostics/client-errors", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-operation-id": crypto.randomUUID(),
    },
    body: JSON.stringify(report),
    keepalive: true,
  }).catch(() => undefined);
}

export function installGlobalErrorHandlers(): () => void {
  const onError = (event: ErrorEvent) => {
    reportClientError(event.error instanceof Error ? event.error : new Error("Browser error"), event.filename);
  };
  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportClientError(event.reason instanceof Error ? event.reason : new Error("Unhandled rejection"));
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}
