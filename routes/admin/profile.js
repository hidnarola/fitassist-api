var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var admin_helper = require('../../helpers/admin_helper');

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
router.get("/", async (req, res) => {
  logger.trace("API - update admin profile called");
  logger.debug("req.body = ", req.userInfo);
  let admin = await admin_helper.get_admin_by_id(req.userInfo.id);
  if (admin.status == 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(admin);
  } else {
    delete admin.admin.password;
    res.status(config.OK_STATUS).json(admin);
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
  var schema = {
    firstName: {
      notEmpty: true,
      isLength: {
        errorMessage: 'First Name should be between 2 to 50 characters',
        options: {
          min: 2,
          max: 50
        }
      },
      errorMessage: "First name is required."
    },
    lastName: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Last Name should be between 2 to 50 characters',
        options: {
          min: 2,
          max: 50
        }
      },
      errorMessage: "Last name is required."
    },
    email: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Email should be between 2 to 30 characters',
        options: {
          min: 2,
          max: 30
        }
      },
      errorMessage: "Email address is required",
      isEmail: {
        errorMessage: "Please enter valid email address"
      }
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var checkEmail = await admin_helper.checkEmail({
      "$and": [{
          "email": {
            "$eq": req.body.email
          }
        },
        {
          "_id": {
            "$ne": req.userInfo.id
          }
        }
      ]
    });
    if (checkEmail.status == 1) {
      let update_resp = await admin_helper.update_admin_by_id(
        req.userInfo.id, {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email
        }
      );

      if (update_resp.status === 1) {
        delete update_resp.admin.password;
        res.status(config.OK_STATUS).json(update_resp);
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