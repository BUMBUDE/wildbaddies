## Direct-to-Bunny TUS upload migration

Switch the upload flow from "browser → Supabase edge function → Bunny" to "browser → Bunny (direct, via TUS)". The edge function only mints credentials and creates the DB row — it never touches the file bytes.

### 1. Install dependency

- `bun add tus-js-client` (adds runtime dep + types — `tus-js-client` ships its own `.d.ts`).

### Dont do this,, i have done it-2. New edge function: `supabase/functions/get-upload-url/index.ts`

Replaces `create-video` for the upload step. Responsibilities:

- POST JSON body: `{ title: string, categoryIds?: string[] }`.
- Validate `title`.
- Call Bunny `POST /library/{libraryId}/videos` with `{ title }` → get `videoId` (guid).
- Insert into `videos` (status `processing`, slug `<slugified-title>-<videoId[0..8]>`, `playback_url` from `buildPlaybackUrl`) using service-role client → get `dbId`.
- If `categoryIds` provided, bulk-insert into `video_categories` (`video_id = dbId`, `category_id = each`); count successful rows for `categoriesInserted`.
- Build TUS credentials per Bunny spec:
  - `tusEndpoint`: `https://video.bunnycdn.com/tusupload`
  - Expiration: `Math.floor(Date.now() / 1000) + 3600` (1 hour)
  - `AuthorizationSignature` = SHA-256 hex of `libraryId + accessKey + expiration + videoId` (using Web Crypto `crypto.subtle.digest`)
  - `tusHeaders`:
    - `AuthorizationSignature`: &nbsp;
    - `AuthorizationExpire`: &nbsp;
    - `VideoId`: &nbsp;
    - `LibraryId`: &nbsp;
- Respond JSON: `{ videoId, dbId, slug, status, categoriesInserted, tusEndpoint, tusHeaders }`.
- Standard CORS + OPTIONS handling (mirroring existing functions).
- Reuse `slugify` and `buildPlaybackUrl` from `_shared/video-utils.ts`.

The existing `create-video` function stays in the repo for now (no deletion) but will become unused; the frontend stops invoking it.

### 3. Frontend `src/lib/videos.ts`

Replace contents with the user-provided `videos_1.ts`:

- New `uploadVideo({ title, file, categoryIds, onProgress })` signature returning `{ videoId, dbId, slug, status, categoriesInserted }`.
- Two-step flow: invoke `get-upload-url` → run `tus.Upload` straight to Bunny with progress callback.
- Keep existing `listVideos`, `getVideoBySlug`, `incrementVideoView`, `listVideoCategories`, types.

### 4. Frontend `src/pages/UploadPage.tsx`

Replace with the user-provided version:

- New `progress` state + real-time progress bar (gradient-purple, brand styled).
- All inputs (`title`, category checkboxes, file picker) get `disabled={isPending}`.
- Pass `onProgress: setProgress` into `uploadVideo`.
- Reset progress on success/error.

### Files touched

- edit `package.json` / `bun.lock` (add `tus-js-client`)
- replace `src/lib/videos.ts`
- replace `src/pages/UploadPage.tsx`

### Notes / risks

- Bunny TUS auth uses SHA-256 of `libraryId + accessKey + expiration + videoId` — implemented via Web Crypto in Deno (no extra deps).
- `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` env vars (already present for `create-video`) are reused.
- Bunny CORS: their TUS endpoint allows browser uploads with the signature headers above; no proxy needed.
- File never passes through Supabase, so the 6 MB edge function body limit no longer applies — large uploads (multi-GB) become possible.