ALTER TABLE public.current_affairs
  ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'current_affair',
  ADD COLUMN IF NOT EXISTS scheme_jurisdiction text,
  ADD COLUMN IF NOT EXISTS ministry text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'current_affairs_content_type_check'
      AND conrelid = 'public.current_affairs'::regclass
  ) THEN
    ALTER TABLE public.current_affairs
      ADD CONSTRAINT current_affairs_content_type_check
      CHECK (content_type IN ('current_affair', 'scheme'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'current_affairs_scheme_jurisdiction_check'
      AND conrelid = 'public.current_affairs'::regclass
  ) THEN
    ALTER TABLE public.current_affairs
      ADD CONSTRAINT current_affairs_scheme_jurisdiction_check
      CHECK (scheme_jurisdiction IS NULL OR scheme_jurisdiction IN ('india', 'tamil_nadu'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'current_affairs_scheme_metadata_check'
      AND conrelid = 'public.current_affairs'::regclass
  ) THEN
    ALTER TABLE public.current_affairs
      ADD CONSTRAINT current_affairs_scheme_metadata_check
      CHECK (
        (content_type = 'current_affair' AND scheme_jurisdiction IS NULL AND ministry IS NULL)
        OR
        (content_type = 'scheme' AND scheme_jurisdiction IS NOT NULL AND ministry IS NOT NULL AND length(trim(ministry)) > 0)
      );
  END IF;
END $$;
