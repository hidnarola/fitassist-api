module.exports = {
  UNIT_SETTING_DEFUALT_VALUE: {
    distance: "km",
    weight: "kg",
    body_measurement: "cm"
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
      "calories_least",
      "calories_excess"
    ],
    NUTRITIONS: [
      "fat_saturated_total",
      "fat_saturated_average",
      "fat_saturated_most",
      "fat_saturated_least",
      "fat_saturated_excess",
      "fat_trans_total",
      "fat_trans_average",
      "fat_trans_most",
      "fat_trans_least",
      "fat_trans_excess",
      "folate_total",
      "folate_average",
      "folate_most",
      "folate_least",
      "folate_excess",
      "potassium_total",
      "potassium_average",
      "potassium_most",
      "potassium_least",
      "potassium_excess",
      "magnesium_total",
      "magnesium_average",
      "magnesium_most",
      "magnesium_least",
      "magnesium_excess",
      "sodium_total",
      "sodium_average",
      "sodium_most",
      "sodium_least",
      "sodium_excess",
      "protein_total",
      "protein_average",
      "protein_most",
      "protein_least",
      "protein_excess",
      "calcium_total",
      "calcium_average",
      "calcium_most",
      "calcium_least",
      "calcium_excess",
      "carbs_total",
      "carbs_average",
      "carbs_most",
      "carbs_least",
      "carbs_excess",
      "cholesterol_total",
      "cholesterol_average",
      "cholesterol_most",
      "cholesterol_least",
      "cholesterol_excess",
      "fat_polyunsaturated_total",
      "fat_polyunsaturated_average",
      "fat_polyunsaturated_most",
      "fat_polyunsaturated_least",
      "fat_polyunsaturated_excess",
      "cholesterol_total",
      "cholesterol_average",
      "cholesterol_most",
      "cholesterol_least",
      "cholesterol_excess",
      "fat_monounsaturated_total",
      "fat_monounsaturated_average",
      "fat_monounsaturated_most",
      "fat_monounsaturated_least",
      "fat_monounsaturated_excess",
      "fat_polyunsaturated_total",
      "fat_polyunsaturated_average",
      "fat_polyunsaturated_most",
      "fat_polyunsaturated_least",
      "fat_polyunsaturated_excess",
      "iron_total",
      "iron_average",
      "iron_most",
      "iron_least",
      "iron_excess",
      "sodium_total",
      "sodium_average",
      "sodium_most",
      "sodium_least",
      "sodium_excess",
      "protein_total",
      "protein_average",
      "protein_most",
      "protein_least",
      "protein_excess",
      "fiber_total",
      "fiber_average",
      "fiber_most",
      "fiber_least",
      "fiber_excess"
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
    COMMENT: {
      TYPE: "comment_post",
      MESSAGE: "commented on your post"
    },
    FRIEND_REQUEST: {
      TYPE: "friend_request_approved",
      MESSAGE: "approved your friend request"
    }
  }
};
