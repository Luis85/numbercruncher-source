/**
 * Gibt eine zufällige Gleitkommazahl zwischen min (inkl.) und max (exkl.) zurück.
 * @param min Untere Grenze (inklusive)
 * @param max Obere Grenze (exklusive)
 */
export function rngFloat(min: number, max: number): number {
  if (min > max) [min, max] = [max, min]
  return Math.random() * (max - min) + min
}
