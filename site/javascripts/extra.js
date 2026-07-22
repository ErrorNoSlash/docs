/* ---------------------------------------------------------------------------
   search dialog: blue result links

   the panel is rendered inside a shadow root on a bare <div> appended to
   <body>, so extra.css can't select into it — only inherited custom properties
   cross the boundary, which is why the palette overrides in extra.css work and
   nothing else does.

   the result link can't be reached that way either. it's `color: inherit`,
   picking up --color-foreground from the results list, the same property every
   other string in the panel reads. recolouring the property would tint the
   whole panel; recolouring the link means getting inside.

   the root is opened with mode:"open" (only mermaid uses "closed"), so an
   adopted stylesheet works. selector is the bare `a` on purpose: the panel's
   own class names are single letters and are regenerated every build, so
   anything more specific breaks on the next zensical release.
   --------------------------------------------------------------------------- */

(() => {
    // same blue the panel already uses for highlighted search terms, so the
    // title and the matched words inside it read as one family. the panel is
    // dark in both schemes (extra.css forces that in light mode), so the light
    // palette's #123f8f is not an option here — it lands under 2:1 on #16171a.
    const SEARCH_CSS = `
        a {
            color: #8fb0ea;
        }

        a:hover,
        a:focus-visible {
            color: #b9cef5;
        }
    `;

    const styled = new WeakSet();

    const inject = (root) => {
        if (styled.has(root)) return;
        styled.add(root);

        if ("adoptedStyleSheets" in root && "replaceSync" in CSSStyleSheet.prototype) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(SEARCH_CSS);
            root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
        } else {
            // older safari
            const el = document.createElement("style");
            el.textContent = SEARCH_CSS;
            root.appendChild(el);
        }
    };

    // the host is created lazily during boot, so scan once and then watch for it
    const scan = () => {
        for (const el of document.body.children) {
            if (el.tagName === "DIV" && el.shadowRoot) inject(el.shadowRoot);
        }
    };

    const start = () => {
        scan();
        new MutationObserver(scan).observe(document.body, { childList: true });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
