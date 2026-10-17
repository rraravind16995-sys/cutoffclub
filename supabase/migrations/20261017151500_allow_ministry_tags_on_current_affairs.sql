ALTER TABLE public.current_affairs
  DROP CONSTRAINT IF EXISTS current_affairs_scheme_metadata_check;

ALTER TABLE public.current_affairs
  ADD CONSTRAINT current_affairs_scheme_metadata_check
  CHECK (
    (content_type = 'current_affair' AND scheme_jurisdiction IS NULL)
    OR
    (content_type = 'scheme'
      AND scheme_jurisdiction IS NOT NULL
      AND ministry IS NOT NULL
      AND length(trim(ministry)) > 0)
  );