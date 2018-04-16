var express = require("express");
var router = express.Router();

var auth = require("./../middlewares/auth");
var authorization = require("./../middlewares/authorization");


// var nutrition = require("./user/nutrition");
// var equipment_category = require("./user/equipment_category");
// var equipment = require("./user/equipment");
// var exercise_type = require("./user/exercise_types");
// var exercise = require("./user/exercise");
// var bodypart = require("./user/bodyparts");
// var user = require("./user/users");
// var ingredient = require("./user/ingredients");
// var recipes = require("./user/recipes");
// var shoppingcart = require("./user/shoppingcart");
// // var item = require("./user/item");
var body_measurement = require("./user/measurement");
var nutrition_preferences = require("./user/nutrition_preferences");

// router.use("/nutrition", auth, authorization, nutrition);
// router.use("/equipment_category", auth, authorization, equipment_category);
// router.use("/equipment", auth, authorization, equipment);
// router.use("/exercise_type", auth, authorization, exercise_type);
// router.use("/exercise", auth, authorization, exercise);
// router.use("/bodypart", auth, authorization, bodypart);
// router.use("/user", auth, authorization, user);
// router.use("/ingredient", auth, authorization, ingredient);
// router.use("/recipes", auth, authorization, recipes);
// router.use("/shoppingcart", auth, authorization, shoppingcart);
router.use("/measurement", auth, authorization, body_measurement);
router.use("/nutrition_preferences", auth, authorization, nutrition_preferences);

var body_measurement = require("./user/measurement");
var nutrition_preference = require("./user/nutrition_preferences");

module.exports = router;
