export function normalizeIban(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase()
}

/** Validate an IBAN via the ISO 7064 mod-97 check. Accepts spaces. */
export function isValidIban(input: string): boolean {
  const iban = normalizeIban(input)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false

  const rearranged = iban.slice(4) + iban.slice(0, 4)
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55))

  let remainder = 0
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97
  }
  return remainder === 1
}

/** Group into blocks of 4 for display: `PL61 1090 1014 …`. */
export function formatIban(input: string): string {
  return normalizeIban(input)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}
