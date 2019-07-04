var express = require("express");
var router = express.Router();

var nutrition = require("./nutritiondb/nutrition");
var proximates = require("./nutritiondb/proximates");
var Inorganics = require("./nutritiondb/inorganics");
var Vitamins = require("./nutritiondb/vitamins");
var VitaminFractions = require("./nutritiondb/vitamin_fractions");
var SfaFa = require("./nutritiondb/sfaFa");
var sfaFood = require("./nutritiondb/sfaFood");
var mufa = require("./nutritiondb/mufa");
var mufaFood = require("./nutritiondb/mufaFood");
var pufa = require("./nutritiondb/pufa");
var pufaFood = require("./nutritiondb/pufaFood");
var phytosterols = require("./nutritiondb/phytosterols");
var organic_acids = require("./nutritiondb/organic_acids");

router.use("/nutrition", nutrition);
router.use("/proximates", proximates);
router.use("/inorganics", Inorganics);
router.use("/vitamins", Vitamins);
router.use("/vitamin_fractions", VitaminFractions);
router.use("/sfaFa", SfaFa);
router.use("/sfaFood", sfaFood);
router.use("/mufaFood", mufaFood);
router.use("/mufa", mufa);
router.use("/pufa", pufa);
router.use("/pufaFood", pufaFood);
router.use("/phytosterols", phytosterols);
router.use("/organic_acids", organic_acids);


module.exports = router;

