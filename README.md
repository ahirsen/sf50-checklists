# SF50 Checklists

A training copy of the SF50 Vision Jet checklist app, set up to work offline on an iPad or iPhone.

**Open it:** https://ahirsen.github.io/sf50-checklists/

## Original

Based on Marc Damon's SF50 checklist recreation:
https://github.com/marcdamon/marcdamon.github.io/tree/main/sf50CheckLists
The checklist content (`checklists.json`, `cassMessages.json`) and app (`js.js`, `css.css`) come from that project.

## Changes in this copy

- **Works offline.** `sw.js` saves the app and checklist data on the device. Open it once in Safari, then Share → Add to Home Screen; after that it opens from the icon in airplane mode.
- **Read aloud.** The speaker button (top right of the checklist) announces the checklist title and each step as you advance with Select. Uses the device's built-in voice (`speech.js`).
- **Fits any screen.** `fit.js` scales the fixed cockpit-style layout to the iPad or phone screen. Phones work best in landscape.
- **Home-screen icon** and app manifest (`manifest.json`, `icons/`).
- Removed the original site's Google Analytics tag.
- `index.html` is the app; `main.html` redirects to it.

## Updating

After changing any file, bump `VERSION` in `sw.js` (e.g. `sf50-v2`) so devices pick up the new copy. Devices refresh the saved copy in the background when online; a change shows on the next launch.

## Note

For training and reference only. Not a substitute for the FAA-approved AFM and checklists. Verify content against the current AFM.
