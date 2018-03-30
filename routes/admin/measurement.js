var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var measurement_helper = require("../../helpers/measurement_helper");

/**
 * @api {get} /admin/measurement Body Measurement - Get all
 * @apiName Body Measurement - Get all
 * @apiGroup Admin
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiSuccess (Success 200) {Array} measurements Array of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all measurement API called");
  var resp_data = await measurement_helper.get_all_measurement();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching measurement = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Measurement got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/measurement/:measurement_by_id Body Measurement - Get by ID
 * @apiName Body Measurement -  - Get by ID
 * @apiGroup Admin
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * * @apiParam {String} measurement_by_id ID of Body measurement

 * @apiSuccess (Success 200) {Array} measurement Array of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:measurement_by_id", async (req, res) => {
  measurement_by_id = req.params.measurement_by_id;
  logger.trace("Get all exercise API called");
  var resp_data = await measurement_helper.get_body_measurement_id(measurement_by_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching get_body_measurement_by_id = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("body_measurement got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/measurement Body Measurement Add
 * @apiName Body Measurement - Add
 * @apiGroup Admin
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
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
 * @api {put} /admin/measurement/:measurement_id Body Measurement Update
 * @apiName Body Measurement - Update
 * @apiGroup Admin
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
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


      let measurement_data = await measurement_helper.update_body_measurement(req.params.measurement_id,measurement_obj);
      if (measurement_data.status === 0) {
      logger.error("Error while updating measurement data = ", measurement_data);
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
 * @api {delete} /admin/measurement/:measurement_id Body Measurement Delete
 * @apiName Body Measurement - Delete
 * @apiGroup Admin
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:measurement_id", async (req, res) => {
  logger.trace("Delete Measurement API - Id = ", req.query.id);
  let measurement_data = await measurement_helper.delete_measurement_by_id(
    req.params.measurement_id
  );

  if (measurement_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(measurement_data);
  } else {
    res.status(config.OK_STATUS).json(measurement_data);
  }
});

module.exports = router;
