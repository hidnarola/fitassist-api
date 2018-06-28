var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var constant = require("../../constant");

var logger = config.logger;

var user_posts_helper = require("../../helpers/user_posts_helper");
var user_timeline_helper = require("../../helpers/user_timeline_helper");
var user_helper = require("../../helpers/user_helper");
var friend_helper = require("../../helpers/friend_helper");
var user_progress_photos_helper = require("../../helpers/user_progress_photos_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");

/**
 * @api {get} /user/timeline/:post_id Get by ID
 * @apiName Get by ID
 * @apiGroup User Timeline
 * @apiSuccess (Success 200) {JSON} timeline JSON of user_posts 's document
 * @apiHeader {String}  authorization user's unique access-key
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:post_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var _id = req.params.post_id;

  logger.trace("Get all user's timeline API called");

  var resp_data = await user_posts_helper.get_user_timeline_by_id({
    _id: mongoose.Types.ObjectId(_id),
    isDeleted: 0
  });

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get all user timeline = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user timeline got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/timeline/:username/:start?/:offset? Get all
 * @apiName Get all
 * @apiGroup User Timeline
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} timeline JSON of user_posts 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:username/:start?/:offset?", async (req, res) => {
  logger.trace("Get all user's timeline API called");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var skip = req.params.start ? req.params.start : 0;
  var limit = req.params.offset ? req.params.offset : 10;
  var privacyArray = [3];
  var user = await user_helper.get_user_by({ username: req.params.username });
  var friendId = user.user.authUserId;

  var searchObject = {
    $or: [
      {
        $and: [{ userId: authUserId }, { friendId: friendId }]
      },
      {
        $and: [{ userId: friendId }, { friendId: authUserId }]
      }
    ]
  };

  var checkFriend = await friend_helper.checkFriend(searchObject);

  if (friendId == authUserId) {
    privacyArray = [1, 2, 3];
  } else if (checkFriend.status == 1) {
    privacyArray = [2, 3];
  } else {
    privacyArray = [3];
  }

  var resp_data = await user_posts_helper.get_user_timeline(
    {
      // $or: [{ privacy: 1 }, { privacy: 2 }, { privacy: 3 }],
      userId: friendId,
      isDeleted: 0
    },
    {
      $skip: parseInt(skip)
    },
    {
      $limit: parseInt(limit)
    }
  );
  var progress_photos_data = await user_progress_photos_helper.get_first_and_last_user_progress_photos(
    {
      userId: user.user.authUserId,
      isDeleted: 0
    }
  );

  if (progress_photos_data.status == 1) {
    resp_data.progress_photos = progress_photos_data.user_progress_photos;
  } else {
    resp_data.progress_photos = {};
  }

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get all user timeline = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user timeline got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/timeline/:user_post_id Get by ID
 * @apiName Get by ID
 * @apiGroup User Timeline
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} user_post_photo user_post_photo's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:user_post_id", async (req, res) => {
  logger.trace(
    "Get user post photo by ID API called : ",
    req.params.user_post_id
  );
  var resp_data = await user_posts_helper.get_user_post_photo_by_id({
    _id: req.params.user_post_id,
    isDeleted: 0
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
 * @api {post} /user/timeline Add
 * @apiName Add
 * @apiGroup User Timeline
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {File} [images] User's  Images is required on if description is not exist.
 * @apiParam {String} onWall id of user on whose timeline you are posting post
 * @apiParam {String} [description] image caption or timeline post is required on if images is not exist.
 * @apiParam {Number} [privacy] privacy of Image <br><code>1 for OnlyMe<br>2 for Friends<br>3 for Public</code>
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

        let user_post_data = await user_posts_helper.insert_user_post(
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
              let user_post_data = await user_posts_helper.insert_user_post_image(
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
                //TIMELINE START
                let resp_data_for_single_post;
                var timelineObj = {
                  userId: req.body.onWall,
                  createdBy: authUserId,
                  postPhotoId: user_post_data.user_post_photo._id,
                  tagLine: "added a new post",
                  type: "timeline",
                  privacy: req.body.privacy ? req.body.privacy : 3
                };
                let user_timeline_data = await user_timeline_helper.insert_timeline_data(
                  timelineObj
                );

                if (user_timeline_data.status === 0) {
                  logger.error(
                    "Error while inserting timeline data = ",
                    user_timeline_data
                  );
                } else {
                  resp_data_for_single_post = await user_posts_helper.get_user_timeline_by_id(
                    {
                      _id: mongoose.Types.ObjectId(
                        user_timeline_data.user_timeline._id
                      ),
                      isDeleted: 0
                    }
                  );

                  logger.error(
                    "successfully added timeline data = ",
                    user_timeline_data
                  );
                }
                //TIMELINE END

                // Badge assign
                var total_post = await user_posts_helper.count_post({
                  userId: authUserId
                });

                var post_data = await badge_assign_helper.badge_assign(
                  authUserId,
                  constant.BADGES_TYPE.PROFILE,
                  {
                    post: total_post.count
                  }
                );
                // Badge assign end

                return res.status(config.OK_STATUS).json({
                  status: 1,
                  message:
                    "post successfully added, " +
                    success +
                    " successfully uploaded image(s), " +
                    unsuccess +
                    " failed uploaded image(s)",
                  timeline: resp_data_for_single_post.timeline
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

/**
 * @api {put} /user/timeline/:photo_id Update
 * @apiName Update
 * @apiGroup User Timeline
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

  var user_post_obj = {
    modifiedAt: new Date()
  };

  if (req.body.privacy) {
    user_post_obj.privacy = req.body.privacy;
  }
  if (req.body.description) {
    user_post_obj.description = req.body.description;
  }
  if (req.body.status) {
    user_post_obj.status = req.body.status;
  }

  resp_data = await user_posts_helper.update_user_post_photo(
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
 * @api {delete} /user/timeline/:photo_id Delete
 * @apiName Delete
 * @apiGroup User Timeline
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:photo_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete user's post photo API - Id = ", req.params.photo_id);
  let user_post_data = await user_posts_helper.delete_user_post_photo(
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
