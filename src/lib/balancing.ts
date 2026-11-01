// Balancing numbers by the matrix method (Luu Ba Thang and Phan Hoang Lam, HNUE J. Sci. 2025).
// Theorem 2.1: with B = [[6, 1], [-1, 0]], Bⁿ = [[B(n+1), B(n)], [-B(n), -B(n-1)]],
// where B(0) = 0, B(1) = 1, B(n) = 6·B(n-1) - B(n-2).

export type Mat2 = readonly [readonly [bigint, bigint], readonly [bigint, bigint]];

export const B: Mat2 = [
  [6n, 1n],
  [-1n, 0n],
];

export function mul(a: Mat2, b: Mat2): Mat2 {
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
  ];
}

/** Bⁿ for n ≥ 1, by repeated multiplication (the widget steps one power at a time). */
export function power(n: number): Mat2 {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('n must be a positive integer');
  let m = B;
  for (let i = 1; i < n; i++) m = mul(m, B);
  return m;
}

/** B(0) through B(count - 1) from the recurrence. */
export function balancingNumbers(count: number): bigint[] {
  const out: bigint[] = [];
  for (let i = 0; i < count; i++) out.push(i === 0 ? 0n : i === 1 ? 1n : 6n * out[i - 1] - out[i - 2]);
  return out;
}

export const det = (m: Mat2): bigint => m[0][0] * m[1][1] - m[0][1] * m[1][0];
