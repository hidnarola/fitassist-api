var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var moment = require("moment");
var jwtDecode = require("jwt-decode");

var router = express.Router();

var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;

var measurement_helper = require("../../helpers/measurement_helper");
var common_helper = require("../../helpers/common_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");

/**
 * @api {post} /user/measurement/get_by_id_logdate Get User Measurement
 * @apiName Get User Measurement by User Id and LogDate
 * @apiGroup User Measurement
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Date} logDate logDate of bodymesurement
 * @apiSuccess (Success 200) {Array}  measurement_logs  data of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/get_by_id_logdate", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logDate = req.body.logDate;
  console.log("Logdate: ", logDate);
  var schema = {
    logDate: {
      notEmpty: true,
      errorMessage: "Log Date is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  var measurement_obj = {
    status: 1,
    message: "",
    measurement: {}
  };
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

    logger.trace("Get measurement by authUserId and logDate API called");
    var resp_data = await measurement_helper.get_body_measurement_id({
      userId: authUserId,
      logDate: {
        $gte: startdate,
        $lte: enddate
      }
    });
    if (resp_data.status == 1 || resp_data.status == 2) {
      measurement_obj.status = resp_data.status;
      measurement_obj.message = resp_data.message;
      if (resp_data.measurement) {
        measurement_obj.measurement = resp_data.measurement;
      }

      res.status(config.OK_STATUS).json(measurement_obj);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {post} /user/measurement Save User Measurement
 * @apiName Save User Measurement
 * @apiGroup User Measurement
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} userId userId of User Collection
 * @apiParam {Date} logDate logDate of bodymesurement
 * @apiParam {Number} [neck] neck of bodymesurement
 * @apiParam {Number} [shoulder] shoulder of bodymesurement
 * @apiParam {Number} [chest] chest of bodymesurement
 * @apiParam {Number} [upperArm] upperArm of bodymesurement
 * @apiParam {Number} [waist] waist of bodymesurement
 * @apiParam {Number} [forearm] forearm of bodymesurement
 * @apiParam {Number} [hips] hips of bodymesurement
 * @apiParam {Number} [thigh] thigh of bodymesurement
 * @apiParam {Number} [calf] calf of bodymesurement
 * @apiParam {Number} [weight] weight of bodymesurement
 * @apiParam {Number} [height] height of bodymesurement
 *
 * @apiSuccess (Success 200) {JSON} measurement Measurement details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var logDate = req.body.logDate;

  var host = req.headers["host"];
  console.log("------------------------------------");
  console.log("host : ", host);
  console.log("------------------------------------");

  var startdate = moment(logDate).utcOffset(0);
  startdate.toISOString();
  startdate.format();

  var enddate = moment(logDate)
    .utcOffset(0)
    .add(23, "hours")
    .add(59, "minutes");
  enddate.toISOString();
  enddate.format();

  logger.trace("Get measurement by authUserId and logDate API called");
  var resp_data = await measurement_helper.get_body_measurement_id({
    userId: authUserId,
    logDate: {
      $gte: startdate,
      $lte: enddate
    }
  });
  if (resp_data.status == 2) {
    var schema = {
      logDate: {
        notEmpty: true,
        errorMessage: "Log Date is required"
      }
    };

    req.checkBody(schema);
    var errors = req.validationErrors();

    if (!errors) {
      var measurement_obj = {
        userId: authUserId,
        logDate: req.body.logDate ? req.body.logDate : 0,
        neck: req.body.neck ? req.body.neck : 0,
        shoulders: req.body.shoulders ? req.body.shoulders : 0,
        chest: req.body.chest ? req.body.chest : 0,
        upperArm: req.body.upperArm ? req.body.upperArm : 0,
        waist: req.body.waist ? req.body.waist : 0,
        forearm: req.body.forearm ? req.body.forearm : 0,
        hips: req.body.hips ? req.body.hips : 0,
        thigh: req.body.thigh ? req.body.thigh : 0,
        calf: req.body.calf ? req.body.calf : 0,
        weight: req.body.weight ? req.body.weight : 0,
        height: req.body.height ? req.body.height : 0
      };

      let measurement_data = await measurement_helper.insert_body_measurement(
        measurement_obj
      );
      if (measurement_data.status === 0) {
        logger.error(
          "Error while inserting measurement data = ",
          measurement_data
        );
        return res.status(config.BAD_REQUEST).json({ measurement_data });
      } else {
        badgesAssign(authUserId);
        return res.status(config.OK_STATUS).json(measurement_data);
      }
    } else {
      logger.error("Validation Error = ", errors);
      res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
    }
  } else if (resp_data.status == 1) {
    var schema = {
      logDate: {
        notEmpty: true,
        errorMessage: "Log Date is required"
      }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();

    if (!errors) {
      var measurement_obj = {
        userId: authUserId,
        logDate: req.body.logDate ? req.body.logDate : 0,
        neck: req.body.neck ? req.body.neck : 0,
        shoulders: req.body.shoulders ? req.body.shoulders : 0,
        chest: req.body.chest ? req.body.chest : 0,
        upperArm: req.body.upperArm ? req.body.upperArm : 0,
        waist: req.body.waist ? req.body.waist : 0,
        forearm: req.body.forearm ? req.body.forearm : 0,
        hips: req.body.hips ? req.body.hips : 0,
        thigh: req.body.thigh ? req.body.thigh : 0,
        calf: req.body.calf ? req.body.calf : 0,
        weight: req.body.weight ? req.body.weight : 0,
        height: req.body.height ? req.body.height : 0
      };

      let measurement_data = await measurement_helper.update_body_measurement(
        resp_data.measurement._id,
        measurement_obj
      );

      if (measurement_data.status === 0) {
        logger.error(
          "Error while inserting measurement data = ",
          measurement_data
        );
        return res.status(config.BAD_REQUEST).json({ measurement_data });
      } else {
        badgesAssign(authUserId);
        return res.status(config.OK_STATUS).json(measurement_data);
      }
    } else {
      logger.error("Validation Error = ", errors);
      res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
    }
  } else {
    return res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

/**
 * @api {post} /user/measurement/get_log_dates_by_date Get Logs of User Measurement
 * @apiName Get Logs of User Measurement
 * @apiGroup User Measurement
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Number} logDate logDate of user's Measurement
 *
 * @apiSuccess (Success 200) {JSON} logdates Measurement details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

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

    var log_data = await measurement_helper.get_logdata_by_userid({
      userId: authUserId,
      logDate: {
        $gte: startCheck,
        $lte: endCheck
      }
    });

    if (log_data.status != 0) {
      res.status(config.OK_STATUS).json(log_data);
    } else {
      return res.status(config.BAD_REQUEST).json({ log_data });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

async function badgesAssign(authUserId) {
  // badge_assign start;
  var resp_data = await measurement_helper.get_body_measurement_id(
    {
      userId: authUserId
    },
    { logDate: -1 },
    1
  );
  var body_measurement_data = {
    neck_measurement_gain: resp_data.measurement.neck,
    neck_measurement_loss: resp_data.measurement.neck,
    shoulders_measurement_gain: resp_data.measurement.shoulders,
    shoulders_measurement_loss: resp_data.measurement.shoulders,
    chest_measurement_gain: resp_data.measurement.chest,
    chest_measurement_loss: resp_data.measurement.chest,
    upper_arm_measurement_gain: resp_data.measurement.upperArm,
    upper_arm_measurement_loss: resp_data.measurement.upperArm,
    waist_measurement_gain: resp_data.measurement.waist,
    waist_measurement_loss: resp_data.measurement.waist,
    forearm_measurement_gain: resp_data.measurement.forearm,
    forearm_measurement_loss: resp_data.measurement.forearm,
    hips_measurement_gain: resp_data.measurement.hips,
    hips_measurement_loss: resp_data.measurement.hips,
    thigh_measurement_gain: resp_data.measurement.thigh,
    thigh_measurement_loss: resp_data.measurement.thigh,
    calf_measurement_gain: resp_data.measurement.calf,
    calf_measurement_loss: resp_data.measurement.calf
  };

  var senderBadges = await badge_assign_helper.badge_assign(
    authUserId,
    constant.BADGES_TYPE.BODY_MEASUREMENT,
    body_measurement_data
  );
  //badge assign end
}
module.exports = router;
