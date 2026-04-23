

## Fix: Use Bunny HLS for playback

**Root cause:** `playback_url` points to `https://{cdn}/{guid}/play_720p.mp4`. Bunny only generates that file if MP4 fallback is enabled AND 720p was encoded. Shorter, lower-resolution, or vertical videos (and libraries without MP4 fallback) won't have it → playback fails. Bunny's HLS playlist (`playlist.m3u8`) is always available and adapts to whatever encodes exist.

**Fix:** Switch playback URL to HLS and add `hls.js` to the custom player (Safari plays HLS natively; Chrome/Firefox/Edge need hls.js). Keep all existing custom controls.

### Changes

1. **`supabase/functions/_shared/video-utils.ts`**
   - Change `buildPlaybackUrl` to return `https://{cdnHost}/{bunnyVideoId}/playlist.m3u8`.

2. **Backfill existing rows** (migration)
   - Update `videos.playback_url` for all `status = 'ready'` rows: replace `/play_720p.mp4` (and any other `play_*.mp4`) with `/playlist.m3u8`.

3. **`src/components/video/VideoPlayer.tsx`**
   - Add `hls.js` dependency.
   - In the URL-change effect:
     - If URL ends with `.m3u8` and `Hls.isSupported()` → create `Hls` instance, `loadSource`, `attachMedia`, store on ref, destroy on cleanup / URL change.
     - Else if `video.canPlayType('application/vnd.apple.mpeg-url')` is truthy (Safari/iOS) → set `video.src` directly.
     - Else (non-HLS URL like legacy `.mp4`) → keep current `<source>` behavior so old data still works.
   - Add minimal HLS error handling (network → `startLoad`, media → `recoverMediaError`, fatal other → destroy).
   - Keep all existing UI: poster, play/pause, seek, volume, fullscreen, glow.

4. **No changes** to `create-video` (already calls `buildPlaybackUrl`, gets HLS automatically) or `sync-video-status` (same).

### Why this works
- `playlist.m3u8` is generated for every Bunny Stream video regardless of MP4 fallback settings or source resolution.
- HLS adapts to available renditions, so vertical/low-res videos play.
- Existing `.mp4` fallback path is preserved so nothing regresses.

### Files touched
- edit `supabase/functions/_shared/video-utils.ts`
- edit `src/components/video/VideoPlayer.tsx`
- add `package.json` dep: `hls.js` (+ `@types/hls.js` if needed)
- add migration to backfill `playback_url` for existing ready videos

