var express = require("express");
var _ = require("underscore");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose")

var logger = config.logger;

var widgets_settings_helper = require("../../helpers/widgets_settings_helper");
var badge_helper = require("../../helpers/badge_helper");

/**
 * @api {post} /user/widgets/:type Save
 * @apiName Save Widgets
 * @apiGroup User Widgets
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} widgets JSON of widgets_settings's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/:type", async (req, res) => {
  logger.trace("Save user's widgets API called");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var type = req.body.type;
  var widgets_data = null;
  var type = req.params.type;

  var widgets_settings_object = {
    userId: authUserId,
    widgetFor: type,
    badges: req.body.badges ? req.body.badges : null,
    workout: req.body.workout ? req.body.workout : null,
    bodyFat: req.body.bodyFat ? req.body.bodyFat : null,
    activityFeed: req.body.activityFeed ? req.body.activityFeed : null,
    // progressPhoto: req.body.progressPhoto ? req.body.progressPhoto : null,
    // mobility: req.body.mobility ? req.body.mobility : null,
    // muscle: req.body.muscle ? req.body.muscle : null,
    // strength: req.body.strength ? req.body.strength : null,
    // endurance: req.body.endurance ? req.body.endurance : null,
    modifiedAt: new Date()
  }

  var resp_data = await widgets_settings_helper.get_all_widgets({
    userId: authUserId,
    widgetFor: type
  });
  if (resp_data.status === 1) {
    widgets_data = await widgets_settings_helper.save_widgets(widgets_settings_object, {
      userId: authUserId
    });
  } else {
    widgets_data = await widgets_settings_helper.save_widgets(widgets_settings_object);
  }

  if (widgets_data && widgets_data.status === 1) {
    logger.trace("user widgets saved   = ", widgets_data);
    res.status(config.OK_STATUS).json(widgets_data);
  } else {
    logger.error("Error occured while saving user widgets = ", widgets_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(widgets_data);
  }
});

module.exports = router;