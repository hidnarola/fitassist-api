var express = require("express");
var router = express.Router();

var auth = require("../middlewares/user_auth");
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
var user_calendar = require("./user/user_calendar");
var user_program = require("./user/user_program");
var user_leaderboard = require("./user/user_leaderboard");
var exercise_measurements = require("./user/exercise_measurements");
var workout_progress = require("./user/workout_progress");

router.use("/measurement", auth, body_measurement);
router.use("/nutrition_preference", auth, nutrition_preference);
router.use("/profile", auth, profile);
router.use("/equipment", auth, equipment);
router.use("/exercise_preference", auth, exercise_preference);
router.use("/progress_photo", auth, user_progress_photos);
router.use("/gallery", auth, gallery);
router.use("/exercise_type", auth, exercise_types);
router.use("/exercise", auth, exercise);
router.use("/bodypart", auth, bodypart);
router.use("/friend", auth, friends);
router.use("/post/comment", auth, comment);
router.use("/post/like", auth, like);
router.use("/recipe", auth, recipe);
router.use("/nutrition", auth, nutrition);
router.use("/test_exercise", auth, test_exercises);
router.use("/shopping_cart", auth, shopping_cart);
router.use("/timeline", auth, timeline);
router.use("/search", auth, search);
router.use("/chat", auth, chat);
router.use("/primary_goal", auth, primary_goal);
router.use("/secondary_goal", auth, secondary_goals);
router.use("/personal_goal", auth, personal_goals);
router.use("/badge", auth, badge);
router.use("/notification", auth, notification);
router.use("/users_nutritions", auth, users_nutritions);
router.use("/user_workouts", auth, user_workouts);
router.use("/user_calendar", auth, user_calendar);
router.use("/user_program", auth, user_program);
router.use("/user_leaderboard", auth, user_leaderboard);
router.use("/exercise_measurements", auth, exercise_measurements);
router.use("/workout_progress", auth, workout_progress);

module.exports = router;
