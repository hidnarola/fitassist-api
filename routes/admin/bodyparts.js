var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var body_part_helper = require("../../helpers/body_parts_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/bodyparts/filter Filter
 * @apiName Filter
 * @apiDescription Request Object :<pre><code>{
  pageSize: 10,
  page: 0,
  columnFilter: [
    {
      id: "firstName",
      value: "mi"
    }
  ],
  columnSort: [
    {
      id: "firstName",
      value: true
    }
  ],
  columnFilterEqual: [
    {
      id: "email",
      value: "amc@narola.email"
    }
  ]
 * }</code></pre>
 * @apiGroup BodyPart
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_bodypart filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await body_part_helper.get_filtered_records(filter_object);
  if (filtered_data.status === 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.BAD_REQUEST).json(filtered_data);
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});


/**
 * @api {get} /admin/bodypart Get all
 * @apiName Get all
 * @apiGroup  Body Parts
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} bodyparts Array of bodyparts document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all body parts API called");
  var resp_data = await body_part_helper.get_all_body_parts({
    isDeleted: 0
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching body parts = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Body Parts got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/bodypart/body_part_id Get by ID
 * @apiName Get by ID
 * @apiGroup  Body Parts
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {JSON} bodypart JSON of Body part document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:body_part_id", async (req, res) => {
  logger.trace("Get all Body part API called");
  var resp_data = await body_part_helper.get_body_part_id(req.params.body_part_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching body part = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Body part got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/bodypart  Add
 * @apiName Add
 * @apiGroup  Body Parts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} bodypart Name of Body Part
 * @apiSuccess (Success 200) {JSON} bodypart added Bodypart detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var schema = {
    bodypart: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Body Part should be between 3 to 50 characters',
        options: {
          min: 3,
          max: 50
        }
      },
      errorMessage: "Body Part is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var body_part_obj = {
      bodypart: req.body.bodypart
    };

    let body_part_data = await body_part_helper.insert_body_part(body_part_obj);
    if (body_part_data.status == 0) {
      logger.error("Error while inserting bodypart data = ", body_part_data);
      return res.status(config.INTERNAL_SERVER_ERROR).json({
        body_part_data
      });
    } else {
      logger.trace("Insert Body Part Successfully = ", req.params.body_part_id);
      return res.status(config.OK_STATUS).json(body_part_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/bodypart/:body_part_id Update
 * @apiName Update
 * @apiGroup  Body Parts
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} bodypart Name of Body Part
 * @apiSuccess (Success 200) {JSON} bodypart JSON of bodypart document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:body_part_id", async (req, res) => {
  var schema = {
    bodypart: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Body Part should be between 3 to 50 characters',
        options: {
          min: 3,
          max: 50
        }
      },
      errorMessage: "Body Part is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var body_part_obj = {
      bodypart: req.body.bodypart,
      modifiedAt: new Date()
    };

    let body_part_data = await body_part_helper.update_bodypart_by_id(
      req.params.body_part_id,
      body_part_obj
    );
    if (body_part_data.status == 0) {
      logger.error("Error while updating Body Part data = ", body_part_data);
      return res.status(config.INTERNAL_SERVER_ERROR).json({
        body_part_data
      });
    } else {
      logger.trace("Update Body Part Successfully = ", req.params.body_part_id);
      return res.status(config.OK_STATUS).json(body_part_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /admin/bodypart/:body_part_id Delete
 * @apiName Delete
 * @apiGroup  Body Parts
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:body_part_id", async (req, res) => {
  logger.trace("Delete Body Part API - Id = ", req.params.body_part_id);
  let body_part_data = await body_part_helper.update_bodypart_by_id(
    mongoose.Types.ObjectId(req.params.body_part_id), {
      isDeleted: 1
    }
  );

  if (body_part_data.status == 0) {
    logger.error("Failed to Delete Body Part = ", req.params.body_part_id);
    body_part_data.message = "Body Part not deleted"
    res.status(config.INTERNAL_SERVER_ERROR).json(body_part_data);
  } else {
    body_part_data.message = "Body Part deleted"
    logger.trace("Delete Body Part Successfully = ", req.params.body_part_id);
    res.status(config.OK_STATUS).json(body_part_data);
  }
});

/**
 * @api {put} /admin/bodypart/undo/:body_part_id Undo
 * @apiName Undo
 * @apiGroup  Body Parts
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/undo/:body_part_id", async (req, res) => {
  logger.trace("Undo Body Part API - Id = ", req.params.body_part_id);
  let body_part_data = await body_part_helper.update_bodypart_by_id(
    mongoose.Types.ObjectId(req.params.body_part_id), {
      isDeleted: 0
    }
  );
  if (body_part_data.status == 0) {
    body_part_data.message = "Body Part not recovered"
    logger.trace("failed to Undo Body Part = ", req.params.body_part_id);
    res.status(config.INTERNAL_SERVER_ERROR).json(body_part_data);
  } else {
    body_part_data.message = "Body Part recovered"
    logger.trace("Undo Body Part Successfully = ", req.params.body_part_id);
    res.status(config.OK_STATUS).json(body_part_data);
  }
});

module.exports = router;