import { UIPanel } from './panel.js';

const DEFAULT_KEY = 'uipanel:state';

export function readState(storage, key = DEFAULT_KEY) {
  const raw = storage.getItem(key);
  return raw ? JSON.parse(raw) : {};
}

export function writeState(storage, state, key = DEFAULT_KEY) {
  storage.setItem(key, JSON.stringify(state));
}

export class PanelManager {
  constructor(container, opts = {}) {
    this.container = container;
    this.persist = !!opts.persist;
    this.storage = opts.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.key = opts.storageKey || DEFAULT_KEY;
    this.panels = new Map();
    this.state = this.persist && this.storage ? readState(this.storage, this.key) : {};
  }

  add(opts = {}) {
    if (this.persist && !opts.id) {
      throw new Error('PanelManager: panels need an id when persist is on');
    }

    const saved = opts.id ? this.state[opts.id] : null;
    const panel = new UIPanel({
      ...opts,
      collapsed: saved ? saved.collapsed : opts.collapsed,
    });

    panel.on('collapse', () => this._update(panel.id, { collapsed: true }));
    panel.on('expand', () => this._update(panel.id, { collapsed: false }));
    panel.on('close', () => this.panels.delete(panel.id));

    this.panels.set(panel.id, panel);
    panel.mount(this.container);
    return panel;
  }

  get(id) {
    return this.panels.get(id);
  }

  remove(id) {
    const panel = this.panels.get(id);
    if (!panel) return false;
    panel.destroy();
    this.panels.delete(id);
    return true;
  }

  collapseAll() {
    this.panels.forEach(p => p.collapse());
  }

  expandAll() {
    this.panels.forEach(p => p.expand());
  }

  clear() {
    this.panels.forEach(p => p.destroy());
    this.panels.clear();
  }

  _update(id, patch) {
    this.state[id] = { ...this.state[id], ...patch };
    if (this.persist && this.storage) writeState(this.storage, this.state, this.key);
  }
}
