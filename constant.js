module.exports = {
    WORKOUTS_TYPE: ["warmup", "cooldown", "exercise"],
    WORKOUTS_SUB_TYPE: ["exercise", "circuit", "superset"],
    BADGES_UNIT: [
        "n/a",
        "cm",
        "feet",
        "kg",
        "lb",
        "percentage",
        "inch",
        "number",
        "hour",
        "minute",
        "meter",
        "km",
        "mile",
        "g",
        "mg"
    ],
    RECIPE_TYPE: [
        "vegetarian",
        "vegan",
        "dairy-free",
        "kosher",
        "islam",
        "coeliac",
        "paleo",
        "pescaterian"
    ],
    UNIT_SETTING_DEFUALT_VALUE: {
        bodyMeasurement: "cm",
        weight: "kg",
        distance: "km",
        postAccessibility: 3,
        commentAccessibility: 3,
        messageAccessibility: 3,
        friendRequestAccessibility: 3
    },

    BADGES_TYPE: {
        PROFILE: ["profile_update", "friends", "post"],
        BODY_MASS: ["weight_gain", "weight_loss"],
        BODY_FAT: [
            "body_fat_gain",
            "body_fat_loss",
            "body_fat_average",
            "body_fat_most",
            "body_fat_least"
        ],
        BODY_MEASUREMENT: [
            "neck_measurement_gain",
            "neck_measurement_loss",
            "shoulders_measurement_gain",
            "shoulders_measurement_loss",
            "chest_measurement_gain",
            "chest_measurement_loss",
            "upper_arm_measurement_gain",
            "upper_arm_measurement_loss",
            "waist_measurement_gain",
            "waist_measurement_loss",
            "forearm_measurement_gain",
            "forearm_measurement_loss",
            "hips_measurement_gain",
            "hips_measurement_loss",
            "thigh_measurement_gain",
            "thigh_measurement_loss",
            "calf_measurement_gain",
            "calf_measurement_loss"
        ],
        WEIGHT_LIFTED: [
            "weight_lifted_total",
            "weight_lifted_average",
            "weight_lifted_most",
            "weight_lifted_least"
        ],
        WORKOUTS: [
            "workouts_total",
            "workouts_average",
            "reps_least",
            "reps_total",
            "reps_average",
            "reps_most",
            "sets_least",
            "sets_total",
            "sets_average",
            "sets_most"
        ],
        RUNNING: [
            "running_distance_total",
            "running_distance_average",
            "running_distance_most",
            "running_distance_least",
            "running_time_average",
            "running_time_total",
            "running_elevation_total",
            "running_elevation_average"
        ],
        HEART_RATE: [
            "heart_rate_total",
            "heart_rate_average",
            "heart_rate_most",
            "heart_rate_least",
            "heart_rate_resting_total",
            "heart_rate_resting_average",
            "heart_rate_resting_most",
            "heart_rate_resting_least"
        ],
        CYCLE: [
            "cycle_distance_total",
            "cycle_distance_average",
            "cycle_distance_most",
            "cycle_distance_least",
            "cycle_time_total",
            "cycle_time_average",
            "cycle_elevation_total",
            "cycle_elevation_average"
        ],
        STEPS: ["steps_total", "steps_average", "steps_most", "steps_least"],
        CALORIES: [
            "calories_total",
            "calories_average",
            "calories_most",
            "calories_least"
        ],
        NUTRITIONS: [
            "saturated_total",
            "saturated_average",
            "saturated_most",
            "saturated_least",
            "trans_total",
            "trans_average",
            "trans_most",
            "trans_least",
            "folate_total",
            "folate_average",
            "folate_most",
            "folate_least",
            "potassium_total",
            "potassium_average",
            "potassium_most",
            "potassium_least",
            "magnesium_total",
            "magnesium_average",
            "magnesium_most",
            "magnesium_least",
            "sodium_total",
            "sodium_average",
            "sodium_most",
            "sodium_least",
            "protein_total",
            "protein_average",
            "protein_most",
            "protein_least",
            "calcium_total",
            "calcium_average",
            "calcium_most",
            "calcium_least",
            "carbs_total",
            "carbs_average",
            "carbs_most",
            "carbs_least",
            "cholesterol_total",
            "cholesterol_average",
            "cholesterol_most",
            "cholesterol_least",
            "polyunsaturated_total",
            "polyunsaturated_average",
            "polyunsaturated_most",
            "polyunsaturated_least",
            "monounsaturated_total",
            "monounsaturated_average",
            "monounsaturated_most",
            "monounsaturated_least",
            "iron_total",
            "iron_average",
            "iron_most",
            "iron_least",
            "fiber_total",
            "fiber_average",
            "fiber_most",
            "fiber_least"
        ]
    },

    EXERCISE_PREFERENCE_DEFUALT_VALUE: {
        workoutIntensity: 0,
        exerciseExperience: 0,
        excludeExercise: [],
        excludeExerciseType: [],
        existingInjuries: [],
        workoutscheduletype: 1,
        timeSchedule: {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0
        }
    },
    USER_TEST_EXERCISE_DEFUALT_VALUE: {
        multiselect: [],
        format: null,
        a_or_b: null,
        max_rep: null,
        text_field: null
    },
    NUTRITION_PREFERENCE_DEFUALT_VALUE: {
        dietRestrictionLabels: [],
        excludeIngredients: [],
        nutritionTargets: [],
        maxRecipeTime: [
            {
                time: 0,
                dayDrive: "breakfast"
            },
            {
                time: 0,
                dayDrive: "lunch"
            },
            {
                time: 0,
                dayDrive: "dinner"
            },
            {
                time: 0,
                dayDrive: "snacks"
            }
        ],
        healthRestrictionLabels: []
    },
    NOTIFICATION_MESSAGES: {
        LIKE: {
            TYPE: "like_post",
            MESSAGE: "liked your post"
        },
        POST: {
            TYPE: "submit_post",
            MESSAGE: "posted on your timeline"
        },
        COMMENT: {
            TYPE: "comment_post",
            MESSAGE: "commented on your post"
        },
        FRIEND_REQUEST: {
            TYPE: "friend_request_approved",
            MESSAGE: "approved your friend request"
        },
        BADGE_GAIN: {
            TYPE: "badge_awarded",
            MESSAGE: "You have been awarded <b>{message}</b> badge"
        }
    },
    EXERCISES_CATEGORIES: ["cardio", "strength", "flexibility", "balance"],

    EXERCISES_SUBCATEGORIES: [
        "running",
        "swimming",
        "walking",
        "cycling",
        "rowing",
        "yoga",
        "pilates",
        "aerobics",
        "boxing",
        "martial_arts",
        "skating",
        "other",
        "elliptical",
        "stair_climber",
        "jumping_rope",
        "sprints",
        "bench_press",
        "dips",
        "cleans",
        "deadlift",
        "squats",
        "pullups",
        "shoulder_press",
        "bent_over_row",
        "bodyweight",
        "bicep_curls",
        "tricep_extension",
        "pull_down",
        "machines",
        "strong_man",
        "isometric_stretching",
        "active_isolated_stretching",
        "ballistic_stretching",
        "dynamic_stretching",
        "passive_stretching",
        "static_stretching"
    ],

    EXERCISES_TYPE: {
        CARDIO: [
            "running",
            "swimming",
            "walking",
            "cycling",
            "rowing",
            "yoga",
            "pilates",
            "aerobics",
            "boxing",
            "martial_arts",
            "skating",
            "other",
            "elliptical",
            "stair_climber",
            "jumping_rope",
            "sprints"
        ],
        STRENGTH: [
            "bench_press",
            "dips",
            "cleans",
            "deadlift",
            "squats",
            "pullups",
            "shoulder_press",
            "bent_over_row",
            "bodyweight",
            "bicep_curls",
            "tricep_extension",
            "pull_down",
            "machines",
            "strong_man"
        ],
        FLEXIBILITY: [
            "isometric_stretching",
            "active_isolated_stretching",
            "ballistic_stretching",
            "dynamic_stretching",
            "passive_stretching",
            "static_stretching"
        ],
        BALANCE: []
    },
    PROGRAM_PRIVACY_PRIVATE: '1',
    PROGRAM_PRIVACY_PUBLIC: '0',
    GOALS_OPTIONS: [
        "gain_muscle",
        "improve_mobility",
        "lose_fat",
        "gain_strength",
        "gain_power",
        "increase_endurance"
    ],
    PROGRAM_LEVEL_OPTIONS: [
        "beginner",
        "intermediate",
        "advanced",
        "expert"
    ],
    PROGRESS_PHOTO_CATEGORY: {
        basic: 'basic',
        isolation: 'isolation',
        posed: 'posed',
        lifestyle: 'lifestyle'
    },
    PROGRESS_PHOTO_POSED: {
        front_lat_spread: 'front_lat_spread',
        front_double_biceps: 'front_double_biceps'
    },
    PROGRESS_PHOTO_BASIC: {
        front: 'front',
        side: 'side',
        back: 'back'
    }
};
