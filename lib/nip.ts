/** Strip everything but digits. */
export function normalizeNip(input: string): string {
  return input.replace(/\D/g, '')
}

/** Validate a Polish NIP (10 digits + weighted checksum). */
export function isValidNip(input: string): boolean {
  const nip = normalizeNip(input)
  if (nip.length !== 10) return false
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  const sum = weights.reduce((acc, w, i) => acc + w * Number(nip[i]), 0)
  const check = sum % 11
  return check !== 10 && check === Number(nip[9])
}

/** Format 10 digits as `123-456-78-90`. Returns input unchanged if not 10 digits. */
export function formatNip(input: string): string {
  const nip = normalizeNip(input)
  if (nip.length !== 10) return input
  return `${nip.slice(0, 3)}-${nip.slice(3, 6)}-${nip.slice(6, 8)}-${nip.slice(8, 10)}`
}
