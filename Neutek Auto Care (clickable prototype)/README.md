# Neutek Auto Care (clickable prototype) — design reference

This is a design mockup created in a visual design tool, exported as a
standalone page. Treat it as a REFERENCE MOCKUP, not production code:
the markup and inline styles carry the design's precise values — colors,
font sizes, spacing, radii, shadows, layout — which an implementation
should replicate faithfully in its own components and styling system
rather than copy wholesale.

## Contents

- `Main.dc.html` — the artboard (a Design Component: an `<x-dc>`
  template + a small logic class). The values to replicate live in its
  inline `style="…"` attributes and the `<helmet><style>` block.
- `Auth.dc.html` — referenced resource
- `Dialogs.dc.html` — referenced resource
- `Marketing.dc.html` — referenced resource
- `Portal.dc.html` — referenced resource
- `Public.dc.html` — referenced resource
- `Workshop1.dc.html` — referenced resource
- `Workshop2.dc.html` — referenced resource
- `Workshop3.dc.html` — referenced resource
- `nt-core.js` — referenced resource
- `nt-cu.js` — referenced resource
- `nt-data.js` — referenced resource
- `nt-mk.css` — referenced resource
- `nt-pub.js` — referenced resource
- `nt-ws1.js` — referenced resource
- `nt-ws2.js` — referenced resource
- `nt-ws3.js` — referenced resource
- `nt.css` — referenced resource
- `Skeleton.dc.html` — referenced resource
- `Workshop4.dc.html` — referenced resource
- `nt-ws4.js` — referenced resource
- `support.js`, `vendor/react*.js` — the runtime that renders the
  component in a browser; not part of the design.

## Viewing

Serve the folder (e.g. `python3 -m http.server`) and open `Main.dc.html`;
some browsers block the scripts over file://.
