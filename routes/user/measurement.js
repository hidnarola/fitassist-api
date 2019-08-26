var express = require("express");
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
var user_progress_photos_helper = require("../../helpers/user_progress_photos_helper");

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
  logger.trace("Get measurement by authUserId and logDate API called");
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
    body_fat_log: {},
    user_progress_photos: []
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

    let cond = {
      userId: authUserId,
      logDate: {
        $gte: startdate,
        $lte: enddate
      }
    };

    var resp_data = await measurement_helper.get_body_measurement_id(cond);
    var body_fat = await body_fat_helper.get_body_fat_logs(cond);
    let userProgress = await user_progress_photos_helper.getUserProgressByDate({
      userId: authUserId,
      date: {
        $gte: new Date(startdate),
        $lte: new Date(enddate)
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
      if (userProgress && userProgress.status === 1) {
        measurement_obj.user_progress_photos = userProgress.data;
      }
      logger.trace("Get measurement by authUserId and logDate successfully");
      res.status(config.OK_STATUS).json(measurement_obj);
    } else {
      logger.trace("No record found");
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
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Date} logDate logDate of body mesurement
 * @apiParam {Number} neck neck of body mesurement
 * @apiParam {Number} shoulder shoulder of body mesurement
 * @apiParam {Number} chest chest of body mesurement
 * @apiParam {Number} upperArm upperArm of body mesurement
 * @apiParam {Number} waist waist of body mesurement
 * @apiParam {Number} forearm forearm of body mesurement
 * @apiParam {Number} hips hips of body mesurement
 * @apiParam {Number} thigh thigh of body mesurement
 * @apiParam {Number} calf calf of body mesurement
 * @apiParam {Number} weight weight of body mesurement
 * @apiParam {Number} height height of body mesurement
 * @apiSuccess (Success 200) {JSON} measurement Measurement details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  logger.trace("Save user measurement API called");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var logDate = req.body.logDate;
  var schema = {
    logDate: {
      notEmpty: true,
      errorMessage: "Log Date is required"
    },
    neck: {
      notEmpty: true,
      errorMessage: "Neck is required"
    },
    shoulders: {
      notEmpty: true,
      errorMessage: "Shoulders is required"
    },
    chest: {
      notEmpty: true,
      errorMessage: "Chest is required"
    },
    upperArm: {
      notEmpty: true,
      errorMessage: "UpperArm is required"
    },
    waist: {
      notEmpty: true,
      errorMessage: "Waist is required"
    },
    forearm: {
      notEmpty: true,
      errorMessage: "Forearm is required"
    },
    hips: {
      notEmpty: true,
      errorMessage: "Hips is required"
    },
    thigh: {
      notEmpty: true,
      errorMessage: "Thigh is required"
    },
    calf: {
      notEmpty: true,
      errorMessage: "Calf is required"
    },
    weight: {
      notEmpty: true,
      errorMessage: "Weight is required"
    },
    height: {
      notEmpty: true,
      errorMessage: "Height is required"
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
        logDate: logDate,
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
        heartRate: req.body.heartRate
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
        logDate: logDate,
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

    await user_helper.update_user_by_id(
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

    let condOfUserAndDate = {
      userId: authUserId,
      logDate: {
        $gte: startdate,
        $lte: enddate
      }
    };

    var resp_data = await measurement_helper.get_body_measurement_id(
      condOfUserAndDate
    );

    let bodyFatData = await body_fat_helper.get_body_fat_log_by_date(
      condOfUserAndDate
    );
    let bodyFat = {
      userId: authUserId,
      logDate: logDate,
      bodyFatPer: req.body.bodyFatPer,
      site1: 0,
      site2: 0,
      site3: 0,
      age: 0
    };
    if (bodyFatData && bodyFatData.status === 1 && bodyFatData.body_fat_log) {
      // body fat update
      bodyFatData.modifiedAt = new Date();
      let bodyFatLogId = bodyFatData.body_fat_log._id;
      await body_fat_helper.save_body_fat_log(bodyFat, { _id: bodyFatLogId });
    } else {
      // body fat add
      await body_fat_helper.save_body_fat_log(bodyFat);
    }

    if (resp_data.status == 2 || resp_data.status == 0) {
      let measurement_data = await measurement_helper.insert_body_measurement(
        measurement_obj
      );
      if (measurement_data.status === 0) {
        logger.error(
          "Error while inserting measurement data = ",
          measurement_data
        );
        return res.status(config.BAD_REQUEST).json(measurement_data);
      } else {
        logger.trace(
          "Successfully inserted measurement data = ",
          measurement_data
        );
        if ((await countBodyMeasurementsOfUser(authUserId)) > 1) {
          badgesAssign(authUserId);
        }
        return res.status(config.OK_STATUS).json(measurement_data);
      }
    } else {
      let measurement_data = await measurement_helper.update_body_measurement(
        resp_data.measurement._id,
        measurement_obj
      );

      if (measurement_data.status === 0 || measurement_data.status === 2) {
        logger.error(
          "Error while updating measurement data = ",
          measurement_data
        );
        return res.status(config.BAD_REQUEST).json(measurement_data);
      } else {
        logger.trace("updating measurement data = ", measurement_data);
        if ((await countBodyMeasurementsOfUser(authUserId)) > 1) {
          badgesAssign(authUserId);
        }
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
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Number} logDate logDate of user's Measurement
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

router.post("/update_body_measurement", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var mesurementObj = {
    logDate: req.body.logDate,
    userId: authUserId
  };

  let check_data = await measurement_helper.checkBodyMeasurement(mesurementObj);
  console.log("check_data ==> ", check_data.measurement.length);

  if (check_data.measurement.length === 0) {
    let measurement_data = await measurement_helper.update_body_measurement(
      req.body.measurementId,
      mesurementObj
    );

    if (measurement_data.status === 0 || measurement_data.status === 2) {
      logger.error(
        "Error while updating measurement data = ",
        measurement_data
      );
      return res.status(config.BAD_REQUEST).json(measurement_data);
    } else {
      logger.trace("updating measurement data = ", measurement_data);
      return res.status(config.OK_STATUS).json(measurement_data);
    }
  } else {
    let error = {
      status: 0,
      message: "Error occured while finding Exercise Types",
      error: "Body Measurement is already exits"
    };
    return res.status(config.BAD_REQUEST).json(error);
  }
});

router.post("/paste_body_measurement", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    logDate: {
      notEmpty: true,
      errorMessage: "log Date is required"
    },
    measurementId: {
      notEmpty: true,
      errorMessage: "Body Measurement ID is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  var copyId = req.body.measurementId;
  var mesurementObj = {
    logDate: req.body.logDate,
    userId: authUserId
  };
  var searchObj = {
    _id: req.body.measurementId,
    userId: authUserId
  };
  if (!errors) {
    let check_data = await measurement_helper.checkBodyMeasurement(
      mesurementObj
    );
    if (check_data.measurement.length === 0) {
      var copydata = await measurement_helper.copyBodyMeasurement(searchObj);
      let data = copydata.measurement[0];
      data.logDate = req.body.logDate;
      let measurement_data = await measurement_helper.insert_body_measurement(
        data
      );
      if (measurement_data.status === 0) {
        logger.error(
          "Error while inserting measurement data = ",
          measurement_data
        );
        return res.status(config.BAD_REQUEST).json(measurement_data);
      } else {
        logger.trace(
          "Successfully inserted measurement data = ",
          measurement_data
        );
        return res.status(config.OK_STATUS).json(measurement_data);
      }
    } else {
      let error = {
        status: 0,
        message: "Error occured while finding Exercise Types",
        error: "Body Measurement is already exits"
      };
      return res.status(config.BAD_REQUEST).json(error);
    }
  }
});

async function badgesAssign(authUserId) {
  // badge_assign start;
  var resp_data = await measurement_helper.get_body_measurement_id(
    {
      userId: authUserId
    },
    {
      logDate: -1
    }
  );
  var heartRate = await measurement_helper.heart_rate_data({
    userId: authUserId
  });

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
    weight_gain: resp_data.measurement.weight,
    weight_loss: resp_data.measurement.weight,
    heart_rate_total: heartRate.heart_rate.heart_rate_total,
    heart_rate_average: heartRate.heart_rate.heart_rate_average,
    heart_rate_most: heartRate.heart_rate.heart_rate_most,
    heart_rate_least: heartRate.heart_rate.heart_rate_least
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

async function countBodyMeasurementsOfUser(userAuthId) {
  const count = await measurement_helper.countByUser({ userId: userAuthId });
  return count;
}

module.exports = router;
