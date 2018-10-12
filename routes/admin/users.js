var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var mongoose = require("mongoose");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var user_helper = require("../../helpers/user_helper");
var common_helper = require("../../helpers/common_helper");
var user_settings_helper = require("../../helpers/user_settings_helper");

/**
 * @api {post} /admin/user/filter User Filter
 * @apiName User User Filter
 * @apiGroup Admin Side User
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {Array} filtered_users filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await user_helper.get_filtered_records(filter_object);
  if (filtered_data.status === 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.BAD_REQUEST).json({
      filtered_data
    });
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});

/**
 * @api {get} /admin/user Get all
 * @apiName Get all
 * @apiGroup Admin Side User
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} users Array of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all Users API called");
  var resp_data = await user_helper.get_all_users();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching Users = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Users got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/user/:user Get by authUserId
 * @apiName Users by authUserId
 * @apiGroup Admin Side User
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {JSON} user JSON of user document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:authUserId", async (req, res) => {
  authUserId = req.params.authUserId;
  logger.trace("Get user by id API called");
  var resp_data = await user_helper.get_user_by_id(authUserId);

  if (resp_data.status === 0) {
    logger.error("Error occured while fetching user = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    var user_settings = await user_settings_helper.get_setting({
      userId: authUserId
    }, {
        "bodyMeasurement": 1,
        "weight": 1,
        "distance": 1,
      });
    resp_data.user_preferences = null;
    if (user_settings.status === 1) {
      resp_data.user_preferences = user_settings.user_settings;
    }
    logger.trace("user got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }


});

/**
 * @api {put} /admin/user/change_block_status  Block/Unblock User
 * @apiName Block/Unblock User
 * @apiGroup  User Block/Unblock User
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String}  authUserId user auth Id
 * @apiParam {String}  status user block status<code>true|false</code>
 * @apiSuccess (Success 200) {JSON} user updated user detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/change_block_status", async (req, res) => {
  var schema = {
    authUserId: {
      notEmpty: true,
      errorMessage: "AuthUserId is required"
    },
    status: {
      notEmpty: true,
      errorMessage: "Status is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var authUserId = req.body.authUserId;
    var status = (req.body.status && req.body.status === 1) ? false : true;
    common_helper.sync_user_data_to_auth(authUserId, {
      blocked: status
    }).then(async function (response) {
      let user_data = await user_helper.update_user_by_id(authUserId, {
        status: req.body.status
      });
      res.status(config.OK_STATUS).json({
        status: 1,
        message: "Record updated successfully",
        user: response
      });
    }).catch(function (error) {
      res.status(config.BAD_REQUEST).json({
        status: 0,
        message: error
      });
    });
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/user/:authUserId Update
 * @apiName Update
 * @apiGroup Admin Side User
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} firstName First name of user
 * @apiParam {String} lastName Last name of user
 * @apiParam {Number} [mobileNumber] mobileNumber
 * @apiParam {Enum} gender gender | <code>Possible Values ('male', 'female', 'transgender')</code>
 * @apiParam {Date} [dateOfBirth] Date of Birth
 * @apiParam {Object} [goal] goal  of user><br><pre>example. {
        "name" : "gain_muscle",
        "start" : 0
    }</pre><code>Possible Values ('gain_muscle', 'improve_mobility', 'lose_fat', 'gain_strength', 'gain_power', 'increase_endurance')</code>
 * @apiParam {File} [user_img] avatar
 * @apiParam {String} [aboutMe] aboutMe
 * @apiParam {Boolean} status status
 * @apiSuccess (Success 200) {JSON} user JSON of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:authUserId", async (req, res) => {
  authUserId = req.params.authUserId;
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
      errorMessage: "First name is required"
    },
    status: {
      notEmpty: true,
      errorMessage: "Status is required"
    }
  };

  req.checkBody('lastName', 'Last Name should be between 2 to 50 characters').isLength({ max: 20, min: 2 });
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var user_obj = {
      firstName: req.body.firstName,
      mobileNumber: req.body.mobileNumber,
      status: req.body.status,
      modifiedAt: new Date()
    };

    if (req.body.lastName) {
      user_obj.lastName = req.body.lastName;
    }
    if (req.body.dateOfBirth) {
      user_obj.dateOfBirth = req.body.dateOfBirth;
    }
    if (req.body.height) {
      if (req.body.heightUnit) {
        var height = await common_helper.unit_converter(req.body.height, req.body.heightUnit);
      }
      user_obj.height = height.baseValue;
    }
    if (req.body.weight) {
      if (req.body.weightUnit) {
        var weight = await common_helper.unit_converter(req.body.weight, req.body.weightUnit);
      }
      user_obj.weight = weight.baseValue;
    }
    if (req.body.gender) {
      user_obj.gender = req.body.gender;
    }
    if (req.body.workoutLocation) {
      user_obj.workoutLocation = req.body.workoutLocation;
    }
    if (req.body.goal) {
      user_obj.goal = req.body.goal;
    }
    if (req.body.aboutMe) {
      user_obj.aboutMe = req.body.aboutMe;
    }

    //image upload
    var filename;
    if (req.files && req.files["user_img"]) {
      var file = req.files["user_img"];
      var dir = "./uploads/user";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "user_" + new Date().getTime() + extention;
        file.mv(dir + "/" + filename, async function (err) {
          if (err) {
            logger.error("There was an issue in uploading image");
            return res.send({
              status: config.MEDIA_ERROR_STATUS,
              err: "There was an issue in uploading image"
            });
          } else {
            logger.trace("image has been uploaded. Image name = ", filename);
            //return res.send(200, "null");
          }
        });
      } else {
        logger.error("Image format is invalid");
        return res.send({
          status: config.VALIDATION_FAILURE_STATUS,
          err: "Image format is invalid"
        });
      }
    } else {
      logger.info("Image not available to upload. Executing next instruction");
      // return res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
    }
    if (filename) {
      user_obj.avatar = config.BASE_URL + "uploads/user/" + filename;
      common_helper.sync_user_data_to_auth(authUserId, {
        picture: user_obj.avatar
      }).then(function (response) { }).catch(function (error) { });
      resp_data = await user_helper.get_user_by_id(authUserId);
      try {
        fs.unlink(resp_data.user.avatar, function () { });
      } catch (err) { }
    }

    let user_data = await user_helper.update_user_by_id(authUserId, user_obj);
    if (user_data.status === 0) {
      logger.error("Error while updating user data = ", user_data);
      return res.status(config.BAD_REQUEST).json({
        user_data
      });
    } else {
      res.status(config.OK_STATUS).json(user_data);
      var status = true;
      if (req.body.status == 1) {
        status = false;
      }
      common_helper.sync_user_data_to_auth(authUserId, {
        blocked: status
      }).then(function (response) {
        return res.status(config.OK_STATUS).json(user_data);
      }).catch(function (error) {
        return res.status(config.BAD_REQUEST).json({
          message: error
        });
      });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /admin/user/:authUserId Delete
 * @apiName Delete
 * @apiGroup Admin Side User
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:authUserId", async (req, res) => {
  logger.trace("Delete user API - Id = ", req.params.authUserId);
  var user_obj = {
    isDeleted: 1
  };
  let userdata = await user_helper.delete_user_by_id(
    req.params.authUserId,
    user_obj
  );

  if (userdata.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(userdata);
  } else {
    res.status(config.OK_STATUS).json(userdata);
  }
});

/**
 * @api {post} /admin/user/checkemail Check Unique
 * @apiName Check Unique
 * @apiGroup Admin Side User
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} email email to be check uniqueness
 * @apiSuccess (Success 200) {String} message Success message
 * @apiSuccess (Success 200) {String} count no of existing email
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/checkemail", async (req, res) => {
  logger.trace("Get check email API called");
  var resp_data = await user_helper.checkvalue({
    email: req.body.email
  });
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while checking email uniqueness  = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("check email Api is called = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

module.exports = router;