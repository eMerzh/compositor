export function round(a: number, afterComma = 0) {
  const coef = 10 ** afterComma
  return Math.round(a * coef) / coef
}
