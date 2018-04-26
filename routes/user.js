var express = require("express");
var router = express.Router();
var auth = require("../middlewares/user_auth");

// var nutrition = require("./user/nutrition");
// var equipment_category = require("./user/equipment_category");
// var exercise_type = require("./user/exercise_types");
// var exercise = require("./user/exercise");
// var ingredient = require("./user/ingredients");
// var recipes = require("./user/recipes");
// // var item = require("./user/item");
var body_measurement = require("./user/measurement");
var nutrition_preference = require("./user/nutrition_preferences");
var profile = require("./user/profile");
var equipment = require("./user/equipment");
var exercise_preference = require("./user/exercise_preference");
var user_progress_photos = require("./user/user_progress_photos");
var user_posts = require("./user/user_posts");
var exercise_types = require("./user/exercise_type");
var exercise = require("./user/exercise");
var bodypart = require("./user/bodyparts");
var shoppingcart = require("./user/shoppingcart");


// router.use("/nutrition", auth, nutrition);
// router.use("/equipment_category", auth, equipment_category);
// router.use("/equipment", auth, equipment);
// router.use("/exercise_type", auth, exercise_type);
// router.use("/exercise", auth, exercise);
// router.use("/ingredient", auth, ingredient);
// router.use("/recipes", auth, recipes);
router.use("/measurement", auth, body_measurement);
router.use("/nutrition_preference", auth, nutrition_preference);
router.use("/profile", auth, profile);
router.use("/equipment", auth, equipment);
router.use("/exercise_preference", auth, exercise_preference);
router.use("/user_progress_photo", auth, user_progress_photos);
router.use("/user_post", auth, user_posts);
router.use("/exercise_type", auth, exercise_types);
router.use("/exercise", auth, exercise);
router.use("/bodypart", auth, bodypart);
router.use("/shoppingcart", auth, shoppingcart);

module.exports = router;
