# UIPanel

Small vanilla JS library for collapsible / closable panels. No dependencies.

## Usage

```html
<link rel="stylesheet" href="src/panel.css">

<script type="module">
  import { UIPanel } from './src/panel.js';

  new UIPanel({ title: 'Hello', content: '<p>hi</p>', closable: true })
    .on('close', () => console.log('closed'))
    .mount('#app');
</script>
```

### Options

- `title` - panel title
- `content` - html string or a DOM node
- `collapsible` - default `true`
- `closable` - default `false`
- `collapsed` - start collapsed

### Methods

`mount(target)`, `setTitle(text)`, `setContent(content)`, `collapse()`, `expand()`, `toggle()`, `close()`, `destroy()`, `on(event, fn)`, `off(event, fn)`

Events: `mount`, `collapse`, `expand`, `close`

## Running the demo

ES modules don't load from `file://`, so serve the folder:

```
npx serve .
```

and open `index.html`.
