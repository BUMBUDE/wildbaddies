# Search Functionality Plan

## Task 1 — Header Search with Suggestion Dropdown

### 1. `src/lib/videos.ts` — add suggestion helper
Add a new function (no edge function needed — calls the existing `list-videos` function with `q` and a small limit, or queries `videos` table directly via Supabase). To stay consistent with the rest of the app (which already uses `list-videos`), use the edge function:

```ts
export interface VideoSuggestion {
  id: string; title: string; slug: string; thumbnail_url: string | null;
}

export const searchVideoSuggestions = async (
  query: string, limit = 6, signal?: AbortSignal
): Promise<VideoSuggestion[]> => {
  const q = query.trim();
  if (!q) return [];
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-videos`
            + `?q=${encodeURIComponent(q)}&limit=${limit}&status=ready`;
  const res = await fetch(url, {
    signal,
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.videos ?? []).map((v: any) => ({
    id: v.id, title: v.title, slug: v.slug, thumbnail_url: v.thumbnail_url,
  }));
};
```

### 2. New component `src/components/search/SearchBox.tsx`
Replaces the static `<input>` in `Header.tsx` (both desktop and mobile).

Features:
- Local state: `query`, `debouncedQuery`, `suggestions`, `loading`, `open`, `activeIndex`.
- **Debounce 300ms** via `useEffect` + `setTimeout` on `query`.
- Fetch suggestions for `debouncedQuery` (>= 2 chars) using `searchVideoSuggestions`. Use `AbortController` to cancel stale requests.
- Dropdown panel (absolute positioned below input):
  - Loading → 3 skeleton rows
  - Empty (and query present) → "No results"
  - Results → list of items showing thumbnail + title; clicking navigates to `/video/{slug}`.
  - Footer row: "See all results for '<query>'" → navigates to `/search?q=<query>`.
- Keyboard support: ArrowUp/Down to move `activeIndex`, Enter to navigate (selected item, or fall back to search page), Esc to close.
- Outside-click closes dropdown (use a ref + `mousedown` listener).
- Submitting (Enter with no active item) → `navigate('/search?q=' + encodeURIComponent(query))`.
- Brand styling: same transparent input look already in `Header`, dropdown uses `bg-card border-border` with rounded corners and shadow, matching popover styling.
- Responsive: full-width on mobile, max-w-md on desktop.

### 3. `src/components/Header.tsx`
- Replace both desktop (`<div class="hidden md:flex flex-1 max-w-md ...">`) and mobile search blocks with `<SearchBox />`.

## Task 2 — Search Results Page

### 4. New page `src/pages/SearchPage.tsx`
- Reads `q` from URL via `useSearchParams`.
- Local state for `page`, `limit`, `sort` (reuse the same options as `FeaturedVideos`).
- Uses `useQuery` keyed on `["videos","search",q,page,limit,sort]`.
- Fetcher calls the edge function:
  ```
  ${SUPABASE_URL}/functions/v1/list-videos?q=...&page=...&limit=...&sort=...&status=ready
  ```
  with the same `apikey` header pattern already used in `FeaturedVideos.tsx`.
- Layout:
  - `Header` + `Footer` like `Index`.
  - Title: `Search results for "<q>"` + total count.
  - Sort + per-page selectors (reuse `SORT_OPTIONS` / `SHOW_OPTIONS`, can extract to `src/lib/listVideosOptions.ts` to share — optional refactor).
  - Grid of `VideoCard` (same grid classes as `FeaturedVideos`).
  - Skeleton UI (`VideoCardSkeleton` × limit) while loading — matches existing pattern.
  - Empty state when no results.
  - Pagination UI reusing the `getPageWindow` helper (could be extracted to `src/lib/pagination.ts`; if not extracted, duplicate inline).
- Updating the search box re-submits → updates `?q=` and resets `page` to 1.

### 5. `src/App.tsx`
- Add route: `<Route path="/search" element={<SearchPage />} />`.

## UX Fixes
- Don't fetch suggestions for queries shorter than 2 chars.
- Cancel in-flight fetch on each new keystroke (AbortController).
- Close dropdown after navigation.
- Pressing Enter with empty input → no-op.
- Clear `activeIndex` whenever suggestions change.

## Files Touched
- Edit: `src/lib/videos.ts`, `src/components/Header.tsx`, `src/App.tsx`
- Create: `src/components/search/SearchBox.tsx`, `src/pages/SearchPage.tsx`
