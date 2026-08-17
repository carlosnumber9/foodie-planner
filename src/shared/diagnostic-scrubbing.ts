export function scrubDiagnosticLocation(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const match = value.match(
    /(?:https?:\/\/[^/\s()]+)?(\/[^?\s():]+)(?:\?[^():\s]*)?:(\d+):(\d+)\)?$/,
  );
  return match === null ? undefined : `${match[1]}:${match[2]}:${match[3]}`;
}
