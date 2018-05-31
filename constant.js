module.exports = {
  UNIT_SETTING_DEFUALT_VALUE: {
    distance: "km",
    weight: "kg",
    body_measurement: "cm"
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
  }
};
