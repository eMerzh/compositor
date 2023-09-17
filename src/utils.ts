export function round(a: number, afterComma: number = 0) {
  const coef = Math.pow(10, afterComma);
  return Math.round(a * coef) / coef;
}
