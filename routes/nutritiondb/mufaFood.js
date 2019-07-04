var express = require("express");
var _ = require("underscore");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var logger = config.logger;
var new_nutrition_helper = require("../../helpers/new_nutrition_helper");

/**
 * @api {post} /nutrition/ Post all
 * @apiName Post all
 * @apiGroup Common Nutrition
 * @apiHeader {String}  authorization Admin's or User's unique access-key
 * @apiSuccess (Success 200) {Array} nutritions Array of nutrition's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  try {
    var resp_data = await new_nutrition_helper.insert_mufaFood(
      req.body
    );
    if (resp_data.status == 0) {
      logger.error("Error occured while mufaFood = ", resp_data.mufaFood.length);
      res.status(config.INTERNAL_SERVER_ERROR)
    } else {
      logger.trace("mufaFood save successfully = ");
      res.status(config.OK_STATUS).json(resp_data);
    }
  } catch (error) {
    logger.error("Error occured while mufaFood = ");
      res.status(config.INTERNAL_SERVER_ERROR)
  }

});

module.exports = router;