-- Add review_entries table for custom review notes
CREATE TABLE IF NOT EXISTS public.review_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'weekly',
  period_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_review_entries_user_id ON public.review_entries(user_id);
CREATE INDEX idx_review_entries_period ON public.review_entries(user_id, period_type, period_start);

ALTER TABLE public.review_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_entries_all_own" ON public.review_entries FOR ALL USING (auth.uid() = user_id);
