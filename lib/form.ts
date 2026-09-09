/**
 * FormData -> plain object of string values. Keys absent from the form are
 * simply missing (so Zod `.optional()` sees `undefined`, never `null`).
 * File entries are dropped.
 */
export function formToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') out[key] = value
  }
  return out
}
