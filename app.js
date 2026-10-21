(function () {
  "use strict";

  /* ================= level 1 · surroundings ================= */
  var SURROUNDS = [
    { id: "none", name: "Plain page", sw: "#e9ebee", title: "Plain page — no host app styles",
      side: "", bleeds: [] },
    { id: "docs", name: "Docs site", sw: "#1c2331", title: "Docs site — slate header, serif body copy",
      side: '<div class="s-search">🔍&nbsp; Search docs…</div>' +
            '<ul class="s-tree"><li>Getting started</li><li>Installation</li><li class="on">Shadow DOM</li><li>Theming</li><li>API reference</li></ul>' +
            '<div class="s-ver">v49.0.0 · stable</div>',
      bleeds: [
        { rule: ".frame p, li, blockquote → Georgia serif, #2d3748", effect: "body text turns serif and slate" },
        { rule: ".frame h2, h3 → #10b981", effect: "headings turn teal-green" },
        { rule: ".frame a → #0d9488, underline", effect: "links restyle" }
      ] },
    { id: "sf",   name: "Salesforce Lightning", sw: "#0176d3", title: "Lightning app shell — SLDS-inspired",
      side: '<div class="sf-card"><span class="sf-ava">AC</span><span><span class="sf-kicker">Account</span><br/><span class="sf-name">Acme Corp</span></span></div>' +
            '<div class="sf-actions"><span>Edit</span><span>Follow</span><span>New Note</span></div>' +
            '<div class="sf-kicker" style="margin-bottom:4px">Activity</div>' +
            '<ul class="sf-side-list"><li>📞 Call with CTO — today</li><li>✉️ Renewal email — Mon</li><li>📄 Contract draft — Fri</li></ul>',
      bleeds: [
        { rule: ".frame p, li, blockquote → Salesforce Sans 13px, #181818", effect: "body text shrinks to SLDS scale" },
        { rule: ".frame h2, h3 → #032d60, bold", effect: "headings go cloud-navy" },
        { rule: ".frame a → #0176d3", effect: "links turn brand blue" }
      ] },
    { id: "cms",  name: "CMS admin", sw: "#2271b1", title: "CMS admin — dark toolbar, compact sans",
      side: '<div class="cms-add">+ Add content</div>' +
            '<ul class="s-tree cms-tree"><li>📁 Site' +
            '<ul><li>📁 Articles<ul><li class="on">📝 Shadow DOM demo</li><li>📝 Release notes</li></ul></li>' +
            '<li>📁 Pages</li><li>🖼 Media</li><li>🏷 Taxonomy</li></ul></li></ul>',
      bleeds: [
        { rule: ".frame p, li, blockquote → system sans 13px, #3c434a", effect: "body text compacts to admin scale" },
        { rule: ".frame h2, h3 → #1d2327", effect: "headings darken" },
        { rule: ".frame a → #2271b1, underline", effect: "links restyle" }
      ] }
  ];

  /* ================= level 2 · editor themes =================
     v49 derives its whole UI from a semantic layer cascading from the base-*
     variables. Each theme is a palette expanded to the full var set, so button
     labels, hover washes, selected states, focus ring, placeholder and links
     all follow — not just the backgrounds. */
  function hexHsl(hex) { /* "#rrggbb" → "h, s%, l%" (focus-coordinate format) */
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min, h = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return Math.round(h) + ", " + Math.round(s * 100) + "%, " + Math.round(l * 100) + "%";
  }

  function expand(p) {
    var focus = p.focus || p.accent;
    return {
      "--ck-color-base-background": p.bg,
      "--ck-color-base-foreground": p.fg,
      "--ck-color-base-border": p.border,
      "--ck-color-base-border-light": p.borderLight || p.border,
      "--ck-color-base-text": p.text,
      "--ck-color-base-text-light": p.textLight,
      "--ck-color-base-hover": p.hover,
      "--ck-color-base-hover-strong": p.hoverStrong || p.hover,
      "--ck-color-base-selected": p.selected,
      "--ck-color-base-selected-hover": p.selectedHover || p.selected,
      "--ck-color-base-active": p.accent,          /* selected-button labels */
      "--ck-color-base-active-focus": p.accentStrong || p.accent,
      "--ck-color-base-action": p.action || p.accent,
      "--ck-color-base-action-hover": p.actionHover || p.accentStrong || p.accent,
      "--ck-color-button-default-hover-background": p.hover,
      "--ck-color-button-default-active-background": p.hoverStrong || p.hover,
      /* Focus ring: border AND shadow — the glow derives from HSL coordinates,
         so without these a themed border still gets the stock blue halo
         (per the official dark-theme example in the theme-customization guide). */
      "--ck-focus-border-color": focus,
      "--ck-color-interactive-focus-border": focus,
      "--ck-color-focus-border": focus,
      "--ck-color-interactive-focus-border-coordinates": hexHsl(focus),
      "--ck-color-focus-border-coordinates": hexHsl(focus),
      "--ck-color-interactive-focus-shadow": "hsla(" + hexHsl(focus) + ", 0.35)",
      /* Widgets (tables, images): blurred/hover borders + focused-editable fill. */
      "--ck-color-widget-blurred-border": p.border,
      "--ck-color-widget-hover-border": focus,
      "--ck-color-widget-editable-focus-background": p.bg,
      "--ck-color-engine-placeholder-text": p.textLight,
      "--ck-color-link-default": p.link || p.accent,
      "--ck-content-color-image-caption-background": p.fg,
      "--ck-content-color-image-caption-text": p.text,
      /* The document INK lives in a separate namespace: .ck-content takes
         color from --ck-content-font-color (fixed #000 by default), not from
         --ck-color-text. A dark theme must bridge the two namespaces or the
         canvas goes dark while the ink stays black. */
      "--ck-content-font-color": p.text,
      "--ck-content-list-marker-color": p.textLight
    };
  }

  var THEMES = [
    { name: "Lark", sub: "stock", sw: "#ffffff", vars: {} },
    { name: "Lightning", sub: "pairs with the Salesforce surroundings", sw: "#0176d3",
      vars: expand({ bg: "#ffffff", fg: "#fafaf9", border: "#d8d8d8", text: "#181818",
        textLight: "#706e6b", hover: "#f3f3f3", hoverStrong: "#eef4ff",
        selected: "#d8edff", selectedHover: "#c5e2fc",
        accent: "#014486", accentStrong: "#032d60", action: "#0176d3",
        actionHover: "#014486", focus: "#0176d3", link: "#0176d3" }) },
    { name: "Midnight", sub: "graphite dark", sw: "#1c2331",
      vars: expand({ bg: "#1c2331", fg: "#242d3d", border: "#3a455a", text: "#e6e9ef",
        textLight: "#9aa7bd", hover: "#2e3950", hoverStrong: "#38466b",
        selected: "#34415c", selectedHover: "#3d4c6b",
        accent: "#8ab4ff", accentStrong: "#a9c7ff", action: "#5e9bff",
        actionHover: "#78adff", focus: "#4a8cff", link: "#8ab4ff" }) },
    { name: "Nova", sub: "ckeditor.com brand", sw: "#7e00fd",
      vars: expand({ bg: "#1c0038", fg: "#2a0054", border: "#45207a", text: "#f1e9ff",
        textLight: "#c1b2d0", hover: "#3a1468", hoverStrong: "#45207a",
        selected: "#45207a", selectedHover: "#532b8d",
        accent: "#afe229", accentStrong: "#c3f04d",
        focus: "#afe229", link: "#d9b8ff" }) },
    { name: "Sunrise", sub: "warm paper", sw: "#f3a007",
      vars: expand({ bg: "#fffaf0", fg: "#f7e8cb", border: "#e3c892", text: "#4a3414",
        textLight: "#8a703f", hover: "#f0dcb4", hoverStrong: "#ead297",
        selected: "#eed3a0", selectedHover: "#e7c88b",
        accent: "#7a5200", accentStrong: "#6b4a00", action: "#8a5600",
        actionHover: "#7a4c00", focus: "#8a5600", link: "#8a5600" }) },
    { name: "Forest", sub: "deep green", sw: "#1abc84",
      vars: expand({ bg: "#082a21", fg: "#0c3328", border: "#1d5a46", text: "#d7f2e8",
        textLight: "#93bfae", hover: "#124434", hoverStrong: "#17543f",
        selected: "#17543f", selectedHover: "#1d6a50",
        accent: "#5ee9b5", accentStrong: "#7df0c4", action: "#1abc84",
        actionHover: "#26dba5", focus: "#26dba5" }) }
  ];

  var allVarNames = {};
  THEMES.forEach(function (t) { Object.keys(t.vars).forEach(function (k) { allVarNames[k] = 1; }); });

  /* ================= level 3 · content styles ================= */
  var CONTENT_STYLES = [
    { name: "Default", sw: "#e9ebee", css: "" },
    { name: "Editorial", sw: "#8a703f", css:
      ".ck.ck-content{font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.75}" +
      ".ck.ck-content h2,.ck.ck-content h3{font-family:Georgia,serif;font-weight:700;letter-spacing:-0.01em}" +
      ".ck.ck-content blockquote{font-style:italic;border-left-width:3px}" +
      ".ck.ck-content ul li::marker{content:'— '}" +
      ".ck.ck-content a{color:color-mix(in oklab,var(--ck-content-font-color,#000) 35%,#c0392b);text-underline-offset:3px;text-decoration-thickness:1px}" },
    { name: "Mono", sw: "#394556", css:
      ".ck.ck-content{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.65}" +
      ".ck.ck-content h2,.ck.ck-content h3{text-transform:uppercase;letter-spacing:0.07em;font-size:1.05em}" +
      ".ck.ck-content ul li::marker{content:'▸ '}" +
      ".ck.ck-content a{color:color-mix(in oklab,var(--ck-content-font-color,#000) 35%,#0e9f8e);text-decoration:none;border-bottom:1px dashed currentColor}" },
    { name: "Billboard", sw: "#7e00fd", css:
      ".ck.ck-content{font-size:19px;line-height:1.6}" +
      ".ck.ck-content h2{font-size:2em;font-weight:800;letter-spacing:-0.02em}" +
      ".ck.ck-content h3{font-size:1.4em;font-weight:750}" +
      ".ck.ck-content blockquote{font-size:1.15em;font-weight:600;border-left-width:4px}" +
      ".ck.ck-content a{color:color-mix(in oklab,var(--ck-content-font-color,#000) 30%,#8b3dff);font-weight:700;text-decoration-thickness:2px}" }
  ];

  /* ================= shadow roots & style adoption ================= */
  // Self-hosted export: the stylesheet ships as a real file. One fetched copy
  // feeds the constructed CSSStyleSheet adopted by every shadow root; the
  // light-DOM editor is styled by the <link> in index.html.
  fetch("./vendor/ckeditor5.css").then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.text();
  }).then(function (CK_CSS) {
  var EXTRA =
    ".ck.ck-editor__editable_inline{min-height:200px;max-height:44vh}" +
    "@media (prefers-reduced-motion: no-preference){" +
    ".ck.ck-editor, .ck.ck-editor *{transition:background-color .5s ease, color .5s ease, border-color .5s ease}" +
    "}";

  var sharedSheets = null;
  function adoptStyles(root) {
    if (sharedSheets === null) {
      try {
        var s = new CSSStyleSheet();
        s.replaceSync(CK_CSS + EXTRA);
        sharedSheets = [s];
      } catch (e) { sharedSheets = false; }
    }
    if (sharedSheets) {
      root.adoptedStyleSheets = sharedSheets;
    } else {
      var st = document.createElement("style");
      st.textContent = CK_CSS + EXTRA;
      root.appendChild(st);
    }
  }

  /* Overlay layer (balloons, dialogs, tooltips) in its own shadow root on a
     host at the end of <body>, where nothing can clip it (ui.overlayContainer). */
  var overlayHost = document.body.appendChild(document.createElement("div"));
  overlayHost.className = "ck-theme-host";
  var overlayRoot = overlayHost.attachShadow({ mode: "open" });
  adoptStyles(overlayRoot);

  var host = document.getElementById("host");
  var shadow = host.attachShadow({ mode: "open" });
  adoptStyles(shadow);

  /* Content-style carriers: one per tree holding an editing area. */
  /* Note that v49's ckeditor5.css has no .ck-content a rule
     (--ck-color-link-default only paints the link balloon's preview), so the
     LINK COLOR is a content-style concern: the Default preset leaves it to
     inherit from whatever "a" rule reaches the tree; the other presets set
     their own. */
  var shadowContentStyle = document.createElement("style");
  shadow.appendChild(shadowContentStyle);
  var docContentStyle = document.createElement("style");
  document.head.appendChild(docContentStyle);

  /* Theme vars go on the shadow HOST elements (an inline value on the host
     beats the stylesheet's :host declaration) + <html> for the light editor. */
  var THEMED = [document.documentElement, host, overlayHost];

  /* ================= controls ================= */
  var frame = document.getElementById("frame");
  var frameTitle = document.getElementById("frameTitle");
  var combo = document.getElementById("combo");
  var state = { surround: 0, theme: 0, content: 0 };

  function updateCombo() {
    combo.innerHTML = "Current mix — <b>1</b> " + SURROUNDS[state.surround].name +
      " · <b>2</b> " + THEMES[state.theme].name +
      " · <b>3</b> " + CONTENT_STYLES[state.content].name +
      ". With Shadow DOM the editor follows 2 + 3 only; without it, the editor also picks up 1.";
  }

  function makeChips(containerId, items, onPick, before) {
    var box = document.getElementById(containerId);
    items.forEach(function (it, i) {
      var b = document.createElement("button");
      b.className = "chip" + (i === 0 ? " active" : "");
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.innerHTML = '<span class="sw" style="background:' + it.sw + '"></span>' + it.name;
      b.addEventListener("click", function () { onPick(i); });
      if (before) box.insertBefore(b, before); else box.appendChild(b);
    });
    return box;
  }
  function setActive(box, i) {
    Array.prototype.forEach.call(box.querySelectorAll(".chip"), function (c, j) {
      c.classList.toggle("active", j === i);
      c.setAttribute("aria-pressed", j === i ? "true" : "false");
    });
  }

  var frameSide = document.getElementById("frameSide");
  var bleedEl = document.getElementById("bleed");
  var tagLight = document.getElementById("tagLight");

  function renderBleed(s) {
    var body;
    if (!s.bleeds.length) {
      body = '<ul><li><span class="ok">No host app styles active beyond the page\'s own <code>a { color }</code>, which already reaches the editor without Shadow DOM (compare the link row below). Pick a surroundings preset to see the full bleed.</span></li></ul>';
    } else {
      body = "<ul>" + s.bleeds.map(function (b) {
        return "<li><code>" + b.rule + "</code> — " + b.effect +
          ' <span class="hits">→ hits host copy ✓ · without Shadow DOM ✓ · with Shadow DOM ✕</span></li>';
      }).join("") + "</ul>";
    }
    bleedEl.innerHTML = '<p class="bleed-title">What leaks where</p>' + body +
      '<div class="measured" id="measured"></div>';
    scheduleMeasure();
  }

  /* live evidence: computed style of the first paragraph in each copy */
  var measureTimer = null;
  function scheduleMeasure() {
    if (measureTimer) clearTimeout(measureTimer);
    measureTimer = setTimeout(measure, 650); /* wait out the color transitions */
  }
  /* color-mix() results come back as oklab(); print them as rgb() like the rest */
  function okToRgb(c) {
    var m = /^oklab\(([-\d.]+) ([-\d.]+) ([-\d.]+)\)$/.exec(c);
    if (!m) return c;
    var L = +m[1], a = +m[2], b = +m[3];
    var l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    var l = l_ * l_ * l_, mm = m_ * m_ * m_, ss = s_ * s_ * s_;
    function g(v) { v = Math.min(1, Math.max(0, v)); return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)); }
    return "rgb(" + g(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * ss) + ", " +
      g(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * ss) + ", " +
      g(-0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * ss) + ")";
  }
  function probe(scopeRoot) {
    if (!scopeRoot) return null;
    function cs(sel, prop) {
      /* selectors in priority order: inside an editor, ".ck-content a" must win
         over any "a" the editor UI renders earlier in the tree */
      var el = null;
      sel.split(", ").some(function (one) { el = scopeRoot.querySelector(one); return !!el; });
      if (!el) return null;
      var v = getComputedStyle(el)[prop];
      return prop === "fontFamily" ? v.split(",")[0].replace(/["']/g, "") : okToRgb(v);
    }
    return {
      "paragraph font": cs(".ck-content p, p", "fontFamily"),
      "paragraph size": cs(".ck-content p, p", "fontSize"),
      "paragraph color": cs(".ck-content p, p", "color"),
      "heading color": cs(".ck-content h2, h2", "color"),
      "link color": cs(".ck-content a, a", "color")
    };
  }
  function measure() {
    var out = document.getElementById("measured");
    if (!out) return;
    /* ClassicEditor hides the source element and inserts the UI beside it,
       so probe the column, not the source div. */
    var sh = probe(shadow);
    var li = probe(document.getElementById("isoLight").parentElement);
    if (!sh || !li) return;
    var rows = Object.keys(sh).map(function (k) {
      if (sh[k] == null || li[k] == null) return "";
      var same = sh[k] === li[k];
      return "<tr><td>" + k + "</td><td>" + sh[k] + "</td><td>" + li[k] + "</td><td>" +
        (same ? '<span class="d-ok">✓ intact</span>'
              : '<span class="d-bad">⚠ overridden by the surroundings</span>') + "</td></tr>";
    }).join("");
    out.innerHTML =
      '<p class="bleed-title" style="margin-top:12px">Measured in your browser — what survived in the editor without Shadow DOM</p>' +
      '<table class="diffs"><thead><tr><th>first element</th><th>with Shadow DOM (intended)</th><th>without Shadow DOM (actual)</th><th>verdict</th></tr></thead>' +
      "<tbody>" + rows + "</tbody></table>";
  }

  var surroundBox = makeChips("surroundChips", SURROUNDS, function (i) {
    state.surround = i;
    var s = SURROUNDS[i];
    frame.dataset.surround = s.id;
    frameTitle.textContent = s.title;
    frameSide.innerHTML = s.side;
    tagLight.textContent = s.bleeds.length ? "Without Shadow DOM — host styles leak in" : "Without Shadow DOM";
    renderBleed(s);
    setActive(surroundBox, i); updateCombo();
  });
  renderBleed(SURROUNDS[0]);

  var tourBtn = document.getElementById("tour");
  var themeBox = makeChips("themeChips", THEMES, function (i) { stopTour(); applyTheme(i); }, tourBtn);

  function applyTheme(i) {
    state.theme = i;
    var t = THEMES[i];
    THEMED.forEach(function (el) {
      Object.keys(allVarNames).forEach(function (k) { el.style.removeProperty(k); });
      Object.keys(t.vars).forEach(function (k) { el.style.setProperty(k, t.vars[k]); });
    });
    setActive(themeBox, i); updateCombo(); scheduleMeasure();
  }

  var tourTimer = null;
  function stopTour() {
    if (tourTimer) { clearInterval(tourTimer); tourTimer = null; tourBtn.innerHTML = "▶&#xFE0E; Theme tour"; }
  }
  tourBtn.addEventListener("click", function () {
    if (tourTimer) { stopTour(); return; }
    tourBtn.innerHTML = "■&#xFE0E; Stop tour";
    applyTheme((state.theme + 1) % THEMES.length);
    tourTimer = setInterval(function () { applyTheme((state.theme + 1) % THEMES.length); }, 2400);
  });

  var contentBox = makeChips("contentChips", CONTENT_STYLES, function (i) {
    state.content = i;
    shadowContentStyle.textContent = CONTENT_STYLES[i].css;
    docContentStyle.textContent = CONTENT_STYLES[i].css;
    setActive(contentBox, i); updateCombo(); scheduleMeasure();
  });

  updateCombo();

  /* ================= editors =================
     ONE sample document, rendered three times: as plain page DOM in the
     dashed host copy, inside the light-DOM editor, inside the shadow editor. */
  var DOC =
    "<h2>Quarterly product notes</h2>" +
    "<p>The editor ships to <a href='https://ckeditor.com'>every team</a> this quarter. The same markup you are reading here exists three times on this page — compare the copies as you switch the levels.</p>" +
    "<ul><li>Rollout starts with the docs team.</li>" +
    "<li>Salesforce embeds follow in November.</li>" +
    "<li>The CMS migration closes the year.</li></ul>" +
    "<blockquote><p>Isolation is not a feature you add — it is the tree you render in.</p></blockquote>";
  document.getElementById("hostCopy").innerHTML = DOC;

  function bootError(el, msg) {
    el.innerHTML = "<p style='font:14px system-ui;color:#e92e3d'>CKEditor failed to start: " + msg + "</p>";
  }

  if (!window.CKEDITOR) {
    bootError(host, "the UMD bundle did not load (CDN blocked or offline).");
    return;
  }
  var CK = window.CKEDITOR;

  var CONFIG = {
    licenseKey: "GPL",
    plugins: [
      CK.Essentials, CK.Paragraph, CK.Heading, CK.Bold, CK.Italic, CK.Underline,
      CK.Strikethrough, CK.Link, CK.List, CK.TodoList, CK.BlockQuote,
      CK.Table, CK.TableToolbar, CK.Font, CK.Highlight, CK.Alignment,
      CK.HorizontalLine, CK.RemoveFormat
    ],
    toolbar: [
      "undo", "redo", "|", "heading", "|",
      "bold", "italic", "underline", "|",
      "fontSize", "fontColor", "fontBackgroundColor", "highlight", "|",
      "alignment", "link", "|",
      "bulletedList", "numberedList", "todoList", "|",
      "blockQuote", "insertTable", "horizontalLine", "|", "removeFormat"
    ],
    table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"] }
  };

  /* shadow-DOM editor */
  host.innerHTML = "";
  var mount = document.createElement("div");
  mount.innerHTML = DOC;
  shadow.appendChild(mount);
  CK.ClassicEditor.create(mount, Object.assign({}, CONFIG, { ui: { overlayContainer: overlayRoot } }))
    .then(scheduleMeasure)
    .catch(function (e) { bootError(mount, String(e && e.message || e)); });

  /* light-DOM twin — same build, same config, no shadow root */
  var isoLight = document.getElementById("isoLight");
  isoLight.innerHTML = DOC;
  CK.ClassicEditor.create(isoLight, CONFIG)
    .then(scheduleMeasure)
    .catch(function (e) { bootError(isoLight, String(e && e.message || e)); });

  /* ================= syntax highlighting for the Visualforce snippet =================
     Reads the <pre>'s textContent, re-emits it as spans. Markup (apex/HTML) and the
     inline <script> body get separate tokenizers; each alternation is scanned left to
     right so a quote inside a comment, or "//" inside a string, lands in the right token. */
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function tok(cls, s) { return '<span class="tok-' + cls + '">' + esc(s) + "</span>"; }
  function hlMerge(s) {              /* {!$Resource.X} merge fields inside strings */
    var re = /\{![^}]*\}/g, out = "", last = 0, m;
    while ((m = re.exec(s))) { out += esc(s.slice(last, m.index)) + tok("m", m[0]); last = re.lastIndex; }
    return out + esc(s.slice(last));
  }
  function hlAttrs(s) {
    var re = /("[^"]*"|'[^']*')|([\w:.-]+)(?=\s*=)/g, out = "", last = 0, m;
    while ((m = re.exec(s))) {
      out += esc(s.slice(last, m.index));
      out += m[1] ? '<span class="tok-s">' + hlMerge(m[1]) + "</span>" : tok("a", m[2]);
      last = re.lastIndex;
    }
    return out + esc(s.slice(last));
  }
  function hlMarkup(s) {
    var re = /(<!--[\s\S]*?-->)|(<\/?[\w:.-]+)([^>]*?)(\/?>)/g, out = "", last = 0, m;
    while ((m = re.exec(s))) {
      out += esc(s.slice(last, m.index));
      out += m[1] ? tok("c", m[1]) : tok("t", m[2]) + hlAttrs(m[3]) + tok("t", m[4]);
      last = re.lastIndex;
    }
    return out + esc(s.slice(last));
  }
  function hlJs(s) {
    var re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(const|let|var|await|async|new|for|of|in|function|return|if|else|import|export|class|true|false|null|undefined)\b|\b(\d+(?:\.\d+)?)\b/g;
    var out = "", last = 0, m;
    while ((m = re.exec(s))) {
      out += esc(s.slice(last, m.index));
      if (m[1]) out += tok("c", m[1]);
      else if (m[2]) out += '<span class="tok-s">' + hlMerge(m[2]) + "</span>";
      else if (m[3]) out += tok("k", m[3]);
      else out += tok("n", m[4]);
      last = re.lastIndex;
    }
    return out + esc(s.slice(last));
  }
  function highlightCode(pre) {
    var s = pre.textContent, html = "", last = 0, m;
    var re = /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g;
    while ((m = re.exec(s))) {
      html += hlMarkup(s.slice(last, m.index)) + hlMarkup(m[1]) + hlJs(m[2]) + hlMarkup(m[3]);
      last = re.lastIndex;
    }
    pre.innerHTML = html + hlMarkup(s.slice(last));
  }
  try { highlightCode(document.getElementById("vfCode")); } catch (e) { /* plain text is a fine fallback */ }

  /* ================= copy button ================= */
  var copyBtn = document.getElementById("copyVf");
  copyBtn.addEventListener("click", function () {
    var text = document.getElementById("vfCode").textContent;
    navigator.clipboard.writeText(text).then(function () {
      copyBtn.textContent = "Copied ✓";
      setTimeout(function () { copyBtn.textContent = "Copy"; }, 1600);
    }).catch(function () {
      var range = document.createRange();
      range.selectNodeContents(document.getElementById("vfCode"));
      var sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(range);
      copyBtn.textContent = "Select + ⌘C";
    });
  });
  }).catch(function (e) { console.error("CKEditor stylesheet failed to load:", e); });
})();
