var express = require("express");
var router = express.Router();
var auth = require("../middlewares/user_auth");
var isBlockedCheck = require("../middlewares/isBlockedCheckMiddleware");
var body_measurement = require("./user/measurement");
var nutrition_preference = require("./user/nutrition_preferences");
var profile = require("./user/profile");
var equipment = require("./user/equipment");
var exercise_preference = require("./user/exercise_preference");
var user_progress_photos = require("./user/user_progress_photos");
var gallery = require("./user/gallery");
var exercise_types = require("./user/exercise_type");
var exercise = require("./user/exercise");
var bodypart = require("./user/bodyparts");
var shopping_cart = require("./user/shopping_cart");
var friends = require("./user/friends");
var comment = require("./user/comment");
var like = require("./user/like");
var recipe = require("./user/user_recipe");
var nutrition = require("./user/nutrition");
var test_exercises = require("./user/test_exercises");
var timeline = require("./user/timeline");
var search = require("./user/search");
var chat = require("./user/chat");
var primary_goal = require("./user/primary_goals");
var secondary_goals = require("./user/secondary_goals");
var personal_goals = require("./user/personal_goals");
var badge = require("./user/badges");
var notification = require("./user/notifications");
var users_nutritions = require("./user/users_nutritions");
var user_workouts = require("./user/user_workouts");
var dashboard = require("./user/dashboard");
var user_program = require("./user/user_program");
var statistics = require("./user/statistics");
var exercise_measurements = require("./user/exercise_measurements");
var workout_progress = require("./user/workout_progress");
var body_fat_logs = require("./user/body_fat_logs");
var widgets = require("./user/widgets");
var user_settings = require("./user/user_settings");
var change_password = require("./user/change_password");
var flag_on_post = require("./user/flag_on_post");
var programs_rating = require("./user/programs_rating");
var follows = require("./user/follows");
var new_nutrition = require("./user/new_nutrition");
var meals = require("./user/meals");
var user_meals = require("./user/user_meals");
var user_progress_activity_photos = require("./user/user_progress_activity_photos");
var user_nutrition_programs = require("./user/user_nutrition_programs");
var user_nutrition_programs_meals = require("./user/user_nutrition_programs_meals");
var user_nutrition_programs_rating = require("./user/user_nutrition_programs_rating");

router.use("/measurement", isBlockedCheck, auth, body_measurement);
router.use("/nutrition_preference", isBlockedCheck, auth, nutrition_preference);
router.use("/profile", isBlockedCheck, auth, profile);
router.use("/equipment", isBlockedCheck, auth, equipment);
router.use("/exercise_preference", isBlockedCheck, auth, exercise_preference);
router.use("/progress_photo", isBlockedCheck, auth, user_progress_photos);
router.use("/gallery", isBlockedCheck, auth, gallery);
router.use("/exercise_type", isBlockedCheck, auth, exercise_types);
router.use("/exercise", isBlockedCheck, auth, exercise);
router.use("/bodypart", isBlockedCheck, auth, bodypart);
router.use("/friend", isBlockedCheck, auth, friends);
router.use("/post/comment", isBlockedCheck, auth, comment);
router.use("/post/like", isBlockedCheck, auth, like);
router.use("/recipe", isBlockedCheck, auth, recipe);
router.use("/nutrition", isBlockedCheck, auth, nutrition);
router.use("/test_exercise", isBlockedCheck, auth, test_exercises);
router.use("/shopping_cart", isBlockedCheck, auth, shopping_cart);
router.use("/timeline", isBlockedCheck, auth, timeline);
router.use("/search", isBlockedCheck, auth, search);
router.use("/chat", isBlockedCheck, auth, chat);
router.use("/primary_goal", isBlockedCheck, auth, primary_goal);
router.use("/secondary_goal", isBlockedCheck, auth, secondary_goals);
router.use("/personal_goal", isBlockedCheck, auth, personal_goals);
router.use("/badge", isBlockedCheck, auth, badge);
router.use("/notification", isBlockedCheck, auth, notification);
router.use("/users_nutritions", isBlockedCheck, auth, users_nutritions);
router.use("/user_workouts", isBlockedCheck, auth, user_workouts);
router.use("/dashboard", isBlockedCheck, auth, dashboard);
router.use("/user_program", isBlockedCheck, auth, user_program);
router.use("/statistics", isBlockedCheck, auth, statistics);
router.use(
  "/exercise_measurements",
  isBlockedCheck,
  auth,
  exercise_measurements
);
router.use("/progress", isBlockedCheck, auth, workout_progress);
router.use("/body_fat_log", isBlockedCheck, auth, body_fat_logs);
router.use("/widgets", isBlockedCheck, auth, widgets);
router.use("/user_settings", isBlockedCheck, auth, user_settings);
router.use("/change_password", isBlockedCheck, auth, change_password);
router.use("/flag_on_post", isBlockedCheck, auth, flag_on_post);
router.use("/programs_rating", isBlockedCheck, auth, programs_rating);
router.use("/follows", isBlockedCheck, auth, follows);
router.use("/new_nutrition", isBlockedCheck, auth, new_nutrition);
router.use("/meals", isBlockedCheck, auth, meals);
router.use("/user_meals", isBlockedCheck, auth, user_meals);
router.use(
  "/progress_activity_photo",
  isBlockedCheck,
  auth,
  user_progress_activity_photos
);
router.use(
  "/user_nutrition_program",
  isBlockedCheck,
  auth,
  user_nutrition_programs
);
router.use(
  "/user_nutrition_program_meals",
  isBlockedCheck,
  auth,
  user_nutrition_programs_meals
);
router.use(
  "/user_nutrition_programs_rating",
  isBlockedCheck,
  auth,
  user_nutrition_programs_rating
);

module.exports = router;
