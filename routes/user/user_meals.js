var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var meals_helper = require("../../helpers/user_meal_helper");
var moment = require("moment");

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
    let meal_data = await meals_helper.insert_meal(meals_obj);

    // insert recent meals
    // let recent_meal = await meals_helper.insert_recent_meal(meals_obj);

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

router.post("/get_log_dates_by_date", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var schema = {
    logDate: {
      notEmpty: true,
      errorMessage: "log Date is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var authUserId = decoded.sub;
    var check = await moment(req.body.logDate).utc(0);
    var startCheck = await moment(check).subtract(2, "month");
    var endCheck = await moment(check).add(2, "month");

    var log_data = await meals_helper.get_logdata_by_userid({
      userId: authUserId,
      date: {
        $gte: startCheck,
        $lte: endCheck
      }
    });

    if (log_data.status != 0) {
      res.status(config.OK_STATUS).json(log_data);
    } else {
      return res.status(config.BAD_REQUEST).json({
        log_data
      });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

router.post("/get_by_id_user_meal", async (req, res) => {
  logger.trace("Get measurement by authUserId and logDate API called");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var logDate = req.body.logDate;
  var schema = {
    logDate: {
      notEmpty: true,
      errorMessage: "Log Date is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var startdate = moment(logDate).utcOffset(0);
    startdate.toISOString();
    startdate.format();

    var enddate = moment(logDate)
      .utcOffset(0)
      .add(23, "hours")
      .add(59, "minutes");
    enddate.toISOString();
    enddate.format();

    // let cond = {
    //   userId: authUserId,
    //   date: {
    //     $gte: startdate,
    //     $lte: enddate
    //   }
    // };
    console.log("LOG DATE", logDate);
    var searchObj = {
      $match: {
        userId: authUserId,
        date: {
          $eq: new Date(startdate)
        }
      }
    };

    var resp_data = await meals_helper.get_user_meal_by_id(searchObj);
    if (resp_data.status != 0) {
      res.status(config.OK_STATUS).json(resp_data);
    } else {
      return res.status(config.BAD_REQUEST).json({
        resp_data
      });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

router.post("/add_to_favourite", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  console.log("req.body => ", req.body);
  var schema = {
    meal_id: {
      notEmpty: true,
      errorMessage: "meal is required"
    }
  };
  var meals_obj = {
    meal_id: req.body.meal_id,
    add: req.body.add,
    userId: authUserId
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    let meal_data = await meals_helper.insert_favourite_meal(meals_obj);

    // insert recent meals
    // let recent_meal = await meals_helper.insert_recent_meal(meals_obj);

    if (meal_data.status === 0) {
      logger.error("Error while inserting favourite meal data = ", meal_data);
      return res.status(config.BAD_REQUEST).json({
        meal_data
      });
    } else {
      return res.status(config.OK_STATUS).json(meal_data);
    }
  }
  console.log(errors);
});

router.get("/get_favourite_meals", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  let cond = {
    userId: authUserId
  };

  var resp_data = await meals_helper.get_favourite_meals(cond);
  if (resp_data.status != 0) {
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    return res.status(config.BAD_REQUEST).json({
      resp_data
    });
  }
});

module.exports = router;
