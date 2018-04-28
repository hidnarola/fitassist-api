var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var config = require("../../config");
var jwtDecode = require("jwt-decode");

var logger = config.logger;

var user_progress_photos_helper = require("../../helpers/user_progress_photos_helper");

/**
 * @api {get} /user/progress_photo Get all
 * @apiName Get all
 * @apiGroup User Progress Photo
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiSuccess (Success 200) {Array} user_progress_photos Array of user's progress_photos 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get all user's progress_photo API called");
  var resp_data = await user_progress_photos_helper.get_user_progress_photos({
    userId: authUserId,
    isDeleted: 0
  });
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get all user progress photos = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user progress photos got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/progress_photo/:user_photo_id Get by ID
 * @apiName Get by ID
 * @apiGroup User Progress Photo
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiSuccess (Success 200) {Array} user_progress_photo progress_photo's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:user_photo_id", async (req, res) => {
  logger.trace(
    "Get user progress photo by ID API called : ",
    req.params.user_photo_id
  );
  var resp_data = await user_progress_photos_helper.get_user_progress_photo_by_id(
    { _id: req.params.user_photo_id, isDeleted: 0 }
  );
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching user progress photo = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user progress photo got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/progress_photo Add
 * @apiName Add
 * @apiGroup User Progress Photo
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiParam {file} image User's Progress Image
 * @apiParam {String} description Description of progress
 *
 * @apiSuccess (Success 200) {JSON} user_progress_photo user_progress_photo details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var user_progress_photo_obj = {
    userId: authUserId,
    date: req.body.date
  };

  if (req.body.description) {
    user_progress_photo_obj.description = req.body.description;
  }

  //image upload
  var filename;
  if (req.files && req.files["image"]) {
    var file = req.files["image"];
    var dir = "./uploads/user_progress";
    var mimetype = ["image/png", "image/jpeg", "image/jpg"];

    if (mimetype.indexOf(file.mimetype) != -1) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      extention = path.extname(file.name);
      filename = "user_progress_" + new Date().getTime() + extention;
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
    user_progress_photo_obj.image = "uploads/user_progress/" + filename;
  }

  let user_progress_photo_data = await user_progress_photos_helper.insert_user_progress_photo(
    user_progress_photo_obj
  );
  if (user_progress_photo_data.status === 0) {
    logger.error(
      "Error while inserting user progress photo = ",
      user_progress_photo_data
    );
    res.status(config.BAD_REQUEST).json(user_progress_photo_data);
  } else {
    res.status(config.OK_STATUS).json(user_progress_photo_data);
  }
});

/**
 * @api {put} /user/progress_photo/ Update
 * @apiName Update
 * @apiGroup User Progress Photo
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token user's unique access-key
 * @apiParam {file} image User's Progress Image
 * @apiParam {String} description Description of progress
 * @apiSuccess (Success 200) {JSON} user_progress_photo user_progress_photo details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var user_progress_photo_obj = {
    userId: authUserId
  };
  if (req.body.description) {
    user_progress_photo_obj.description = req.body.description;
  }

  //image upload
  var filename;
  if (req.files && req.files["image"]) {
    var file = req.files["image"];
    var dir = "./uploads/user_progress";
    var mimetype = ["image/png", "image/jpeg", "image/jpg"];

    if (mimetype.indexOf(file.mimetype) != -1) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      extention = path.extname(file.name);
      filename = "user_progress_" + new Date().getTime() + extention;
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
    user_progress_photo_obj.image = "uploads/user_progress/" + filename;
    var resp_data = await user_progress_photos_helper.get_user_progress_photos({
      userId: authUserId
    });
    if (resp_data.status == 1) {
      fs.unlink(resp_data.user_progress_photos[0].image, function(
        err,
        Success
      ) {
        if (err) throw err;
        console.log("image is deleted");
      });
    }
  }

  let user_progress_photo_data = await user_progress_photos_helper.update_user_progress_photo(
    authUserId,
    user_progress_photo_obj
  );
  if (user_progress_photo_data.status === 0) {
    logger.error(
      "Error while inserting user progress photo = ",
      user_progress_photo_data
    );
    res.status(config.BAD_REQUEST).json(user_progress_photo_data);
  } else {
    res.status(config.OK_STATUS).json(user_progress_photo_data);
  }
});

/**
 * @api {delete} /user/progress_photo/ Delete
 * @apiName Delete
 * @apiGroup User Progress Photo
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:photo_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete user's progress photo API - Id = ", req.params.photo_id);
  let nutrition_predata_data = await user_progress_photos_helper.delete_user_progress_photo(
    { userId: authUserId, _id: req.params.photo_id },
    { isDeleted: 1 }
  );

  if (nutrition_predata_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(nutrition_predata_data);
  } else {
    res.status(config.OK_STATUS).json(nutrition_predata_data);
  }
});

module.exports = router;