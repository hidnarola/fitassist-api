var express = require("express");
var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var exercise_types_helper = require("../../helpers/exercise_types_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/exercise_type/filter Filter
 * @apiName Filter
 * @apiGroup Exercise Type
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
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_exercise_types filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await exercise_types_helper.get_filtered_records(
    filter_object
  );
  if (filtered_data.status === 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.INTERNAL_SERVER_ERROR).json({
      filtered_data
    });
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});

/**
 * @api {get} /admin/exercise_type Get all
 * @apiName Get all
 * @apiGroup Exercise Type
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} exercise_types Array of exercise_types's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all Exercise types API called");
  var resp_data = await exercise_types_helper.get_all_exercise_types();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching exercise types = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Exercise types got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/exercise_type/exercise_type_id Get by ID
 * @apiName Get by ID
 * @apiGroup Exercise Type
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} exercise_id ID of Exercise
 * @apiSuccess (Success 200) {JSON} exercise_type JSON of exercise_type document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:exercise_type_id", async (req, res) => {
  exercise_type_id = req.params.exercise_type_id;
  logger.trace("Get all exercise_type API called");

  var resp_data = await exercise_types_helper.get_exercise_type_id(
    exercise_type_id
  );

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching exercise_type = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("exercise_type got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/exercise_type Add
 * @apiName Add
 * @apiGroup Exercise Type
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of Exercise_types
 * @apiParam {String} description Description of Exercise types
 * @apiSuccess (Success 200) {JSON} exercise_type Exercise types details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Name should be between 3 to 100 characters',
        options: {
          min: 3,
          max: 100
        }
      },
      errorMessage: "Name is required"
    },
    description: {
      notEmpty: true,
      errorMessage: "Description is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var exercise_type_obj = {
      name: req.body.name,
      description: req.body.description ? req.body.description : null
    };

    let exercise_type_data = await exercise_types_helper.insert_exercise_type(
      exercise_type_obj
    );
    if (exercise_type_data.status === 0) {
      logger.error(
        "Error while inserting Exercise type data = ",
        exercise_type_data
      );
      res.status(config.BAD_REQUEST).json({
        exercise_type_data
      });
    } else {
      res.status(config.OK_STATUS).json(exercise_type_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/exercise_type/:exercise_type_id Update
 * @apiName Update
 * @apiGroup Exercise Type
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Exercise type name
 * @apiParam {String} description Exercise type description
 * @apiParam {Boolean} status status of Exercise type
 * @apiSuccess (Success 200) {JSON} exercise_type Exercise Type details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:exercise_type_id", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Name should be between 3 to 100 characters',
        options: {
          min: 3,
          max: 100
        }
      },
      errorMessage: "Name is required"
    },
    description: {
      notEmpty: true,
      errorMessage: "Description is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var exercise_type_obj = {
      name: req.body.name,
      modifiedAt: new Date()
    };

    if (req.body.description) {
      exercise_type_obj.description = req.body.description;
    }
    if (typeof req.body.status !== "undefined" && req.body.status >= 0) {
      exercise_type_obj.status = req.body.status;
    }

    let exercise_type_data = await exercise_types_helper.update_exercise_type_by_id(
      req.params.exercise_type_id,
      exercise_type_obj
    );
    if (exercise_type_data.status === 0) {
      logger.error(
        "Error while updating exercise_type_data = ",
        exercise_type_data
      );
      res.status(config.BAD_REQUEST).json({
        exercise_type_data
      });
    } else {
      res.status(config.OK_STATUS).json(exercise_type_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /admin/exercise_type/:exercise_type_id Delete
 * @apiName Delete
 * @apiGroup Exercise Type
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:exercise_type_id", async (req, res) => {
  logger.trace(
    "Delete Exercise Type  API - Id = ",
    req.params.exercise_type_id
  );
  let exercise_type_data = await exercise_types_helper.delete_exercise_type_by_id(
    req.params.exercise_type_id
  );

  if (exercise_type_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(exercise_type_data);
  } else {
    res.status(config.OK_STATUS).json(exercise_type_data);
  }
});

module.exports = router;