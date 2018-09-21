var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;
var admin_helper = require('../../helpers/admin_helper');
var common_helper = require('../../helpers/common_helper');

/**
 * @api {put} /admin/change_password Admin Change Password
 * @apiName Admin Change Password
 * @apiGroup Change Password API
 * @apiHeader {String}  Content-Type application/json
 * @apiParam {String} email Email
 * @apiParam {String} password Password
 * @apiSuccess (Success 200) {JSON} user Admin user object.
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/", async (req, res) => {
  logger.trace("API - Admin change password  called");
  logger.debug("req.body = ", req.body);
  var resp = null;
  var schema = {
    password: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Password should be between 8 to 32 characters',
        options: {
          min: 8,
          max: 32
        }
      },
      errorMessage: "Old Password is required."
    },
    newPassword: {
      notEmpty: true,
      isLength: {
        errorMessage: 'New Password should be between 8 to 32 characters',
        options: {
          min: 8,
          max: 32
        }
      },
      errorMessage: "New Password is required."
    }
  };
  req.checkBody(schema);

  var errors = req.validationErrors();
  if (!errors) {
    logger.trace("Valid request of admin change password");
    // Checking for user availability
    logger.trace("Checking for user availability");
    let user_resp = await admin_helper.get_admin_by_id(req.userInfo.id);
    logger.trace("User checked resp = ", user_resp);

    if (user_resp.status === 0) {
      logger.error(
        "Error in finding user by email in admin change password API. Err = ",
        user_resp.err
      );
      res.status(config.INTERNAL_SERVER_ERROR).json({
        status: 0,
        message: "Something went wrong while finding admin",
        error: user_resp.error
      });
    } else if (user_resp.status === 1) {
      logger.trace("admin data found. Executing next instruction");
      // Checking password

      common_helper.hashPassword.call({
          password: req.body.password,
          hash: user_resp.admin.password
        },
        async password_resp => {

          logger.trace("password resp = ", password_resp);
          if (password_resp.status === 0 || password_resp.res === false) {
            res.status(config.BAD_REQUEST).json({
              status: 0,
              message: "Old password does not match"
            });
          } else {
            if (user_resp.admin.status) {
              // Generate token
              bcrypt.genSalt(SALT_WORK_FACTOR, async function (err, salt) {
                if (err) {
                  console.log("Error", err)
                };
                bcrypt.hash(req.body.newPassword, salt, async function (err, hash) {
                  if (err) {
                    console.log("Error", err);
                  }
                  let update_resp = await admin_helper.update_admin_by_id(
                    user_resp.admin._id, {
                      password: hash,
                    }
                  );
                  if (update_resp.status === 1) {
                    res.status(config.OK_STATUS).json({
                      status: 1,
                      message: "Password Changed successful",
                    });

                  } else {
                    res.status(config.INTERNAL_SERVER_ERROR).json({
                      status: 2,
                      message: "Password does not changed",
                    });
                  }
                });
              });
            } else {
              logger.trace("Admin account is not active");
              res
                .status(config.BAD_REQUEST)
                .json({
                  status: 0,
                  message: "Account is not active"
                });
            }
          }
        }
      );
    } else {
      logger.info("Account doesn't exist.");
      res
        .status(config.BAD_REQUEST)
        .json({
          status: 0,
          message: "Invalid email address"
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