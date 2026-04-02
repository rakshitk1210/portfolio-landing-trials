# Portfolio landing — design iterations

Static HTML/CSS explorations for a personal portfolio landing page. The root [`index.html`](index.html) is a hub that links to numbered iterations (`iteration-1` … `iteration-13`), each with its own layout, typography, and interaction ideas.

## What’s inside

| Area | Description |
|------|-------------|
| **Hub** | Central index listing every iteration with short labels |
| **Iterations** | Self-contained `iteration-N/index.html` (+ `styles.css` where used) |
| **Components** | Reference JSX/TS snippets (e.g. aurora text, blur-reveal) for reuse in other stacks |

No build step is required for the static pages: open files in a browser or serve the folder locally.

## Run locally

**Option A — open the file**

Double-click `index.html`, or open it from your editor’s “Open in browser” action.

**Option B — local server** (recommended for consistent asset paths)

```bash
# Python 3
python3 -m http.server 8080

# Node (if you have npx)
npx --yes serve .
```

Then visit `http://localhost:8080` (or the URL your tool prints).

## Repo structure

```
.
├── index.html          # Iteration hub
├── iteration-1/ … iteration-13/
├── AuroraText.jsx      # Reference component
├── BlurRevealText.tsx
└── …
```

## GitHub Pages

To host this site on GitHub Pages: **Settings → Pages → Build and deployment → Source** → deploy from the `main` branch (folder `/` or `/root`). The site will be available at:

`https://rakshitk1210.github.io/portfolio-landing-trials/`

(Exact URL matches your GitHub username and repository name.)

## License

This repository is provided as a personal project. Add a `LICENSE` file if you want to specify terms.
