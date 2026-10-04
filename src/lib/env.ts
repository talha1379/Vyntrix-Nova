export function getEnv(name: string): string | undefined {
  if (typeof process !== "undefined" && process?.env) {
    const value = process.env[name];
    if (value) return value;
  }

  if (typeof import.meta !== "undefined" && import.meta.env) {
    const viteName = name.startsWith("VITE_") ? name : `VITE_${name}`;
    const value = (import.meta.env as Record<string, unknown>)[viteName];

    if (typeof value === "string" && value) return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
  }

  return undefined;
}
