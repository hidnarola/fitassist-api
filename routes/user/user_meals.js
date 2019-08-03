var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var meal_helper = require("../../helpers/user_helper");

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    meals: {
      notEmpty: true,
      errorMessage: "meals is required"
    },
    date: {
      notEmpty: true,
      errorMessage: "date is required"
    }
  };
  var meals_obj = {
    meals: req.body.meals,
    date: req.body.date,
    userId: authUserId
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    let meal_data = await meal_helper.insert_meal(meals_obj);
    if (meal_data.status === 0) {
      logger.error("Error while inserting meal data = ", meal_data);
      return res.status(config.BAD_REQUEST).json({
        meal_data
      });
    } else {
      return res.status(config.OK_STATUS).json(meal_data);
    }
  }
});

module.exports = router;
