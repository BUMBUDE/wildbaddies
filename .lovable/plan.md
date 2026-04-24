## Plan — Categories Page

### Route
- Add `/categories` route in `src/App.tsx` → new page `src/pages/CategoriesPage.tsx`.
- Update Header `navItems`: turn the existing "Categories" link into a real `<Link to="/categories">` (currently a dead `<a href="#">`).

### Data layer (`src/lib/categories.ts`)
- New `CategoryRecord` type with the fields we render: `id`, `name`, `slug`, `thumbnail_url`, `video_count`, `total_views`, `rating`, `is_active`.
- `listCategories()`:
  ```ts
  supabase.from("categories").select("*").eq("is_active", true).order("name", { ascending: true })
  ```
- Defensive mapping so missing optional fields (counts/rating) don't crash the UI — they just hide.
- If column names differ from the assumptions above, only this file needs updating.

### Page layout (`src/pages/CategoriesPage.tsx`)
Mirrors brand styling (black bg, Roboto Condensed, purple `#AC58E9`, glow):

1. `<Header />`
2. **Title row** — centered `CATEGORIES` heading: `text-4xl sm:text-6xl font-bold uppercase text-white text-glow tracking-tight` matching the screenshot.
3. **Grid** — responsive:
   - `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8`
   - Each cell uses a new `CategoryCard` component.
4. **Footer count row** — right-aligned `{categories.length} categories` in muted text (matches screenshot's "51 categories"). The "Show: 30 60 90 120" pager from the screenshot is **not** included for v1 (no pagination data yet) — easy to add later.
5. `<Footer />`

States:
- Loading → 12 skeleton tiles (`Skeleton` from `@/components/ui/skeleton`, `aspect-square`).
- Error → small centered message in red.
- Empty → "No categories yet" centered.

### `src/components/CategoryCard.tsx`
Per screenshot:
- `<a href="/categories/{slug}">` (full reload, consistent with VideoCard pattern; the detail route doesn't exist yet but the link is future-proof).
- `aspect-square` thumbnail, `object-cover`, rounded `rounded-md`, subtle `ring-1 ring-white/5`, hover `scale-105` transition.
- Black fallback `<div>` if `thumbnail_url` missing (no placeholder asset, matching the "no placeholder" rule we already established).
- Below image, centered:
  - **Name** — `font-bold uppercase text-white text-sm` with hover turning `text-primary` (matches the purple "WHITE ON LATINA" hover state in screenshot 2).
  - Stats row — three inline stats with lucide icons:
    - `Folder` icon + `video_count`
    - `Eye` icon + formatted `total_views` (e.g. `1.1M`, `333K`)
    - `Star` icon (purple) + `rating` (5-decimal display like screenshot, e.g. `4.78652`)
  - Stats use `text-xs text-muted-foreground gap-3`.
- Stats gracefully hide individual items when their value is null/undefined.

### Helpers
- `formatCount(n)` in `src/lib/format.ts` (new): `>=1_000_000` → `1.1M`, `>=1_000` → `333K`, else raw number. Reusable later.

### Responsive notes
- Mobile (≤640): 2 columns, smaller name text, stats wrap to 2 rows if needed (`flex-wrap`).
- Tablet: 3–4 columns.
- Desktop: 6 columns matching screenshot density.
- Container uses existing `container` class with the same vertical spacing (`py-10 sm:py-16`) used by `SimilarVideos` for brand consistency.

### Files touched
- add `src/pages/CategoriesPage.tsx`
- add `src/components/CategoryCard.tsx`
- add `src/lib/categories.ts`
- add `src/lib/format.ts`
- edit `src/App.tsx` (new `/categories` route)
- edit `src/components/Header.tsx` (link "Categories" nav item to `/categories`)

### Assumed columns on `categories`
`id, name, slug, thumbnail_url, video_count, total_views, rating, is_active`. If the actual table uses different names (e.g. `image_url`, `views_count`), I'll adapt the select + mapping in `src/lib/categories.ts` only.
