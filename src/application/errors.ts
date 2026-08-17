export type ApplicationErrorKind = "not_found" | "conflict" | "unavailable";

export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    public readonly kind: ApplicationErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}
