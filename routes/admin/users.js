var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var user_helper = require("../../helpers/user_helper");
var common_helper = require("../../helpers/common_helper");

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
    return res.status(config.BAD_REQUEST).json({ filtered_data });
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
 * @api {get} /admin/user/:authUserId Get by authUserId
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
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {put} /admin/user/:authUserId Update
 * @apiName Update
 * @apiGroup Admin Side User
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} firstName First name of user
 * @apiParam {String} lastName Last name of user
 * @apiParam {String} email Email address
 * @apiParam {Number} [mobileNumber] mobileNumber
 * @apiParam {Enum} gender gender | <code>Possible Values ('male', 'female', 'transgender')</code>
 * @apiParam {Date} [dateOfBirth] Date of Birth
 * @apiParam {Object} [goal] goal  of user><br><pre>example. {
        "name" : "gain_muscle",
        "start" : 0
    }</pre><code>Possible Values ('gain_muscle', 'gain_flexibility', 'lose_fat', 'gain_strength', 'gain_power', 'increase_endurance')</code>
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
      errorMessage: "First name is required"
    },
    status: {
      notEmpty: true,
      errorMessage: "Status is required"
    },
    email: {
      notEmpty: true,
      errorMessage: "Email address is required",
      isEmail: { errorMessage: "Please enter valid email address" }
    }
  };

  req
    .checkBody("email", "This email is already taken")
    .isEmailAvailable(authUserId);

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var user_obj = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      gender: req.body.gender,
      aboutMe: req.body.aboutMe,
      modifiedAt: new Date()
    };

    if (req.body.mobileNumber) {
      user_obj.mobileNumber = req.body.mobileNumber;
    }
    if (req.body.height) {
      user_obj.height = req.body.height;
    }
    if (req.body.weight) {
      user_obj.weight = req.body.weight;
    }
    if (req.body.dateOfBirth) {
      user_obj.dateOfBirth = req.body.dateOfBirth;
    }
    if (req.body.goals) {
      user_obj.goals = req.body.goals;
    }
    if (req.body.status) {
      user_obj.status = req.body.status;
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
        file.mv(dir + "/" + filename, function(err) {
          if (err) {
            logger.error("There was an issue in uploading image");
            res.send({
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
        res.send({
          status: config.VALIDATION_FAILURE_STATUS,
          err: "Image format is invalid"
        });
      }
    } else {
      logger.info("Image not available to upload. Executing next instruction");
      //res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
    }
    if (filename) {
      user_obj.avatar = "uploads/user/" + filename;
      resp_data = await user_helper.get_user_by_id(authUserId);
      try {
        fs.unlink(resp_data.user.avatar, function() {});
      } catch (err) {}
    }

    let user_data = await user_helper.update_user_by_id(authUserId, user_obj);
    if (user_data.status === 0) {
      logger.error("Error while updating user data = ", user_data);
      return res.status(config.BAD_REQUEST).json({ user_data });
    } else {
      return res.status(config.OK_STATUS).json(user_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {delete} /admin/user/:authUserId Delete
 * @apiName Delete
 * @apiGroup Admin Side User
 *
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
  var resp_data = await user_helper.checkvalue({ email: req.body.email });
  if (resp_data.status == 1) {
    logger.trace("check email Api is called = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error(
      "Error occured while checking email uniqueness  = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

module.exports = router;
