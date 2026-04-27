## Three additions

### 1. Age gate modal (18+ confirmation)

Create `src/components/AgeGate.tsx` — a full-screen modal styled to our dark/purple brand (inspired by reference). On first load, check `localStorage.getItem("age_verified")`; if not set, show the gate over the entire app.

- Brand-styled card: site logo/wordmark, headline "This is an adult website", short notice copy, two buttons:
  - "I am 18 or older — Enter" (gradient-purple, `btn-glow`) → sets `localStorage.age_verified = "1"` and closes
  - "I am under 18 — Exit" (outline) → redirects to `https://www.google.com`
- Footer line with terms link.
- Mount in `src/App.tsx` above `<BrowserRouter>` so it appears on every route.
- No backend yet — purely frontend gate (note in code: enforce server-side later).

### 2. Quality selector in VideoPlayer

Extend `src/components/video/VideoPlayer.tsx` to expose HLS quality levels via the existing `Settings` (gear) button.

- After `hls.on(Hls.Events.MANIFEST_PARSED)`, read `hls.levels` and store `[{ height, index }]` in state, plus `currentLevel` (-1 = auto).
- Click gear → small popover (use existing `Popover` from `components/ui/popover`) anchored above the controls bar, listing:
  - `Auto` (default, highlighted when `hls.currentLevel === -1` or set to -1)
  - Each level sorted desc by `height` shown as `1080p`, `720p`, `480p`, `360p` with an `HD` badge for ≥720 (matches reference screenshot styling — pill badge, gradient highlight on active row).
- Selecting a row sets `hls.currentLevel = index` (or -1 for auto) and closes popover.
- Hidden / disabled when `hls.levels.length <= 1` or when not using HLS (Safari native fallback).
- Keep mp4 path unchanged.

### 3. Category videos page (3-2-1 responsive grid)

New route `src/pages/CategoryVideosPage.tsx` at path `/categories/:slug` (matches existing `CategoryCard` link).

- Title: category name in the same big uppercase glow style.
- Sort tabs row: `MOST RECENT`, `MOST VIEWED`, `BEST RATED` (visual only for now, MOST RECENT active by default; tab state stored locally and passed as `sort` query param).
- Right-aligned `ALL TIME ▼` placeholder dropdown (visual only).
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8` (3-2-1 responsive) using existing `VideoCard`.
- Loading skeletons + empty / error states matching `CategoriesPage` patterns.

Data fetching in new helper `getVideosByCategory(slug, sort?)` in `src/lib/videos.ts`:

- Calls `supabase.functions.invoke("get-videos-by-category", { body: { slug, sort } })`.
- If the function isn't deployed yet (404 / non-2xx), fall back to a direct query: join `categories` (by slug) → `video_categories` → `videos` (status `ready`) ordered by `created_at desc` (or views / rating depending on sort). This keeps the page working until the edge function is live.
- Returns `VideoRecord[]`.

Register the route in `src/App.tsx` above the catch-all.

### Files

- create `src/components/AgeGate.tsx`
- create `src/pages/CategoryVideosPage.tsx`
- edit `src/App.tsx` (mount AgeGate, add `/categories/:slug` route)
- edit `src/components/video/VideoPlayer.tsx` (HLS levels + quality popover)
- edit `src/lib/videos.ts` (add `getVideosByCategory`)
