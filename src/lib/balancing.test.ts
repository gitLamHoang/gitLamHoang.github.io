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
