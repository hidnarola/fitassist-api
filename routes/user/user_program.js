var express = require("express");
var router = express.Router();

var config = require("../../config");
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose");
var moment = require("moment");
var logger = config.logger;

var user_program_helper = require("../../helpers/user_program_helper");

/**
 * @api {get} /user/user_program/ Get user's program
 * @apiName Get user's program
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} programs JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get all user programs API called");
  var resp_data = await user_program_helper.get_user_programs_in_details({
    userId: authUserId
  });

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user programs = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/user_program/names Get user's program
 * @apiName Get user's program
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_programs JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/names", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get all user programs API called");
  var resp_data = await user_program_helper.get_user_programs({
    userId: authUserId
  });

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user programs = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/user_program/:program_id Get user's program by _id
 * @apiName Get user's program by _id
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} program JSON of user_program document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:program_id", async (req, res) => {
  var program_id = mongoose.Types.ObjectId(req.params.program_id);

  logger.trace("Get all user programs API called ID:" + program_id);
  var resp_data = await user_program_helper.get_user_programs(
    {
      _id: program_id
    },
    true
  );

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user program = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user program got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_program Add user's program
 * @apiName Add user's program
 * @apiGroup  User Program
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
  var programObj = {
    name: req.body.name,
    description: req.body.description,
    userId: authUserId,
    type: req.body.type
  };
  logger.trace("Add user programs  API called");
  var resp_data = await user_program_helper.add_program(programObj);
  if (resp_data.status == 0) {
    logger.error("Error occured while adding user programs = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs added successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {put} /user/user_program update user's program
 * @apiName update user's program
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  name name of program
 * @apiParam {String}  description description of program
 * @apiParam {Enum}  type type of program creator | Possible Values<code>Enum : ['admin','user'] </code>
 * @apiSuccess (Success 200) {JSON} program JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:program_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var program_id = mongoose.Types.ObjectId(req.params.program_id);
  var programObj = {
    name: req.body.name,
    description: req.body.description,
    userId: authUserId,
    type: req.body.type
  };
  logger.trace("Add user programs  API called");
  var resp_data = await user_program_helper.update_user_program_by_id(
    program_id,
    programObj
  );
  if (resp_data.status == 0) {
    logger.error("Error occured while adding user programs = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs added successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {delete} /user/user_program/:program_id Delete user's program by _id
 * @apiName Delete user's program by _id
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:program_id", async (req, res) => {
  var program_id = mongoose.Types.ObjectId(req.params.program_id);

  logger.trace("Delete user program  API called ID:" + program_id);
  var resp_data = await user_program_helper.delete_user_program({
    _id: program_id
  });

  if (resp_data.status == 0) {
    logger.error("Error occured while deleting user program = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user program got delete successgully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});
module.exports = router;
