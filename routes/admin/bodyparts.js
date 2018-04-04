var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var body_part_helper = require("../../helpers/body_parts_helper");

/**
 * @api {get} /admin/bodypart Body Parts - Get all
 * @apiName Body Parts - Get all
 * @apiGroup Admin
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} bodyparts Array of bodyparts document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {

    logger.trace("Get all exercise API called");
    var resp_data = await body_part_helper.get_all_body_parts();
    if (resp_data.status == 0) {
      logger.error("Error occured while fetching body parts = ", resp_data);
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("Body Parts got successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  });

/**
 * @api {get} /admin/bodypart/body_part_id Body Parts - Get by ID
 * @apiName Body Part - Body Parts by ID
 * @apiGroup Admin
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} body_part_id ID of Body part
 * @apiSuccess (Success 200) {Array} bodypart Array of Body part document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:body_part_id", async (req, res) => {
    body_part_id = req.params.body_part_id;
  logger.trace("Get all Body part API called");
  var resp_data = await body_part_helper.get_body_part_id(body_part_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching body part = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Body part got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/bodypart Body Parts - Add
 * @apiName Body Parts - Add
 * @apiGroup Admin
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} bodypart Name of Body Part
 * @apiSuccess (Success 200) {JSON} bodypart added Bodypart detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
    var schema = {
        "bodypart": {
            notEmpty: true,
            errorMessage: "Body Part name is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    
    if (!errors) {
        var body_part_obj = {
            "bodypart": req.body.bodypart,
            };

            let body_part_data = await body_part_helper.insert_body_part(body_part_obj);
            if (body_part_data.status === 0) {
                logger.error("Error while inserting bodypart data = ", body_part_data);
                return res.status(config.BAD_REQUEST).json({ body_part_data });
            } else {
                return res.status(config.OK_STATUS).json(body_part_data);
            }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }
});

/**
 * @api {put} /admin/bodypart Body Parts - Update
 * @apiName Body Parts - Update
 * @apiGroup Admin
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} bodypart Name of Body Part
 * @apiSuccess (Success 200) {Array} bodypart Array of bodypart document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:body_part_id", async (req, res) => {
    body_part_id = req.params.body_part_id;
    console.log(body_part_id);
    var schema = {
        "bodypart": {
            notEmpty: true,
            errorMessage: "Body Part name is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    
    if (!errors) {
        var body_part_obj = {
            "bodypart": req.body.bodypart,
            };

            let body_part_data = await body_part_helper.update_bodypart_by_id(body_part_id,body_part_obj);
            if (body_part_data.status === 0) {
                logger.error("Error while updating bodypart data = ", body_part_data);
                return res.status(config.BAD_REQUEST).json({ body_part_data });
            } else {
                return res.status(config.OK_STATUS).json(body_part_data);
            }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }

});

/**
 * @api {delete} /admin/bodypart/:body_part_id Body Parts - Delete
 * @apiName Body Parts - Delete  
 * @apiGroup Admin
 * 
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:body_part_id", async (req, res) => {

  logger.trace("Delete Body Part API - Id = ", req.query.id);
  let bodypart_data = await body_part_helper.delete_bodypart_by_id(
    req.params.body_part_id
  );

  if (bodypart_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(bodypart_data);
  } else {
    res.status(config.OK_STATUS).json(bodypart_data);
  }
});

module.exports = router;