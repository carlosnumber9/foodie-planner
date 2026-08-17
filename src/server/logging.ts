import { scrubDiagnosticLocation } from "../shared/diagnostic-scrubbing";

export type DiagnosticOutcome = "success" | "failure";

export interface DiagnosticLogEntry {
  event: string;
  outcome?: DiagnosticOutcome;
  request_id: string;
  operation_id?: string | null;
  route: string;
  duration_ms?: number;
  status?: number;
  error_code?: string;
  entity_type?: string;
  entity_id?: string;
  stack?: string;
  client_route?: string;
  application_version?: string;
  location?: string;
}

export interface Logger {
  info(entry: DiagnosticLogEntry): void;
  warn(entry: DiagnosticLogEntry): void;
  error(entry: DiagnosticLogEntry): void;
}

function write(entry: DiagnosticLogEntry): void {
  console.log(JSON.stringify(entry));
}

export const consoleLogger: Logger = {
  info: write,
  warn: write,
  error(entry) {
    console.error(JSON.stringify(entry));
  },
};

export function scrubErrorStack(error: unknown): string | undefined {
  if (!(error instanceof Error) || error.stack === undefined) {
    return undefined;
  }

  const frames = error.stack.split("\n").slice(1).join("\n").trim();
  return frames.length === 0 ? undefined : frames;
}

export function scrubClientLocation(value: string | undefined): string | undefined {
  return scrubDiagnosticLocation(value);
}

export function scrubClientStack(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const locations = value
    .split("\n")
    .map(scrubClientLocation)
    .filter((location): location is string => location !== undefined)
    .slice(0, 20)
    .map((location) => `at ${location}`);
  return locations.length === 0 ? undefined : locations.join("\n");
}
