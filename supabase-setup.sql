-- Create profiles table for user avatars
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Storage setup for avatars
-- Run these commands in Supabase dashboard SQL editor or via CLI

-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars bucket
-- Users can only upload to their own folder (auth.uid())
CREATE POLICY "Users can upload to own folder" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only view their own files
CREATE POLICY "Users can view own files" 
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only update their own files
CREATE POLICY "Users can update own files" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only delete their own files
CREATE POLICY "Users can delete own files" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars (for displaying images)
CREATE POLICY "Public can view avatars" 
ON storage.objects FOR SELECT 
TO public
USING (bucket_id = 'avatars');

-- Create habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_frequency INTEGER DEFAULT 1, -- times per day/week
  frequency_type TEXT DEFAULT 'daily', -- 'daily' or 'weekly'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_logs table
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, log_date) -- One log per habit per day
);

-- Enable RLS on both tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits table
-- Users can only see their own habits
CREATE POLICY "Users can view own habits" 
ON habits FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own habits
CREATE POLICY "Users can insert own habits" 
ON habits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own habits
CREATE POLICY "Users can update own habits" 
ON habits FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own habits
CREATE POLICY "Users can delete own habits" 
ON habits FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for daily_logs table
-- Users can only view logs for their own habits
CREATE POLICY "Users can view own habit logs" 
ON daily_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = daily_logs.habit_id 
    AND habits.user_id = auth.uid()
  )
);

-- Users can insert logs for their own habits
CREATE POLICY "Users can insert own habit logs" 
ON daily_logs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = daily_logs.habit_id 
    AND habits.user_id = auth.uid()
  )
);

-- Users can update logs for their own habits
CREATE POLICY "Users can update own habit logs" 
ON daily_logs FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = daily_logs.habit_id 
    AND habits.user_id = auth.uid()
  )
);

-- Users can delete logs for their own habits
CREATE POLICY "Users can delete own habit logs" 
ON daily_logs FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = daily_logs.habit_id 
    AND habits.user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_daily_logs_habit_id ON daily_logs(habit_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);

-- Seed data (you'll need to replace USER_ID with an actual user UUID after signup)
-- Uncomment and run this after you have created a user account
/*
-- Replace with actual user UUID from auth.users
-- INSERT INTO habits (user_id, name, description, target_frequency, frequency_type) VALUES
--   ('YOUR_USER_ID_HERE', 'Morning Exercise', '30 minutes of exercise', 1, 'daily'),
--   ('YOUR_USER_ID_HERE', 'Read Books', 'Read for 20 minutes', 1, 'daily'),
--   ('YOUR_USER_ID_HERE', 'Drink Water', 'Drink 8 glasses of water', 8, 'daily'),
--   ('YOUR_USER_ID_HERE', 'Meditation', '10 minutes of meditation', 1, 'daily');

-- After inserting habits, you can seed some daily logs
-- INSERT INTO daily_logs (habit_id, log_date, completed, notes) VALUES
--   ((SELECT id FROM habits WHERE name = 'Morning Exercise' LIMIT 1), CURRENT_DATE, true, 'Great workout!'),
--   ((SELECT id FROM habits WHERE name = 'Read Books' LIMIT 1), CURRENT_DATE, false, 'Will do tonight'),
--   ((SELECT id FROM habits WHERE name = 'Drink Water' LIMIT 1), CURRENT_DATE, true, '8 glasses completed');
*/