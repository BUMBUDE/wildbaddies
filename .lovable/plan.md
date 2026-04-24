##  Task 1 — Increment view count only when user actually presses Play

### DB

- Add migration creating SQL function `public.increment_video_view(video_id uuid)` that does `UPDATE public.videos SET views = views + 1 WHERE id = video_id`. Marked `SECURITY DEFINER`, `SET search_path = public`, granted EXECUTE to `anon` + `authenticated` so the public site can call it without auth.

### Edge Function

- Create `supabase/functions/increment-view/index.ts`:
  - CORS (OPTIONS handler + headers on every response).
  - POST only. Validate body `{ videoId: uuid }` with Zod-like check (regex for uuid).
  - Use service-role client, call `supabase.rpc("increment_video_view", { video_id: videoId })`.
  - Return `{ ok: true }`.
- `verify_jwt = false` endpoint is public-callable.

### Frontend

- `src/lib/videos.ts`: add `incrementVideoView(videoId)` that calls `supabase.functions.invoke("increment-view", { body: { videoId } })`. Errors are swallowed (view count is best-effort, must not break playback).
- `src/components/video/VideoPlayer.tsx`:
  - Add optional prop `videoId?: string` and `onFirstPlay?: () => void`.
  - In existing `onPlay` handler, the FIRST time `play` fires for a given `videoUrl`, call `onFirstPlay?.()`. Reset that "fired" guard whenever `videoUrl` changes (alongside the existing reset effect). This guarantees the call fires only on a real `play` event (not on autoplay-blocked, not on metadata load, not on hover).
- `src/pages/VideoPage.tsx`:
  - Pass `videoId={video?.id}` and `onFirstPlay={() => incrementVideoView(video.id)}` to `<VideoPlayer />`.

### Why this is safe

- View only increments on the actual `play` media event → satisfies "only after user actually watches / pressed play".
- One increment per page load (guard by `videoUrl`) → repeated pause/play doesn't inflate.
- RPC is atomic increment; no race conditions.

---

## Task 2 — Categories multi-select on Upload page

### I have done this in supabase dont do it again- DB (new migration)

- Create `public.video_categories` join table:
  - `video_id uuid references public.videos(id) on delete cascade`
  - `category_id uuid references public.categories(id) on delete cascade`
  - `primary key (video_id, category_id)`
- Index on `category_id` for filter queries.
- Enable RLS; policies:
  - `select` to `anon, authenticated` (public catalog).
  - `insert/delete` only to service role (used by edge function).

### I have done this in supabase dont do it again-Edge function (`create-video`)

- Accept additional form field `category_ids` as a JSON-encoded array of UUIDs (multipart can't send arrays cleanly; JSON string is simplest).
- Validate each entry is a UUID.
- After inserting the video row, if any categories were provided, bulk-insert into `video_categories` with `{ video_id: inserted.id, category_id }`. Errors there don't roll back the video, but are returned in the response payload as `categoriesError` so we can surface a toast.

### Frontend data

- `src/lib/videos.ts` `uploadVideo(title, file, categoryIds)`:
  - Append `category_ids` (JSON string) to the FormData before invoking the function.

### UI — `src/pages/UploadPage.tsx`

Match the screenshot layout (left = form fields stacked, right = upload rules). Add a Categories block between the Title field and the file picker:

- Heading: "CATEGORIES" (uppercase, `font-bold tracking-wider`, brand purple bullet/dot consistent with rest of page).
- Helper line: "Select all that apply" (`text-muted-foreground text-sm`).
- Multi-select using `@/components/ui/checkbox` (already in the project) inside a responsive grid:
  - Mobile: `grid-cols-2`
  - sm: `grid-cols-3`
  - lg: `grid-cols-4`
  - Each cell: rounded `border border-primary/40 bg-secondary/30 p-3` flex row with checkbox + label, hover + checked states use brand purple (`data-[state=checked]:bg-primary` already in checkbox.tsx; the wrapping label gets `has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10`).
  - Label is the category name in normal case (not uppercased — matches screenshot).
- Selected count chip under the grid: "X selected" in muted text, only shown when > 0.
- Loading: shadcn `Skeleton` blocks while categories fetch.
- Empty/error state: small muted message.

State + behavior:

- `useQuery({ queryKey: ["categories"], queryFn: listCategories })` (already exists in `src/lib/categories.ts`).
- `selectedIds: Set<string>` in `useState`. Toggle on checkbox change.
- On submit, pass `Array.from(selectedIds)` to `uploadVideo`.
- Reset selection on success alongside title/file reset.
- Categories are optional (no validation gate) — keeps the existing required fields (title + file) unchanged.

### Files touched

- add migration `supabase/migrations/<ts>_increment_view_and_video_categories.sql` (function + join table + RLS)
- add `supabase/functions/increment-view/index.ts`
- edit `src/lib/videos.ts` (add `incrementVideoView`, extend `uploadVideo` signature)
- edit `src/components/video/VideoPlayer.tsx` (first-play callback)
- edit `src/pages/VideoPage.tsx` (wire callback)
- edit `src/pages/UploadPage.tsx` (categories multi-select UI + wire submit)