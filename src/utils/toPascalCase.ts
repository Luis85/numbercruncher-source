/**
 * Wandelt einen String in PascalCase um.
 *
 * Beispiel:
 *   "Work Item Type" → "WorkItemType"
 *
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}
