import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readState, writeState } from '../src/manager.js';

function fakeStorage() {
  const data = {};
  return {
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
  };
}

test('readState returns empty object when nothing saved', () => {
  assert.deepEqual(readState(fakeStorage()), {});
});

test('writeState then readState round trips', () => {
  const s = fakeStorage();
  writeState(s, { logs: { collapsed: true } });
  assert.deepEqual(readState(s), { logs: { collapsed: true } });
});

test('custom storage key is respected', () => {
  const s = fakeStorage();
  writeState(s, { a: { collapsed: false } }, 'other');
  assert.deepEqual(readState(s), {});
  assert.deepEqual(readState(s, 'other'), { a: { collapsed: false } });
});
