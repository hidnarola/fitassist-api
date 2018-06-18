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
 * @apiParam {Object} timeType timeType of badge
 * @apiParam {Object} [timeWindowType] timeWindowType of badge | possible values<code>["day", "week", "month", "year"]</code>
 * @apiParam {Object} [duration] duration of badge
 * @apiParam {Number} point point of badge
 * @apiSuccess (Success 200) {JSON} badge added badge detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name is required"
    },
    task: {
      notEmpty: true,
      isIn: {
        options: [
          [
            "profile_update",
            "friends",
            "post",
            "weight_gain",
            "weight_loss",
            "body_fat_gain",
            "body_fat_loss",
            "body_fat_average",
            "body_fat_most",
            "body_fat_least",
            "neck_measurement_gain",
            "neck_measurement_loss",
            "shoulders_measurement_gain",
            "shoulders_measurement_loss",
            "chest_measurement_gain",
            "chest_measurement_loss",
            "upper_arm_measurement_gain",
            "upper_arm_measurement_loss",
            "waist_measurement_gain",
            "waist_measurement_loss",
            "forearm_measurement_gain",
            "forearm_measurement_loss",
            "hips_measurement_gain",
            "hips_measurement_loss",
            "thigh_measurement_gain",
            "thigh_measurement_loss",
            "calf_measurement_gain",
            "calf_measurement_loss",
            "weight_lifted_total",
            "weight_lifted_average",
            "weight_lifted_most",
            "weight_lifted_least",
            "workouts_total",
            "workouts_average",
            "reps_least",
            "reps_total",
            "reps_average",
            "reps_most",
            "sets_least",
            "sets_total",
            "sets_average",
            "sets_most",
            "running_distance_total",
            "running_distance_average",
            "running_distance_most",
            "running_distance_least",
            "running_time_average",
            "running_time_total",
            "running_elevation_total",
            "running_elevation_average",
            "heart_rate_total",
            "heart_rate_average",
            "heart_rate_most",
            "heart_rate_least",
            "heart_rate_resting_total",
            "heart_rate_resting_average",
            "heart_rate_resting_most",
            "heart_rate_resting_least",
            "cycle_distance_total",
            "cycle_distance_average",
            "cycle_distance_most",
            "cycle_distance_least",
            "cycle_time_total",
            "cycle_time_average",
            "cycle_elevation_total",
            "cycle_elevation_average",
            "steps_total",
            "steps_average",
            "steps_most",
            "steps_least",
            "calories_total",
            "calories_average",
            "calories_most",
            "calories_least",
            "calories_excess",
            "fat_saturated_total",
            "fat_saturated_average",
            "fat_saturated_most",
            "fat_saturated_least",
            "fat_saturated_excess",
            "fat_trans_total",
            "fat_trans_average",
            "fat_trans_most",
            "fat_trans_least",
            "fat_trans_excess",
            "folate_total",
            "folate_average",
            "folate_most",
            "folate_least",
            "folate_excess",
            "potassium_total",
            "potassium_average",
            "potassium_most",
            "potassium_least",
            "potassium_excess",
            "magnesium_total",
            "magnesium_average",
            "magnesium_most",
            "magnesium_least",
            "magnesium_excess",
            "sodium_total",
            "sodium_average",
            "sodium_most",
            "sodium_least",
            "sodium_excess",
            "protein_total",
            "protein_average",
            "protein_most",
            "protein_least",
            "protein_excess",
            "calcium_total",
            "calcium_average",
            "calcium_most",
            "calcium_least",
            "calcium_excess",
            "carbs_total",
            "carbs_average",
            "carbs_most",
            "carbs_least",
            "carbs_excess",
            "cholesterol_total",
            "cholesterol_average",
            "cholesterol_most",
            "cholesterol_least",
            "cholesterol_excess",
            "fat_polyunsaturated_total",
            "fat_polyunsaturated_average",
            "fat_polyunsaturated_most",
            "fat_polyunsaturated_least",
            "fat_polyunsaturated_excess",
            "cholesterol_total",
            "cholesterol_average",
            "cholesterol_most",
            "cholesterol_least",
            "cholesterol_excess",
            "fat_monounsaturated_total",
            "fat_monounsaturated_average",
            "fat_monounsaturated_most",
            "fat_monounsaturated_least",
            "fat_monounsaturated_excess",
            "fat_polyunsaturated_total",
            "fat_polyunsaturated_average",
            "fat_polyunsaturated_most",
            "fat_polyunsaturated_least",
            "fat_polyunsaturated_excess",
            "iron_total",
            "iron_average",
            "iron_most",
            "iron_least",
            "iron_excess",
            "sodium_total",
            "sodium_average",
            "sodium_most",
            "sodium_least",
            "sodium_excess",
            "protein_total",
            "protein_average",
            "protein_most",
            "protein_least",
            "protein_excess",
            "fiber_total",
            "fiber_average",
            "fiber_most",
            "fiber_least",
            "fiber_excess"
          ]
        ],
        errorMessage: "Invalid task"
      },
      errorMessage: "Task is required"
    },
    unit: {
      notEmpty: true,
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
        errorMessage: "Unit is invalid"
      },
      errorMessage: "Unit is required"
    },
    value: {
      notEmpty: true,
      errorMessage: "Target is required"
    },
    point: {
      notEmpty: true,
      errorMessage: "Points are required"
    },
    timeType: {
      notEmpty: true,
      isIn: {
        options: [["standard", "time_window"]],
        errorMessage: "Time Type is invalid"
      },
      errorMessage: "Time Type is required"
    }
  };
  if (req.body.timeType && req.body.timeType == "time_window") {
    schema.duration = {
      notEmpty: true,
      errorMessage: "Duration is required"
    };
  }
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
      point: req.body.point,
      timeType: req.body.timeType
    };
    if (req.body.duration) {
      badge_obj.duration = req.body.duration;
    }
    if (req.body.timeWindowType) {
      badge_obj.timeWindowType = req.body.timeWindowType;
      switch (req.body.timeWindowType) {
        case "day":
          badge_obj.baseDuration = req.body.duration;
          break;
        case "week":
          badge_obj.baseDuration = req.body.duration * 7;
          break;
        case "month":
          badge_obj.baseDuration = req.body.duration * 30;
          break;
        case "year":
          badge_obj.baseDuration = req.body.duration * 365;
          break;
        default:
          badge_obj.baseDuration = req.body.duration;
          break;
      }
    }

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
 * @apiParam {String} [name] Name of badge
 * @apiParam {String} [descriptionCompleted] description of Completed badge
 * @apiParam {String} [descriptionInCompleted] description of InCompleted badge
 * @apiParam {String} [unit] unit of badge
 * @apiParam {Number} [value] value of badge
 * @apiParam {String} [task] task of badge
 * @apiParam {Object} [timeType] timeType of badge
 * @apiParam {Object} [timeWindowType] timeWindowType of badge | possible values<code>["day", "week", "month", "year"]</code>
 * @apiParam {Object} [duration] duration of badge
 * @apiParam {Number} [point] point of badge
 * @apiParam {Number} [status] status of badge
 * @apiSuccess (Success 200) {JSON} badge added badge detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:badge_id", async (req, res) => {
  badge_id = req.params.badge_id;
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name is required"
    },
    task: {
      notEmpty: true,
      isIn: {
        options: [
          [
            "profile_update",
            "friends",
            "post",
            "weight_gain",
            "weight_loss",
            "body_fat_gain",
            "body_fat_loss",
            "body_fat_average",
            "body_fat_most",
            "body_fat_least",
            "neck_measurement_gain",
            "neck_measurement_loss",
            "shoulders_measurement_gain",
            "shoulders_measurement_loss",
            "chest_measurement_gain",
            "chest_measurement_loss",
            "upper_arm_measurement_gain",
            "upper_arm_measurement_loss",
            "waist_measurement_gain",
            "waist_measurement_loss",
            "forearm_measurement_gain",
            "forearm_measurement_loss",
            "hips_measurement_gain",
            "hips_measurement_loss",
            "thigh_measurement_gain",
            "thigh_measurement_loss",
            "calf_measurement_gain",
            "calf_measurement_loss",
            "weight_lifted_total",
            "weight_lifted_average",
            "weight_lifted_most",
            "weight_lifted_least",
            "workouts_total",
            "workouts_average",
            "reps_least",
            "reps_total",
            "reps_average",
            "reps_most",
            "sets_least",
            "sets_total",
            "sets_average",
            "sets_most",
            "running_distance_total",
            "running_distance_average",
            "running_distance_most",
            "running_distance_least",
            "running_time_average",
            "running_time_total",
            "running_elevation_total",
            "running_elevation_average",
            "heart_rate_total",
            "heart_rate_average",
            "heart_rate_most",
            "heart_rate_least",
            "heart_rate_resting_total",
            "heart_rate_resting_average",
            "heart_rate_resting_most",
            "heart_rate_resting_least",
            "cycle_distance_total",
            "cycle_distance_average",
            "cycle_distance_most",
            "cycle_distance_least",
            "cycle_time_total",
            "cycle_time_average",
            "cycle_elevation_total",
            "cycle_elevation_average",
            "steps_total",
            "steps_average",
            "steps_most",
            "steps_least",
            "calories_total",
            "calories_average",
            "calories_most",
            "calories_least",
            "calories_excess",
            "fat_saturated_total",
            "fat_saturated_average",
            "fat_saturated_most",
            "fat_saturated_least",
            "fat_saturated_excess",
            "fat_trans_total",
            "fat_trans_average",
            "fat_trans_most",
            "fat_trans_least",
            "fat_trans_excess",
            "folate_total",
            "folate_average",
            "folate_most",
            "folate_least",
            "folate_excess",
            "potassium_total",
            "potassium_average",
            "potassium_most",
            "potassium_least",
            "potassium_excess",
            "magnesium_total",
            "magnesium_average",
            "magnesium_most",
            "magnesium_least",
            "magnesium_excess",
            "sodium_total",
            "sodium_average",
            "sodium_most",
            "sodium_least",
            "sodium_excess",
            "protein_total",
            "protein_average",
            "protein_most",
            "protein_least",
            "protein_excess",
            "calcium_total",
            "calcium_average",
            "calcium_most",
            "calcium_least",
            "calcium_excess",
            "carbs_total",
            "carbs_average",
            "carbs_most",
            "carbs_least",
            "carbs_excess",
            "cholesterol_total",
            "cholesterol_average",
            "cholesterol_most",
            "cholesterol_least",
            "cholesterol_excess",
            "fat_polyunsaturated_total",
            "fat_polyunsaturated_average",
            "fat_polyunsaturated_most",
            "fat_polyunsaturated_least",
            "fat_polyunsaturated_excess",
            "cholesterol_total",
            "cholesterol_average",
            "cholesterol_most",
            "cholesterol_least",
            "cholesterol_excess",
            "fat_monounsaturated_total",
            "fat_monounsaturated_average",
            "fat_monounsaturated_most",
            "fat_monounsaturated_least",
            "fat_monounsaturated_excess",
            "fat_polyunsaturated_total",
            "fat_polyunsaturated_average",
            "fat_polyunsaturated_most",
            "fat_polyunsaturated_least",
            "fat_polyunsaturated_excess",
            "iron_total",
            "iron_average",
            "iron_most",
            "iron_least",
            "iron_excess",
            "sodium_total",
            "sodium_average",
            "sodium_most",
            "sodium_least",
            "sodium_excess",
            "protein_total",
            "protein_average",
            "protein_most",
            "protein_least",
            "protein_excess",
            "fiber_total",
            "fiber_average",
            "fiber_most",
            "fiber_least",
            "fiber_excess"
          ]
        ],
        errorMessage: "Invalid task"
      },
      errorMessage: "Task is required"
    },
    unit: {
      notEmpty: true,
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
        errorMessage: "Unit is invalid"
      },
      errorMessage: "Unit is required"
    },
    value: {
      notEmpty: true,
      errorMessage: "Target is required"
    },
    point: {
      notEmpty: true,
      errorMessage: "Points are required"
    },
    timeType: {
      notEmpty: true,
      isIn: {
        options: [["standard", "time_window"]],
        errorMessage: "Time Type is invalid"
      },
      errorMessage: "Time Type is required"
    }
  };
  if (req.body.timeType && req.body.timeType == "time_window") {
    schema.duration = {
      notEmpty: true,
      errorMessage: "Duration is required"
    };
  }
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
      point: req.body.point,
      timeType: req.body.timeType,
      status: req.body.status
    };

    if (req.body.duration) {
      badge_obj.duration = req.body.duration;
    }
    if (req.body.timeWindowType) {
      badge_obj.timeWindowType = req.body.timeWindowType;
      switch (req.body.timeWindowType) {
        case "day":
          badge_obj.baseDuration = req.body.duration;
          break;
        case "week":
          badge_obj.baseDuration = req.body.duration * 7;
          break;
        case "month":
          badge_obj.baseDuration = req.body.duration * 30;
          break;
        case "year":
          badge_obj.baseDuration = req.body.duration * 365;
          break;
        default:
          badge_obj.baseDuration = req.body.duration;
          break;
      }
    }

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
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
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

/**
 * @api {put} /admin/badge/undo/:badge_id Undo
 * @apiName Undo
 * @apiGroup  Badge
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/undo/:badge_id", async (req, res) => {
  logger.trace("undo badge API - Id = ", req.params.badge_id);
  let badge_data = await badge_helper.undo_badge_by_id(req.params.badge_id);

  if (badge_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(badge_data);
  } else {
    res.status(config.OK_STATUS).json(badge_data);
  }
});

module.exports = router;
