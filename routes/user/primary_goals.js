var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");
var jwtDecode = require("jwt-decode");
var config = require("../../config");
var logger = config.logger;
var user_primary_goals_helper = require("../../helpers/user_primary_goals_helper");

/**
 * @api {get} /user/primary_goal/ Get Goal
 * @apiName Get Goal
 * @apiGroup User Primary Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} goal goal document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get user primary goal by ID API called : ", req.params.goal_id);
  var resp_data = await user_primary_goals_helper.get_primary_goal_by_id({
    authUserId: authUserId
  });
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching user primary goal = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user primary goal got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

module.exports = router;
