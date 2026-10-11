let counter = 0;

export function uid(prefix = 'id') {
  counter++;
  return `${prefix}-${counter}`;
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
