# CLAUDE.md — CKEditor Shadow Showcase

Context for AI-assisted edits. This is a **plain static site** — no build step,
no package.json, no framework. Edit the files directly and land them on
`main` (via a PR branch); GitHub Pages deploys from the `main` branch root
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
- The twin editor without Shadow DOM (`#isoLight`, left column, labelled
  "today's default") is styled by the `<link>` to the same CSS file in
  `index.html`. The shadow editor (`#host`) is the right column. Keep the
  "without / with Shadow DOM" wording in labels, bleed report and
  divergence table — the columns were deliberately swapped so the
  familiar setup comes first.
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
6. **Link color is not a theme token.** v49's `ckeditor5.css` has no
   `.ck-content a` rule; `--ck-color-link-default` only paints the link
   balloon's preview. Link color therefore lives in `CONTENT_STYLES`: the
   Default preset deliberately leaves it to inherit (so the page's
   `a { color }` visibly reaches the editor without Shadow DOM — that leak
   is part of the demo), the other presets set `.ck.ck-content a` with
   `color-mix()` against `--ck-content-font-color` so it tracks dark
   themes. Don't "fix" the Default preset by adding a link color.

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
- **`probe()` takes comma-separated selectors in priority order** (first
  match wins), so `.ck-content a` beats any `a` the editor UI renders
  earlier in the tree. `color-mix()` values come back as `oklab(...)`;
  `okToRgb()` normalises them to `rgb()` so the divergence table compares
  like with like.
- **Salesforce section is two recipes side by side** (`.sf-grid` in
  `index.html`): the documented Visualforce-in-an-iframe page
  (`<pre id="vfCode">`) and a *draft, never run in an org* Lightning Web
  Component (`lwcHtml`, `lwcJs`, `lwcXml`). All four blocks are
  **HTML-escaped** markup (`&lt;apex:page&gt;` …) — edit them escaped — and
  keep `licenseKey: 'GPL'` (no commercial keys in a public repo). The LWC
  attaches its own *open* shadow roots to `lwc:dom="manual"` divs because
  Lightning Web Security closes component roots and CKEditor needs an open
  one; keep the "draft for review" badge and checklist until someone has
  verified it in an org.
- **Code blocks are highlighted by a homegrown tokenizer in `app.js`**, not
  a library. `<pre data-lang="markup|js|xml">` picks the tokenizer; copy
  buttons bind via `data-target="<pre id>"`. Token colors are the `.tok-*`
  classes in `styles.css`, audited ≥ 4.5:1 on the dark code surface.
- Upstream limitation (not a bug here): Safari and Chromium do not report
  backward mouse selections inside a shadow root, so selection-anchored UI
  appears at the selection's end. Closed shadow roots are unsupported.

## Upgrading CKEditor

Both vendored files must move together, pinned to the same version:
`vendor/ckeditor5.umd.js` and `vendor/ckeditor5.css` from
`https://cdn.jsdelivr.net/npm/ckeditor5@<ver>/dist/browser/`. The UMD global
is `CKEDITOR`. Update the version strings in `index.html` (header, footer,
stylesheet comment) and `README.md`. The Salesforce recipes reference the
vendored files only by static-resource name, so they need no edit. Re-test
every theme in light and dark mode after an upgrade — the token set is what
usually changes.

## Repo housekeeping

- `.gitignore` covers macOS metadata (`.DS_Store`, `._*`, …), `.vscode/`,
  `.idea/` and logs. `.claude/skills/ckeditor/` is the official CKEditor
  agent skill (https://github.com/ckeditor/skills), vendored for anyone who
  clones the repo; it is the manual-copy install from that README, so to
  update it re-copy `skills/ckeditor/` from the upstream repo.
- Work on a branch and open a PR to `main`; Pages deploys on merge.

## Provenance

Exported from a Claude artifact
(https://claude.ai/artifact/DE3ZBYZzrqhahyanstQ7g1); the single-file artifact
and this repo are siblings, not synced — changes here don't propagate there.
Built against the official guides: getting-started/setup/shadow-dom,
framework/deep-dive/ui/theme-customization, and
getting-started/installation/self-hosted/salesforce.
