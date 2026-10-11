import { uid, clamp } from './utils.js';

export class UIPanel {
  constructor(opts = {}) {
    this.id = opts.id || uid('panel');
    this.title = opts.title || 'Untitled';
    this.collapsible = opts.collapsible !== false;
    this.closable = !!opts.closable;
    this.collapsed = !!opts.collapsed;
    this.draggable = !!opts.draggable;
    this.handlers = {};
    this.el = null;
    this._drag = null;

    this._startDrag = this._startDrag.bind(this);
    this._onDragMove = this._onDragMove.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);

    this._build(opts.content);
  }

  _build(content) {
    const el = document.createElement('div');
    el.className = 'uipanel';
    el.id = this.id;

    const header = document.createElement('div');
    header.className = 'uipanel-header';

    const title = document.createElement('span');
    title.className = 'uipanel-title';
    title.innerHTML = this.title;
    header.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'uipanel-actions';

    if (this.collapsible) {
      const btn = document.createElement('button');
      btn.className = 'uipanel-btn uipanel-toggle';
      btn.textContent = this.collapsed ? '+' : '-';
      btn.addEventListener('click', () => this.toggle());
      actions.appendChild(btn);
      this.toggleBtn = btn;
    }

    if (this.closable) {
      const btn = document.createElement('button');
      btn.className = 'uipanel-btn uipanel-close';
      btn.textContent = 'x';
      btn.addEventListener('click', () => this.close());
      actions.appendChild(btn);
    }

    header.appendChild(actions);

    const body = document.createElement('div');
    body.className = 'uipanel-body';

    el.appendChild(header);
    el.appendChild(body);

    this.el = el;
    this.header = header;
    this.titleEl = title;
    this.body = body;

    if (content) this.setContent(content);
    if (this.collapsed) el.classList.add('collapsed');

    if (this.draggable) {
      el.classList.add('uipanel-draggable');
      header.addEventListener('pointerdown', this._startDrag);
    }
  }

  mount(parent) {
    const target = typeof parent === 'string' ? document.querySelector(parent) : parent;
    if (!target) throw new Error('UIPanel: mount target not found');
    target.appendChild(this.el);
    this.emit('mount');
    return this;
  }

  setTitle(text) {
    this.title = text;
    this.titleEl.innerHTML = text;
    return this;
  }

  setContent(content) {
    if (content instanceof Node) {
      this.body.innerHTML = '';
      this.body.appendChild(content);
    } else {
      this.body.innerHTML = content;
    }
    return this;
  }

  moveTo(x, y) {
    this.el.style.position = 'fixed';
    this.el.style.left = x + 'px';
    this.el.style.top = y + 'px';
    return this;
  }

  _startDrag(e) {
    if (e.button !== 0 || e.target.closest('.uipanel-btn')) return;

    const rect = this.el.getBoundingClientRect();
    this._drag = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };

    // keep the width it had in the normal flow
    this.el.style.width = rect.width + 'px';
    this.moveTo(rect.left, rect.top);
    this.el.classList.add('dragging');

    document.addEventListener('pointermove', this._onDragMove);
    document.addEventListener('pointerup', this._onDragEnd);
    e.preventDefault();
  }

  _onDragMove(e) {
    if (!this._drag) return;
    const maxX = window.innerWidth - this.el.offsetWidth;
    const maxY = window.innerHeight - this.header.offsetHeight;
    const x = clamp(e.clientX - this._drag.dx, 0, maxX);
    const y = clamp(e.clientY - this._drag.dy, 0, maxY);
    this.moveTo(x, y);
    this.emit('move', x, y);
  }

  _onDragEnd() {
    this._drag = null;
    this.el.classList.remove('dragging');
    document.removeEventListener('pointermove', this._onDragMove);
    document.removeEventListener('pointerup', this._onDragEnd);
    this.emit('dragend', parseInt(this.el.style.left), parseInt(this.el.style.top));
  }

  collapse() {
    if (!this.collapsible || this.collapsed) return this;
    this.collapsed = true;
    this.el.classList.add('collapsed');
    this.toggleBtn.textContent = '+';
    this.emit('collapse');
    return this;
  }

  expand() {
    if (!this.collapsed) return this;
    this.collapsed = false;
    this.el.classList.remove('collapsed');
    this.toggleBtn.textContent = '-';
    this.emit('expand');
    return this;
  }

  toggle() {
    return this.collapsed ? this.expand() : this.collapse();
  }

  close() {
    this.emit('close');
    this.destroy();
  }

  on(evt, fn) {
    (this.handlers[evt] = this.handlers[evt] || []).push(fn);
    return this;
  }

  off(evt, fn) {
    if (!this.handlers[evt]) return this;
    this.handlers[evt] = this.handlers[evt].filter(h => h !== fn);
    return this;
  }

  emit(evt, ...args) {
    (this.handlers[evt] || []).forEach(fn => fn.apply(this, args));
  }

  destroy() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.handlers = {};
    this.el = null;
  }
}
