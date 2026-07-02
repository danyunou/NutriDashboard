-- Run in Supabase SQL Editor

-- 1. Add user_id to both tables
ALTER TABLE user_substitutions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE completed_meals
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Set DEFAULT so new rows are automatically stamped with auth.uid()
ALTER TABLE user_substitutions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE completed_meals    ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3. Replace old unique constraints with user-scoped ones
ALTER TABLE user_substitutions
  DROP CONSTRAINT IF EXISTS user_substitutions_day_momento_id_original_ingredient_id_key;
ALTER TABLE completed_meals
  DROP CONSTRAINT IF EXISTS completed_meals_date_momento_id_key;

ALTER TABLE user_substitutions
  ADD CONSTRAINT user_substitutions_user_day_momento_orig_key
  UNIQUE (user_id, day, momento_id, original_ingredient_id);

ALTER TABLE completed_meals
  ADD CONSTRAINT completed_meals_user_date_momento_key
  UNIQUE (user_id, date, momento_id);

-- 4. Replace open RLS policies with per-user policies
DROP POLICY IF EXISTS "public_all" ON user_substitutions;
DROP POLICY IF EXISTS "public_all" ON completed_meals;

CREATE POLICY "user_own" ON user_substitutions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_own" ON completed_meals
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
