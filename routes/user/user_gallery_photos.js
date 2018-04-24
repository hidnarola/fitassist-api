var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var async = require("async");

var config = require("../../config");
var jwtDecode = require("jwt-decode");

var logger = config.logger;

var user_gallery_photos_helper = require("../../helpers/user_gallery_photos_helper");

/**
 * @api {get} /user/user_gallery_photo Get all
 * @apiName Get all
 * @apiGroup User Gallery Photo
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiSuccess (Success 200) {JSON} user_gallery_photos JSON of user gallery photos 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  logger.trace("Get all user's gallery photos API called");

  var resp_data = await user_gallery_photos_helper.get_user_gallery_photos({
    userId: authUserId,isDeleted:0
  });

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get all user gallery photos = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user gallery photos got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/user_gallery_photo/:user_photo_id Get by ID
 * @apiName Get by ID
 * @apiGroup User Gallery Photo
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiSuccess (Success 200) {JSON} user_gallery_photo user_gallery_photo's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:user_photo_id", async (req, res) => {
  logger.trace(
    "Get user gallery photo by ID API called : ",
    req.params.user_photo_id
  );
  var resp_data = await user_gallery_photos_helper.get_user_gallery_photo_by_id(
    { _id: req.params.user_photo_id,isDeleted:0}
  );
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching user gallery photo = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user gallery photo got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_gallery_photo Add
 * @apiName Add
 * @apiGroup User Gallery Photo
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiParam {File} images User's  Images
 * @apiParam {String} description Description of Images
 * @apiParam {Number} priavacy privacy of Image <br><code>1 for OnlyMe<br>2 for Friends<br>3 for Public</code>
 *
 * @apiSuccess (Success 200) {JSON} message message for successful and unsuccessful image upload
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    privacy: {
      notEmpty: true,
      errorMessage: "privacy is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var user_gallery_photo_obj = {
      userId: authUserId,
      description: req.body.description
    };

    if (req.body.privacy) {
      user_gallery_photo_obj.privacy = req.body.privacy;
    }

    async.waterfall(
      [
        function(callback) {
          //image upload
          if (req.files && req.files["images"]) {
            var file_path_array = [];
            var files = [].concat(req.files.images);
            var dir = "./uploads/user_gallery";
            var mimetype = ["image/png", "image/jpeg", "image/jpg"];

            async.eachSeries(
              files,
              function(file, loop_callback) {
                var mimetype = ["image/png", "image/jpeg", "image/jpg"];
                if (mimetype.indexOf(file.mimetype) != -1) {
                  if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                  }
                  extention = path.extname(file.name);
                  filename = "user_gallery_" + new Date().getTime() + extention;
                  file.mv(dir + "/" + filename, function(err) {
                    if (err) {
                      logger.error("There was an issue in uploading image");
                      loop_callback({
                        status: config.MEDIA_ERROR_STATUS,
                        err: "There was an issue in uploading image"
                      });
                    } else {
                      logger.trace(
                        "image has been uploaded. Image name = ",
                        filename
                      );
                      location = "uploads/user_gallery/" + filename;
                      file_path_array.push(location);

                      loop_callback();
                    }
                  });
                } else {
                  logger.error("Image format is invalid");
                  loop_callback({
                    status: config.VALIDATION_FAILURE_STATUS,
                    err: "Image format is invalid"
                  });
                }
              },
              function(err) {
                if (err) {
                  res.status(err.status).json(err);
                } else {
                  callback(null, file_path_array);
                }
              }
            );
          } else {
            logger.info(
              "Image not available to upload. Executing next instruction"
            );
            callback(null, []);
          }
        }
      ],
      async (err, file_path_array) => {
        var unsuccess = 0;
        var success = 0;
        async.each(
          file_path_array,
          async function(file, callback) {
            user_gallery_photo_obj.image = file;
            let user_progress_photo_data = await user_gallery_photos_helper.insert_user_gallery_photo(
              user_gallery_photo_obj
            );
            if (user_progress_photo_data.status === 0) {
              unsuccess++;
              logger.error(
                "Error while inserting user gallery data = ",
                user_progress_photo_data
              );
            } else {
              success++;
            }
          },
          function(err) {
            if (err) {
              console.log("Failed to upload image");
              console.log("unsuccess:", unsuccess);
            } else {
              return res
                .status(config.OK_STATUS)
                .json({
                  status: 1,
                  message:
                    success +
                    " successfully uploaded image(s), " +
                    unsuccess +
                    " failed uploaded image(s)"
                });
            }
          }
        );
      }
    );
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

/**
 * @api {put} /user/user_gallery_photo/:photo_id Update
 * @apiName Update
 * @apiGroup User Gallery Photo
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiParam {File} image User's  Image
 * @apiParam {String} description Description of Image
 * @apiParam {Number} privacy privacy of Image <br><code>1 for OnlyMe<br>2 for Friends<br>3 for Public</code>
 * @apiParam {Number} status status of Image <br><code>1 for Active<br>2 for Inactive</code>
 *
 * @apiSuccess (Success 200) {JSON} user_gallery_photo user_gallery_photo details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:photo_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    privacy: {
      notEmpty: true,
      errorMessage: "Privacy is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    //console.log("Data = ",req.body);
    //console.log("Files = ",req.files);
    var user_gallery_photo_obj = {
      userId: authUserId,
    };

    if (req.body.privacy) {
      user_gallery_photo_obj.privacy = req.body.privacy;
	}
    if (req.body.description) {
      user_gallery_photo_obj.description = req.body.description;
	}
	if (req.body.status) {
		user_gallery_photo_obj.status = req.body.status;
	  }

	
	var filename;
        if (req.files && req.files['image']) {
            var file = req.files['image'];
            var dir = "./uploads/user_gallery";
            var mimetype = ['image/png', 'image/jpeg', 'image/jpg'];

            if (mimetype.indexOf(file.mimetype) != -1) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                extention = path.extname(file.name);
                filename = "user_gallery_" + new Date().getTime() + extention;
                file.mv(dir + '/' + filename, function (err) {
                    if (err) {
                        logger.error("There was an issue in uploading image");
                        res.send({"status": config.MEDIA_ERROR_STATUS, "err": "There was an issue in uploading image"});
                    } else {
                        logger.trace("image has been uploaded. Image name = ", filename);
                        //return res.send(200, "null");
                    }
                });
            } else {
                logger.error("Image format is invalid");
                res.send({"status": config.VALIDATION_FAILURE_STATUS, "err": "Image format is invalid"});
            }
        } else {
            logger.info("Image not available to upload. Executing next instruction");
            //res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
        }
       
        //End image upload
        if(filename)
        {

            var resp_data = await user_gallery_photos_helper.get_user_gallery_photo_by_id({_id:req.params.photo_id});
            fs.unlink(resp_data.user_gallery_photo.image,function(err,Success){
                if(err) throw err;
                console.log('image is deleted');
            });
            user_gallery_photo_obj.image='uploads/user_gallery/' + filename;
        }

//        console.log(resp_data);
        resp_data = await user_gallery_photos_helper.update_user_gallery_photo({_id:req.params.photo_id,userId:authUserId}, user_gallery_photo_obj);
        if (resp_data.status === 0) {
            logger.error("Error while updating user gallery image = ", resp_data);
            res.status(config.BAD_REQUEST).json({ resp_data });
        } else {
            res.status(config.OK_STATUS).json(resp_data);
        }

    
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

/**
 * @api {delete} /user/user_gallery_photo/:photo_id Delete
 * @apiName Delete
 * @apiGroup User Gallery Photo
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:photo_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete user's gallery photo API - Id = ", req.params.photo_id);
  let user_progress_photo_data = await user_gallery_photos_helper.delete_user_gallery_photo(
    { userId: authUserId, _id: req.params.photo_id },
    { isDeleted: 1 }
  );

  if (user_progress_photo_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(user_progress_photo_data);
  } else {
    res.status(config.OK_STATUS).json(user_progress_photo_data);
  }
});

module.exports = router;
