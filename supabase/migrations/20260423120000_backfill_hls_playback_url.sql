-- Backfill playback_url from Bunny MP4 to HLS playlist for ready videos
UPDATE public.videos
SET playback_url = regexp_replace(playback_url, '/play_[^/]+\.mp4$', '/playlist.m3u8')
WHERE status = 'ready'
  AND playback_url ~ '/play_[^/]+\.mp4$';
