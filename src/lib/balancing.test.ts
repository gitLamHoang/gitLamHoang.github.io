import { test } from 'node:test';
import assert from 'node:assert/strict';
import { B, balancingNumbers, det, mul, power } from './balancing.ts';

const seq = balancingNumbers(40);

const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));

test('the sequence starts 0, 1, 6, 35, 204, 1189', () => {
  assert.deepEqual(seq.slice(0, 6), [0n, 1n, 6n, 35n, 204n, 1189n]);
});

test('B² matches the paper', () => {
  assert.deepEqual(power(2), [
    [35n, 6n],
    [-6n, -1n],
  ]);
});

test('Theorem 2.1 holds for n = 1..30', () => {
  for (let n = 1; n <= 30; n++) {
    assert.deepEqual(power(n), [
      [seq[n + 1], seq[n]],
      [-seq[n], -seq[n - 1]],
    ]);
  }
});

test('det(Bⁿ) = 1, so B(n)² - B(n+1)·B(n-1) = 1', () => {
  for (let n = 1; n <= 30; n++) assert.equal(det(power(n)), 1n);
});

test('gcd(B(m), B(n)) = B(gcd(m, n))', () => {
  for (let m = 1; m <= 25; m++) {
    for (let n = 1; n <= 25; n++) assert.equal(gcd(seq[m], seq[n]), seq[Number(gcd(BigInt(m), BigInt(n)))]);
  }
});

test('mul is associative on powers of B', () => {
  assert.deepEqual(mul(mul(B, B), B), mul(B, mul(B, B)));
});

test('power rejects n < 1', () => {
  assert.throws(() => power(0), RangeError);
});

test('addition formula: B(m+n) = B(m+1)B(n) - B(m)B(n-1)', () => {
  for (let m = 1; m <= 18; m++) {
    for (let n = 1; n <= 18; n++) assert.equal(seq[m + n], seq[m + 1] * seq[n] - seq[m] * seq[n - 1]);
  }
});

test('Binet-like closed form with eigenvalues 3 ± 2√2', () => {
  const l1 = 3 + 2 * Math.SQRT2;
  const l2 = 3 - 2 * Math.SQRT2;
  for (let n = 0; n <= 20; n++) {
    const binet = (l1 ** n - l2 ** n) / (4 * Math.SQRT2);
    assert.ok(Math.abs(binet - Number(seq[n])) / Math.max(1, Number(seq[n])) < 1e-12, `n = ${n}`);
  }
});

test('n is balancing: 1 + ... + (n - 1) = (n + 1) + ... + (n + r) for some r', () => {
  const sum = (a: bigint, b: bigint) => ((a + b) * (b - a + 1n)) / 2n;
  // B(1) = 1 balances only by convention (r = 0, both sums empty), so start at B(2) = 6.
  for (const n of seq.slice(2, 9)) {
    let found = false;
    for (let r = 1n; r <= n; r++) if (sum(1n, n - 1n) === sum(n + 1n, n + r)) found = true;
    assert.ok(found, `B = ${n}`);
  }
});
