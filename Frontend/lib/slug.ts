/**
 * Convert a trait/champion name to a URL-friendly slug.
 * e.g. "Party Animal" → "party-animal"
 *      "Stargazer - The Serpent" → "stargazer-the-serpent"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents (é→e, etc.)
    .replace(/đ/gi, "d")             // Vietnamese đ
    .replace(/[^a-z0-9\s-]/g, "")    // strip special characters (like dots in N.O.V.A.) FIRST
    .replace(/[\s-]+/g, "-")         // convert any run of spaces/dashes to a single dash
    .replace(/^-|-$/g, "");          // trim leading/trailing dashes
}
