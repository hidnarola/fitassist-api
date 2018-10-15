var express = require("express");
var router = express.Router();
var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var moment = require("moment");
var body_fat_helper = require("../../helpers/body_fat_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");

/**
 * @api {get} /user/body_fat_log Save
 * @apiName Save
 * @apiGroup  User Body Fat Logs
 * @apiHeader {String} authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} body_fat_logs JSON of body_fat_logs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  logger.trace("Save body_fat_logs API called");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    logDate: {
      notEmpty: true,
      errorMessage: "logDate is required"
    },
    site1: {
      notEmpty: true,
      isInt: {
        errorMessage: "Site1 should be between 0 to 200",
        options: {
          min: 0,
          max: 200
        }
      },
      errorMessage: "Site 1 is required"
    },
    site2: {
      notEmpty: true,
      isInt: {
        errorMessage: "Site2 should be between 0 to 200",
        options: {
          min: 0,
          max: 200
        }
      },
      errorMessage: "Site 2 is required"
    },
    site3: {
      notEmpty: true,
      isInt: {
        errorMessage: "Site3 should be between 0 to 200",
        options: {
          min: 0,
          max: 200
        }
      },
      errorMessage: "Site 3 is required"
    },
    age: {
      notEmpty: true,
      isInt: {
        errorMessage: "Age should be between 18 to 100",
        options: {
          min: 18,
          max: 100
        }
      },
      errorMessage: "Age is required"
    },
    bodyFatPer: {
      notEmpty: true,
      errorMessage: "Body Fat % is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var logDate = req.body.logDate;
    var bodyFatObject = {
      userId: authUserId,
      logDate: logDate,
      site1: req.body.site1,
      site2: req.body.site2,
      site3: req.body.site3,
      bodyFatPer: req.body.bodyFatPer,
      age: req.body.age,
      modifiedAt: new Date()
    };

    var startdate = moment(logDate).utcOffset(0);
    startdate.toISOString();
    startdate.format();

    var enddate = moment(logDate)
      .utcOffset(0)
      .add(23, "hours")
      .add(59, "minutes");
    enddate.toISOString();
    enddate.format();

    var resp_data = await body_fat_helper.get_body_fat_logs({
      userId: authUserId,
      logDate: {
        $gte: startdate,
        $lte: enddate
      }
    });
    if (resp_data.status === 2) {
      var resp_data = await body_fat_helper.save_body_fat_log(bodyFatObject);
      if (resp_data.status == 1) {
        logger.trace("body_fat_log got saved = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
      } else {
        logger.error("Error occured while saving body_fat_logs = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
      }
    } else {
      var resp_data = await body_fat_helper.save_body_fat_log(bodyFatObject, {
        _id: resp_data.body_fat_log._id
      });
      if (resp_data.status == 1) {
        logger.trace("body_fat_log got saved = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);

        var body_fat = await body_fat_helper.body_fat_data({
          userId: authUserId
        });

        var body_fat_measurment = {
          body_fat_gain: body_fat.body_fat_log.body_fat_gain,
          body_fat_loss: body_fat.body_fat_log.body_fat_loss,
          body_fat_average: body_fat.body_fat_log.body_fat_average,
          body_fat_most: body_fat.body_fat_log.body_fat_most,
          body_fat_least: body_fat.body_fat_log.body_fat_least,
        };

        var badges = await badge_assign_helper.badge_assign(
          authUserId,
          constant.BADGES_TYPE.BODY_FAT,
          body_fat_measurment
        );

        //badge assign end

      } else {
        logger.error("Error occured while saving body_fat_logs = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
      }
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});
module.exports = router;
