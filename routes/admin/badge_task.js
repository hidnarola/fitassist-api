var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var badge_task_helper = require("../../helpers/badge_task_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/badge_task/filter Filter
 * @apiName Filter
 * @apiDescription Request Object :<pre><code>
 * {
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
}</code></pre>
 * @apiGroup Badge Task
 * @apiDescription Request Object :<pre><code>
 * {
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
}</code></pre>
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_badge_tasks filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await badge_task_helper.get_filtered_records(
    filter_object
  );
  if (filtered_data.status != 0) {
    return res.status(config.OK_STATUS).json(filtered_data);
  } else {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.BAD_REQUEST).json(filtered_data);
  }
});

/**
 * @api {get} /admin/badge_task Get all
 * @apiName Get all
 * @apiGroup  Badge Task
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} badge_tasks Array of badge_task document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all badge_tasks API called");
  var resp_data = await badge_task_helper.get_badge_tasks();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching  badge_tasks = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("badge_tasks got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/badge_task/badge_task_id Get by ID
 * @apiName Get Badge Task by ID
 * @apiGroup  Badge Task
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} badge_task Array of badge_task document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:badge_task_id", async (req, res) => {
  badge_task_id = req.params.badge_task_id;
  logger.trace("Get all badge_task API called");
  var resp_data = await badge_task_helper.get_badge_task_id(badge_task_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching badge_task = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("badge_task got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/badge_task  Add
 * @apiName Add
 * @apiGroup  Badge Task
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of badge_task
 * @apiParam {String} [description] description of badge_task
 * @apiParam {String} unit Unit of task activity
 * @apiSuccess (Success 200) {JSON} badge_task added badge_task detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Name should be between 3 to 50 characters',
        options: {
          min: 3,
          max: 50
        }
      },
      errorMessage: "Name of Task is required"
    },
    unit: {
      notEmpty: true,
      isIn: {
        options: [
          ["kgs", "kms"]
        ],
        errorMessage: "Unit must be from kgs or kms"
      },
      errorMessage: "Unit is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var badge_task_obj = {
      name: req.body.name,
      unit: req.body.unit,
      description: req.body.description ? req.body.description : null
    };

    let badge_task_data = await badge_task_helper.insert_badge_task(
      badge_task_obj
    );
    if (badge_task_data.status === 0) {
      logger.error("Error while inserting badge_task data = ", badge_task_data);
      return res.status(config.BAD_REQUEST).json(badge_task_data);
    } else {
      return res.status(config.OK_STATUS).json(badge_task_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/badge_task/:badge_task_id Update
 * @apiName Update
 * @apiGroup  Badge Task
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of badge_task
 * @apiParam {String} [description] description of badge_task
 * @apiParam {String} unit Unit of task activity | <code>["kms","kgs"]</code>
 * @apiParam {String} unit status of status task
 * @apiSuccess (Success 200) {Array} badge_task Array of badge_task document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:badge_task_id", async (req, res) => {
  badge_task_id = req.params.badge_task_id;
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Name should be between 3 to 50 characters',
        options: {
          min: 3,
          max: 50
        }
      },
      errorMessage: "Name of Task is required"
    },
    unit: {
      notEmpty: true,
      isIn: {
        options: [
          ["kgs", "kms"]
        ],
        errorMessage: "Unit must be from kgs or kms"
      },
      errorMessage: "Unit is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var badge_task_obj = {
      name: req.body.name,
      unit: req.body.unit,
      description: req.body.description ? req.body.description : null,
      status: req.body.status
    };

    let badge_task_data = await badge_task_helper.update_badge_task_by_id(
      badge_task_id,
      badge_task_obj
    );
    if (badge_task_data.status === 0) {
      logger.error("Error while updating badge_task data = ", badge_task_data);
      return res.status(config.BAD_REQUEST).json(badge_task_data);
    } else {
      return res.status(config.OK_STATUS).json(badge_task_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /admin/badge_task/:badge_task_id Delete
 * @apiName Delete
 * @apiGroup  Badge Task
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:badge_task_id", async (req, res) => {
  logger.trace("Delete badge_task API - Id = ", req.body.badge_task_id);
  let badge_task_data = await badge_task_helper.delete_badge_task_by_id(
    req.params.badge_task_id
  );

  if (badge_task_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(badge_task_data);
  } else {
    res.status(config.OK_STATUS).json(badge_task_data);
  }
});

module.exports = router;