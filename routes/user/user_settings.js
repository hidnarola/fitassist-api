var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var user_settings_helper = require("../../helpers/user_settings_helper");

/**
 * @api {post} /user/settings Save User Preference
 * @apiName Save Preference
 * @apiGroup  User Settings
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} distance distance unit of user. <code>Enum : ["km", "mile"]</code>
 * @apiParam {String} weight weight unit of user. <code>Enum : ["kg", "lb"]</code>
 * @apiParam {String} bodyMeasurement body measurement unit of user. <code>Enum : ["cm", "inch"]</code>
 * @apiParam {String} postAccessibility post accessibility of user.
 * @apiParam {String} commentAccessibility comment accessibility of user.
 * @apiParam {String} messageAccessibility message accessibility of user.
 * @apiParam {String} friendRequestAccessibility friend request accessibility of user.
 * @apiSuccess (Success 200) {JSON} user_settings user preference in user_settings detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {};

  if (req.body.distance) {
    schema.distance = {
      notEmpty: false,
      isIn: {
        options: [["km", "mile"]],
        errorMessage: "distance is invalid"
      },
      errorMessage: "distance unit required"
    };
  }

  if (req.body.weight) {
    schema.weight = {
      notEmpty: false,
      isIn: {
        options: [["kg", "lb"]],
        errorMessage: "weight is invalid"
      },
      errorMessage: "weight unit required"
    };
  }

  if (req.body.bodyMeasurement) {
    schema.bodyMeasurement = {
      notEmpty: false,
      isIn: {
        options: [["cm", "inch"]],
        errorMessage: "body is invalid"
      },
      errorMessage: "body measurement unit required"
    };
  }

  if (req.body.postAccessibility) {
    schema.postAccessibility = {
      notEmpty: false,
      isDecimal: {
        errorMessage: "post accessibility is invalid"
      },
      errorMessage: "post accessibility is required"
    };
  }

  if (req.body.commentAccessibility) {
    schema.commentAccessibility = {
      notEmpty: false,
      isDecimal: {
        errorMessage: "comment accessibility is invalid"
      },
      errorMessage: "comment accessibility is required"
    };
  }

  if (req.body.messageAccessibility) {
    schema.messageAccessibility = {
      notEmpty: false,
      isDecimal: {
        errorMessage: "message accessibility is invalid"
      },
      errorMessage: "message accessibility is required"
    };
  }

  if (req.body.friendRequestAccessibility) {
    schema.friendRequestAccessibility = {
      notEmpty: false,
      isDecimal: {
        errorMessage: "friend request accessibility is invalid"
      },
      errorMessage: "friend request accessibility is required"
    };
  }

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var setting_obj = {};

    if (req.body.distance) {
      setting_obj.distance = req.body.distance;
    }

    if (req.body.weight) {
      setting_obj.weight = req.body.weight;
    }

    if (req.body.bodyMeasurement) {
      setting_obj.bodyMeasurement = req.body.bodyMeasurement;
    }

    if (req.body.postAccessibility) {
      setting_obj.postAccessibility = req.body.postAccessibility;
    }

    if (req.body.commentAccessibility) {
      setting_obj.commentAccessibility = req.body.commentAccessibility;
    }

    if (req.body.messageAccessibility) {
      setting_obj.messageAccessibility = req.body.messageAccessibility;
    }

    if (req.body.friendRequestAccessibility) {
      setting_obj.friendRequestAccessibility =
        req.body.friendRequestAccessibility;
    }

    setting_obj.modifiedAt = new Date();

    let settings_data = await user_settings_helper.save_settings(
      { userId: authUserId },
      setting_obj
    );
    if (settings_data.status === 0) {
      logger.error("Error while saving setting  = ", settings_data);
      return res.status(config.BAD_REQUEST).json({ settings_data });
    } else {
      return res.status(config.OK_STATUS).json(settings_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

module.exports = router;
