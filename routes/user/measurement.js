var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var measurement_helper = require("../../helpers/measurement_helper");
var common_helper = require("../../helpers/common_helper");


/**
 * @api {post} /user/measurement/get_by_id_logdate Get User Measurement
 * @apiName Get User Measurement by User Id and LogDate
 * @apiGroup User Measurement
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiParam {String} userId userId of User Collection
 * @apiParam {Date} logDate logDate of bodymesurement
 * @apiSuccess (Success 200) {Array}  measurement  data of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/get_by_id_logdate", async (req, res) => {
  userId = req.body.userId;
  logDate = req.body.logDate;
  var schema = {
    userId: {
      notEmpty: true,
      errorMessage: "User ID is required"
    },
    logDate: {
      notEmpty: true,
      errorMessage: "Log Date is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    logger.trace("Get measurement by User ID and logDate API called");
    var resp_data = await measurement_helper.get_body_measurement_id({
      userId: userId,
      logDate:logDate
    });
    if (resp_data.status == 0) {
      logger.error(
        "Error occured while fetching get_body_measurement_by_userid and logDate = ",
        resp_data
      );
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("body_measurement got successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});


/**
 * @api {post} /user/measurement Add
 * @apiName Add
 * @apiGroup User - Measurement
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token User's unique access-key
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
  var schema = {
    userId: {
      notEmpty: true,
      errorMessage: "User ID is required"
    },
    logDate: {
      notEmpty: true,
      errorMessage: "Log Date is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var measurement_obj = {
      
        userId:		req.body.userId?req.body.userId:0,
        logDate:	req.body.logDate?req.body.logDate:0,
        neck:		req.body.neck?req.body.neck:0,
        shoulders:	req.body.shoulders?req.body.shoulders:0,
        chest:		req.body.chest?req.body.chest:0, 
        upperArm:	req.body.upperArm?req.body.upperArm:0,
        waist:		req.body.waist?req.body.waist:0,
        forearm:	req.body.forearm?req.body.forearm:0, 
        hips:		req.body.hips?req.body.hips:0,
        thigh:		req.body.thigh?req.body.thigh:0,
        calf:		req.body.calf?req.body.calf:0,
        weight:		req.body.weight?req.body.weight:0,
        height:		req.body.height?req.body.height:0
      };


      let measurement_data = await measurement_helper.insert_body_measurement(measurement_obj);
      if (measurement_data.status === 0) {
      logger.error("Error while inserting measurement data = ", measurement_data);
      return res.status(config.BAD_REQUEST).json({ measurement_data });
      } else {
      return res.status(config.OK_STATUS).json(measurement_data);
      }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

/**
 * @api {put} /user/measurement/:measurement_id Update
 * @apiName Update
 * @apiGroup User - Measurement
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token User's unique access-key
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
 * @apiSuccess (Success 200) {Array}  measurement of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:measurement_id", async (req, res) => {
  var schema = {
    userId: {
      notEmpty: true,
      errorMessage: "User ID is required"
    },
    logDate: {
      notEmpty: true,
      errorMessage: "Log Date is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var measurement_obj = {
      userId: req.body.userId ? req.body.userId : 0,
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
      req.params.measurement_id,
      measurement_obj
    );
    if (measurement_data.status === 0) {
      logger.error(
        "Error while updating measurement data = ",
        measurement_data
      );
      return res.status(config.BAD_REQUEST).json({ measurement_data });
    } else {
      return res.status(config.OK_STATUS).json(measurement_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

module.exports = router;
