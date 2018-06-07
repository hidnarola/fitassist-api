var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");

var config = require("../../config");
var jwtDecode = require("jwt-decode");

var logger = config.logger;

var user_personal_goals_helper = require("../../helpers/user_personal_goals_helper");

/**
 * @api {get} /user/personal_goal/:type/:start?/:offset? Get all
 * @apiName Get all
 * @apiGroup User Personal Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Number}  type type of completed goal 1 for completed and 0 for uncompleted
 * @apiParam {Number}  start start of records
 * @apiParam {Number}  offset offset of records
 * @apiSuccess (Success 200) {JSON} personal_goals JSON of personal_goals 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type?/:start?/:offset?", async (req, res) => {
  logger.trace("Get all user's personal_goal API called");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var skip = req.params.start ? req.params.start : 0;
  var limit = req.params.offset ? req.params.offset : 10;
  var type = req.params.type;

  var resp_data = await user_personal_goals_helper.get_personal_goals(
    {
      userId: authUserId,
      isCompleted: type
    },
    {
      $skip: parseInt(skip)
    },
    {
      $limit: parseInt(limit)
    }
  );

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get all user personal_goals = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user personal goals got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/personal_goal/:goal_id Get by Goal ID
 * @apiName Get by Goal ID
 * @apiGroup User Personal Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} user_post_photo user_post_photo's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:goal_id", async (req, res) => {
  logger.trace("Get user post photo by ID API called : ", req.params.goal_id);
  var resp_data = await user_personal_goals_helper.get_personal_goals({
    _id: req.params.goal_id
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user post photo = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user post photo got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/personal_goal Add
 * @apiName Add
 * @apiGroup User Personal Goal
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Number} start start of goal
 * @apiParam {Number} target target of goal
 * @apiParam {Number} unit unit of goal
 * @apiSuccess (Success 200) {JSON} message message for successful and unsuccessful image upload
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    privacy: { notEmpty: true, errorMessage: "privacy is required" }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var user_post_obj = {
      userId: req.body.onWall,
      description: req.body.description
    };

    if (req.body.privacy) {
      user_post_obj.privacy = req.body.privacy;
    }
    user_post_obj.createdBy = authUserId;

    async.waterfall(
      [
        function(callback) {
          //image upload
          if (req.files && req.files["images"]) {
            var file_path_array = [];
            var files = [].concat(req.files.images);
            var dir = "./uploads/user_post";
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
                  filename = "user_post_" + new Date().getTime() + extention;
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
                      location = "uploads/user_post/" + filename;
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

        let user_post_data = await user_personal_goals_helper.insert_user_post(
          user_post_obj
        );
        if (user_post_data.status === 0) {
          logger.error(
            "Error while inserting user post data = ",
            user_post_data
          );
        } else {
          var post_image_obj = {
            postId: user_post_data.user_post_photo._id,
            privacy: req.body.privacy
          };
          async.each(
            file_path_array,
            async function(file, callback) {
              post_image_obj.image = file;
              let user_post_data = await user_personal_goals_helper.insert_user_post_image(
                post_image_obj
              );
              if (user_post_data.status === 0) {
                unsuccess++;
                logger.error(
                  "Error while inserting user post data = ",
                  user_post_data
                );
              } else {
                success++;
              }
            },
            async function(err) {
              if (err) {
                console.log("Failed to upload image");
              } else {
                //personal_goal START
                let resp_data_for_single_post;
                var timelineObj = {
                  userId: req.body.onWall,
                  createdBy: authUserId,
                  postPhotoId: user_post_data.user_post_photo._id,
                  tagLine: "added a new post",
                  type: "personal_goal",
                  privacy: req.body.privacy ? req.body.privacy : 3
                };
                let user_timeline_data = await user_timeline_helper.insert_timeline_data(
                  timelineObj
                );

                if (user_timeline_data.status === 0) {
                  logger.error(
                    "Error while inserting personal_goal data = ",
                    user_timeline_data
                  );
                } else {
                  resp_data_for_single_post = await user_personal_goals_helper.get_user_timeline_by_id(
                    {
                      _id: mongoose.Types.ObjectId(
                        user_timeline_data.user_timeline._id
                      ),
                      isDeleted: 0
                    }
                  );

                  console.log(
                    "resp_data_for_single_post",
                    resp_data_for_single_post
                  );
                  logger.error(
                    "successfully added personal_goal data = ",
                    user_timeline_data
                  );
                }
                //personal_goal END
                return res.status(config.OK_STATUS).json({
                  status: 1,
                  message:
                    "post successfully added, " +
                    success +
                    " successfully uploaded image(s), " +
                    unsuccess +
                    " failed uploaded image(s)",
                  personal_goal: resp_data_for_single_post.personal_goal
                });
              }
            }
          );
        }
      }
    );
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**@apiIgnore Not finished Method
 * @api {put} /user/personal_goal/:photo_id Update
 * @apiName Update
 * @apiGroup User Personal Goal
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {File} image User's  Image
 * @apiParam {String} createdBy created User Id of user
 * @apiParam {String} description Description of Image
 * @apiParam {Number} privacy privacy of Image <br><code>1 for OnlyMe<br>2 for Friends<br>3 for Public</code>
 * @apiParam {Number} status status of Image <br><code>1 for Active<br>2 for Inactive</code>
 * @apiSuccess (Success 200) {JSON} user_post_photo user_post_photo details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:photo_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var user_post_obj = {};

  if (req.body.privacy) {
    user_post_obj.privacy = req.body.privacy;
  }
  if (req.body.description) {
    user_post_obj.description = req.body.description;
  }
  if (req.body.status) {
    user_post_obj.status = req.body.status;
  }

  resp_data = await user_personal_goals_helper.update_user_post_photo(
    { _id: req.params.photo_id, userId: authUserId },
    user_post_obj
  );
  if (resp_data.status === 0) {
    logger.error("Error while updating user post image = ", resp_data);
    res.status(config.BAD_REQUEST).json({ resp_data });
  } else {
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {delete} /user/personal_goal/:photo_id Delete
 * @apiName Delete
 * @apiGroup User Personal Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:photo_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete user's post photo API - Id = ", req.params.photo_id);
  let user_post_data = await user_personal_goals_helper.delete_user_post_photo(
    { userId: authUserId, _id: req.params.photo_id },
    { isDeleted: 1 }
  );

  if (user_post_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(user_post_data);
  } else {
    res.status(config.OK_STATUS).json(user_post_data);
  }
});

module.exports = router;
