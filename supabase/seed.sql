-- Insert sample user (this is just for reference, actual users will be created through auth)
INSERT INTO auth.users (id, email)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'demo@example.com')
ON CONFLICT DO NOTHING;

-- Insert sample profile
INSERT INTO profiles (id, user_id, username, full_name, avatar_url)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'demo_user', 'Demo User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo')
ON CONFLICT DO NOTHING;

-- Insert sample muscle groups
INSERT INTO muscle_groups (id, name, is_default)
VALUES 
  ('00000000-0000-0000-0000-000000000010', 'Chest', TRUE),
  ('00000000-0000-0000-0000-000000000011', 'Back', TRUE),
  ('00000000-0000-0000-0000-000000000012', 'Legs', TRUE),
  ('00000000-0000-0000-0000-000000000013', 'Shoulders', TRUE),
  ('00000000-0000-0000-0000-000000000014', 'Arms', TRUE),
  ('00000000-0000-0000-0000-000000000015', 'Core', TRUE),
  ('00000000-0000-0000-0000-000000000016', 'Upper Chest', TRUE),
  ('00000000-0000-0000-0000-000000000017', 'Lower Chest', TRUE),
  ('00000000-0000-0000-0000-000000000018', 'Lats', TRUE),
  ('00000000-0000-0000-0000-000000000019', 'Trapezius', TRUE),
  ('00000000-0000-0000-0000-00000000001A', 'Middle Back', TRUE),
  ('00000000-0000-0000-0000-00000000001B', 'Lower Back', TRUE),
  ('00000000-0000-0000-0000-00000000001C', 'Quadriceps', TRUE),
  ('00000000-0000-0000-0000-00000000001D', 'Hamstrings', TRUE),
  ('00000000-0000-0000-0000-00000000001E', 'Calves', TRUE),
  ('00000000-0000-0000-0000-00000000001F', 'Glutes', TRUE),
  ('00000000-0000-0000-0000-000000000020', 'Front Delts', TRUE),
  ('00000000-0000-0000-0000-000000000021', 'Side Delts', TRUE),
  ('00000000-0000-0000-0000-000000000022', 'Rear Delts', TRUE),
  ('00000000-0000-0000-0000-000000000023', 'Biceps', TRUE),
  ('00000000-0000-0000-0000-000000000024', 'Triceps', TRUE),
  ('00000000-0000-0000-0000-000000000025', 'Forearms', TRUE),
  ('00000000-0000-0000-0000-000000000026', 'Abs', TRUE),
  ('00000000-0000-0000-0000-000000000027', 'Obliques', TRUE),
  ('00000000-0000-0000-0000-000000000028', 'Lower Back', TRUE),
  ('00000000-0000-0000-0000-000000000029', 'Adductors', TRUE),
  ('00000000-0000-0000-0000-00000000002A', 'Abductors', TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample exercises
INSERT INTO exercises (id, user_id, name, instructions, is_default)
VALUES 
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'Bench Press', 'Lie on a bench, lower the bar to your chest, and press it back up.', TRUE),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000000', 'Deadlift', 'Stand with feet shoulder-width apart, bend at the hips and knees to grip the bar, then stand up.', TRUE),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000000', 'Squat', 'Stand with feet shoulder-width apart, lower your body by bending your knees, then stand back up.', TRUE),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000000', 'Overhead Press', 'Stand with feet shoulder-width apart, press the bar from shoulder level to overhead.', TRUE),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000000', 'Pull-up', 'Hang from a bar with palms facing away, pull your body up until your chin is over the bar.', TRUE),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000000', 'Dumbbell Curl', 'Stand with a dumbbell in each hand, curl the weights up to shoulder level.', TRUE),
  ('00000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000000', 'Tricep Extension','Hold a dumbbell overhead, lower it behind your head, then extend your arms.', TRUE),
  ('00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000000', 'Plank', 'Hold a push-up position with your weight on your forearms and toes.', TRUE),
  ('00000000-0000-0000-0000-00000000002B', '00000000-0000-0000-0000-000000000000', 'Incline Bench Press', 'Lie on an inclined bench, lower the bar to your upper chest, and press it back up.', TRUE),
  ('00000000-0000-0000-0000-00000000002C', '00000000-0000-0000-0000-000000000000', 'Decline Bench Press', 'Lie on a declined bench, lower the bar to your lower chest, and press it back up.', TRUE),
  ('00000000-0000-0000-0000-00000000002D', '00000000-0000-0000-0000-000000000000', 'Dumbbell Fly', 'Lie on a flat bench with dumbbells, open arms to the sides, then bring them back together over your chest.', TRUE),
  ('00000000-0000-0000-0000-00000000002E', '00000000-0000-0000-0000-000000000000', 'Romanian Deadlift', 'Hold a barbell at hip level, hinge at the hips while keeping legs nearly straight, then return to standing.', TRUE),
  ('00000000-0000-0000-0000-00000000002F', '00000000-0000-0000-0000-000000000000', 'Barbell Row', 'Bend at the hips holding a barbell, pull it toward your lower chest while keeping your back straight.', TRUE),
  ('00000000-0000-0000-0000-00000000003A', '00000000-0000-0000-0000-000000000000', 'Lat Pulldown', 'Sit at a machine, grab the bar with wide grip, and pull it down to your upper chest.', TRUE),
  ('00000000-0000-0000-0000-00000000003B', '00000000-0000-0000-0000-000000000000', 'Front Squat', 'Hold a barbell across the front of your shoulders, squat down, then stand back up.', TRUE),
  ('00000000-0000-0000-0000-00000000003C', '00000000-0000-0000-0000-000000000000', 'Leg Press', 'Sit in the machine, press the platform away with your feet, then control it back.', TRUE),
  ('00000000-0000-0000-0000-00000000003D', '00000000-0000-0000-0000-000000000000', 'Leg Extension', 'Sit in the machine, extend your legs to straighten your knees, then lower back down.', TRUE),
  ('00000000-0000-0000-0000-00000000003E', '00000000-0000-0000-0000-000000000000', 'Leg Curl', 'Lie face down in the machine, curl your legs up by bending your knees, then lower back down.', TRUE),
  ('00000000-0000-0000-0000-00000000003F', '00000000-0000-0000-0000-000000000000', 'Calf Raise', 'Stand with balls of feet on a step, lower your heels, then raise up onto your toes.', TRUE),
  ('00000000-0000-0000-0000-00000000004A', '00000000-0000-0000-0000-000000000000', 'Lateral Raise', 'Stand holding dumbbells at your sides, raise them out to the sides to shoulder level, then lower.', TRUE),
  ('00000000-0000-0000-0000-00000000004B', '00000000-0000-0000-0000-000000000000', 'Face Pull', 'Pull a rope attachment to your face with elbows high, squeezing your shoulder blades together.', TRUE),
  ('00000000-0000-0000-0000-00000000004C', '00000000-0000-0000-0000-000000000000', 'Dips', 'Support yourself between parallel bars, lower your body by bending your elbows, then push back up.', TRUE),
  ('00000000-0000-0000-0000-00000000004D', '00000000-0000-0000-0000-000000000000', 'Hammer Curl', 'Hold dumbbells with neutral grip, curl the weights up while keeping palms facing each other.', TRUE),
  ('00000000-0000-0000-0000-00000000004E', '00000000-0000-0000-0000-000000000000', 'Skull Crusher', 'Lie on a bench holding a weight above your head, bend elbows to lower it toward your forehead.', TRUE),
  ('00000000-0000-0000-0000-00000000004F', '00000000-0000-0000-0000-000000000000', 'Ab Crunch', 'Lie on your back with knees bent, curl your shoulders toward your hips, then lower back down.', TRUE),
  ('00000000-0000-0000-0000-00000000005A', '00000000-0000-0000-0000-000000000000', 'Russian Twist', 'Sit with knees bent and torso leaned back, rotate a weight from side to side across your body.', TRUE),
  ('00000000-0000-0000-0000-00000000005B', '00000000-0000-0000-0000-000000000000', 'Mountain Climber', 'Start in a push-up position, alternate bringing knees toward your chest in a running motion.', TRUE),
  ('00000000-0000-0000-0000-00000000005C', '00000000-0000-0000-0000-000000000000', 'Burpee', 'From standing, drop to a squat, kick feet back to push-up position, return to squat, then jump up.', TRUE),
  -- Additional chest exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Cable Fly', 'Stand between cable stations with handles at chest height. With slight bend in elbows, bring hands together in front of chest in an arc motion.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Push-up', 'Start in a high plank position with hands slightly wider than shoulders. Lower your body until chest nearly touches the floor, then push back up.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Chest Dip', 'Support yourself between parallel bars, lean forward, lower your body by bending elbows, then push back up.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Machine Chest Press', 'Sit with back flat against pad, grip handles at chest level. Push handles forward until arms are extended, then return with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Pec Deck', 'Sit with back against pad, place forearms on pads. Squeeze arms together in front of chest, then return with control.', TRUE),
  
  -- Additional back exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'One-Arm Dumbbell Row', 'Place one knee and hand on bench, other foot on floor. Hold dumbbell with free hand, pull it to hip while keeping back flat.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Seated Cable Row', 'Sit at cable row station, feet on platform and knees slightly bent. Pull handle to lower abdomen while keeping back straight.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Chin-up', 'Hang from bar with palms facing you. Pull body up until chin clears the bar, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'T-Bar Row', 'Stand straddling T-bar with bent knees. Grip handle, pull weight up to chest while keeping back flat.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Straight Arm Pulldown', 'Stand facing cable machine with high pulley, hold bar with straight arms. Pull bar down in arc motion to thighs while keeping arms straight.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Meadows Row', 'Position one end of a barbell in a landmine or corner. Bend forward at hips, row the weight up with one arm, keeping elbow close to body.', TRUE),
  
  -- Additional shoulder exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Arnold Press', 'Sit with dumbbells at shoulder height, palms facing you. Press up while rotating palms to face forward at the top.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Front Raise', 'Stand holding dumbbells in front of thighs. Raise one arm forward to shoulder height, then alternate.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Reverse Fly', 'Bend at waist with dumbbells hanging down. Raise arms out to sides, squeezing shoulder blades together.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Shrugs', 'Stand holding dumbbells or barbell at sides. Raise shoulders toward ears, hold briefly, then lower.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Cable Lateral Raise', 'Stand sideways to cable machine, hold handle with opposite hand. Raise arm out to side to shoulder height.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Upright Row', 'Stand holding a barbell in front of thighs. Lift the barbell straight up to chin level, keeping it close to the body.', TRUE),
  
  -- Additional leg exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Bulgarian Split Squat', 'Place back foot on bench behind you, front foot forward. Lower body by bending front knee, then push back up.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Hack Squat', 'Position back against pad of hack squat machine, shoulders under pads. Release safety and squat down, then push back up.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Step-up', 'Stand facing a step or box. Step one foot onto platform, drive through heel to lift body up, then lower back down.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Glute Bridge', 'Lie on back with knees bent, feet flat on floor. Push through heels to lift hips toward ceiling, squeezing glutes at top.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Standing Calf Raise', 'Stand on edge of platform with balls of feet, heels hanging off. Raise heels up as high as possible, then lower below platform level.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Seated Calf Raise', 'Sit at machine with knees bent and balls of feet on platform. Raise heels by pressing feet up, then lower.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Hip Thrust', 'Sit with upper back against bench, barbell across hips. Drive hips upward by squeezing glutes, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Good Morning', 'Stand with barbell across upper back. Bend at hips while keeping back straight, then return to standing.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Sissy Squat', 'Hold onto a support, lean back with straight torso, bend knees to lower body, then extend knees to rise.', TRUE),
  
  -- Additional arm exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Concentration Curl', 'Sit on bench, lean forward with elbow against inner thigh. Curl dumbbell toward shoulder without moving upper arm.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Preacher Curl', 'Sit at preacher bench with arms extended over pad. Curl weight toward shoulders, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Cable Pushdown', 'Stand facing cable machine with high pulley. Grasp bar with overhand grip, push down until arms are fully extended.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Overhead Rope Extension', 'Stand facing cable machine with low pulley and rope attachment. Hold rope overhead, extend arms by moving hands away from each other.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Reverse Curl', 'Stand holding barbell with overhand grip. Curl weight toward shoulders without moving upper arms.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Wrist Curl', 'Sit holding barbell with palms up, forearms on thighs, wrists extended beyond knees. Curl wrists upward, then lower.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Reverse Wrist Curl', 'Sit holding barbell with palms down, forearms on thighs. Curl wrists upward, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Zottman Curl', 'Start with palms up, curl dumbbells, rotate to palms down at the top, lower with palms down, then rotate back.', TRUE),
  
  -- Additional core exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Hanging Leg Raise', 'Hang from pull-up bar with arms extended. Raise legs until they are parallel to floor, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Cable Woodchop', 'Stand sideways to cable machine, grasp handle with both hands. Pull handle diagonally across body from high to low position.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Ab Wheel Rollout', 'Kneel holding ab wheel on floor in front of knees. Roll wheel forward extending body, then pull back to starting position.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Bicycle Crunch', 'Lie on back with hands behind head, knees bent. Bring opposite elbow to opposite knee while extending other leg.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Side Plank', 'Lie on side propped up on forearm, feet stacked. Raise hips creating straight line from head to feet, hold position.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Dragon Flag', 'Lie on bench holding behind head. Raise legs and torso as one unit until body is vertical, then lower with control.', TRUE),
  
  -- Functional/compound exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Clean and Press', 'In one motion, pull barbell from floor to shoulders, then press overhead until arms extended. Return to floor and repeat.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Turkish Get-up', 'Lie on back holding weight in one hand above chest. Rise to standing position while keeping weight overhead, then reverse.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Kettlebell Swing', 'Stand with feet shoulder-width apart, kettlebell between feet. Hinge at hips swinging kettlebell between legs, then thrust hips forward swinging weight to chest height.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Battle Ropes', 'Stand with feet shoulder-width apart holding one rope in each hand. Create waves by rapidly raising and lowering arms.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Medicine Ball Slam', 'Stand holding medicine ball overhead. Forcefully throw ball to ground by bending forward, retrieve and repeat.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Renegade Row', 'Start in push-up position with hands on dumbbells. Perform a push-up, then row one dumbbell to hip, alternate sides.', TRUE)
ON CONFLICT DO NOTHING;

-- Link exercises to muscle groups
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, is_primary, incidence_level)
VALUES 
  -- Bench Press
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', TRUE, 10),  -- Chest (primary, 100%)
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000024', FALSE, 7),  -- Triceps (70%)
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000013', FALSE, 5),  -- Shoulders (50%)
  
  -- Deadlift
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000011', TRUE, 9),   -- Back (primary, 90%)
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000012', FALSE, 8),  -- Legs (80%)
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-00000000001F', FALSE, 7),  -- Glutes (70%)
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-00000000001B', FALSE, 6),  -- Lower Back (60%)
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000025', FALSE, 5),  -- Forearms (50%)
  
  -- Squat
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-00000000001C', TRUE, 10),  -- Quadriceps (primary, 100%)
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-00000000001F', FALSE, 9),  -- Glutes (90%)
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-00000000001D', FALSE, 8),  -- Hamstrings (80%)
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-00000000001B', FALSE, 6),  -- Lower Back (60%)
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000015', FALSE, 5),  -- Core (50%)
  
  -- Overhead Press
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000013', TRUE, 10),  -- Shoulders (primary, 100%)
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000020', TRUE, 9),   -- Front Delts (primary, 90%)
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000021', FALSE, 6),  -- Side Delts (60%)
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000024', FALSE, 5),  -- Triceps (50%)
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000010', FALSE, 3),  -- Chest (30%)
  
  -- Pull-up
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000018', TRUE, 10),  -- Lats (primary, 100%)
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000011', TRUE, 9),   -- Back (primary, 90%)
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000023', FALSE, 7),  -- Biceps (70%)
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000025', FALSE, 5),  -- Forearms (50%)
  
  -- Dumbbell Curl
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000023', TRUE, 10),  -- Biceps (primary, 100%)
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000025', FALSE, 4),  -- Forearms (40%)
  
  -- Tricep Extension
  ('00000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000024', TRUE, 10),  -- Triceps (primary, 100%)
  
  -- Plank
  ('00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000015', TRUE, 10),  -- Core (primary, 100%)
  ('00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000026', TRUE, 9),   -- Abs (primary, 90%)
  ('00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000013', FALSE, 5),  -- Shoulders (50%)
  ('00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-00000000001B', FALSE, 5),  -- Lower Back (50%)
  
  -- Incline Bench Press
  ('00000000-0000-0000-0000-00000000002B', '00000000-0000-0000-0000-000000000016', TRUE, 10),  -- Upper Chest (primary, 100%)
  ('00000000-0000-0000-0000-00000000002B', '00000000-0000-0000-0000-000000000010', TRUE, 9),   -- Chest (primary, 90%)
  ('00000000-0000-0000-0000-00000000002B', '00000000-0000-0000-0000-000000000013', FALSE, 6),  -- Shoulders (60%)
  ('00000000-0000-0000-0000-00000000002B', '00000000-0000-0000-0000-000000000024', FALSE, 6),  -- Triceps (60%)
  
  -- Decline Bench Press
  ('00000000-0000-0000-0000-00000000002C', '00000000-0000-0000-0000-000000000017', TRUE, 10),  -- Lower Chest (primary, 100%)
  ('00000000-0000-0000-0000-00000000002C', '00000000-0000-0000-0000-000000000010', TRUE, 9),   -- Chest (primary, 90%)
  ('00000000-0000-0000-0000-00000000002C', '00000000-0000-0000-0000-000000000024', FALSE, 7),  -- Triceps (70%)
  
  -- Dumbbell Fly
  ('00000000-0000-0000-0000-00000000002D', '00000000-0000-0000-0000-000000000010', TRUE, 10),  -- Chest (primary, 100%)
  ('00000000-0000-0000-0000-00000000002D', '00000000-0000-0000-0000-000000000013', FALSE, 4),  -- Shoulders (40%)
  
  -- Romanian Deadlift
  ('00000000-0000-0000-0000-00000000002E', '00000000-0000-0000-0000-00000000001D', TRUE, 10),  -- Hamstrings (primary, 100%)
  ('00000000-0000-0000-0000-00000000002E', '00000000-0000-0000-0000-00000000001F', TRUE, 8),   -- Glutes (primary, 80%)
  ('00000000-0000-0000-0000-00000000002E', '00000000-0000-0000-0000-00000000001B', FALSE, 7),  -- Lower Back (70%)
  
  -- Barbell Row
  ('00000000-0000-0000-0000-00000000002F', '00000000-0000-0000-0000-00000000001A', TRUE, 10),  -- Middle Back (primary, 100%)
  ('00000000-0000-0000-0000-00000000002F', '00000000-0000-0000-0000-000000000011', TRUE, 9),   -- Back (primary, 90%)
  ('00000000-0000-0000-0000-00000000002F', '00000000-0000-0000-0000-000000000018', FALSE, 8),  -- Lats (80%)
  ('00000000-0000-0000-0000-00000000002F', '00000000-0000-0000-0000-000000000023', FALSE, 5),  -- Biceps (50%)
  ('00000000-0000-0000-0000-00000000002F', '00000000-0000-0000-0000-000000000025', FALSE, 4),  -- Forearms (40%)
  
  -- Lat Pulldown
  ('00000000-0000-0000-0000-00000000003A', '00000000-0000-0000-0000-000000000018', TRUE, 10),  -- Lats (primary, 100%)
  ('00000000-0000-0000-0000-00000000003A', '00000000-0000-0000-0000-000000000011', FALSE, 8),  -- Back (80%)
  ('00000000-0000-0000-0000-00000000003A', '00000000-0000-0000-0000-000000000023', FALSE, 5),  -- Biceps (50%)
  
  -- Front Squat
  ('00000000-0000-0000-0000-00000000003B', '00000000-0000-0000-0000-00000000001C', TRUE, 10),  -- Quadriceps (primary, 100%)
  ('00000000-0000-0000-0000-00000000003B', '00000000-0000-0000-0000-00000000001F', FALSE, 7),  -- Glutes (70%)
  ('00000000-0000-0000-0000-00000000003B', '00000000-0000-0000-0000-000000000015', FALSE, 7),  -- Core (70%)
  ('00000000-0000-0000-0000-00000000003B', '00000000-0000-0000-0000-000000000013', FALSE, 5),  -- Shoulders (50%)
  
  -- Leg Press
  ('00000000-0000-0000-0000-00000000003C', '00000000-0000-0000-0000-00000000001C', TRUE, 10),  -- Quadriceps (primary, 100%)
  ('00000000-0000-0000-0000-00000000003C', '00000000-0000-0000-0000-00000000001F', FALSE, 7),  -- Glutes (70%)
  ('00000000-0000-0000-0000-00000000003C', '00000000-0000-0000-0000-00000000001D', FALSE, 6),  -- Hamstrings (60%)
  
  -- Leg Extension
  ('00000000-0000-0000-0000-00000000003D', '00000000-0000-0000-0000-00000000001C', TRUE, 10),  -- Quadriceps (primary, 100%)
  
  -- Leg Curl
  ('00000000-0000-0000-0000-00000000003E', '00000000-0000-0000-0000-00000000001D', TRUE, 10),  -- Hamstrings (primary, 100%)
  
  -- Calf Raise
  ('00000000-0000-0000-0000-00000000003F', '00000000-0000-0000-0000-00000000001E', TRUE, 10),  -- Calves (primary, 100%)
  
  -- Lateral Raise
  ('00000000-0000-0000-0000-00000000004A', '00000000-0000-0000-0000-000000000021', TRUE, 10),  -- Side Delts (primary, 100%)
  ('00000000-0000-0000-0000-00000000004A', '00000000-0000-0000-0000-000000000013', FALSE, 7),  -- Shoulders (70%)
  
  -- Face Pull
  ('00000000-0000-0000-0000-00000000004B', '00000000-0000-0000-0000-000000000022', TRUE, 10),  -- Rear Delts (primary, 100%)
  ('00000000-0000-0000-0000-00000000004B', '00000000-0000-0000-0000-000000000019', FALSE, 8),  -- Trapezius (80%)
  ('00000000-0000-0000-0000-00000000004B', '00000000-0000-0000-0000-000000000013', FALSE, 7),  -- Shoulders (70%)
  
  -- Dips
  ('00000000-0000-0000-0000-00000000004C', '00000000-0000-0000-0000-000000000024', TRUE, 10),  -- Triceps (primary, 100%)
  ('00000000-0000-0000-0000-00000000004C', '00000000-0000-0000-0000-000000000010', FALSE, 8),  -- Chest (80%)
  ('00000000-0000-0000-0000-00000000004C', '00000000-0000-0000-0000-000000000013', FALSE, 5),  -- Shoulders (50%)
  
  -- Hammer Curl
  ('00000000-0000-0000-0000-00000000004D', '00000000-0000-0000-0000-000000000023', TRUE, 10),  -- Biceps (primary, 100%)
  ('00000000-0000-0000-0000-00000000004D', '00000000-0000-0000-0000-000000000025', FALSE, 6),  -- Forearms (60%)
  
  -- Skull Crusher
  ('00000000-0000-0000-0000-00000000004E', '00000000-0000-0000-0000-000000000024', TRUE, 10),  -- Triceps (primary, 100%)
  
  -- Ab Crunch
  ('00000000-0000-0000-0000-00000000004F', '00000000-0000-0000-0000-000000000026', TRUE, 10),  -- Abs (primary, 100%)
  ('00000000-0000-0000-0000-00000000004F', '00000000-0000-0000-0000-000000000015', FALSE, 7),  -- Core (70%)
  
  -- Russian Twist
  ('00000000-0000-0000-0000-00000000005A', '00000000-0000-0000-0000-000000000027', TRUE, 10),  -- Obliques (primary, 100%)
  ('00000000-0000-0000-0000-00000000005A', '00000000-0000-0000-0000-000000000026', FALSE, 7),  -- Abs (70%)
  ('00000000-0000-0000-0000-00000000005A', '00000000-0000-0000-0000-000000000015', FALSE, 8),  -- Core (80%)
  
  -- Mountain Climber
  ('00000000-0000-0000-0000-00000000005B', '00000000-0000-0000-0000-000000000015', TRUE, 10),  -- Core (primary, 100%)
  ('00000000-0000-0000-0000-00000000005B', '00000000-0000-0000-0000-000000000026', FALSE, 8),  -- Abs (80%)
  ('00000000-0000-0000-0000-00000000005B', '00000000-0000-0000-0000-00000000001C', FALSE, 6),  -- Quadriceps (60%)
  ('00000000-0000-0000-0000-00000000005B', '00000000-0000-0000-0000-000000000013', FALSE, 4),  -- Shoulders (40%)
  
  -- Burpee
  ('00000000-0000-0000-0000-00000000005C', '00000000-0000-0000-0000-000000000015', TRUE, 8),   -- Core (primary, 80%)
  ('00000000-0000-0000-0000-00000000005C', '00000000-0000-0000-0000-00000000001C', FALSE, 7),  -- Quadriceps (70%)
  ('00000000-0000-0000-0000-00000000005C', '00000000-0000-0000-0000-00000000001F', FALSE, 6),  -- Glutes (60%)
  ('00000000-0000-0000-0000-00000000005C', '00000000-0000-0000-0000-000000000013', FALSE, 5),  -- Shoulders (50%)
  ('00000000-0000-0000-0000-00000000005C', '00000000-0000-0000-0000-000000000010', FALSE, 4)   -- Chest (40%)
ON CONFLICT DO NOTHING;

-- Additional exercises
INSERT INTO exercises (id, user_id, name, instructions, is_default)
VALUES
  -- Additional chest exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Cable Fly', 'Stand between cable stations with handles at chest height. With slight bend in elbows, bring hands together in front of chest in an arc motion.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Push-up', 'Start in a high plank position with hands slightly wider than shoulders. Lower your body until chest nearly touches the floor, then push back up.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Chest Dip', 'Support yourself between parallel bars, lean forward, lower your body by bending elbows, then push back up.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Machine Chest Press', 'Sit with back flat against pad, grip handles at chest level. Push handles forward until arms are extended, then return with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Pec Deck', 'Sit with back against pad, place forearms on pads. Squeeze arms together in front of chest, then return with control.', TRUE),
  
  -- Additional back exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'One-Arm Dumbbell Row', 'Place one knee and hand on bench, other foot on floor. Hold dumbbell with free hand, pull it to hip while keeping back flat.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Seated Cable Row', 'Sit at cable row station, feet on platform and knees slightly bent. Pull handle to lower abdomen while keeping back straight.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Chin-up', 'Hang from bar with palms facing you. Pull body up until chin clears the bar, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'T-Bar Row', 'Stand straddling T-bar with bent knees. Grip handle, pull weight up to chest while keeping back flat.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Straight Arm Pulldown', 'Stand facing cable machine with high pulley, hold bar with straight arms. Pull bar down in arc motion to thighs while keeping arms straight.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Meadows Row', 'Position one end of a barbell in a landmine or corner. Bend forward at hips, row the weight up with one arm, keeping elbow close to body.', TRUE),
  
  -- Additional shoulder exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Arnold Press', 'Sit with dumbbells at shoulder height, palms facing you. Press up while rotating palms to face forward at the top.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Front Raise', 'Stand holding dumbbells in front of thighs. Raise one arm forward to shoulder height, then alternate.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Reverse Fly', 'Bend at waist with dumbbells hanging down. Raise arms out to sides, squeezing shoulder blades together.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Shrugs', 'Stand holding dumbbells or barbell at sides. Raise shoulders toward ears, hold briefly, then lower.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Cable Lateral Raise', 'Stand sideways to cable machine, hold handle with opposite hand. Raise arm out to side to shoulder height.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Upright Row', 'Stand holding a barbell in front of thighs. Lift the barbell straight up to chin level, keeping it close to the body.', TRUE),
  
  -- Additional leg exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Bulgarian Split Squat', 'Place back foot on bench behind you, front foot forward. Lower body by bending front knee, then push back up.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Hack Squat', 'Position back against pad of hack squat machine, shoulders under pads. Release safety and squat down, then push back up.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Step-up', 'Stand facing a step or box. Step one foot onto platform, drive through heel to lift body up, then lower back down.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Glute Bridge', 'Lie on back with knees bent, feet flat on floor. Push through heels to lift hips toward ceiling, squeezing glutes at top.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Standing Calf Raise', 'Stand on edge of platform with balls of feet, heels hanging off. Raise heels up as high as possible, then lower below platform level.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Seated Calf Raise', 'Sit at machine with knees bent and balls of feet on platform. Raise heels by pressing feet up, then lower.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Hip Thrust', 'Sit with upper back against bench, barbell across hips. Drive hips upward by squeezing glutes, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Good Morning', 'Stand with barbell across upper back. Bend at hips while keeping back straight, then return to standing.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Sissy Squat', 'Hold onto a support, lean back with straight torso, bend knees to lower body, then extend knees to rise.', TRUE),
  
  -- Additional arm exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Concentration Curl', 'Sit on bench, lean forward with elbow against inner thigh. Curl dumbbell toward shoulder without moving upper arm.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Preacher Curl', 'Sit at preacher bench with arms extended over pad. Curl weight toward shoulders, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Cable Pushdown', 'Stand facing cable machine with high pulley. Grasp bar with overhand grip, push down until arms are fully extended.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Overhead Rope Extension', 'Stand facing cable machine with low pulley and rope attachment. Hold rope overhead, extend arms by moving hands away from each other.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Reverse Curl', 'Stand holding barbell with overhand grip. Curl weight toward shoulders without moving upper arms.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Wrist Curl', 'Sit holding barbell with palms up, forearms on thighs, wrists extended beyond knees. Curl wrists upward, then lower.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Reverse Wrist Curl', 'Sit holding barbell with palms down, forearms on thighs. Curl wrists upward, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Zottman Curl', 'Start with palms up, curl dumbbells, rotate to palms down at the top, lower with palms down, then rotate back.', TRUE),
  
  -- Additional core exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Hanging Leg Raise', 'Hang from pull-up bar with arms extended. Raise legs until they are parallel to floor, then lower with control.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Cable Woodchop', 'Stand sideways to cable machine, grasp handle with both hands. Pull handle diagonally across body from high to low position.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Ab Wheel Rollout', 'Kneel holding ab wheel on floor in front of knees. Roll wheel forward extending body, then pull back to starting position.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Bicycle Crunch', 'Lie on back with hands behind head, knees bent. Bring opposite elbow to opposite knee while extending other leg.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Side Plank', 'Lie on side propped up on forearm, feet stacked. Raise hips creating straight line from head to feet, hold position.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Dragon Flag', 'Lie on bench holding behind head. Raise legs and torso as one unit until body is vertical, then lower with control.', TRUE),
  
  -- Functional/compound exercises
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Clean and Press', 'In one motion, pull barbell from floor to shoulders, then press overhead until arms extended. Return to floor and repeat.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Turkish Get-up', 'Lie on back holding weight in one hand above chest. Rise to standing position while keeping weight overhead, then reverse.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Kettlebell Swing', 'Stand with feet shoulder-width apart, kettlebell between feet. Hinge at hips swinging kettlebell between legs, then thrust hips forward swinging weight to chest height.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Battle Ropes', 'Stand with feet shoulder-width apart holding one rope in each hand. Create waves by rapidly raising and lowering arms.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Medicine Ball Slam', 'Stand holding medicine ball overhead. Forcefully throw ball to ground by bending forward, retrieve and repeat.', TRUE),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Renegade Row', 'Start in push-up position with hands on dumbbells. Perform a push-up, then row one dumbbell to hip, alternate sides.', TRUE)
ON CONFLICT DO NOTHING;

-- Connect new exercises to muscle groups
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, is_primary, incidence_level)
WITH exercises_info AS (
  SELECT id, name FROM exercises
),
muscle_groups_info AS (
  SELECT id, name FROM muscle_groups
)
SELECT
  e.id AS exercise_id,
  m.id AS muscle_group_id,
  is_primary,
  incidence_level
FROM
  (VALUES
    -- Cable Fly
    ('Cable Fly', 'Chest', TRUE, 10),
    ('Cable Fly', 'Front Delts', FALSE, 4),
    
    -- Push-up  
    ('Push-up', 'Chest', TRUE, 10),
    ('Push-up', 'Triceps', FALSE, 6),
    ('Push-up', 'Front Delts', FALSE, 5),
    ('Push-up', 'Core', FALSE, 4),
    
    -- Chest Dip
    ('Chest Dip', 'Lower Chest', TRUE, 9),
    ('Chest Dip', 'Chest', TRUE, 10),
    ('Chest Dip', 'Triceps', FALSE, 7),
    ('Chest Dip', 'Front Delts', FALSE, 4),
    
    -- Machine Chest Press
    ('Machine Chest Press', 'Chest', TRUE, 10),
    ('Machine Chest Press', 'Triceps', FALSE, 6),
    ('Machine Chest Press', 'Front Delts', FALSE, 4),
    
    -- Pec Deck
    ('Pec Deck', 'Chest', TRUE, 10),
    
    -- One-Arm Dumbbell Row
    ('One-Arm Dumbbell Row', 'Back', TRUE, 9),
    ('One-Arm Dumbbell Row', 'Lats', TRUE, 9),
    ('One-Arm Dumbbell Row', 'Middle Back', FALSE, 8),
    ('One-Arm Dumbbell Row', 'Biceps', FALSE, 5),
    ('One-Arm Dumbbell Row', 'Rear Delts', FALSE, 5),
    ('One-Arm Dumbbell Row', 'Forearms', FALSE, 4),
    
    -- Seated Cable Row
    ('Seated Cable Row', 'Middle Back', TRUE, 10),
    ('Seated Cable Row', 'Back', FALSE, 9),
    ('Seated Cable Row', 'Lats', FALSE, 7),
    ('Seated Cable Row', 'Biceps', FALSE, 6),
    ('Seated Cable Row', 'Forearms', FALSE, 4),
    
    -- Chin-up
    ('Chin-up', 'Lats', TRUE, 9),
    ('Chin-up', 'Biceps', TRUE, 8),
    ('Chin-up', 'Back', FALSE, 7),
    ('Chin-up', 'Forearms', FALSE, 5),
    
    -- T-Bar Row
    ('T-Bar Row', 'Middle Back', TRUE, 10),
    ('T-Bar Row', 'Back', FALSE, 8),
    ('T-Bar Row', 'Lats', FALSE, 7),
    ('T-Bar Row', 'Biceps', FALSE, 4),
    ('T-Bar Row', 'Trapezius', FALSE, 6),
    ('T-Bar Row', 'Forearms', FALSE, 3),
    
    -- Straight Arm Pulldown
    ('Straight Arm Pulldown', 'Lats', TRUE, 10),
    ('Straight Arm Pulldown', 'Triceps', FALSE, 4),
    ('Straight Arm Pulldown', 'Lower Back', FALSE, 3),
    
    -- Meadows Row
    ('Meadows Row', 'Lats', TRUE, 9),
    ('Meadows Row', 'Middle Back', TRUE, 9),
    ('Meadows Row', 'Trapezius', FALSE, 6),
    ('Meadows Row', 'Biceps', FALSE, 5),
    ('Meadows Row', 'Forearms', FALSE, 6),
    
    -- Arnold Press
    ('Arnold Press', 'Shoulders', TRUE, 10),
    ('Arnold Press', 'Front Delts', TRUE, 9),
    ('Arnold Press', 'Side Delts', TRUE, 9),
    ('Arnold Press', 'Triceps', FALSE, 6),
    
    -- Front Raise
    ('Front Raise', 'Front Delts', TRUE, 10),
    ('Front Raise', 'Shoulders', FALSE, 8),
    
    -- Reverse Fly
    ('Reverse Fly', 'Rear Delts', TRUE, 10),
    ('Reverse Fly', 'Middle Back', FALSE, 6),
    ('Reverse Fly', 'Trapezius', FALSE, 5),
    
    -- Shrugs
    ('Shrugs', 'Trapezius', TRUE, 10),
    ('Shrugs', 'Forearms', FALSE, 4),
    ('Shrugs', 'Neck', FALSE, 3),
    
    -- Cable Lateral Raise
    ('Cable Lateral Raise', 'Side Delts', TRUE, 10),
    ('Cable Lateral Raise', 'Shoulders', FALSE, 7),
    ('Cable Lateral Raise', 'Trapezius', FALSE, 3),
    
    -- Upright Row
    ('Upright Row', 'Trapezius', TRUE, 9),
    ('Upright Row', 'Side Delts', TRUE, 9),
    ('Upright Row', 'Front Delts', FALSE, 6),
    ('Upright Row', 'Biceps', FALSE, 5),
    
    -- Bulgarian Split Squat
    ('Bulgarian Split Squat', 'Quadriceps', TRUE, 10),
    ('Bulgarian Split Squat', 'Glutes', TRUE, 9),
    ('Bulgarian Split Squat', 'Hamstrings', FALSE, 7),
    ('Bulgarian Split Squat', 'Adductors', FALSE, 6),
    ('Bulgarian Split Squat', 'Calves', FALSE, 3),
    
    -- Hack Squat
    ('Hack Squat', 'Quadriceps', TRUE, 10),
    ('Hack Squat', 'Glutes', FALSE, 7),
    ('Hack Squat', 'Hamstrings', FALSE, 6),
    ('Hack Squat', 'Calves', FALSE, 3),
    
    -- Step-up
    ('Step-up', 'Quadriceps', TRUE, 9),
    ('Step-up', 'Glutes', TRUE, 9),
    ('Step-up', 'Hamstrings', FALSE, 6),
    ('Step-up', 'Calves', FALSE, 4),
    
    -- Glute Bridge
    ('Glute Bridge', 'Glutes', TRUE, 10),
    ('Glute Bridge', 'Hamstrings', FALSE, 6),
    ('Glute Bridge', 'Lower Back', FALSE, 5),
    
    -- Standing Calf Raise
    ('Standing Calf Raise', 'Calves', TRUE, 10),
    
    -- Seated Calf Raise
    ('Seated Calf Raise', 'Calves', TRUE, 10),
    
    -- Hip Thrust
    ('Hip Thrust', 'Glutes', TRUE, 10),
    ('Hip Thrust', 'Hamstrings', FALSE, 7),
    ('Hip Thrust', 'Lower Back', FALSE, 5),
    ('Hip Thrust', 'Quadriceps', FALSE, 4),
    
    -- Good Morning
    ('Good Morning', 'Hamstrings', TRUE, 10),
    ('Good Morning', 'Lower Back', TRUE, 9),
    ('Good Morning', 'Glutes', FALSE, 7),
    ('Good Morning', 'Calves', FALSE, 3),
    
    -- Sissy Squat
    ('Sissy Squat', 'Quadriceps', TRUE, 10),
    ('Sissy Squat', 'Calves', FALSE, 4),
    
    -- Concentration Curl
    ('Concentration Curl', 'Biceps', TRUE, 10),
    ('Concentration Curl', 'Forearms', FALSE, 4),
    
    -- Preacher Curl
    ('Preacher Curl', 'Biceps', TRUE, 10),
    ('Preacher Curl', 'Forearms', FALSE, 5),
    
    -- Cable Pushdown
    ('Cable Pushdown', 'Triceps', TRUE, 10),
    
    -- Overhead Rope Extension
    ('Overhead Rope Extension', 'Triceps', TRUE, 10),
    
    -- Reverse Curl
    ('Reverse Curl', 'Biceps', TRUE, 8),
    ('Reverse Curl', 'Forearms', TRUE, 9),
    
    -- Wrist Curl
    ('Wrist Curl', 'Forearms', TRUE, 10),
    
    -- Reverse Wrist Curl
    ('Reverse Wrist Curl', 'Forearms', TRUE, 10),
    
    -- Zottman Curl
    ('Zottman Curl', 'Biceps', TRUE, 9),
    ('Zottman Curl', 'Forearms', TRUE, 9),
    
    -- Hanging Leg Raise
    ('Hanging Leg Raise', 'Abs', TRUE, 10),
    ('Hanging Leg Raise', 'Hip Flexors', FALSE, 7),
    ('Hanging Leg Raise', 'Obliques', FALSE, 5),
    ('Hanging Leg Raise', 'Forearms', FALSE, 4),
    
    -- Cable Woodchop
    ('Cable Woodchop', 'Obliques', TRUE, 10),
    ('Cable Woodchop', 'Abs', FALSE, 6),
    ('Cable Woodchop', 'Shoulders', FALSE, 4),
    
    -- Ab Wheel Rollout
    ('Ab Wheel Rollout', 'Abs', TRUE, 10),
    ('Ab Wheel Rollout', 'Core', TRUE, 10),
    ('Ab Wheel Rollout', 'Shoulders', FALSE, 6),
    ('Ab Wheel Rollout', 'Lower Back', FALSE, 5),
    ('Ab Wheel Rollout', 'Lats', FALSE, 4),
    
    -- Bicycle Crunch
    ('Bicycle Crunch', 'Abs', TRUE, 10),
    ('Bicycle Crunch', 'Obliques', TRUE, 9),
    ('Bicycle Crunch', 'Hip Flexors', FALSE, 6),
    
    -- Side Plank
    ('Side Plank', 'Obliques', TRUE, 10),
    ('Side Plank', 'Abs', FALSE, 7),
    ('Side Plank', 'Shoulders', FALSE, 5),
    
    -- Dragon Flag
    ('Dragon Flag', 'Abs', TRUE, 10),
    ('Dragon Flag', 'Core', TRUE, 10),
    ('Dragon Flag', 'Hip Flexors', FALSE, 7),
    ('Dragon Flag', 'Lower Back', FALSE, 6),
    
    -- Clean and Press
    ('Clean and Press', 'Quadriceps', TRUE, 9),
    ('Clean and Press', 'Shoulders', TRUE, 9),
    ('Clean and Press', 'Hamstrings', FALSE, 8),
    ('Clean and Press', 'Glutes', FALSE, 8),
    ('Clean and Press', 'Trapezius', FALSE, 7),
    ('Clean and Press', 'Triceps', FALSE, 6),
    ('Clean and Press', 'Core', FALSE, 7),
    ('Clean and Press', 'Lower Back', FALSE, 7),
    ('Clean and Press', 'Front Delts', FALSE, 8),
    
    -- Turkish Get-up
    ('Turkish Get-up', 'Core', TRUE, 9),
    ('Turkish Get-up', 'Shoulders', TRUE, 9),
    ('Turkish Get-up', 'Glutes', FALSE, 7),
    ('Turkish Get-up', 'Hamstrings', FALSE, 6),
    ('Turkish Get-up', 'Quadriceps', FALSE, 6),
    ('Turkish Get-up', 'Triceps', FALSE, 6),
    ('Turkish Get-up', 'Obliques', FALSE, 7),
    ('Turkish Get-up', 'Lower Back', FALSE, 7),
    
    -- Kettlebell Swing
    ('Kettlebell Swing', 'Glutes', TRUE, 10),
    ('Kettlebell Swing', 'Hamstrings', TRUE, 9),
    ('Kettlebell Swing', 'Lower Back', FALSE, 7),
    ('Kettlebell Swing', 'Core', FALSE, 6),
    ('Kettlebell Swing', 'Shoulders', FALSE, 5),
    ('Kettlebell Swing', 'Forearms', FALSE, 5),
    
    -- Battle Ropes
    ('Battle Ropes', 'Shoulders', TRUE, 9),
    ('Battle Ropes', 'Arms', TRUE, 8),
    ('Battle Ropes', 'Core', FALSE, 7),
    ('Battle Ropes', 'Back', FALSE, 6),
    ('Battle Ropes', 'Chest', FALSE, 5),
    
    -- Medicine Ball Slam
    ('Medicine Ball Slam', 'Core', TRUE, 9),
    ('Medicine Ball Slam', 'Shoulders', TRUE, 8),
    ('Medicine Ball Slam', 'Arms', FALSE, 7),
    ('Medicine Ball Slam', 'Back', FALSE, 6),
    ('Medicine Ball Slam', 'Legs', FALSE, 5),
    
    -- Renegade Row
    ('Renegade Row', 'Core', TRUE, 10),
    ('Renegade Row', 'Middle Back', TRUE, 9),
    ('Renegade Row', 'Chest', FALSE, 6),
    ('Renegade Row', 'Triceps', FALSE, 6),
    ('Renegade Row', 'Biceps', FALSE, 5),
    ('Renegade Row', 'Shoulders', FALSE, 5)
  ) AS vals(ex_name, muscle_name, is_primary, incidence_level)
JOIN exercises_info e ON e.name = vals.ex_name
JOIN muscle_groups_info m ON m.name = vals.muscle_name
ON CONFLICT DO NOTHING;

-- Insert sample mesocycle
-- INSERT INTO mesocycles (id, user_id, name, description, start_date, end_date, status)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000000', 'Strength Phase 1', 'Focus on building strength in compound movements', '2023-01-01', '2023-02-28', 'completed'),
--   ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000000', 'Hypertrophy Phase', 'Focus on muscle growth with higher volume', '2023-03-01', '2023-04-30', 'completed'),
--   ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000000', 'Strength Phase 2', 'Focus on increasing maximal strength', '2023-05-01', '2023-06-30', 'in_progress'),
--   ('00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000000', 'Deload and Recovery', 'Reduced volume and intensity for recovery', '2023-07-01', '2023-07-14', 'planned')
-- ON CONFLICT DO NOTHING;

-- -- Insert sample training sessions
-- INSERT INTO training_sessions (id, mesocycle_id, day_of_week, duration_minutes)
-- VALUES 
--   -- Strength Phase 1
--   ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000030', 1, 90),
--   ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000030', 3, 90),
--   ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000030', 5, 90),
  
--   -- Hypertrophy Phase
--   ('00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000031', 1, 75),
--   ('00000000-0000-0000-0000-000000000044', '00000000-0000-0000-0000-000000000031', 3, 75),
--   ('00000000-0000-0000-0000-000000000045', '00000000-0000-0000-0000-000000000031', 5, 75),
  
--   -- Strength Phase 2
--   ('00000000-0000-0000-0000-000000000046', '00000000-0000-0000-0000-000000000032', 1, 90),
--   ('00000000-0000-0000-0000-000000000047', '00000000-0000-0000-0000-000000000032', 3, 90),
--   ('00000000-0000-0000-0000-000000000048', '00000000-0000-0000-0000-000000000032', 5, 60)
-- ON CONFLICT DO NOTHING;

-- -- Insert sample session exercises
-- INSERT INTO session_exercises (id, training_session_id, exercise_id, sets, reps, rir, rest_between_sets, rest_after_exercise, order_index)
-- VALUES 
--   -- Upper Body Strength
--   ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000020', 5, 5, 2, 180, 240, 1), -- Bench Press
--   ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000024', 5, 5, 2, 180, 240, 2), -- Pull-up
--   ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000023', 5, 5, 2, 180, 240, 3), -- Overhead Press
  
--   -- Lower Body Strength
--   ('00000000-0000-0000-0000-000000000053', '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000022', 5, 5, 2, 180, 240, 1), -- Squat
--   ('00000000-0000-0000-0000-000000000054', '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000021', 5, 5, 2, 180, 240, 2), -- Deadlift
--   ('00000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000027', 3, 60, NULL, 60, 120, 3), -- Plank (timed for 60 seconds)
  
--   -- Full Body
--   ('00000000-0000-0000-0000-000000000056', '00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000020', 3, 8, 2, 120, 180, 1), -- Bench Press
--   ('00000000-0000-0000-0000-000000000057', '00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000022', 3, 8, 2, 120, 180, 2), -- Squat
--   ('00000000-0000-0000-0000-000000000058', '00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000024', 3, 8, 2, 120, 180, 3), -- Pull-up
  
--   -- Push Day
--   ('00000000-0000-0000-0000-000000000059', '00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000020', 4, 10, 1, 90, 120, 1), -- Bench Press
--   ('00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000023', 4, 10, 1, 90, 120, 2), -- Overhead Press
--   ('00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000026', 4, 12, 1, 60, 120, 3), -- Tricep Extension
  
--   -- Pull Day
--   ('00000000-0000-0000-0000-000000000062', '00000000-0000-0000-0000-000000000044', '00000000-0000-0000-0000-000000000024', 4, 10, 1, 90, 120, 1), -- Pull-up
--   ('00000000-0000-0000-0000-000000000063', '00000000-0000-0000-0000-000000000044', '00000000-0000-0000-0000-000000000021', 4, 10, 1, 90, 120, 2), -- Deadlift
--   ('00000000-0000-0000-0000-000000000064', '00000000-0000-0000-0000-000000000044', '00000000-0000-0000-0000-000000000025', 4, 12, 1, 60, 120, 3), -- Dumbbell Curl
  
--   -- Leg Day
--   ('00000000-0000-0000-0000-000000000065', '00000000-0000-0000-0000-000000000045', '00000000-0000-0000-0000-000000000022', 4, 10, 1, 120, 180, 1), -- Squat
--   ('00000000-0000-0000-0000-000000000066', '00000000-0000-0000-0000-000000000045', '00000000-0000-0000-0000-000000000021', 4, 10, 1, 120, 180, 2), -- Deadlift
--   ('00000000-0000-0000-0000-000000000067', '00000000-0000-0000-0000-000000000045', '00000000-0000-0000-0000-000000000027', 4, 60, NULL, 60, 120, 3)  -- Plank (timed for 60 seconds)
-- ON CONFLICT DO NOTHING;

-- -- Insert sample workout logs
-- INSERT INTO workout_logs (id, user_id, training_session_id, date, start_time, end_time, notes, rating)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000040', '2023-01-02', '2023-01-02 18:00:00', '2023-01-02 19:30:00', 'Felt strong today', 4),
--   ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000041', '2023-01-04', '2023-01-04 18:00:00', '2023-01-04 19:30:00', 'Legs were tired', 3),
--   ('00000000-0000-0000-0000-000000000072', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000042', '2023-01-06', '2023-01-06 18:00:00', '2023-01-06 19:30:00', 'Great full body workout', 5),
--   ('00000000-0000-0000-0000-000000000073', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000043', '2023-03-06', '2023-03-06 18:00:00', '2023-03-06 19:15:00', 'Good pump in chest', 4),
--   ('00000000-0000-0000-0000-000000000074', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000044', '2023-03-08', '2023-03-08 18:00:00', '2023-03-08 19:15:00', 'Back was sore from yesterday', 3),
--   ('00000000-0000-0000-0000-000000000075', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000045', '2023-03-10', '2023-03-10 18:00:00', '2023-03-10 19:15:00', 'Legs day was brutal', 4)
-- ON CONFLICT DO NOTHING;

-- -- Insert sample exercise logs
-- INSERT INTO exercise_logs (id, workout_log_id, exercise_id, set_number, reps, weight, rir, notes)
-- VALUES 
--   -- Upper Body Strength Workout
--   ('00000000-0000-0000-0000-000000000080', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000020', 1, 5, 135, 3, 'Warm-up set'),
--   ('00000000-0000-0000-0000-000000000081', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000020', 2, 5, 185, 2, NULL),
--   ('00000000-0000-0000-0000-000000000082', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000020', 3, 5, 205, 2, NULL),
--   ('00000000-0000-0000-0000-000000000083', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000020', 4, 5, 225, 1, 'Felt heavy'),
--   ('00000000-0000-0000-0000-000000000084', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000020', 5, 4, 225, 0, 'Failed on the last rep'),
  
--   ('00000000-0000-0000-0000-000000000085', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000024', 1, 5, 0, 3, 'Bodyweight'),
--   ('00000000-0000-0000-0000-000000000086', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000024', 2, 5, 25, 2, 'Added weight'),
--   ('00000000-0000-0000-0000-000000000087', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000024', 3, 5, 35, 2, NULL),
--   ('00000000-0000-0000-0000-000000000088', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000024', 4, 5, 45, 1, NULL),
--   ('00000000-0000-0000-0000-000000000089', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000024', 5, 4, 45, 0, 'Struggled on the last set'),
  
--   ('00000000-0000-0000-0000-000000000090', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000023', 1, 5, 95, 3, 'Warm-up set'),
--   ('00000000-0000-0000-0000-000000000091', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000023', 2, 5, 115, 2, NULL),
--   ('00000000-0000-0000-0000-000000000092', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000023', 3, 5, 135, 2, NULL),
--   ('00000000-0000-0000-0000-000000000093', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000023', 4, 5, 145, 1, NULL),
--   ('00000000-0000-0000-0000-000000000094', '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000023', 5, 5, 155, 0, 'PR!'),
  
--   -- Lower Body Strength Workout
--   ('00000000-0000-0000-0000-000000000095', '00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000022', 1, 5, 135, 3, 'Warm-up set'),
--   ('00000000-0000-0000-0000-000000000096', '00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000022', 2, 5, 225, 2, NULL),
--   ('00000000-0000-0000-0000-000000000097', '00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000022', 3, 5, 275, 2, NULL),
--   ('00000000-0000-0000-0000-000000000098', '00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000022', 4, 5, 315, 1, 'Felt heavy'),
--   ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000022', 5, 3, 315, 0, 'Failed on the 4th rep')
-- ON CONFLICT DO NOTHING;

-- -- Insert sample workout reminders
-- INSERT INTO workout_reminders (id, user_id, training_session_id, day_of_week, time_of_day, is_enabled, notification_type)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000046', 1, '17:30:00', TRUE, 'browser'),
--   ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000047', 3, '17:30:00', TRUE, 'browser'),
--   ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000048', 5, '17:30:00', TRUE, 'browser')
-- ON CONFLICT DO NOTHING;

-- Insert sample mesocycle templates
INSERT INTO mesocycle_templates (id, user_id, name, description, duration_weeks, is_default)
VALUES
  ('00000000-0000-0000-0000-000000000110', NULL, 'Beginner Strength Program', 'Perfect for beginners focusing on building fundamental strength', 8, TRUE),
  ('00000000-0000-0000-0000-000000000111', NULL, 'Hypertrophy Focus', 'High volume program designed for muscle growth', 10, TRUE),
  ('00000000-0000-0000-0000-000000000112', NULL, 'Power Building', 'Mix of strength and hypertrophy training', 12, TRUE),
  ('00000000-0000-0000-0000-000000000113', NULL, 'Upper/Lower Split', 'Four-day split focusing on upper and lower body', 8, TRUE),
  ('00000000-0000-0000-0000-000000000114', NULL, 'Custom Split', 'Personal five-day split routine', 6, TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample mesocycle template goals
INSERT INTO mesocycle_template_goals (id, mesocycle_template_id, goal_type, target_value, unit, notes)
VALUES
  ('00000000-0000-0000-0000-000000000120', '00000000-0000-0000-0000-000000000110', 'strength', 1.5, 'bodyweight multiplier', 'Target for major compound lifts'),
  ('00000000-0000-0000-0000-000000000121', '00000000-0000-0000-0000-000000000111', 'hypertrophy', NULL, NULL, 'Focus on progressive overload and mind-muscle connection'),
  ('00000000-0000-0000-0000-000000000122', '00000000-0000-0000-0000-000000000112', 'strength', 2.0, 'bodyweight multiplier', 'Primary goal for squats and deadlifts'),
  ('00000000-0000-0000-0000-000000000123', '00000000-0000-0000-0000-000000000112', 'hypertrophy', NULL, NULL, 'Secondary goal for accessory movements')
ON CONFLICT DO NOTHING;

-- Insert sample training session templates
INSERT INTO training_session_templates (id, mesocycle_template_id, user_id, name, description, day_of_week, estimated_duration_minutes, is_default)
VALUES
  -- Beginner Strength Program sessions
  ('00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-000000000110', NULL, 'Full Body A', 'Focuses on basic compound movements', 1, 60, TRUE),
  ('00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000110', NULL, 'Full Body B', 'Alternative full body routine', 3, 60, TRUE),
  ('00000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-000000000110', NULL, 'Full Body C', 'Third full body workout with different emphasis', 5, 60, TRUE),
  
  -- Hypertrophy Focus sessions
  ('00000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-000000000111', NULL, 'Push Day', 'Chest, shoulders, and triceps', 1, 75, TRUE),
  ('00000000-0000-0000-0000-000000000134', '00000000-0000-0000-0000-000000000111', NULL, 'Pull Day', 'Back and biceps', 3, 75, TRUE),
  ('00000000-0000-0000-0000-000000000135', '00000000-0000-0000-0000-000000000111', NULL, 'Leg Day', 'Quads, hamstrings, calves', 5, 75, TRUE),
  
  -- Power Building sessions
  ('00000000-0000-0000-0000-000000000136', '00000000-0000-0000-0000-000000000112', NULL, 'Strength Upper', 'Heavy compound movements for upper body', 1, 90, TRUE),
  ('00000000-0000-0000-0000-000000000137', '00000000-0000-0000-0000-000000000112', NULL, 'Strength Lower', 'Heavy compound movements for lower body', 2, 90, TRUE),
  ('00000000-0000-0000-0000-000000000138', '00000000-0000-0000-0000-000000000112', NULL, 'Hypertrophy Upper', 'Higher volume upper body training', 4, 75, TRUE),
  ('00000000-0000-0000-0000-000000000139', '00000000-0000-0000-0000-000000000112', NULL, 'Hypertrophy Lower', 'Higher volume lower body training', 5, 75, TRUE),
  
  -- Upper/Lower Split sessions
  ('00000000-0000-0000-0000-00000000013A', '00000000-0000-0000-0000-000000000113', NULL, 'Upper Body A', 'First upper body session of the week', 1, 70, TRUE),
  ('00000000-0000-0000-0000-00000000013B', '00000000-0000-0000-0000-000000000113', NULL, 'Lower Body A', 'First lower body session of the week', 2, 70, TRUE),
  ('00000000-0000-0000-0000-00000000013C', '00000000-0000-0000-0000-000000000113', NULL, 'Upper Body B', 'Second upper body session of the week', 4, 70, TRUE),
  ('00000000-0000-0000-0000-00000000013D', '00000000-0000-0000-0000-000000000113', NULL, 'Lower Body B', 'Second lower body session of the week', 5, 70, TRUE),
  
  -- Custom Split sessions (for specific user)
  ('00000000-0000-0000-0000-00000000013E', '00000000-0000-0000-0000-000000000114', NULL, 'Chest & Triceps', 'Focus on chest and triceps development', 1, 65, TRUE),
  ('00000000-0000-0000-0000-00000000013F', '00000000-0000-0000-0000-000000000114',NULL, 'Back & Biceps', 'Focus on back and biceps development', 2, 65, TRUE),
  ('00000000-0000-0000-0000-00000000014A', '00000000-0000-0000-0000-000000000114', NULL, 'Shoulders', 'Dedicated shoulder development day', 3, 50, TRUE),
  ('00000000-0000-0000-0000-00000000014B', '00000000-0000-0000-0000-000000000114', NULL, 'Legs', 'Complete leg development workout', 4, 70, TRUE),
  ('00000000-0000-0000-0000-00000000014C', '00000000-0000-0000-0000-000000000114', NULL, 'Arms & Core', 'Focused session on arms and core', 5, 60, TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample template session exercises
INSERT INTO template_session_exercises (id, training_session_template_id, exercise_id, sets, reps, rir, rest_between_sets, rest_after_exercise, notes, order_index)
VALUES
  -- Full Body A exercises (Beginner Strength)
  ('00000000-0000-0000-0000-000000000150', '00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-000000000022', 3, 8, 2, 120, 180, 'Focus on form', 1), -- Squat
  ('00000000-0000-0000-0000-000000000151', '00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-000000000020', 3, 8, 2, 120, 180, 'Use spotter if needed', 2), -- Bench Press
  ('00000000-0000-0000-0000-000000000152', '00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-00000000002F', 3, 10, 2, 90, 120, 'Keep back straight', 3), -- Barbell Row
  ('00000000-0000-0000-0000-000000000153', '00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-00000000004A', 3, 12, 1, 60, 90, NULL, 4), -- Lateral Raise
  ('00000000-0000-0000-0000-000000000154', '00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-000000000026', 3, 12, 1, 60, 60, NULL, 5), -- Tricep Extension
  ('00000000-0000-0000-0000-000000000155', '00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-000000000025', 3, 12, 1, 60, 60, NULL, 6), -- Dumbbell Curl
  
  -- Full Body B exercises
  ('00000000-0000-0000-0000-000000000156', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000021', 3, 8, 2, 180, 240, 'Focus on hip hinge', 1), -- Deadlift
  ('00000000-0000-0000-0000-000000000157', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-00000000002B', 3, 10, 2, 120, 180, NULL, 2), -- Incline Bench Press
  ('00000000-0000-0000-0000-000000000158', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000024', 3, 8, 1, 120, 180, 'Assisted if needed', 3), -- Pull-up
  ('00000000-0000-0000-0000-000000000159', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000023', 3, 10, 2, 90, 120, NULL, 4), -- Overhead Press
  ('00000000-0000-0000-0000-00000000015A', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-00000000004D', 3, 12, 1, 60, 60, NULL, 5), -- Hammer Curl
  ('00000000-0000-0000-0000-00000000015B', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-00000000004F', 3, 15, 1, 60, 0, NULL, 6), -- Ab Crunch
  
  -- Full Body C exercises
  ('00000000-0000-0000-0000-00000000015C', '00000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-00000000003B', 3, 8, 2, 120, 180, 'Keep chest up', 1), -- Front Squat
  ('00000000-0000-0000-0000-00000000015D', '00000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-00000000002C', 3, 10, 2, 120, 180, NULL, 2), -- Decline Bench Press
  ('00000000-0000-0000-0000-00000000015E', '00000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-00000000003A', 3, 10, 2, 90, 120, NULL, 3), -- Lat Pulldown
  ('00000000-0000-0000-0000-00000000015F', '00000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-00000000002E', 3, 10, 2, 90, 120, 'Keep knees slightly bent', 4), -- Romanian Deadlift
  ('00000000-0000-0000-0000-00000000016A', '00000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-00000000004E', 3, 12, 1, 60, 60, NULL, 5), -- Skull Crusher
  ('00000000-0000-0000-0000-00000000016B', '00000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-00000000005A', 3, 15, 1, 60, 0, NULL, 6), -- Russian Twist
  
  -- Push Day (Hypertrophy)
  ('00000000-0000-0000-0000-00000000016C', '00000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-000000000020', 4, 10, 1, 90, 120, NULL, 1), -- Bench Press
  ('00000000-0000-0000-0000-00000000016D', '00000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-00000000002B', 4, 10, 1, 90, 120, NULL, 2), -- Incline Bench Press
  ('00000000-0000-0000-0000-00000000016E', '00000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-00000000002D', 3, 12, 1, 60, 120, 'Squeeze at the top', 3), -- Dumbbell Fly
  ('00000000-0000-0000-0000-00000000016F', '00000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-000000000023', 4, 10, 1, 90, 120, NULL, 4), -- Overhead Press
  ('00000000-0000-0000-0000-00000000017A', '00000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-00000000004A', 4, 15, 1, 60, 90, NULL, 5), -- Lateral Raise
  ('00000000-0000-0000-0000-00000000017B', '00000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-00000000004C', 4, 10, 1, 90, 90, 'Full range of motion', 6), -- Dips
  ('00000000-0000-0000-0000-00000000017C', '00000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-00000000004E', 4, 12, 1, 60, 0, NULL, 7), -- Skull Crusher
  
  -- Custom sessions for user - just adding a few examples
  ('00000000-0000-0000-0000-00000000017D', '00000000-0000-0000-0000-00000000013E', '00000000-0000-0000-0000-000000000020', 4, 8, 2, 150, 180, 'Heavy bench day', 1), -- Bench Press
  ('00000000-0000-0000-0000-00000000017E', '00000000-0000-0000-0000-00000000013E', '00000000-0000-0000-0000-00000000002B', 4, 10, 2, 120, 150, NULL, 2), -- Incline Bench Press
  ('00000000-0000-0000-0000-00000000017F', '00000000-0000-0000-0000-00000000013E', '00000000-0000-0000-0000-00000000002D', 3, 12, 1, 90, 120, NULL, 3), -- Dumbbell Fly
  ('00000000-0000-0000-0000-00000000018A', '00000000-0000-0000-0000-00000000013E', '00000000-0000-0000-0000-00000000004C', 4, 10, 1, 120, 120, NULL, 4), -- Dips
  ('00000000-0000-0000-0000-00000000018B', '00000000-0000-0000-0000-00000000013E', '00000000-0000-0000-0000-000000000026', 4, 12, 1, 60, 60, NULL, 5) -- Tricep Extension
ON CONFLICT DO NOTHING;

-- Insert sample mesocycle template muscle focus
INSERT INTO mesocycle_template_muscle_focus (id, mesocycle_template_id, muscle_group_id, priority)
VALUES
  -- Beginner Strength Program - Balanced focus on major muscle groups
  ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000010', 8), -- Chest (high priority)
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000011', 8), -- Back (high priority)
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000012', 9), -- Legs (very high priority)
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000013', 7), -- Shoulders (medium-high priority)
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000015', 6), -- Core (medium priority)
  
  -- Hypertrophy Focus - Aesthetic muscle groups prioritized
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000010', 9), -- Chest (very high priority)
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000011', 8), -- Back (high priority)
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000012', 8), -- Legs (high priority)
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000013', 9), -- Shoulders (very high priority)
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000014', 9), -- Arms (very high priority)
  ('00000000-0000-0000-0000-00000000020A', '00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000023', 8), -- Biceps (high priority)
  ('00000000-0000-0000-0000-00000000020B', '00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000024', 8), -- Triceps (high priority)
  ('00000000-0000-0000-0000-00000000020C', '00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000015', 7), -- Core (medium-high priority)
  
  -- Power Building - Strength-focused muscle groups prioritized
  ('00000000-0000-0000-0000-00000000020D', '00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000010', 9), -- Chest (very high priority)
  ('00000000-0000-0000-0000-00000000020E', '00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000011', 9), -- Back (very high priority)
  ('00000000-0000-0000-0000-00000000020F', '00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000012', 10), -- Legs (highest priority)
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-00000000001C', 9), -- Quadriceps (very high priority)
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-00000000001F', 8), -- Glutes (high priority)
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000013', 8), -- Shoulders (high priority)
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000015', 7), -- Core (medium-high priority)
  ('00000000-0000-0000-0000-000000000214', '00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000014', 6), -- Arms (medium priority)
  
  -- Upper/Lower Split - Balanced between upper and lower body
  ('00000000-0000-0000-0000-000000000215', '00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000010', 8), -- Chest (high priority)
  ('00000000-0000-0000-0000-000000000216', '00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000011', 8), -- Back (high priority)
  ('00000000-0000-0000-0000-000000000217', '00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000012', 8), -- Legs (high priority)
  ('00000000-0000-0000-0000-000000000218', '00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000013', 8), -- Shoulders (high priority)
  ('00000000-0000-0000-0000-000000000219', '00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000014', 7), -- Arms (medium-high priority)
  ('00000000-0000-0000-0000-00000000021A', '00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000015', 6), -- Core (medium priority)
  ('00000000-0000-0000-0000-00000000021B', '00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-00000000001F', 7), -- Glutes (medium-high priority)
  ('00000000-0000-0000-0000-00000000021C', '00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-00000000001D', 7), -- Hamstrings (medium-high priority)
  
  -- Custom Split - Focus on aesthetic proportions
  ('00000000-0000-0000-0000-00000000021D', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000010', 9), -- Chest (very high priority)
  ('00000000-0000-0000-0000-00000000021E', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000011', 8), -- Back (high priority)
  ('00000000-0000-0000-0000-00000000021F', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000013', 10), -- Shoulders (highest priority)
  ('00000000-0000-0000-0000-000000000220', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000014', 9), -- Arms (very high priority)
  ('00000000-0000-0000-0000-000000000221', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000015', 8), -- Core (high priority)
  ('00000000-0000-0000-0000-000000000222', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000012', 7), -- Legs (medium-high priority)
  ('00000000-0000-0000-0000-000000000223', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000021', 9), -- Side Delts (very high priority)
  ('00000000-0000-0000-0000-000000000224', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000023', 8), -- Biceps (high priority)
  ('00000000-0000-0000-0000-000000000225', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000024', 8)  -- Triceps (high priority)
ON CONFLICT DO NOTHING;