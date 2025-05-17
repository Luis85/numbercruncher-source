/**
 * Gibt eine zufällige Ganzzahl zwischen min und max (beide inklusive) zurück.
 * @param min Kleinster möglicher Wert
 * @param max Größter möglicher Wert
 */
export function rngInt(min: number, max: number): number {
  // Tausch, falls min größer als max übergeben wurde
  if (min > max) [min, max] = [max, min];
  // Math.random() ∈ [0,1), skaliert auf [0, max-min+1), floor → [0, max-min], + min → [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
