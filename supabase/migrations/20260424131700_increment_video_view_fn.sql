create or replace function public.increment_video_view(video_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.videos set views = views + 1 where id = video_id;
$$;

grant execute on function public.increment_video_view(uuid) to anon, authenticated;
