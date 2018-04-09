var express = require("express");
var router = express.Router();

var auth = require("./../middlewares/auth");
var authorization = require("./../middlewares/authorization");

var nutrition = require("./admin/nutrition");
var equipment_category = require("./admin/equipment_category");

var equipment = require("./admin/equipment");
var exercise_type = require("./admin/exercise_types");
var exercise = require("./admin/exercise");
var bodypart = require("./admin/bodyparts");
var body_measurement = require("./admin/measurement");
var user = require("./admin/users");
var ingredient = require("./admin/ingredients");
var recipes = require("./admin/recipes");
var shppingcart = require("./admin/shppingcart");
// var item = require("./admin/item");

router.use("/nutrition", auth, authorization, nutrition);
router.use("/equipment_category", auth, authorization, equipment_category);

router.use("/equipment", auth, authorization, equipment);
router.use("/exercise_type", auth, authorization, exercise_type);
router.use("/exercise", auth, authorization, exercise);
router.use("/bodypart", auth, authorization, bodypart);
router.use("/measurement", auth, authorization, body_measurement);
router.use("/user", auth, authorization, user);
router.use("/ingredient", auth, authorization, ingredient);
router.use("/recipes", auth, authorization, recipes);
router.use("/shppingcart", auth, authorization, shppingcart);
// router.use("/item", auth, authorization, item);


module.exports = router;
