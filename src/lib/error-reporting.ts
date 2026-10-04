// Generic runtime error reporter.
// This logs errors and calls an optional global hook `window.__appReportRuntimeError` if present.

type ErrorReportPayload = {
  message: string;
  stack?: string;
  filename?: string;
  context?: Record<string, unknown>;
};

declare global {
  interface Window {
    __appReportRuntimeError?: (payload: ErrorReportPayload) => void;
  }
}

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  // Avoid calling in non-browser environments.
  if (typeof window === "undefined") return;

  // Console log for local/dev visibility.
  console.error(error);

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  const payload: ErrorReportPayload = {
    message,
    ...(stack !== undefined && { stack }),
    filename: typeof window !== "undefined" ? window.location.pathname : undefined,
    context,
  } as ErrorReportPayload;

  // Call an optional global hook (keeps integration points for custom telemetry).
  try {
    window.__appReportRuntimeError?.(payload);
  } catch (e) {
    // swallow any telemetry errors to avoid crash loops
  }
}
