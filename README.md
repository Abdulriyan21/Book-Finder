# Book Finder

A modern, responsive Book Finder built with **vanilla HTML/CSS/JS** (Vite dev server used for convenience) and the **Open Library** API.

## Features
- Search by **title**, **author**, or **subject**.
- Advanced filters: year-from / year-to.
- Clickable search suggestions (tags) for quick queries.
- Toggle between **grid** and **list** views.
- Each book card shows a cover (or placeholder), title, author, year, and subject badges.
- Animated shine effect on covers, 3D hover tilt, and smooth entrance animations.
- Animated starry/particle gradient background and glassmorphism UI.
- Loading indicator and empty state messaging.
- Mock data fallback when no query or network error.
- No API keys or authentication required.

## How to run locally
```bash
# 1. Install dependencies (Vite)
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173 in your browser
```

## Build & Deploy
- Build: `npm run build` (outputs to `dist/`)
- You can deploy the `dist/` to Netlify, Vercel, or any static hosting provider.

## Notes
- The project intentionally uses vanilla JavaScript for portability and ease of review.
- The UI is responsive and aims to run well on mobile, tablet, and desktop.
