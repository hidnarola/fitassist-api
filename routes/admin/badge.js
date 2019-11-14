var express = require("express");
var _ = require("underscore");
var router = express.Router();
var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;
var badge_helper = require("../../helpers/badge_helper");
var common_helper = require("../../helpers/common_helper");
var jwtDecode = require("jwt-decode");

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
  logger.trace("Get all badge API called ID: " + req.params.badge_id);
  var resp_data = await badge_helper.get_badge_id(req.params.badge_id);
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
 * @apiParam {Object} timeType timeType of badge | possible values<code>["standard", "time_window"]</code>
 * @apiParam {Object} [timeWindowType] timeWindowType of badge | possible values<code>["day", "week", "month", "year"]</code>
 * @apiParam {Object} [duration] duration of badge
 * @apiParam {Number} point point of badge
 * @apiSuccess (Success 200) {JSON} badge added badge detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["x-access-token"]);
  var role = "admin";
  var userID = decoded.id;
  console.log("===========authUserId===========");
  console.log(decoded);
  console.log(role);
  console.log("==========================");
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: "Name should be between 3 to 100 chars long",
        options: {
          min: 3,
          max: 100
        }
      },
      errorMessage: "Name is required"
    },
    task: {
      notEmpty: true,
      isIn: {
        options: [
          _.union(
            constant.BADGES_TYPE.PROFILE,
            constant.BADGES_TYPE.PROFILE,
            constant.BADGES_TYPE.BODY_MASS,
            constant.BADGES_TYPE.BODY_FAT,
            constant.BADGES_TYPE.BODY_MEASUREMENT,
            constant.BADGES_TYPE.WEIGHT_LIFTED,
            constant.BADGES_TYPE.WORKOUTS,
            constant.BADGES_TYPE.RUNNING,
            constant.BADGES_TYPE.HEART_RATE,
            constant.BADGES_TYPE.CYCLE,
            constant.BADGES_TYPE.STEPS,
            constant.BADGES_TYPE.CALORIES,
            constant.BADGES_TYPE.NUTRITIONS
          )
        ],
        errorMessage: "Task is invalid"
      },
      errorMessage: "Task is required"
    },
    unit: {
      notEmpty: true,
      isIn: {
        options: [constant.BADGES_UNIT],
        errorMessage: "Unit is invalid"
      },
      errorMessage: "Unit is required"
    },
    value: {
      notEmpty: true,
      isInt: {
        errorMessage: "Target should be greater than 0",
        options: {
          gt: 0
        }
      },
      errorMessage: "Target is required"
    },
    point: {
      notEmpty: true,
      isInt: {
        errorMessage: "Point should be greater than 0",
        options: {
          gt: 0
        }
      },
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
    var category = await find_badges_category(req.body.task);
    var badge_obj = {
      userId: userID,
      role: "admin",
      name: req.body.name,
      task: req.body.task,
      category: category,
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

    let badge_data = await badge_helper.insert_badge(badge_obj);
    if (badge_data.status === 0) {
      logger.error("Error while inserting badge data = ", badge_data);
      return res.status(config.BAD_REQUEST).json({
        badge_data
      });
    } else {
      return res.status(config.OK_STATUS).json(badge_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
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
 * @apiParam {Object} [timeType] timeType of badge | possible values<code>["standard", "time_window"]</code>
 * @apiParam {Object} [timeWindowType] timeWindowType of badge | possible values<code>["day", "week", "month", "year"]</code>
 * @apiParam {Object} [duration] duration of badge
 * @apiParam {Number} [point] point of badge
 * @apiParam {Number} [status] status of badge
 * @apiSuccess (Success 200) {JSON} badge updated badge detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:badge_id", async (req, res) => {
  badge_id = req.params.badge_id;
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: "Name should be between 3 to 100 chars long",
        options: {
          min: 3,
          max: 100
        }
      },
      errorMessage: "Name is required"
    },
    task: {
      notEmpty: true,
      isIn: {
        options: [
          _.union(
            constant.BADGES_TYPE.PROFILE,
            constant.BADGES_TYPE.PROFILE,
            constant.BADGES_TYPE.BODY_MASS,
            constant.BADGES_TYPE.BODY_FAT,
            constant.BADGES_TYPE.BODY_MEASUREMENT,
            constant.BADGES_TYPE.WEIGHT_LIFTED,
            constant.BADGES_TYPE.WORKOUTS,
            constant.BADGES_TYPE.RUNNING,
            constant.BADGES_TYPE.HEART_RATE,
            constant.BADGES_TYPE.CYCLE,
            constant.BADGES_TYPE.STEPS,
            constant.BADGES_TYPE.CALORIES,
            constant.BADGES_TYPE.NUTRITIONS
          )
        ],
        errorMessage: "Task is invalid"
      },
      errorMessage: "Task is required"
    },
    unit: {
      notEmpty: true,
      isIn: {
        options: [constant.BADGES_UNIT],
        errorMessage: "Unit is invalid"
      },
      errorMessage: "Unit is required"
    },
    value: {
      notEmpty: true,
      isInt: {
        errorMessage: "Target should be greater than 0",
        options: {
          gt: 0
        }
      },
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
    var category = await find_badges_category(req.body.task);

    var badge_obj = {
      name: req.body.name,
      task: req.body.task,
      category: category,
      descriptionCompleted: req.body.descriptionCompleted,
      descriptionInCompleted: req.body.descriptionInCompleted,
      unit: req.body.unit,
      value: req.body.value,
      point: req.body.point,
      timeType: req.body.timeType,
      status: req.body.status,
      modifiedAt: new Date()
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
      return res.status(config.BAD_REQUEST).json({
        badge_data
      });
    } else {
      return res.status(config.OK_STATUS).json(badge_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /admin/badge/:badge_id Delete
 * @apiName Delete
 * @apiGroup  Badge
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
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
 * @api {get} /admin/badge/undo/:badge_id Undo
 * @apiName Undo
 * @apiGroup  Badge
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/undo/:badge_id", async (req, res) => {
  logger.trace("undo badge API - Id = ", req.params.badge_id);
  let badge_data = await badge_helper.undo_badge_by_id(req.params.badge_id);

  if (badge_data.status == 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(badge_data);
  } else {
    res.status(config.OK_STATUS).json(badge_data);
  }
});

async function find_badges_category(badgestask) {
  var categoryName = "";
  var badges_keys = Object.keys(constant.BADGES_TYPE);
  _.each(badges_keys, function(key) {
    var arr = constant.BADGES_TYPE[key];
    if (arr.indexOf(badgestask) >= 0) {
      categoryName = key;
    }
  });
  return categoryName;
}

module.exports = router;
