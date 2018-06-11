var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var badge_helper = require("../../helpers/badge_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/badge/filter Filter
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
      value: "ake@narola.email"
    }
  ]
 * }</code></pre>
 * @apiGroup Badge
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_badges filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await badge_helper.get_filtered_records(filter_object);
  if (filtered_data.status === 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.BAD_REQUEST).json(filtered_data);
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});

/**
 * @api {get} /admin/badge Get all
 * @apiName Get all
 * @apiGroup  Badge
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} badges Array of badges document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all badges API called");
  var resp_data = await badge_helper.get_badges();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching  badges = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("badges got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/badge/badge_id Get by ID
 * @apiName Get Badge by ID
 * @apiGroup  Badge
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} badge Array of badges document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:badge_id", async (req, res) => {
  badge_id = req.params.badge_id;
  logger.trace("Get all badge API called");
  var resp_data = await badge_helper.get_badge_id(badge_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching badge = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("badge got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/badge  Add
 * @apiName Add
 * @apiGroup  Badge
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of badge
 * @apiParam {String} descriptionCompleted description of Completed badge
 * @apiParam {String} descriptionInCompleted description of InCompleted badge
 * @apiParam {String} unit unit of badge
 * @apiParam {Number} value value of badge
 * @apiParam {String} task task of badge
 * @apiParam {Object} duration duration of badge
 * @apiParam {Number} point point of badge
 * @apiSuccess (Success 200) {JSON} badge added badge detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name of Task is required"
    },
    task: {
      notEmpty: true,
      errorMessage: "task is required"
    },
    unit: {
      notEmpty: false,
      isIn: {
        options: [
          [
            "n/a",
            "cm",
            "feet",
            "kg",
            "lb",
            "percentage",
            "in",
            "number",
            "hour",
            "minute",
            "meter",
            "km",
            "mile",
            "g",
            "mg"
          ]
        ],
        errorMessage:
          "unit must be from n/a, cm, feet, kg, lb, percentage, in, number,hour, minute,km, meter, mile, g or mg"
      },
      errorMessage: "unit is required"
    },
    value: {
      notEmpty: true,
      errorMessage: "value is required"
    },
    duration: {
      notEmpty: true,
      errorMessage: "duration is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var badge_obj = {
      name: req.body.name,
      task: req.body.task,
      descriptionCompleted: req.body.descriptionCompleted,
      descriptionInCompleted: req.body.descriptionInCompleted,
      unit: req.body.unit,
      value: req.body.value,
      duration: req.body.duration
    };

    let base_value_and_unit = await common_helper.unit_converter(
      req.body.value,
      req.body.unit
    );

    badge_obj.baseValue = base_value_and_unit.baseValue;
    badge_obj.baseUnit = base_value_and_unit.baseUnit;

    // console.log("badge_obj", badge_obj);
    // return res.send(badge_obj);
    let badge_data = await badge_helper.insert_badge(badge_obj);
    if (badge_data.status === 0) {
      logger.error("Error while inserting badge data = ", badge_data);
      return res.status(config.BAD_REQUEST).json({ badge_data });
    } else {
      return res.status(config.OK_STATUS).json(badge_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {put} /admin/badge  Update
 * @apiName Update
 * @apiGroup  Badge
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of badge
 * @apiParam {String} descriptionCompleted description of Completed badge
 * @apiParam {String} descriptionInCompleted description of InCompleted badge
 * @apiParam {String} unit unit of badge
 * @apiParam {Number} value value of badge
 * @apiParam {String} task task of badge
 * @apiParam {Object} duration duration of badge
 * @apiParam {Number} point point of badge
 * @apiSuccess (Success 200) {JSON} badge added badge detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:badge_id", async (req, res) => {
  badge_id = req.params.badge_id;

  var badge_obj = {
    name: req.body.name,
    task: req.body.task,
    descriptionCompleted: req.body.descriptionCompleted,
    descriptionInCompleted: req.body.descriptionInCompleted,
    unit: req.body.unit,
    value: req.body.value,
    duration: req.body.duration
  };

  let base_value_and_unit = await common_helper.unit_converter(
    req.body.value,
    req.body.unit
  );

  badge_obj.baseValue = base_value_and_unit.baseValue;
  badge_obj.baseUnit = base_value_and_unit.baseUnit;

  let badge_data = await badge_helper.update_badge_by_id(badge_id, badge_obj);
  if (badge_data.status === 0) {
    logger.error("Error while updating badge data = ", badge_data);
    return res.status(config.BAD_REQUEST).json({ badge_data });
  } else {
    return res.status(config.OK_STATUS).json(badge_data);
  }
});

/**
 * @api {delete} /admin/badge/:badge_id Delete
 * @apiName Delete
 * @apiGroup  Badge
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:badge_id", async (req, res) => {
  logger.trace("Delete badge API - Id = ", req.body.badge_id);
  let badge_data = await badge_helper.delete_badge_by_id(req.params.badge_id);

  if (badge_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(badge_data);
  } else {
    res.status(config.OK_STATUS).json(badge_data);
  }
});

module.exports = router;
