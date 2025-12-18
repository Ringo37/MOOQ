export function parseInitialContent(value: string | null) {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}
