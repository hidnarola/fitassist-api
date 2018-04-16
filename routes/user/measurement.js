var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var measurement_helper = require("../../helpers/measurement_helper");

/**
 * @api {get} /user/measurement/userid/:measurement_by_userid Get by User ID
 * @apiName Get by User ID
 * @apiGroup Measurement
 *
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiSuccess (Success 200) {Array} measurement Array of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/userid/:measurement_by_userid", async (req, res) => {
  measurement_by_userid = req.params.measurement_by_userid;
  logger.trace("Get all measurement API called");
  var resp_data = await measurement_helper.get_body_measurement_id({userId:measurement_by_userid});
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching get_body_measurement_by_userid = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("body_measurement got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});


/**
 * @api {put} /user/measurement/:measurement_id Update
 * @apiName Update
 * @apiGroup Measurement
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



module.exports = router;
