# CLAUDE.md — CKEditor Shadow Showcase

Context for AI-assisted edits. This is a **plain static site** — no build step,
no package.json, no framework. Edit the files directly and push to `main`;
GitHub Pages deploys from the `main` branch root automatically
(live at https://ondrej.chrastina.dev/ckeditor-shadow-showcase/).

## Running and testing locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000/
```

`file://` does NOT work: `app.js` builds the shadow-root stylesheet with
`fetch('./vendor/ckeditor5.css')`. Always test over HTTP, and check the
console — editor boot errors surface there, not on the page.

## Architecture (app.js)

- **One constructed `CSSStyleSheet`** is built from the fetched
  `vendor/ckeditor5.css` and adopted by every shadow root that holds editor
  UI: the editor's root AND a dedicated **overlay root** attached to a host
  at the end of `<body>`, passed as `config.ui.overlayContainer`. Without the
  overlay container the editor logs `ui-overlay-container-not-configured`
  and balloons/dialogs may render unstyled or clipped. Each mount target
  gets its own `.ck-body-wrapper` — don't query for a single global one.
- The light-DOM twin editor is styled by the `<link>` to the same CSS file
  in `index.html`.
- `THEMED` is the list of elements that receive theme variables as **inline
  styles**: `document.documentElement` (for the light editor), the editor
  shadow host, and the overlay host. Any new shadow host holding editor UI
  must be added to it.

## CKEditor 5 v49 theming — the gotchas that cost the most time

1. **`:root` overrides never reach a shadowed editor.** v49 declares every
   token on `:root, :host`; the `:host` declaration on the host element
   beats any value inherited from an ancestor, `!important` included.
   Override on the **shadow host elements** (hence the inline styles).
2. **Token overrides only re-flow on `:root`/hosts.** The theme resolves its
   foundation → semantic → component chain on `:root`/`:host`. A scoped
   override of a foundation or semantic token (e.g. on a wrapper div) is a
   silent no-op — which is why `expand()` writes to the elements in `THEMED`
   and nowhere else.
3. **Two namespaces, one editing area.** The canvas *surface* is theme
   (`--ck-color-base-background`), but the document *ink* is the separate
   `--ck-content-*` namespace with a fixed `#000` default
   (`--ck-content-font-color`). Every dark theme MUST bridge them or you get
   black text on a dark canvas. `expand()` sets `--ck-content-font-color`
   and `--ck-content-list-marker-color` from the palette — keep that.
4. **The focus glow is HSL coordinates, not a color.** The ring's shadow
   derives from `--ck-color-interactive-focus-border-coordinates` (an
   `"h, s%, l%"` string) + `--ck-color-interactive-focus-shadow`. Recoloring
   only the border leaves the stock blue halo. `hexHsl()` computes the
   coordinates from the palette's focus color.
5. **v49 replaced many legacy component vars** (toolbar-background,
   dropdown-panel-*, input-*, button-on-*) with a semantic layer cascading
   from `base-*`. Don't reintroduce legacy var names; extend `expand()`.

## Adding or changing a theme

Add a palette object to `THEMES` and let `expand(palette)` derive the full
var set — never hand-write raw `--ck-color-*` maps. Palettes are
WCAG-audited per pairing; keep these floors when picking colors:
content text on canvas ≥ 7:1; toolbar text, placeholder, links, and
primary-button labels ≥ 4.5:1; focus ring vs. surroundings ≥ 3:1.
(Primary-button label = `text-inverse`, which cascades from
`base-background` — dark themes need an explicit bright `action` color.)

## Other traps

- **ClassicEditor hides its source element.** The divergence-measurement
  code probes the light editor via `isoLight.parentElement`, not `#isoLight`.
- **`scheduleMeasure()` waits 650ms** before reading `getComputedStyle`,
  because CSS color transitions otherwise return intermediate values.
- The Salesforce Visualforce recipe lives in `index.html` inside
  `<pre id="vfCode">` as **HTML-escaped** markup (`&lt;apex:page&gt;` …);
  edit it escaped, and keep `licenseKey: 'GPL'` (no commercial keys in a
  public repo).
- Upstream limitation (not a bug here): Safari and Chromium do not report
  backward mouse selections inside a shadow root, so selection-anchored UI
  appears at the selection's end. Closed shadow roots are unsupported.

## Upgrading CKEditor

Both vendored files must move together, pinned to the same version:
`vendor/ckeditor5.umd.js` and `vendor/ckeditor5.css` from
`https://cdn.jsdelivr.net/npm/ckeditor5@<ver>/dist/browser/`. The UMD global
is `CKEDITOR`. Update the version strings in `index.html` (header, footer)
and `README.md`. Re-test every theme in light and dark mode after an
upgrade — the token set is what usually changes.

## Provenance

Exported from a Claude artifact
(https://claude.ai/artifact/DE3ZBYZzrqhahyanstQ7g1); the single-file artifact
and this repo are siblings, not synced — changes here don't propagate there.
Built against the official guides: getting-started/setup/shadow-dom,
framework/deep-dive/ui/theme-customization, and
getting-started/installation/self-hosted/salesforce.
