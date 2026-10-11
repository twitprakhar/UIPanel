import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, uid } from '../src/utils.js';

test('clamp keeps value inside range', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(42, 0, 10), 10);
});

test('uid gives a new id every call', () => {
  const a = uid('x');
  const b = uid('x');
  assert.notEqual(a, b);
  assert.ok(a.startsWith('x-'));
});
