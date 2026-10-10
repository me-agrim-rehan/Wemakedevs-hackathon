# HelpAsOne – Flood Relief (React + Vite)

## Run it
1. Install Node.js 18 or newer.
2. In this folder run:
   - `npm install`
   - `npm run dev`
3. Open the link it prints (usually http://localhost:5173).

Production build: `npm run build` (then `npm run preview`).

## Demo accounts
Login is DEMO ONLY. Any valid details work (10-digit phone starting 6-9, password of 6+ characters).
Choose "NGO Login" to open the NGO dashboard, or "Admin Login" for the Admin dashboard.
Passwords are never checked or stored.

## Photo
Put a flood photo at `public/images/flood-hero.jpg`. It is used only on the login banner and the NGO dashboard banner,
with a soft golden overlay. A warm gradient shows if the file is missing.

## Files
- src/App.jsx – routes and role protection
- src/data.js – sample data and constants
- src/context/AppContext.jsx – shared state + localStorage saving
- src/components/ – sidebar layout, map, incident cards/form, shared UI
- src/pages/ngo/ – NGO dashboard, active incidents, directory, volunteer, summary
- src/pages/admin/ – admin dashboard, incidents, add/edit, NGOs, cities, summary
- src/App.css – all styling (colours at the top)
