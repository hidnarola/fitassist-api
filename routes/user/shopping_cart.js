var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");
var moment = require("moment");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var shopping_cart_helper = require("../../helpers/shopping_cart_helper");
var user_recipe_helper = require("../../helpers/user_recipe_helper");

/**
 * @api {post} /user/shopping_cart  Get Shopping Cart
 * @apiName Get Shopping Cart
 * @apiGroup  Shopping Cart
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Date} start_date start date of recipe
 * @apiParam {Date} end_date end date of recipe
 * @apiSuccess (Success 200) {JSON} shopping_cart added shopping cart detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var schema = {
    start_date: {
      notEmpty: true,
      errorMessage: "start date is required"
    },
    end_date: {
      notEmpty: true,
      errorMessage: "end date is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var ingredients = {};
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;

    start_date = await moment(start_date);
    end_date = await moment(end_date);

    let shopping_cart_data = await user_recipe_helper.get_user_recipe_by_id({
      userId: authUserId,
      date: {
        $gte: start_date,
        $lte: end_date
      }
    });

    if (shopping_cart_data.status === 0) {
      logger.error(
        "Error while fetching shopping cart data = ",
        shopping_cart_data
      );
      return res.status(config.BAD_REQUEST).json({
        shopping_cart_data
      });
    } else if (shopping_cart_data.status === 2) {
      logger.error("no shopping cart data found= ", shopping_cart_data);
      return res.status(config.OK_STATUS).json({
        shopping_cart_data
      });
    } else {
      data = shopping_cart_data.todays_meal;

      var keys = Object.keys(data);

      keys.forEach(async key => {
        single_ingredient = data[key].ingredients;

        single_ingredient.forEach(ingredient => {
          var foodName = ingredient.food.toLowerCase();

          if (!ingredients[foodName]) {
            ingredients[foodName] = parseFloat(ingredient.weight);
          } else {
            ingredients[foodName] =
              parseFloat(ingredients[foodName]) + parseFloat(ingredient.weight);
          }
        });
      });

      return res.status(config.OK_STATUS).json({
        status: 1,
        message: "user's recipe shopping cart data found",
        ingredients: ingredients
      });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

module.exports = router;