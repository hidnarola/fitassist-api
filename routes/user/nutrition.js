var express = require("express");
var router = express.Router();

var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var moment = require("moment");

user_recipe_helper = require("../../helpers/user_recipe_helper");



/**
 * @api {post} /user/nutrition/todays_meal Get User recipe by Date
 * @apiName Get User Measurement by Date
 * @apiGroup Get User recipe by Date
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Date} date date of recipe
 * @apiSuccess (Success 200) {Array}  user_recipes  data of user_recipes document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/todays_meal", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  date = req.body.date;
  console.log("Date: ", date);
  var schema = {
    date: {
      notEmpty: true,
      errorMessage: "Date is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  var recipe_obj = {
    status: 1,
    message: "",
    user_recipe: []
  };
  if (!errors) {
    // var startdate = moment(logDate).utcOffset(0);
    var startdate = moment(date);
    startdate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    startdate.toISOString();
    startdate.format();

    var enddate = moment(date);
    enddate.set({ hour: 23, minute: 59, second: 59, millisecond: 99 });
    enddate.toISOString();
    enddate.format();

    logger.trace("Get user_recipe by date API called");
    var resp_data = await user_recipe_helper.get_user_recipe_by_id({
      userId: authUserId,
      date: {
        $gte: startdate,
        $lte: enddate
      }
    });
    console.log("DATA: ", resp_data);

    if (resp_data.status == 1) {
      recipe_obj.status = resp_data.status;
      recipe_obj.message = resp_data.message;
      if (resp_data.user_recipes) {
        recipe_obj.user_recipes = resp_data.user_recipes;
      }
      res.status(config.OK_STATUS).json(recipe_obj);
    } else {
      recipe_obj.status = resp_data.status;
      recipe_obj.message = resp_data.message;
      res.status(config.OK_STATUS).json(recipe_obj);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

module.exports = router;
