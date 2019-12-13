var express = require("express");
var router = express.Router();

var config = require("../../config");
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose");
var _ = require("underscore");
var logger = config.logger;
var constant = require("../../constant");
var common_helper = require("../../helpers/common_helper");
var user_nutrition_programs_helper = require("../../helpers/user_nutrition_programs_helper");

/**
 * @api {post} /user/user_nutrition_program Add user's program
 * @apiName Add user's nutrition program
 * @apiGroup  User Nutrition Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  name name of program
 * @apiParam {String}  description description of program
 * @apiParam {Enum}  type type of program creator | Possible Values<code>Enum : ['admin','user'] </code>
 * @apiSuccess (Success 200) {JSON} program JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    name: {
      notEmpty: true,
      trim: { options: [[" "]] },
      isLength: {
        errorMessage: "Name should be between 0 to 100 characters",
        options: { min: 0, max: 100 }
      },
      errorMessage: "Name is required"
    },
    privacy: {
      notEmpty: true,
      isIn: {
        options: [
          [constant.PROGRAM_PRIVACY_PRIVATE, constant.PROGRAM_PRIVACY_PUBLIC]
        ],
        errorMessage: "Privacy is invalid"
      },
      errorMessage: "Privacy is required"
    },
    level: {
      notEmpty: true,
      errorMessage: "Level is required",
      isIn: {
        options: [constant.PROGRAM_LEVEL_OPTIONS],
        errorMessage: "Level is invalid"
      }
    }
  };
  req
    .checkBody("description", "Description should be less than 5000")
    .isLength({ max: 5000 });
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var programObj = {
      name: req.body.name,
      description: req.body.description,
      privacy: req.body.privacy,
      categories: req.body.categories ? req.body.categories : [],
      level: req.body.level,
      userId: authUserId,
      type: req.body.type,
      tags: req.body.tags ? req.body.tags : []
    };
    logger.trace("Add user nutrition programs  API called");
    var resp_data = await user_nutrition_programs_helper.add_user_nutrition_program_data(
      programObj
    );
    if (resp_data.status == 0) {
      logger.error(
        "Error occured while adding user nutrition programs = ",
        resp_data
      );
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("user nutrition programs added successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

router.post("/program", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get all user nutrition programs API");
  var start = req.body.start ? req.body.start : 0;
  var limit = req.body.limit ? req.body.limit : 10;
  var resp_data = await user_nutrition_programs_helper.get_all_user_nutrition_programs(
    req.body.condition,
    start,
    limit
  );
  if (resp_data.status === 0) {
    logger.error(
      "Error occured while finding user nutrition programs = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user nutrition programs found  = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

router.get("/:programId", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var programId = mongoose.Types.ObjectId(req.params.programId);
  logger.trace("Get all user nutrition programs API called ID:" + programId);
  var resp_data = await user_nutrition_programs_helper.get_user_nutrition_programs_in_details(
    {
      _id: programId,
      userId: authUserId
    }
  );
  if (resp_data.status === 0) {
    logger.error(
      "Error occured while finding user nutrition programs = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user nutrition programs found  = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

router.get("/program/:programId", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var programId = mongoose.Types.ObjectId(req.params.programId);
  logger.trace("Get all user nutrition programs API called ID:" + programId);
  var resp_data = await user_nutrition_programs_helper.get_user_nutrition_programs_by_id(
    {
      _id: programId,
      userId: authUserId
    }
  );
  if (resp_data.status === 0) {
    logger.error(
      "Error occured while finding user nutrition programs = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user nutrition programs found  = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {put} /user/user_nutrition_program/:programId Update user's program
 * @apiName Update user's nutrition program
 * @apiGroup  User Nutrition Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  name name of program
 * @apiParam {String}  description description of program
 * @apiParam {Enum}  type type of program creator | Possible Values<code>Enum : ['admin','user'] </code>
 * @apiSuccess (Success 200) {JSON} program JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:programId", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    name: {
      notEmpty: true,
      trim: { options: [[" "]] },
      isLength: {
        errorMessage: "Name should be between 0 to 100 characters",
        options: { min: 0, max: 100 }
      },
      errorMessage: "Name is required"
    },
    privacy: {
      notEmpty: true,
      isIn: {
        options: [
          [constant.PROGRAM_PRIVACY_PRIVATE, constant.PROGRAM_PRIVACY_PUBLIC]
        ],
        errorMessage: "Privacy is invalid"
      },
      errorMessage: "Privacy is required"
    },
    level: {
      notEmpty: true,
      errorMessage: "Level is required",
      isIn: {
        options: [constant.PROGRAM_LEVEL_OPTIONS],
        errorMessage: "Level is invalid"
      }
    }
  };
  req
    .checkBody("description", "Description should be less than 5000")
    .isLength({ max: 5000 });
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var programObj = {
      name: req.body.name,
      description: req.body.description,
      privacy: req.body.privacy,
      categories: req.body.categories ? req.body.categories : [],
      level: req.body.level,
      userId: authUserId,
      type: req.body.type,
      tags: req.body.tags ? req.body.tags : []
    };
    var condition = {
      _id: req.params.programId
    };
    logger.trace("Update user nutrition programs  API called");
    var resp_data = await user_nutrition_programs_helper.update_user_nutrition_program_data(
      condition,
      programObj
    );
    if (resp_data.status == 0) {
      logger.error(
        "Error occured while updating user nutrition programs = ",
        resp_data
      );
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace(
        "user nutrition programs updating successfully = ",
        resp_data
      );
      res.status(config.OK_STATUS).json(resp_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

module.exports = router;
