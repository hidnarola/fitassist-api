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
var user_settings_helper = require("../../helpers/user_settings_helper");
var user_helper = require("../../helpers/user_helper");
var body_fat_helper = require("../../helpers/body_fat_helper");

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
    measurement: {},
    body_fat_log: {}
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
    var body_fat = await body_fat_helper.get_body_fat_logs({
      userId: authUserId,
      logDate: {
        $gte: startdate,
        $lte: enddate
      }
    });

    if (resp_data.status != 0 || body_fat.status != 0) {
      measurement_obj.status = 1;
      measurement_obj.message = "Success";
      if (resp_data.measurement) {
        measurement_obj.measurement = resp_data.measurement;
      }
      if (body_fat.body_fat_log) {
        measurement_obj.body_fat_log = body_fat.body_fat_log;
      }
      res.status(config.OK_STATUS).json(measurement_obj);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
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

  logger.trace("Get measurement by authUserId and logDate API called");

  var schema = {
    logDate: {
      notEmpty: true,
      errorMessage: "Log Date is required"
    },
    neck: {
      notEmpty: true,
      errorMessage: "neck is required"
    },
    shoulders: {
      notEmpty: true,
      errorMessage: "shoulders is required"
    },
    chest: {
      notEmpty: true,
      errorMessage: "chest is required"
    },
    upperArm: {
      notEmpty: true,
      errorMessage: "upperArm is required"
    },
    waist: {
      notEmpty: true,
      errorMessage: "waist is required"
    },
    forearm: {
      notEmpty: true,
      errorMessage: "forearm is required"
    },
    hips: {
      notEmpty: true,
      errorMessage: "hips is required"
    },
    thigh: {
      notEmpty: true,
      errorMessage: "thigh is required"
    },
    calf: {
      notEmpty: true,
      errorMessage: "calf is required"
    },
    weight: {
      notEmpty: true,
      errorMessage: "weight is required"
    },
    height: {
      notEmpty: true,
      errorMessage: "height is required"
    },
    heartRate: {
      notEmpty: true,
      errorMessage: "Heart rate is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    let measurement_unit_data = await user_settings_helper.get_setting({
      userId: authUserId
    });
    if (measurement_unit_data.status === 0) {
      logger.error(
        "Error while inserting measurement data = ",
        measurement_unit_data
      );
      measurement_obj = {
        userId: authUserId,
        logDate: req.body.logDate,
        neck: req.body.neck,
        shoulders: req.body.shoulders,
        chest: req.body.chest,
        upperArm: req.body.upperArm,
        waist: req.body.waist,
        forearm: req.body.forearm,
        hips: req.body.hips,
        thigh: req.body.thigh,
        calf: req.body.calf,
        weight: req.body.weight,
        height: req.body.height,
        heartRate: req.body.heartRate,
      };
    } else {
      var bodyMeasurement;
      var weight;
      try {
        bodyMeasurement = measurement_unit_data.user_settings.bodyMeasurement;
      } catch (error) {
        bodyMeasurement = "cm";
      }

      try {
        weight = measurement_unit_data.user_settings.weight;
      } catch (error) {
        weight = "gram";
      }
      var neck = await common_helper.unit_converter(
        req.body.neck,
        bodyMeasurement
      );
      var shoulders = await common_helper.unit_converter(
        req.body.shoulders,
        bodyMeasurement
      );
      var chest = await common_helper.unit_converter(
        req.body.chest,
        bodyMeasurement
      );
      var upperArm = await common_helper.unit_converter(
        req.body.upperArm,
        bodyMeasurement
      );
      var waist = await common_helper.unit_converter(
        req.body.waist,
        bodyMeasurement
      );
      var forearm = await common_helper.unit_converter(
        req.body.forearm,
        bodyMeasurement
      );
      var hips = await common_helper.unit_converter(
        req.body.hips,
        bodyMeasurement
      );
      var thigh = await common_helper.unit_converter(
        req.body.thigh,
        bodyMeasurement
      );
      var calf = await common_helper.unit_converter(
        req.body.calf,
        bodyMeasurement
      );
      weight = await common_helper.unit_converter(req.body.weight, weight);
      var height = await common_helper.unit_converter(
        req.body.height,
        bodyMeasurement
      );

      measurement_obj = {
        userId: authUserId,
        logDate: req.body.logDate,
        neck: neck.baseValue,
        shoulders: shoulders.baseValue,
        chest: chest.baseValue,
        upperArm: upperArm.baseValue,
        waist: waist.baseValue,
        forearm: forearm.baseValue,
        hips: hips.baseValue,
        thigh: thigh.baseValue,
        calf: calf.baseValue,
        weight: weight.baseValue,
        height: height.baseValue,
        heartRate: req.body.heartRate,
        modifiedAt: new Date()
      };
    }

    var user_height_and_weight_object = {
      weight: weight.baseValue,
      height: height.baseValue
    };

    let user_height_and_weight = await user_helper.update_user_by_id(
      authUserId,
      user_height_and_weight_object
    );

    var startdate = moment(logDate).utcOffset(0);
    startdate.toISOString();
    startdate.format();

    var enddate = moment(logDate)
      .utcOffset(0)
      .add(23, "hours")
      .add(59, "minutes");
    enddate.toISOString();
    enddate.format();

    var resp_data = await measurement_helper.get_body_measurement_id({
      userId: authUserId,
      logDate: {
        $gte: startdate,
        $lte: enddate
      }
    });

    if (resp_data.status == 2) {
      let measurement_data = await measurement_helper.insert_body_measurement(
        measurement_obj
      );
      if (measurement_data.status === 0) {
        logger.error(
          "Error while inserting measurement data = ",
          measurement_data
        );
        return res.status(config.BAD_REQUEST).json({
          measurement_data
        });
      } else {
        badgesAssign(authUserId);
        return res.status(config.OK_STATUS).json(measurement_data);
      }
    } else {
      let measurement_data = await measurement_helper.update_body_measurement(
        resp_data.measurement._id,
        measurement_obj
      );

      if (measurement_data.status === 0) {
        logger.error(
          "Error while inserting measurement data = ",
          measurement_data
        );
        return res.status(config.BAD_REQUEST).json({
          measurement_data
        });
      } else {
        badgesAssign(authUserId);
        return res.status(config.OK_STATUS).json(measurement_data);
      }
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
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

async function badgesAssign(authUserId) {
  // badge_assign start;
  var resp_data = await measurement_helper.get_body_measurement_id({
      userId: authUserId
    }, {
      logDate: -1
    },
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
    calf_measurement_loss: resp_data.measurement.calf,
    weight: resp_data.measurement.weight,
    heart_rate_total: resp_data.measurement.heartRate,
    heart_rate_average: resp_data.measurement.heartRate,
    heart_rate_most: resp_data.measurement.heartRate,
    heart_rate_least: resp_data.measurement.heartRate,
    heart_rate_resting_total: resp_data.measurement.heartRate,
    heart_rate_resting_average: resp_data.measurement.heartRate,
    heart_rate_resting_most: resp_data.measurement.heartRate,
    heart_rate_resting_least: resp_data.measurement.heartRate,
  };


  var badges = await badge_assign_helper.badge_assign(
    authUserId,
    constant.BADGES_TYPE.BODY_MEASUREMENT.concat(
      constant.BADGES_TYPE.BODY_MASS
    ).concat(constant.BADGES_TYPE.BODY_FAT),
    body_measurement_data
  );
  //badge assign end
}
module.exports = router;