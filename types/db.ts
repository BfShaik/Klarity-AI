export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  oci_credly_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  slug: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  customer_id: string | null;
  title: string;
  body: string | null;
  source: string;
  transcript: string | null;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  certification_id: string | null;
  badge_id: string | null;
  custom_title: string | null;
  custom_description: string | null;
  earned_at: string;
  credential_url: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_date: string | null;
  linked_certification_id: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string;
  content: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkLog {
  id: string;
  user_id: string;
  date: string;
  summary: string;
  customer_id: string | null;
  minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  source: string;
  title: string;
  external_url: string | null;
  progress_percent: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
