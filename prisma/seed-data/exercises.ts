// Default exercise catalog (seeded as is_default).
// Ported from supabase/seed.sql. Fixes applied vs the legacy seed:
//  - The "additional exercises" block was duplicated in the SQL; we insert each once.
//  - Links to muscle groups that don't exist ("Neck", "Hip Flexors") are dropped.
//  - The demo user_id FK is omitted (user_id is NULL for defaults).
export interface SeedExerciseLink {
  muscleGroup: string;
  isPrimary: boolean;
  incidenceLevel: number;
}

export interface SeedExercise {
  name: string;
  instructions: string;
  links: SeedExerciseLink[];
}

export const exercises: SeedExercise[] = [
  {
    name: "Bench Press",
    instructions:
      "Lie on a bench, lower the bar to your chest, and press it back up.",
    links: [
      { muscleGroup: "Chest", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Deadlift",
    instructions:
      "Stand with feet shoulder-width apart, bend at the hips and knees to grip the bar, then stand up.",
    links: [
      { muscleGroup: "Back", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Legs", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Glutes", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Squat",
    instructions:
      "Stand with feet shoulder-width apart, lower your body by bending your knees, then stand back up.",
    links: [
      { muscleGroup: "Quadriceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Glutes", isPrimary: false, incidenceLevel: 9 },
      { muscleGroup: "Hamstrings", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Core", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Overhead Press",
    instructions:
      "Stand with feet shoulder-width apart, press the bar from shoulder level to overhead.",
    links: [
      { muscleGroup: "Shoulders", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Front Delts", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Side Delts", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Chest", isPrimary: false, incidenceLevel: 3 },
    ],
  },
  {
    name: "Pull-up",
    instructions:
      "Hang from a bar with palms facing away, pull your body up until your chin is over the bar.",
    links: [
      { muscleGroup: "Lats", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Back", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Biceps", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Dumbbell Curl",
    instructions:
      "Stand with a dumbbell in each hand, curl the weights up to shoulder level.",
    links: [
      { muscleGroup: "Biceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Tricep Extension",
    instructions:
      "Hold a dumbbell overhead, lower it behind your head, then extend your arms.",
    links: [
      { muscleGroup: "Triceps", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Plank",
    instructions:
      "Hold a push-up position with your weight on your forearms and toes.",
    links: [
      { muscleGroup: "Core", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Abs", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Incline Bench Press",
    instructions:
      "Lie on an inclined bench, lower the bar to your upper chest, and press it back up.",
    links: [
      { muscleGroup: "Upper Chest", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Chest", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 6 },
    ],
  },
  {
    name: "Decline Bench Press",
    instructions:
      "Lie on a declined bench, lower the bar to your lower chest, and press it back up.",
    links: [
      { muscleGroup: "Lower Chest", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Chest", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 7 },
    ],
  },
  {
    name: "Dumbbell Fly",
    instructions:
      "Lie on a flat bench with dumbbells, open arms to the sides, then bring them back together over your chest.",
    links: [
      { muscleGroup: "Chest", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Romanian Deadlift",
    instructions:
      "Hold a barbell at hip level, hinge at the hips while keeping legs nearly straight, then return to standing.",
    links: [
      { muscleGroup: "Hamstrings", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Glutes", isPrimary: true, incidenceLevel: 8 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 7 },
    ],
  },
  {
    name: "Barbell Row",
    instructions:
      "Bend at the hips holding a barbell, pull it toward your lower chest while keeping your back straight.",
    links: [
      { muscleGroup: "Middle Back", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Back", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Lats", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Biceps", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Lat Pulldown",
    instructions:
      "Sit at a machine, grab the bar with wide grip, and pull it down to your upper chest.",
    links: [
      { muscleGroup: "Lats", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Back", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Biceps", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Front Squat",
    instructions:
      "Hold a barbell across the front of your shoulders, squat down, then stand back up.",
    links: [
      { muscleGroup: "Quadriceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Glutes", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Core", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Leg Press",
    instructions:
      "Sit in the machine, press the platform away with your feet, then control it back.",
    links: [
      { muscleGroup: "Quadriceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Glutes", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Hamstrings", isPrimary: false, incidenceLevel: 6 },
    ],
  },
  {
    name: "Leg Extension",
    instructions:
      "Sit in the machine, extend your legs to straighten your knees, then lower back down.",
    links: [
      { muscleGroup: "Quadriceps", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Leg Curl",
    instructions:
      "Lie face down in the machine, curl your legs up by bending your knees, then lower back down.",
    links: [
      { muscleGroup: "Hamstrings", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Calf Raise",
    instructions:
      "Stand with balls of feet on a step, lower your heels, then raise up onto your toes.",
    links: [
      { muscleGroup: "Calves", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Lateral Raise",
    instructions:
      "Stand holding dumbbells at your sides, raise them out to the sides to shoulder level, then lower.",
    links: [
      { muscleGroup: "Side Delts", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 7 },
    ],
  },
  {
    name: "Face Pull",
    instructions:
      "Pull a rope attachment to your face with elbows high, squeezing your shoulder blades together.",
    links: [
      { muscleGroup: "Rear Delts", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Trapezius", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 7 },
    ],
  },
  {
    name: "Dips",
    instructions:
      "Support yourself between parallel bars, lower your body by bending your elbows, then push back up.",
    links: [
      { muscleGroup: "Triceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Chest", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Hammer Curl",
    instructions:
      "Hold dumbbells with neutral grip, curl the weights up while keeping palms facing each other.",
    links: [
      { muscleGroup: "Biceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 6 },
    ],
  },
  {
    name: "Skull Crusher",
    instructions:
      "Lie on a bench holding a weight above your head, bend elbows to lower it toward your forehead.",
    links: [
      { muscleGroup: "Triceps", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Ab Crunch",
    instructions:
      "Lie on your back with knees bent, curl your shoulders toward your hips, then lower back down.",
    links: [
      { muscleGroup: "Abs", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Core", isPrimary: false, incidenceLevel: 7 },
    ],
  },
  {
    name: "Russian Twist",
    instructions:
      "Sit with knees bent and torso leaned back, rotate a weight from side to side across your body.",
    links: [
      { muscleGroup: "Obliques", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Abs", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Core", isPrimary: false, incidenceLevel: 8 },
    ],
  },
  {
    name: "Mountain Climber",
    instructions:
      "Start in a push-up position, alternate bringing knees toward your chest in a running motion.",
    links: [
      { muscleGroup: "Core", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Abs", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Quadriceps", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Burpee",
    instructions:
      "From standing, drop to a squat, kick feet back to push-up position, return to squat, then jump up.",
    links: [
      { muscleGroup: "Core", isPrimary: true, incidenceLevel: 8 },
      { muscleGroup: "Quadriceps", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Glutes", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Chest", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Cable Fly",
    instructions:
      "Stand between cable stations with handles at chest height. With slight bend in elbows, bring hands together in front of chest in an arc motion.",
    links: [
      { muscleGroup: "Chest", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Front Delts", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Push-up",
    instructions:
      "Start in a high plank position with hands slightly wider than shoulders. Lower your body until chest nearly touches the floor, then push back up.",
    links: [
      { muscleGroup: "Chest", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Front Delts", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Core", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Chest Dip",
    instructions:
      "Support yourself between parallel bars, lean forward, lower your body by bending elbows, then push back up.",
    links: [
      { muscleGroup: "Lower Chest", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Chest", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Front Delts", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Machine Chest Press",
    instructions:
      "Sit with back flat against pad, grip handles at chest level. Push handles forward until arms are extended, then return with control.",
    links: [
      { muscleGroup: "Chest", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Front Delts", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Pec Deck",
    instructions:
      "Sit with back against pad, place forearms on pads. Squeeze arms together in front of chest, then return with control.",
    links: [
      { muscleGroup: "Chest", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "One-Arm Dumbbell Row",
    instructions:
      "Place one knee and hand on bench, other foot on floor. Hold dumbbell with free hand, pull it to hip while keeping back flat.",
    links: [
      { muscleGroup: "Back", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Lats", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Middle Back", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Biceps", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Rear Delts", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Seated Cable Row",
    instructions:
      "Sit at cable row station, feet on platform and knees slightly bent. Pull handle to lower abdomen while keeping back straight.",
    links: [
      { muscleGroup: "Middle Back", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Back", isPrimary: false, incidenceLevel: 9 },
      { muscleGroup: "Lats", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Biceps", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Chin-up",
    instructions:
      "Hang from bar with palms facing you. Pull body up until chin clears the bar, then lower with control.",
    links: [
      { muscleGroup: "Lats", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Biceps", isPrimary: true, incidenceLevel: 8 },
      { muscleGroup: "Back", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "T-Bar Row",
    instructions:
      "Stand straddling T-bar with bent knees. Grip handle, pull weight up to chest while keeping back flat.",
    links: [
      { muscleGroup: "Middle Back", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Back", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Lats", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Biceps", isPrimary: false, incidenceLevel: 4 },
      { muscleGroup: "Trapezius", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 3 },
    ],
  },
  {
    name: "Straight Arm Pulldown",
    instructions:
      "Stand facing cable machine with high pulley, hold bar with straight arms. Pull bar down in arc motion to thighs while keeping arms straight.",
    links: [
      { muscleGroup: "Lats", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 4 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 3 },
    ],
  },
  {
    name: "Meadows Row",
    instructions:
      "Position one end of a barbell in a landmine or corner. Bend forward at hips, row the weight up with one arm, keeping elbow close to body.",
    links: [
      { muscleGroup: "Lats", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Middle Back", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Trapezius", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Biceps", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 6 },
    ],
  },
  {
    name: "Arnold Press",
    instructions:
      "Sit with dumbbells at shoulder height, palms facing you. Press up while rotating palms to face forward at the top.",
    links: [
      { muscleGroup: "Shoulders", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Front Delts", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Side Delts", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 6 },
    ],
  },
  {
    name: "Front Raise",
    instructions:
      "Stand holding dumbbells in front of thighs. Raise one arm forward to shoulder height, then alternate.",
    links: [
      { muscleGroup: "Front Delts", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 8 },
    ],
  },
  {
    name: "Reverse Fly",
    instructions:
      "Bend at waist with dumbbells hanging down. Raise arms out to sides, squeezing shoulder blades together.",
    links: [
      { muscleGroup: "Rear Delts", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Middle Back", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Trapezius", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Shrugs",
    instructions:
      "Stand holding dumbbells or barbell at sides. Raise shoulders toward ears, hold briefly, then lower.",
    links: [
      { muscleGroup: "Trapezius", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Cable Lateral Raise",
    instructions:
      "Stand sideways to cable machine, hold handle with opposite hand. Raise arm out to side to shoulder height.",
    links: [
      { muscleGroup: "Side Delts", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Trapezius", isPrimary: false, incidenceLevel: 3 },
    ],
  },
  {
    name: "Upright Row",
    instructions:
      "Stand holding a barbell in front of thighs. Lift the barbell straight up to chin level, keeping it close to the body.",
    links: [
      { muscleGroup: "Trapezius", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Side Delts", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Front Delts", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Biceps", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Bulgarian Split Squat",
    instructions:
      "Place back foot on bench behind you, front foot forward. Lower body by bending front knee, then push back up.",
    links: [
      { muscleGroup: "Quadriceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Glutes", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Hamstrings", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Adductors", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Calves", isPrimary: false, incidenceLevel: 3 },
    ],
  },
  {
    name: "Hack Squat",
    instructions:
      "Position back against pad of hack squat machine, shoulders under pads. Release safety and squat down, then push back up.",
    links: [
      { muscleGroup: "Quadriceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Glutes", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Hamstrings", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Calves", isPrimary: false, incidenceLevel: 3 },
    ],
  },
  {
    name: "Step-up",
    instructions:
      "Stand facing a step or box. Step one foot onto platform, drive through heel to lift body up, then lower back down.",
    links: [
      { muscleGroup: "Quadriceps", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Glutes", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Hamstrings", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Calves", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Glute Bridge",
    instructions:
      "Lie on back with knees bent, feet flat on floor. Push through heels to lift hips toward ceiling, squeezing glutes at top.",
    links: [
      { muscleGroup: "Glutes", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Hamstrings", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Standing Calf Raise",
    instructions:
      "Stand on edge of platform with balls of feet, heels hanging off. Raise heels up as high as possible, then lower below platform level.",
    links: [
      { muscleGroup: "Calves", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Seated Calf Raise",
    instructions:
      "Sit at machine with knees bent and balls of feet on platform. Raise heels by pressing feet up, then lower.",
    links: [
      { muscleGroup: "Calves", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Hip Thrust",
    instructions:
      "Sit with upper back against bench, barbell across hips. Drive hips upward by squeezing glutes, then lower with control.",
    links: [
      { muscleGroup: "Glutes", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Hamstrings", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Quadriceps", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Good Morning",
    instructions:
      "Stand with barbell across upper back. Bend at hips while keeping back straight, then return to standing.",
    links: [
      { muscleGroup: "Hamstrings", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Lower Back", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Glutes", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Calves", isPrimary: false, incidenceLevel: 3 },
    ],
  },
  {
    name: "Sissy Squat",
    instructions:
      "Hold onto a support, lean back with straight torso, bend knees to lower body, then extend knees to rise.",
    links: [
      { muscleGroup: "Quadriceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Calves", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Concentration Curl",
    instructions:
      "Sit on bench, lean forward with elbow against inner thigh. Curl dumbbell toward shoulder without moving upper arm.",
    links: [
      { muscleGroup: "Biceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Preacher Curl",
    instructions:
      "Sit at preacher bench with arms extended over pad. Curl weight toward shoulders, then lower with control.",
    links: [
      { muscleGroup: "Biceps", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Cable Pushdown",
    instructions:
      "Stand facing cable machine with high pulley. Grasp bar with overhand grip, push down until arms are fully extended.",
    links: [
      { muscleGroup: "Triceps", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Overhead Rope Extension",
    instructions:
      "Stand facing cable machine with low pulley and rope attachment. Hold rope overhead, extend arms by moving hands away from each other.",
    links: [
      { muscleGroup: "Triceps", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Reverse Curl",
    instructions:
      "Stand holding barbell with overhand grip. Curl weight toward shoulders without moving upper arms.",
    links: [
      { muscleGroup: "Biceps", isPrimary: true, incidenceLevel: 8 },
      { muscleGroup: "Forearms", isPrimary: true, incidenceLevel: 9 },
    ],
  },
  {
    name: "Wrist Curl",
    instructions:
      "Sit holding barbell with palms up, forearms on thighs, wrists extended beyond knees. Curl wrists upward, then lower.",
    links: [
      { muscleGroup: "Forearms", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Reverse Wrist Curl",
    instructions:
      "Sit holding barbell with palms down, forearms on thighs. Curl wrists upward, then lower with control.",
    links: [
      { muscleGroup: "Forearms", isPrimary: true, incidenceLevel: 10 },
    ],
  },
  {
    name: "Zottman Curl",
    instructions:
      "Start with palms up, curl dumbbells, rotate to palms down at the top, lower with palms down, then rotate back.",
    links: [
      { muscleGroup: "Biceps", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Forearms", isPrimary: true, incidenceLevel: 9 },
    ],
  },
  {
    name: "Hanging Leg Raise",
    instructions:
      "Hang from pull-up bar with arms extended. Raise legs until they are parallel to floor, then lower with control.",
    links: [
      { muscleGroup: "Abs", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Obliques", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Cable Woodchop",
    instructions:
      "Stand sideways to cable machine, grasp handle with both hands. Pull handle diagonally across body from high to low position.",
    links: [
      { muscleGroup: "Obliques", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Abs", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Ab Wheel Rollout",
    instructions:
      "Kneel holding ab wheel on floor in front of knees. Roll wheel forward extending body, then pull back to starting position.",
    links: [
      { muscleGroup: "Abs", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Core", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Lats", isPrimary: false, incidenceLevel: 4 },
    ],
  },
  {
    name: "Bicycle Crunch",
    instructions:
      "Lie on back with hands behind head, knees bent. Bring opposite elbow to opposite knee while extending other leg.",
    links: [
      { muscleGroup: "Abs", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Obliques", isPrimary: true, incidenceLevel: 9 },
    ],
  },
  {
    name: "Side Plank",
    instructions:
      "Lie on side propped up on forearm, feet stacked. Raise hips creating straight line from head to feet, hold position.",
    links: [
      { muscleGroup: "Obliques", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Abs", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Dragon Flag",
    instructions:
      "Lie on bench holding behind head. Raise legs and torso as one unit until body is vertical, then lower with control.",
    links: [
      { muscleGroup: "Abs", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Core", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 6 },
    ],
  },
  {
    name: "Clean and Press",
    instructions:
      "In one motion, pull barbell from floor to shoulders, then press overhead until arms extended. Return to floor and repeat.",
    links: [
      { muscleGroup: "Quadriceps", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Shoulders", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Hamstrings", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Glutes", isPrimary: false, incidenceLevel: 8 },
      { muscleGroup: "Trapezius", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Core", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Front Delts", isPrimary: false, incidenceLevel: 8 },
    ],
  },
  {
    name: "Turkish Get-up",
    instructions:
      "Lie on back holding weight in one hand above chest. Rise to standing position while keeping weight overhead, then reverse.",
    links: [
      { muscleGroup: "Core", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Shoulders", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Glutes", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Hamstrings", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Quadriceps", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Obliques", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 7 },
    ],
  },
  {
    name: "Kettlebell Swing",
    instructions:
      "Stand with feet shoulder-width apart, kettlebell between feet. Hinge at hips swinging kettlebell between legs, then thrust hips forward swinging weight to chest height.",
    links: [
      { muscleGroup: "Glutes", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Hamstrings", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Lower Back", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Core", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Forearms", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Battle Ropes",
    instructions:
      "Stand with feet shoulder-width apart holding one rope in each hand. Create waves by rapidly raising and lowering arms.",
    links: [
      { muscleGroup: "Shoulders", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Arms", isPrimary: true, incidenceLevel: 8 },
      { muscleGroup: "Core", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Back", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Chest", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Medicine Ball Slam",
    instructions:
      "Stand holding medicine ball overhead. Forcefully throw ball to ground by bending forward, retrieve and repeat.",
    links: [
      { muscleGroup: "Core", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Shoulders", isPrimary: true, incidenceLevel: 8 },
      { muscleGroup: "Arms", isPrimary: false, incidenceLevel: 7 },
      { muscleGroup: "Back", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Legs", isPrimary: false, incidenceLevel: 5 },
    ],
  },
  {
    name: "Renegade Row",
    instructions:
      "Start in push-up position with hands on dumbbells. Perform a push-up, then row one dumbbell to hip, alternate sides.",
    links: [
      { muscleGroup: "Core", isPrimary: true, incidenceLevel: 10 },
      { muscleGroup: "Middle Back", isPrimary: true, incidenceLevel: 9 },
      { muscleGroup: "Chest", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Triceps", isPrimary: false, incidenceLevel: 6 },
      { muscleGroup: "Biceps", isPrimary: false, incidenceLevel: 5 },
      { muscleGroup: "Shoulders", isPrimary: false, incidenceLevel: 5 },
    ],
  },
]