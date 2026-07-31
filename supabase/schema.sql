-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TO DOO RLS 
-- muscle groups - cualquiera puede ver los grupos de músculos por defecto
-- exercises - cualquiera puede ver los ejercicios por defecto
-- exercise_muscle_groups - cualquiera puede ver los grupos de músculos por defecto

-- Create handle_new_user function to automatically create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    unit_value TEXT;
BEGIN
    -- Get the preferred unit from metadata or use 'kg' as default
    unit_value := COALESCE(NEW.raw_user_meta_data->>'preferred_unit', 'kg');
    
    -- Validate the value against allowed options
    IF unit_value NOT IN ('kg', 'lb') THEN
        unit_value := 'kg'; -- Default to kg if invalid value
    END IF;
    
    -- Insert new row into profiles with user data
    INSERT INTO public.profiles (
        id, 
        user_id, 
        username, 
        full_name, 
        preferred_unit
    )
    VALUES (
        uuid_generate_v4(),
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        unit_value
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error details to postgres log
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Still return the user to avoid blocking registration
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that executes after an insert on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  weight_kg NUMERIC(5, 2),
  height_cm INTEGER,
  birth_date DATE,
  sex TEXT CHECK (sex IN ('male', 'female', 'other', 'prefer_not_to_say')),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  training_goal TEXT CHECK (training_goal IN ('strength', 'hypertrophy', 'endurance', 'weight_loss', 'general_fitness', 'sport_specific')),
  weekly_availability INTEGER, -- Number of days available per week
  session_duration_preference INTEGER, -- Preferred session length in minutes
  preferred_unit TEXT CHECK (preferred_unit IN ('kg', 'lb')) DEFAULT 'kg', -- Preferred unit for weights (kg or lb)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create a table for user's body measurements history
CREATE TABLE IF NOT EXISTS profile_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC(5, 2),
  body_fat_percentage NUMERIC(4, 1),
  chest_cm NUMERIC(5, 1),
  waist_cm NUMERIC(5, 1),
  hips_cm NUMERIC(5, 1),
  arm_left_cm NUMERIC(5, 1),
  arm_right_cm NUMERIC(5, 1),
  thigh_left_cm NUMERIC(5, 1),
  thigh_right_cm NUMERIC(5, 1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS muscle_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  video_url TEXT,
  equipment_needed TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  primary_muscle_group_id UUID REFERENCES muscle_groups(id) ON DELETE SET NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Junction table for exercises and muscle groups with incidence level
CREATE TABLE IF NOT EXISTS exercise_muscle_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_group_id UUID REFERENCES muscle_groups(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  incidence_level INTEGER DEFAULT 5 CHECK (incidence_level BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(exercise_id, muscle_group_id)
);

-- Create mesocycles table
CREATE TABLE IF NOT EXISTS mesocycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create mesocycle goals table
CREATE TABLE IF NOT EXISTS mesocycle_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_id UUID REFERENCES mesocycles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('muscle_focus', 'weight_loss', 'strength', 'endurance', 'hypertrophy', 'other')),
  target_value NUMERIC,
  unit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create mesocycle muscle group focus table
CREATE TABLE IF NOT EXISTS mesocycle_muscle_group_focus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_id UUID REFERENCES mesocycles(id) ON DELETE CASCADE,
  muscle_group_id UUID REFERENCES muscle_groups(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(mesocycle_id, muscle_group_id)
);

-- Create training_sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_id UUID REFERENCES mesocycles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  duration_minutes INTEGER,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  scheduled_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create session_exercises table
CREATE TABLE IF NOT EXISTS session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  rir INTEGER, -- Reps In Reserve
  rest_between_sets INTEGER, -- Rest time in seconds
  rest_after_exercise INTEGER, -- Rest time in seconds
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  training_session_id UUID REFERENCES training_sessions(id) ON DELETE SET NULL,
  mesocycle_id UUID REFERENCES mesocycles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create exercise_logs table
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC(10, 2),
  rir INTEGER, -- Reps In Reserve
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create workout_reminders table
CREATE TABLE IF NOT EXISTS workout_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  training_session_id UUID REFERENCES training_sessions(id) ON DELETE SET NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  time_of_day TIME,
  is_enabled BOOLEAN DEFAULT TRUE,
  notification_type TEXT DEFAULT 'browser' CHECK (notification_type IN ('browser', 'email', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create mesocycle templates table
CREATE TABLE IF NOT EXISTS mesocycle_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create template goals table
CREATE TABLE IF NOT EXISTS mesocycle_template_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_template_id UUID REFERENCES mesocycle_templates(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('muscle_focus', 'weight_loss', 'strength', 'endurance', 'hypertrophy', 'other')),
  target_value NUMERIC,
  unit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create template muscle group focus table
CREATE TABLE IF NOT EXISTS mesocycle_template_muscle_focus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_template_id UUID REFERENCES mesocycle_templates(id) ON DELETE CASCADE,
  muscle_group_id UUID REFERENCES muscle_groups(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(mesocycle_template_id, muscle_group_id)
);

-- Create training session templates table
CREATE TABLE IF NOT EXISTS training_session_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_template_id UUID REFERENCES mesocycle_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  estimated_duration_minutes INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create template session exercises table
CREATE TABLE IF NOT EXISTS template_session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_session_template_id UUID REFERENCES training_session_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  rir INTEGER,
  rest_between_sets INTEGER,
  rest_after_exercise INTEGER,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear tabla para limitar intentos de inicio de sesión (rate limiting)
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  email TEXT PRIMARY KEY,
  failed_attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE
);

-- Política de seguridad para --que solo los superusuarios puedan acceder a esta tabla
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo superusuarios pueden acceder a auth_rate_limits" ON auth_rate_limits 
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_super_admin = true));

-- Añadir índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_email ON auth_rate_limits (email);

-- Añadir función para limpiar entradas antiguas (ejecutar como cron job)
CREATE OR REPLACE FUNCTION clean_old_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM auth_rate_limits 
  WHERE last_attempt < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- RLS for mesocycle templates
--ALTER TABLE mesocycle_templates ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view default and their own mesocycle templates" 
--   ON mesocycle_templates FOR SELECT 
--   USING (is_default = TRUE OR user_id = auth.uid());

-- CREATE POLICY "Users can insert their own mesocycle templates" 
--   ON mesocycle_templates FOR INSERT 
--   WITH CHECK (user_id = auth.uid());

-- CREATE POLICY "Users can update their own mesocycle templates" 
--   ON mesocycle_templates FOR UPDATE 
--   USING (user_id = auth.uid());

-- CREATE POLICY "Users can delete their own mesocycle templates" 
--   ON mesocycle_templates FOR DELETE 
--   USING (user_id = auth.uid());

-- RLS for mesocycle template goals
--ALTER TABLE mesocycle_template_goals ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own mesocycle template goals" 
--   ON mesocycle_template_goals FOR SELECT 
--   USING ((SELECT user_id FROM mesocycle_templates WHERE id = mesocycle_template_goals.mesocycle_template_id) = auth.uid() OR
--          (SELECT is_default FROM mesocycle_templates WHERE id = mesocycle_template_goals.mesocycle_template_id) = TRUE);

-- CREATE POLICY "Users can insert their own mesocycle template goals" 
--   ON mesocycle_template_goals FOR INSERT 
--   WITH CHECK ((SELECT user_id FROM mesocycle_templates WHERE id = mesocycle_template_goals.mesocycle_template_id) = auth.uid());

-- CREATE POLICY "Users can update their own mesocycle template goals" 
--   ON mesocycle_template_goals FOR UPDATE 
--   USING ((SELECT user_id FROM mesocycle_templates WHERE id = mesocycle_template_goals.mesocycle_template_id) = auth.uid());

-- CREATE POLICY "Users can delete their own mesocycle template goals" 
--   ON mesocycle_template_goals FOR DELETE 
--   USING ((SELECT user_id FROM mesocycle_templates WHERE id = mesocycle_template_goals.mesocycle_template_id) = auth.uid());

-- RLS for mesocycle template muscle focus
--ALTER TABLE mesocycle_template_muscle_focus ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own mesocycle template muscle focus" 
--   ON mesocycle_template_muscle_focus FOR SELECT 
--   USING ((SELECT user_id FROM mesocycle_templates WHERE id = mesocycle_template_muscle_focus.mesocycle_template_id) = auth.uid() OR
--          (SELECT is_default FROM mesocycle_templates WHERE id = mesocycle_template_muscle_focus.mesocycle_template_id) = TRUE);

-- CREATE POLICY "Users can insert their own mesocycle template muscle focus" 
--   ON mesocycle_template_muscle_focus FOR INSERT 
--   WITH CHECK ((SELECT user_id FROM mesocycle_templates WHERE id = mesocycle_template_muscle_focus.mesocycle_template_id) = auth.uid());

-- CREATE POLICY "Users can update their own mesocycle template muscle focus" 
--   ON mesocycle_template_muscle_focus FOR UPDATE 
--   USING ((SELECT user_id FROM mesocycle_templates WHERE id = mesocycle_template_muscle_focus.mesocycle_template_id) = auth.uid());

-- CREATE POLICY "Users can delete their own mesocycle template muscle focus" 
--   ON mesocycle_template_muscle_focus FOR DELETE 
--   USING ((SELECT user_id FROM mesocycle_templates WHERE id = mesocycle_template_muscle_focus.mesocycle_template_id) = auth.uid());

-- RLS for training session templates
--ALTER TABLE training_session_templates ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view default and their own training session templates" 
--   ON training_session_templates FOR SELECT 
--   USING (is_default = TRUE OR user_id = auth.uid() OR
--         (SELECT user_id FROM mesocycle_templates WHERE id = training_session_templates.mesocycle_template_id) = auth.uid());

-- CREATE POLICY "Users can insert their own training session templates" 
--   ON training_session_templates FOR INSERT 
--   WITH CHECK (user_id = auth.uid());

-- CREATE POLICY "Users can update their own training session templates" 
--   ON training_session_templates FOR UPDATE 
--   USING (user_id = auth.uid());

-- CREATE POLICY "Users can delete their own training session templates" 
--   ON training_session_templates FOR DELETE 
--   USING (user_id = auth.uid());

-- RLS for template session exercises
--ALTER TABLE template_session_exercises ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own template session exercises" 
--   ON template_session_exercises FOR SELECT 
--   USING ((SELECT user_id FROM training_session_templates WHERE id = template_session_exercises.training_session_template_id) = auth.uid() OR
--          (SELECT is_default FROM training_session_templates WHERE id = template_session_exercises.training_session_template_id) = TRUE);

-- CREATE POLICY "Users can insert their own template session exercises" 
--   ON template_session_exercises FOR INSERT 
--   WITH CHECK ((SELECT user_id FROM training_session_templates WHERE id = template_session_exercises.training_session_template_id) = auth.uid());

-- CREATE POLICY "Users can update their own template session exercises" 
--   ON template_session_exercises FOR UPDATE 
--   USING ((SELECT user_id FROM training_session_templates WHERE id = template_session_exercises.training_session_template_id) = auth.uid());

-- CREATE POLICY "Users can delete their own template session exercises" 
--   ON template_session_exercises FOR DELETE 
--   USING ((SELECT user_id FROM training_session_templates WHERE id = template_session_exercises.training_session_template_id) = auth.uid());

-- Create RLS policies-- for profiles
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own profile" 
--   ON profiles FOR SELECT 
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own profile" 
--   ON profiles FOR UPDATE 
--   USING (auth.uid() = user_id);

-- Create RLS policies for --muscle_groups
-- ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view default and their own muscle groups" 
--   ON muscle_groups FOR SELECT 
--   USING (is_default = TRUE OR user_id = auth.uid());

-- CREATE POLICY "Users can insert their own muscle groups" 
--   ON muscle_groups FOR INSERT 
--   WITH CHECK (user_id = auth.uid());

-- CREATE POLICY "Users can update their own muscle groups" 
--   ON muscle_groups FOR UPDATE 
--   USING (user_id = auth.uid());

-- CREATE POLICY "Users can delete their own muscle groups" 
--   ON muscle_groups FOR DELETE 
--   USING (user_id = auth.uid());

-- Create RLS policies --for exercises
-- ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view default and their own exercises" 
--   ON exercises FOR SELECT 
--   USING (is_default = TRUE OR user_id = auth.uid());

-- CREATE POLICY "Users can insert their own exercises" 
--   ON exercises FOR INSERT 
--   WITH CHECK (user_id = auth.uid());

-- CREATE POLICY "Users can update their own exercises" 
--   ON exercises FOR UPDATE 
--   USING (user_id = auth.uid());

-- CREATE POLICY "Users can delete their own exercises" 
--   ON exercises FOR DELETE 
--   USING (user_id = auth.uid());

-- Create RLS policies for exercise_--muscle_groups
-- ALTER TABLE exercise_muscle_groups ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view default and their own exercise muscle groups" 
--   ON exercise_muscle_groups FOR SELECT 
--   USING ((SELECT is_default FROM exercises WHERE id = exercise_muscle_groups.exercise_id) = TRUE OR 
--          (SELECT user_id FROM exercises WHERE id = exercise_muscle_groups.exercise_id) = auth.uid());

-- CREATE POLICY "Users can insert their own exercise muscle groups" 
--   ON exercise_muscle_groups FOR INSERT 
--   WITH CHECK ((SELECT user_id FROM exercises WHERE id = exercise_muscle_groups.exercise_id) = auth.uid());

-- CREATE POLICY "Users can update their own exercise muscle groups" 
--   ON exercise_muscle_groups FOR UPDATE 
--   USING ((SELECT user_id FROM exercises WHERE id = exercise_muscle_groups.exercise_id) = auth.uid());

-- CREATE POLICY "Users can delete their own exercise muscle groups" 
--   ON exercise_muscle_groups FOR DELETE 
--   USING ((SELECT user_id FROM exercises WHERE id = exercise_muscle_groups.exercise_id) = auth.uid());

-- Create RLS policies f--or mesocycles
-- ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own mesocycles" 
--   ON mesocycles FOR SELECT 
--   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can insert their own mesocycles" 
--   ON mesocycles FOR INSERT 
--   WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can update their own mesocycles" 
--   ON mesocycles FOR UPDATE 
--   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can delete their own mesocycles" 
--   ON mesocycles FOR DELETE 
--   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create RLS policies for trai--ning_sessions
-- ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own training sessions" 
--   ON training_sessions FOR SELECT 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = training_sessions.mesocycle_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can insert their own training sessions" 
--   ON training_sessions FOR INSERT 
--   WITH CHECK ((SELECT profile_id FROM mesocycles WHERE id = training_sessions.mesocycle_id) IN 
--               (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can update their own training sessions" 
--   ON training_sessions FOR UPDATE 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = training_sessions.mesocycle_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can delete their own training sessions" 
--   ON training_sessions FOR DELETE 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = training_sessions.mesocycle_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create RLS policies for sess--ion_exercises
-- ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own session exercises" 
--   ON session_exercises FOR SELECT 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = (SELECT mesocycle_id FROM training_sessions WHERE id = session_exercises.training_session_id)) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can insert their own session exercises" 
--   ON session_exercises FOR INSERT 
--   WITH CHECK ((SELECT profile_id FROM mesocycles WHERE id = (SELECT mesocycle_id FROM training_sessions WHERE id = session_exercises.training_session_id)) IN 
--               (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can update their own session exercises" 
--   ON session_exercises FOR UPDATE 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = (SELECT mesocycle_id FROM training_sessions WHERE id = session_exercises.training_session_id)) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can delete their own session exercises" 
--   ON session_exercises FOR DELETE 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = (SELECT mesocycle_id FROM training_sessions WHERE id = session_exercises.training_session_id)) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create RLS policies for-- workout_logs
-- ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own workout logs" 
--   ON workout_logs FOR SELECT 
--   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can insert their own workout logs" 
--   ON workout_logs FOR INSERT 
--   WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can update their own workout logs" 
--   ON workout_logs FOR UPDATE 
--   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can delete their own workout logs" 
--   ON workout_logs FOR DELETE 
--   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create RLS policies for --exercise_logs
-- ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own exercise logs" 
--   ON exercise_logs FOR SELECT 
--   USING ((SELECT profile_id FROM workout_logs WHERE id = exercise_logs.workout_log_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can insert their own exercise logs" 
--   ON exercise_logs FOR INSERT 
--   WITH CHECK ((SELECT profile_id FROM workout_logs WHERE id = exercise_logs.workout_log_id) IN 
--               (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can update their own exercise logs" 
--   ON exercise_logs FOR UPDATE 
--   USING ((SELECT profile_id FROM workout_logs WHERE id = exercise_logs.workout_log_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can delete their own exercise logs" 
--   ON exercise_logs FOR DELETE 
--   USING ((SELECT profile_id FROM workout_logs WHERE id = exercise_logs.workout_log_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create RLS policies for work--out_reminders
-- ALTER TABLE workout_reminders ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own workout reminders" 
--   ON workout_reminders FOR SELECT 
--   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can insert their own workout reminders" 
--   ON workout_reminders FOR INSERT 
--   WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can update their own workout reminders" 
--   ON workout_reminders FOR UPDATE 
--   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can delete their own workout reminders" 
--   ON workout_reminders FOR DELETE 
--   USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create RLS policies for me--socycle_goals
-- ALTER TABLE mesocycle_goals ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own mesocycle goals" 
--   ON mesocycle_goals FOR SELECT 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = mesocycle_goals.mesocycle_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can insert their own mesocycle goals" 
--   ON mesocycle_goals FOR INSERT 
--   WITH CHECK ((SELECT profile_id FROM mesocycles WHERE id = mesocycle_goals.mesocycle_id) IN 
--               (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can update their own mesocycle goals" 
--   ON mesocycle_goals FOR UPDATE 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = mesocycle_goals.mesocycle_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can delete their own mesocycle goals" 
--   ON mesocycle_goals FOR DELETE 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = mesocycle_goals.mesocycle_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create RLS policies for mesocycle_muscl--e_group_focus
-- ALTER TABLE mesocycle_muscle_group_focus ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own mesocycle muscle focus" 
--   ON mesocycle_muscle_group_focus FOR SELECT 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = mesocycle_muscle_group_focus.mesocycle_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can insert their own mesocycle muscle focus" 
--   ON mesocycle_muscle_group_focus FOR INSERT 
--   WITH CHECK ((SELECT profile_id FROM mesocycles WHERE id = mesocycle_muscle_group_focus.mesocycle_id) IN 
--               (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can update their own mesocycle muscle focus" 
--   ON mesocycle_muscle_group_focus FOR UPDATE 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = mesocycle_muscle_group_focus.mesocycle_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- CREATE POLICY "Users can delete their own mesocycle muscle focus" 
--   ON mesocycle_muscle_group_focus FOR DELETE 
--   USING ((SELECT profile_id FROM mesocycles WHERE id = mesocycle_muscle_group_focus.mesocycle_id) IN 
--          (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create functions for analytics

-- Function to calculate total volume (sets * reps * weight) per muscle group for a workout
CREATE OR REPLACE FUNCTION get_workout_volume_by_muscle_group(workout_id UUID)
RETURNS TABLE (
  muscle_group_id UUID,
  muscle_group_name TEXT,
  total_volume NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mg.id AS muscle_group_id,
    mg.name AS muscle_group_name,
    SUM(el.reps * el.weight * CASE WHEN emg.is_primary THEN 1.0 ELSE 0.5 END) AS total_volume
  FROM 
    exercise_logs el
    JOIN exercises e ON el.exercise_id = e.id
    JOIN exercise_muscle_groups emg ON e.id = emg.exercise_id
    JOIN muscle_groups mg ON emg.muscle_group_id = mg.id
  WHERE 
    el.workout_log_id = workout_id
  GROUP BY 
    mg.id, mg.name
  ORDER BY 
    total_volume DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total sets per muscle group for a workout
CREATE OR REPLACE FUNCTION get_workout_sets_by_muscle_group(workout_id UUID)
RETURNS TABLE (
  muscle_group_id UUID,
  muscle_group_name TEXT,
  total_sets INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mg.id AS muscle_group_id,
    mg.name AS muscle_group_name,
    COUNT(DISTINCT el.set_number) AS total_sets
  FROM 
    exercise_logs el
    JOIN exercises e ON el.exercise_id = e.id
    JOIN exercise_muscle_groups emg ON e.id = emg.exercise_id
    JOIN muscle_groups mg ON emg.muscle_group_id = mg.id
  WHERE 
    el.workout_log_id = workout_id
  GROUP BY 
    mg.id, mg.name
  ORDER BY 
    total_sets DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get exercise progress over time
CREATE OR REPLACE FUNCTION get_exercise_progress(p_exercise_id UUID, p_user_id UUID)
RETURNS TABLE (
  workout_date DATE,
  max_weight NUMERIC,
  total_volume NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wl.date AS workout_date,
    MAX(el.weight) AS max_weight,
    SUM(el.reps * el.weight) AS total_volume
  FROM 
    exercise_logs el
    JOIN workout_logs wl ON el.workout_log_id = wl.id
  WHERE 
    el.exercise_id = p_exercise_id
    AND wl.user_id = p_user_id
  GROUP BY 
    wl.date
  ORDER BY 
    wl.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get volume by muscle group for a user within a period (used by dashboard)
CREATE OR REPLACE FUNCTION get_volume_by_muscle_group(
  user_id_param UUID,
  period_param TEXT DEFAULT 'month'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  volume NUMERIC,
  sets NUMERIC
) AS $$
DECLARE
  start_date DATE;
BEGIN
  IF period_param = 'week' THEN
    start_date := CURRENT_DATE - INTERVAL '7 days';
  ELSIF period_param = 'month' THEN
    start_date := CURRENT_DATE - INTERVAL '1 month';
  ELSIF period_param = 'year' THEN
    start_date := CURRENT_DATE - INTERVAL '1 year';
  ELSE
    start_date := CURRENT_DATE - INTERVAL '1 month';
  END IF;

  RETURN QUERY
  SELECT 
    mg.id,
    mg.name,
    SUM(el.reps * el.weight * CASE WHEN emg.is_primary THEN 1.0 ELSE 0.5 END) AS volume,
    COUNT(DISTINCT el.id) * CASE WHEN emg.is_primary THEN 1.0 ELSE 0.5 END AS sets
  FROM 
    exercise_logs el
    JOIN workout_logs wl ON el.workout_log_id = wl.id
    JOIN exercises e ON el.exercise_id = e.id
    JOIN exercise_muscle_groups emg ON e.id = emg.exercise_id
    JOIN muscle_groups mg ON emg.muscle_group_id = mg.id
  WHERE 
    wl.user_id = user_id_param
    AND wl.date >= start_date
  GROUP BY 
    mg.id, mg.name, emg.is_primary
  ORDER BY 
    volume DESC;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_muscle_groups_modtime
BEFORE UPDATE ON muscle_groups
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_exercises_modtime
BEFORE UPDATE ON exercises
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mesocycles_modtime
BEFORE UPDATE ON mesocycles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_training_sessions_modtime
BEFORE UPDATE ON training_sessions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_session_exercises_modtime
BEFORE UPDATE ON session_exercises
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_workout_logs_modtime
BEFORE UPDATE ON workout_logs
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_exercise_logs_modtime
BEFORE UPDATE ON exercise_logs
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_workout_reminders_modtime
BEFORE UPDATE ON workout_reminders
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mesocycle_goals_modtime
BEFORE UPDATE ON mesocycle_goals
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mesocycle_muscle_group_focus_modtime
BEFORE UPDATE ON mesocycle_muscle_group_focus
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mesocycle_templates_modtime
BEFORE UPDATE ON mesocycle_templates
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mesocycle_template_goals_modtime
BEFORE UPDATE ON mesocycle_template_goals
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mesocycle_template_muscle_focus_modtime
BEFORE UPDATE ON mesocycle_template_muscle_focus
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_training_session_templates_modtime
BEFORE UPDATE ON training_session_templates
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_template_session_exercises_modtime
BEFORE UPDATE ON template_session_exercises
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
