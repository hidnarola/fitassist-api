var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;
var admin_helper = require('../../helpers/admin_helper');
var common_helper = require('../../helpers/common_helper');

/**
 * @api {get} /admin/:admin_id Admin Get by ID
 * @apiName Admin Admin Get by ID
 * @apiGroup Admin Profile
 * @apiHeader {String}  Content-Type application/json
 * @apiParam {String} email Email
 * @apiParam {String} password Password
 * @apiSuccess (Success 200) {JSON} user Admin user object.
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:admin_id", async (req, res) => {
  logger.trace("API - update admin profile called");
  logger.debug("req.body = ", req.body);
  let admin = await admin_helper.get_admin_by_id(req.params.admin_id);
  if (admin.status == 1) {
    res.status(config.OK_STATUS).json(admin);
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(admin);
  }
});

/**
 * @api {put} /admin/ Admin Profile
 * @apiName Admin Profile
 * @apiGroup Admin Profile
 * @apiHeader {String}  Content-Type application/json
 * @apiParam {String} email Email
 * @apiParam {String} firstName firstName
 * @apiParam {String} lastName lastName
 * @apiSuccess (Success 200) {JSON} user Admin user object.
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/", async (req, res) => {

  logger.trace("API - update admin profile called");
  logger.debug("req.body = ", req.body);
  var resp = null;
  var schema = {
    firstName: {
      notEmpty: true,
      errorMessage: "First name is required."
    },
    id: {
      notEmpty: true,
      errorMessage: "Admin id is required."
    },
    lastName: {
      notEmpty: true,
      errorMessage: "Last name is required."
    },
    email: {
      notEmpty: true,
      errorMessage: "Email address is required",
      isEmail: {
        errorMessage: "Please enter valid email address"
      }
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    let checkEmail = await admin_helper.checkEmail({
      "$and": [{
          "email": {
            "$eq": req.body.email
          }
        },
        {
          "_id": {
            "$ne": req.body.id
          }
        }
      ]
    });
    if (checkEmail.status == 1) {
      let update_resp = await admin_helper.update_admin_by_id(
        req.body.id, {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email
        }
      );

      if (update_resp.status === 1) {
        res.status(config.OK_STATUS).json({
          status: 1,
          message: "Profile updated successful",
        });

      } else {
        res.status(config.INTERNAL_SERVER_ERROR).json({
          status: 2,
          message: "Profile does not updated",
        });
      }
    } else {
      res.status(config.BAD_REQUEST).json({
        status: 2,
        message: "Email already exists",
      });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

module.exports = router;