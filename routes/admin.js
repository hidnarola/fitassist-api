var express = require("express");
var router = express.Router();

var auth = require("./../middlewares/auth");
var authorization = require("./../middlewares/authorization");

var nutrition = require("./admin/nutrition");
var equipment_category = require("./admin/equipment_category");

var equipment = require("./admin/equipment");
var exercise_type = require("./admin/exercise_types");
var exercise = require("./admin/exercise");

router.use("/nutrition", auth, authorization, nutrition);
router.use("/equipment_category", auth, authorization, equipment_category);

router.use("/equipment", equipment);
router.use("/exercise_type", auth, authorization, exercise_type);
router.use("/exercise", exercise);

module.exports = router;
