Baseline Checker – VS Code Extension

A VS Code extension that integrates with the WebStatus (Baseline API)
 to give developers real-time insights about web platform features (CSS, HTML, JavaScript) – directly inside the editor.

Why Use This Extension?

Developers often face these challenges:

Uncertainty about feature support – “Is this CSS property or JS API supported in all browsers?”

Manual compatibility checks – Searching MDN, CanIUse, or WebStatus repeatedly.

Late surprises in production – A feature works locally but fails in older browsers.

 This extension solves these problems by bringing WebStatus data into your editor:

Shows hover tooltips with feature details (status, release date, supported browsers).

Adds gutter icons & highlights to quickly indicate availability.

Lets you check multiple features or selectors at once.

Links directly to WebStatus for deeper exploration.

What It Solves

 Know immediately if a feature is production-ready

 See which browsers support it (with version numbers & dates)

 Avoid breaking compatibility in production

 Speed up development by keeping compatibility checks in-editor

 Stay up-to-date with newly available features

📖 Features

Hover Panel – Hover over a CSS property, HTML tag, or JS API to see:

Production readiness ( Yes /  Experimental /  Not ready)

Release date (since when it’s available)

Baseline status (Widely / Newly / Not in Baseline)

Browser support table (Chrome, Firefox, Edge, Safari)

Gutter Decorations

✅ Green check → Widely available

🆕 Yellow alert → Newly available / experimental

⛔ Red cross → Not in baseline

Command: Baseline: Check Selection

Select one or multiple features/selectors → see a detailed panel with info

 How to Use

Install the extension from the VS Code Marketplace (or side-load via .vsix).

Open any HTML, CSS, or JS file.

Hover over a tag, property, or API → see instant compatibility info.

Or, select multiple features → run the command:

Press Ctrl+Shift+P → Baseline: Check Selection

A panel will show detailed info for all selected features.
