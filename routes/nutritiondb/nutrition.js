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
  console.log('here in checking');
    console.log("Post all nutrition API called", req.body);

    res.json(req.body);

    var resp_data = await new_nutrition_helper.insert_nutrition(
     req.body
    );
    if (resp_data.status == 0) {
      logger.error("Error occured while nutritions = ", resp_data);
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("nutritions save successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  });

  module.exports = router;