var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var constant = require("../../constant");
var _ = require("underscore");

var logger = config.logger;
var user_posts_helper = require("../../helpers/user_posts_helper");
var user_timeline_helper = require("../../helpers/user_timeline_helper");
var user_helper = require("../../helpers/user_helper");
var workout_progress_helper = require("../../helpers/workout_progress_helper");
var friend_helper = require("../../helpers/friend_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var user_progress_photos_helper = require("../../helpers/user_progress_photos_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var widgets_settings_helper = require("../../helpers/widgets_settings_helper");
var user_settings_helper = require("../../helpers/user_settings_helper");
var common_helper = require("../../helpers/common_helper");
var socket = require("../../socket/socketServer");

/**
 * @api {get} /user/timeline/widgets/:username Get user's widgets
 * @apiName Get user's widgets
 * @apiGroup User Timeline
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} data widgets data
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/widgets/:username", async (req, res) => {
    var userId = await user_helper.get_user_by({
        username: req.params.username
    });

    try {
        var authUserId = userId.user.authUserId;
    } catch (error) {
        return res.send({
            status: 2,
            message: "Invalid username"
        });
    }
    //start other data on timeline
    var timeline = {
        status: 1,
        message: "Success",
        data: {
            userWidgets: null,
            progressPhoto: null,
            badges: null,
            bodyFat: null,
            muscle: null
        }
    };

    //Widgets
    var widgets = await widgets_settings_helper.get_all_widgets(
            {
                userId: authUserId,
                widgetFor: "timeline"
            },
            {
                bodyFat: 1,
                muscle: 1,
                badges: 1,
                progressPhoto: 1
            }
    );

    if (widgets.status === 1) {
        timeline.data.userWidgets = widgets.widgets;

        if (widgets.widgets.progressPhoto) {
            var progressPhoto = await user_progress_photos_helper.get_first_and_last_user_progress_photos(
                    {
                        userId: authUserId
                    }
            );
            if (progressPhoto.status === 1) {
                timeline.data.progressPhoto = progressPhoto.user_progress_photos;
            } else {
                timeline.data.progressPhoto = null;
            }
        }

        if (widgets.widgets.badges) {
            var badges = await badge_assign_helper.get_all_badges(
                    {
                        userId: authUserId
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    },
                    {
                        $limit: 6
                    }
            );
            if (badges.status === 1) {
                timeline.data.badges = badges.badges;
            }
        }

        if (widgets.widgets.bodyFat) {
            var body = await workout_progress_helper.graph_data_body_fat({
                createdAt: {
                    logDate: {
                        $gte: new Date(widgets.widgets.bodyFat.start),
                        $lte: new Date(widgets.widgets.bodyFat.end)
                    },
                    userId: authUserId
                }
            });

            if (body.status === 1) {
                timeline.data.bodyFat = body.progress;
            }
        }

        if (widgets.widgets.muscle) {
            var muscle = {};
            var bodyMeasurment;
            for (let x of widgets.widgets.muscle) {
                bodyMeasurment = await workout_progress_helper.user_body_progress({
                    userId: authUserId,
                    logDate: {
                        $gte: new Date(x.start),
                        $lte: new Date(x.end)
                    }
                });
                if (bodyMeasurment.status === 1) {
                    muscle[x.name] = bodyMeasurment.progress.data[x.name];
                } else {
                    muscle[x.name] = null;
                }
            }
            timeline.data.muscle = muscle;
        }
    }
    return res.send(timeline);
    //end Other data on timeline
});
/**
 * @api {get} /user/timeline/privacy/:username Get User Preference
 * @apiName Get Preference
 * @apiGroup  User Timeline
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_settings user preference in user_settings detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/privacy/:username", async (req, res) => {
    var user = await user_helper.get_user_by({
        username: req.params.username
    });
    if (user.status === 1) {
        var settings_data = await user_settings_helper.get_setting({
            userId: user.user.authUserId
        });
        if (settings_data.status === 0) {
            logger.error("Error while fetching setting  = ", settings_data);
            return res.status(config.INTERNAL_SERVER_ERROR).json({
                settings_data
            });
        } else {
            return res.status(config.OK_STATUS).json(settings_data);
        }
    } else {
        return res.status(config.BAD_REQUEST).json(user);
    }
});
/**
 * @api {get} /user/timeline/:post_id Get by ID
 * @apiName Get by ID
 * @apiGroup User Timeline
 * @apiSuccess (Success 200) {JSON} timeline JSON of user_posts 's document
 * @apiHeader {String}  authorization user's unique access-key
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:post_id", async (req, res) => {
    let decoded = jwtDecode(req.headers["authorization"]);
    let authUserId = decoded.sub;
    let friendshipStatus = "unknown";
    let _id = req.params.post_id;
    logger.trace("Get all user's timeline API called");

    let resp_data = await user_posts_helper.get_user_timeline_by_id({_id: mongoose.Types.ObjectId(_id), isDeleted: 0}, authUserId);

    if (resp_data && resp_data.status === 1 &&
            resp_data.timeline &&
            resp_data.timeline.owner_by &&
            resp_data.timeline.owner_by.authUserId) {
        if (authUserId.toString() === resp_data.timeline.owner_by.authUserId.toString()) {
            friendshipStatus = "self";
        }
        let friendId = resp_data.timeline.owner_by.authUserId;

        var friend = await friend_helper.checkFriend({
            $or: [{
                    $and: [{
                            userId: authUserId
                        }, {
                            friendId: friendId
                        }]
                },
                {
                    $and: [{
                            userId: friendId
                        }, {
                            friendId: authUserId
                        }]
                }
            ]
        });

        if (friend && friend.status === 1) {
            if (friend.friends.status === 2) {
                friendshipStatus = "friend"
            }
        }
    }
    if (resp_data.status == 1) {
        resp_data.timeline.friendshipStatus = friendshipStatus
        logger.trace("user timeline got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    } else {
        logger.error(
                "Error occured while fetching get all user timeline = ",
                resp_data
                );
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    }
});

router.get("/discover/:start?/:offset?", async (req, res) => {
    logger.trace("Get discover user's timeline API called");
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var skip = req.params.start ? req.params.start : 0;
    var limit = req.params.offset ? req.params.offset : 10;
    var privacyArray = [3];
    var resp_data = await user_posts_helper.get_user_timeline(
        {
            privacy: {
                $in: privacyArray
            },
            isDeleted: 0
        },
        {
            $skip: parseInt(skip)
        },
        {
            $limit: parseInt(limit)
        },
        {
            $orderby: { createdAt : -1 }
        }
    );
    if (resp_data.status === 1) {
        res.status(config.OK_STATUS).json(resp_data);
    }else {
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    }
})

/**
 * @api {get} /user/timeline/:username/:start?/:offset? Get all
 * @apiName Get all
 * @apiGroup User Timeline
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} timeline JSON of user_posts 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:username/:start?/:offset?", async (req, res) => {
    logger.trace("Get user's timeline API called");
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var skip = req.params.start ? req.params.start : 0;
    var limit = req.params.offset ? req.params.offset : 10;
    var privacyArray = [3];
    var user = await user_helper.get_user_by({
        username: req.params.username
    });
    if (user.status === 1) {
        var friendId = user.user.authUserId;
        var searchObject = {
            $or: [
                {
                    $and: [
                        {
                            userId: authUserId
                        },
                        {
                            friendId: friendId
                        }
                    ]
                },
                {
                    $and: [
                        {
                            userId: friendId
                        },
                        {
                            friendId: authUserId
                        }
                    ]
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
                    privacy: {
                        $in: privacyArray
                    },
                    userId: friendId,
                    isDeleted: 0
                },
                {
                    $skip: parseInt(skip)
                },
                {
                    $limit: parseInt(limit)
                },
                {
                    $orderby: { createdAt : -1 }
                }
        );

        if (resp_data.status === 1) {
            var getUserPrivacy = await user_settings_helper.get_setting({
                userId: friendId
            });

            if (getUserPrivacy.status === 1) {
                getUserPrivacy = {
                    postAccessibility: getUserPrivacy.user_settings.postAccessibility,
                    commentAccessibility:
                            getUserPrivacy.user_settings.commentAccessibility,
                    messageAccessibility:
                            getUserPrivacy.user_settings.messageAccessibility,
                    friendRequestAccessibility:
                            getUserPrivacy.user_settings.friendRequestAccessibility
                };
            } else {
                getUserPrivacy = null;
            }
            resp_data.privacy = getUserPrivacy;
            logger.trace("user timeline got successfully = ", resp_data);
            res.status(config.OK_STATUS).json(resp_data);
        } else {
            logger.error(
                    "Error occured while fetching get all user timeline = ",
                    resp_data
                    );
            res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
        }
    } else {
        return res.status(config.BAD_REQUEST).json(user);
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
 * @api {post} /user/timeline/body_fat Save
 * @apiName Save Bodyfat
 * @apiGroup User Timeline
 * @apiParam start start date
 * @apiParam end end date
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} widgets JSON of widgets_settings's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/body_fat", async (req, res) => {
    logger.trace("Save user's body fat widgets API called");
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var returnObj = {
        status: 1,
        message: "Success",
        data: {
            widgets: null,
            bodyFat: null
        }
    };
    var schema = {
        start: {
            notEmpty: true,
            errorMessage: "Start date required"
        },
        end: {
            notEmpty: true,
            errorMessage: "End date required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        var widgets_settings_object = {
            userId: authUserId,
            modifiedAt: new Date()
        };
        widgets_settings_object.bodyFat = {
            start: req.body.start,
            end: req.body.end
        };

        var widgets_data = await widgets_settings_helper.save_widgets(
                widgets_settings_object,
                {
                    userId: authUserId,
                    widgetFor: "timeline"
                }
        );

        if (widgets_data && widgets_data.status === 1) {
            returnObj.data.widgets = widgets_data.widgets;
            var body = await workout_progress_helper.graph_data_body_fat({
                createdAt: {
                    logDate: {
                        $gte: new Date(req.body.start),
                        $lte: new Date(req.body.end)
                    },
                    userId: authUserId
                }
            });

            if (body.status === 1) {
                returnObj.data.bodyFat = body.progress;
            }
            logger.trace("user body fat widget saved   = ", returnObj);
            res.status(config.OK_STATUS).json(returnObj);
        } else {
            logger.error(
                    "Error occured while saving user body fat widgets = ",
                    widgets_data
                    );
            res.status(config.INTERNAL_SERVER_ERROR).json(widgets_data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
    }
});

/**
 * @api {post} /user/timeline/muscle Save
 * @apiName Save Muscle
 * @apiGroup User Timeline
 * @apiParam type type type of muscle
 * @apiParam start start date
 * @apiParam end end date
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} widgets JSON of widgets_settings's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/muscle", async (req, res) => {
    logger.trace("Save user's body fat widgets API called");
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var returnObj = {
        status: 1,
        message: "Success",
        data: {
            widgets: null,
            bodypart: null,
            muscle: []
        }
    };
    var schema = {
        start: {
            notEmpty: true,
            errorMessage: "Start date required"
        },
        end: {
            notEmpty: true,
            errorMessage: "End date required"
        }
    };

    req.checkBody(schema);
    var errors = req.validationErrors();

    if (!errors) {
        var widgets_settings_object = {
            userId: authUserId,
            modifiedAt: new Date()
        };

        var widgets_data = await widgets_settings_helper.get_all_widgets({
            userId: authUserId,
            widgetFor: "timeline"
        });

        if (widgets_data.status === 1) {
            var muscle = widgets_data.widgets.muscle;
            _.map(muscle, function (o) {
                o.start = req.body.start;
                o.end = req.body.end;
            });

            widgets_settings_object.muscle = muscle;
            var widgets_data = await widgets_settings_helper.save_widgets(
                    widgets_settings_object,
                    {
                        userId: authUserId,
                        widgetFor: "timeline"
                    }
            );

            if (widgets_data && widgets_data.status === 1) {
                returnObj.data.widgets = widgets_data.widgets;
                logger.trace("User muscle widget saved   = ", returnObj);
                var muscle = {};
                var bodyMeasurment;
                for (let x of widgets_data.widgets.muscle) {
                    x.start = req.body.start;
                    x.end = req.body.end;
                    bodyMeasurment = await workout_progress_helper.user_body_progress({
                        userId: authUserId,
                        logDate: {
                            $gte: new Date(req.body.start),
                            $lte: new Date(req.body.end)
                        }
                    });
                    if (bodyMeasurment.status === 1) {
                        muscle[x.name] = bodyMeasurment.progress.data[x.name];
                    } else {
                        muscle[x.name] = null;
                    }
                }
                returnObj.data.muscle = muscle;
                res.status(config.OK_STATUS).json(returnObj);
            } else {
                returnObj.wi;
                logger.error(
                        "Error occured while saving user muscle widgets = ",
                        widgets_data
                        );
                res.status(config.INTERNAL_SERVER_ERROR).json(widgets_data);
            }
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
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
        privacy: {
            notEmpty: true,
            errorMessage: "privacy is required"
        },
        onWall: {
            notEmpty: true,
            errorMessage: "Reciver Id is required"
        }
    };

    req.checkBody(schema);
    var errors = req.validationErrors();

    if (!errors) {
        var user_post_obj = {
            userId: req.body.onWall,
            description: req.body.description ? req.body.description : null
        };

        if (req.body.privacy) {
            user_post_obj.privacy = req.body.privacy;
        }
        user_post_obj.createdBy = authUserId;
        async.waterfall(
                [
                    function (callback) {
                        //image upload
                        if (req.files && req.files["images"]) {
                            var file_path_array = [];
                            var files = [].concat(req.files.images);
                            var dir = "./uploads/user_post";
                            var increment = 1;

                            async.eachSeries(
                                    files,
                                    function (file, loop_callback) {
                                        var mimetype = ["image/png", "image/jpeg", "image/jpg"];
                                        if (mimetype.indexOf(file.mimetype) != -1) {
                                            if (!fs.existsSync(dir)) {
                                                fs.mkdirSync(dir);
                                            }
                                            extention = path.extname(file.name);
                                            filename = `user_post_${new Date().getTime()}_${increment}${extention}`;

                                            file.mv(dir + "/" + filename, function (err) {
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
                                                    increment++;
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
                                    function (err) {
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
                        async function (file, callback) {
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
                        async function (err) {
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
                                    resp_data_for_single_post = await user_posts_helper.get_user_timeline_by_id({_id: mongoose.Types.ObjectId(user_timeline_data.user_timeline._id), isDeleted: 0}, authUserId);
                                    logger.error(
                                            "successfully added timeline data = ",
                                            user_timeline_data
                                            );
                                }
                                //TIMELINE END
                                res.status(config.OK_STATUS).json({
                                    status: 1,
                                    message:
                                            "post successfully added, " +
                                            success +
                                            " successfully uploaded image(s), " +
                                            unsuccess +
                                            " failed uploaded image(s)",
                                    timeline: resp_data_for_single_post.timeline
                                });

                                if (authUserId.toString() !== req.body.onWall.toString()) {
                                    var notificationObj = {
                                        senderId: authUserId,
                                        receiverId: req.body.onWall,
                                        timelineId: user_timeline_data.user_timeline._id,
                                        type: constant.NOTIFICATION_MESSAGES.POST.TYPE,
                                        bodyMessage: constant.NOTIFICATION_MESSAGES.POST.MESSAGE
                                    };
                                    var tmp = await common_helper.send_notification(
                                            notificationObj,
                                            socket
                                            );
                                }

                                // Badge assign
                                var total_post = await user_posts_helper.count_post({
                                    userId: authUserId
                                });
                                if (total_post.status === 1) {
                                    var post_data = await badge_assign_helper.badge_assign(
                                            authUserId,
                                            constant.BADGES_TYPE.PROFILE,
                                            {
                                                post: total_post.count
                                            }
                                    );
                                }
                                // Badge assign end
                            }
                        }
                );
            }
        }
        );
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
    }
});

/**
 * @api {put} /user/timeline/:timelineId Update
 * @apiName Update
 * @apiGroup User Timeline
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {String} [description] Description of Image
 * @apiParam {Number} [privacy] privacy of Image <br><code>1 for OnlyMe<br>2 for Friends<br>3 for Public</code>
 * @apiParam {Number} [status] status of Image <br><code>1 for Active<br>2 for Inactive</code>
 * @apiSuccess (Success 200) {JSON} user_post_photo user_post_photo details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:timelineId", async (req, res) => {
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

    var resp_data = await user_timeline_helper.update_user_timeline_by_id(
            {
                _id: req.params.timelineId,
                userId: authUserId
            },
            user_post_obj
            );
    if (resp_data.status === 1) {
        res.status(config.OK_STATUS).json(resp_data);
    } else {
        logger.error("Error while updating user post image = ", resp_data);
        res.status(config.BAD_REQUEST).json({
            resp_data
        });
    }
});

/**
 * @api {delete} /user/timeline/:timelineId Delete
 * @apiName Delete
 * @apiGroup User Timeline
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:timelineId", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    logger.trace("Delete user's post photo API - Id = ", req.params.photo_id);
    let user_post_data = await user_posts_helper.delete_user_timeline_post(
            {
                userId: authUserId,
                _id: req.params.timelineId
            },
            {
                isDeleted: 1
            }
    );
    if (user_post_data.status === 0) {
        res.status(config.INTERNAL_SERVER_ERROR).json(user_post_data);
    } else {
        res.status(config.OK_STATUS).json(user_post_data);
    }
});

module.exports = router;
