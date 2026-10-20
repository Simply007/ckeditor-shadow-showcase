# CKEditor Shadow Showcase

A single-page, dependency-free demo of **CKEditor 5 v49 running inside a Shadow DOM**, next to an identically configured light-DOM twin, with three independently switchable style levels:

1. **Surroundings** — the host page around the editors (plain page, docs site, Salesforce Lightning shell, CMS admin), each with hostile global styles that visibly leak into the light-DOM editor and never into the shadow one.
2. **Editor theme** — WCAG-audited `--ck-color-*` palettes (Lark, Lightning, Midnight, Nova, Sunrise, Forest) applied on the shadow host elements, because v49 declares its tokens on `:root, :host`.
3. **Content styles** — `.ck-content` typography variants applied per DOM tree.

It also includes a copy-paste **Salesforce Visualforce** page implementing the same wrapper (static resources, constructed stylesheet, dedicated overlay container).

## Run it

It is a plain static site — open `index.html` over any HTTP server:

```sh
python3 -m http.server 8000
```

(A `file://` open won't work: the shadow roots build their stylesheet with `fetch('./vendor/ckeditor5.css')`.)

## Layout

| File | Purpose |
|---|---|
| `index.html` | Markup, Visualforce recipe, explanatory panels |
| `styles.css` | The showcase's own page styles |
| `app.js` | Editor bootstrapping, shadow-root wiring, theme/surroundings/content switching, leak measurement |
| `vendor/ckeditor5.css` | CKEditor 5 v49.0.0 stylesheet (self-hosted) |
| `vendor/ckeditor5.umd.js` | CKEditor 5 v49.0.0 UMD build (self-hosted, `licenseKey: 'GPL'`) |

Built after the official [Shadow DOM guide](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/shadow-dom.html), the [theme customization deep dive](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/theme-customization.html), and the [Salesforce integration guide](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/self-hosted/salesforce.html).
