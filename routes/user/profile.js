var express = require("express");
var fs = require("fs");
var async = require("async");
var jwtDecode = require("jwt-decode");
var router = express.Router();

var config = require("../../config");
var logger = config.logger;
var base64Img = require("base64-img");
var constant = require("../../constant");

var user_helper = require("../../helpers/user_helper");
var friend_helper = require("../../helpers/friend_helper");
var follow_helper = require("../../helpers/follow_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var user_settings_helper = require("../../helpers/user_settings_helper");
var common_helper = require("../../helpers/common_helper");
var user_workouts_helper = require("../../helpers/user_workouts_helper");

/**
 * @api {get} /user/profile/preferences Get User Profile preferences
 * @apiName Get Profile preferences
 * @apiGroup User
 * @apiSuccess (Success 200) {JSON} user_settings JSON of users_settings document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/preferences", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var resp_data = await user_settings_helper.get_setting({
        userId: authUserId
    });
    if (resp_data.status == 0) {
        logger.error("Error occured while fetching user profile = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        logger.trace("user profile got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    }
});

/**
 * @api {get} /user/profile Get User Profile by AuthID
 * @apiName Get Profile by AuthID
 * @apiGroup User
 * @apiSuccess (Success 200) {Array} user Array of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;

    var resp_data = await user_helper.get_user_by({
        authUserId: authUserId
    });
    if (resp_data.status == 0) {
        logger.error("Error occured while fetching user profile = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        logger.trace("user profile got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    }
});

/**
 * @api {get} /user/profile/:username Get User Profile by username
 * @apiName Get Profile by username
 * @apiGroup User
 * @apiSuccess (Success 200) {JSON} user JSON of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:username", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var friendshipStatus = "";
    var friendshipId = "";
    let followingStatus = false;
    let followingId = null;

    var userdata = await friend_helper.find({
        username: req.params.username
    });
    if (userdata.status == 2) {
        return res.status(config.OK_STATUS).json({
            status: 1,
            message: "No username available",
            user: []
        });
    }

    var userAuthId = userdata.friends.authUserId;
    if (userAuthId && typeof userAuthId !== "undefined") {
        if (userAuthId === authUserId) {
            friendshipStatus = "self";
        } else {
            friend_data = await friend_helper.checkFriend({
                $or: [
                    {
                        $and: [
                            {
                                userId: authUserId
                            },
                            {
                                friendId: userAuthId
                            }
                        ]
                    },
                    {
                        $and: [
                            {
                                userId: userAuthId
                            },
                            {
                                friendId: authUserId
                            }
                        ]
                    }
                ]
            });

            if (friend_data.status == 1) {
                friendshipId = friend_data.friends._id;
                if (friend_data.friends.status == 1) {
                    friend_data = await friend_helper.checkFriend({
                        userId: authUserId,
                        friendId: userAuthId
                    });
                    if (friend_data.status == 1) {
                        friendshipStatus = "request_sent";
                    } else {
                        friendshipStatus = "request_received";
                    }
                } else {
                    friendshipStatus = "friend";
                }
            } else {
                friendshipStatus = "unknown";
            }
        }
    }

    logger.trace("Get user profile by ID API called : ", authUserId, req.params.username);

    let followingRes = await follow_helper.getFollowing(authUserId, userAuthId);
    if (followingRes && followingRes.status === 1) {
        if (followingRes.data) {
            followingStatus = true;
            followingId = followingRes.data._id;
        }
    }


    var resp_data = await user_helper.get_user_by({
        username: req.params.username
    });
    if (resp_data.status == 0) {
        logger.error("Error occured while fetching user profile = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        let totalFollowers = await follow_helper.countFollowers(resp_data.user.authUserId);
        let totalFollowings = await follow_helper.countFollowings(resp_data.user.authUserId);
        let totalWorkouts = await user_workouts_helper.countWorkouts(resp_data.user.authUserId);
        resp_data.user.friendshipStatus = friendshipStatus;
        resp_data.user.friendshipId = friendshipId;
        resp_data.user.followingStatus = followingStatus;
        resp_data.user.followingId = followingId;
        resp_data.user.totalFollowers = totalFollowers;
        resp_data.user.totalFollowings = totalFollowings;
        resp_data.user.totalWorkouts = totalWorkouts;
        logger.trace("user profile got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    }
});

/**
 * @api {put} /user/profile Profile - Update
 * @apiName Profile - Update
 * @apiGroup User
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} [firstName] First name of user
 * @apiParam {String} [lastName] Last name of user
 * @apiParam {Number} [mobileNumber] mobileNumber
 * @apiParam {Number} [height] height
 * @apiParam {Number} [weight] weight
 * @apiParam {Enum} [gender] gender | Possible Values ('male', 'female', 'transgender')
 * @apiParam {Date} [dateOfBirth] Date of Birth
 * @apiParam {Enum-Array} [goals] goals | Possible Values ('gain_muscle', 'improve_mobility', 'lose_fat','gain_strength', 'gain_power', 'increase_endurance')
 * @apiParam {String} [aboutMe] aboutMe
 * @apiParam {String} [workoutLocation] workoutLocation
 * @apiParam {Boolean} [status] status of profile
 * @apiSuccess (Success 200) {JSON} user JSON of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var schema = {
        mobileNumber: {
            notEmpty: true,
            errorMessage: "Mobile number is required"
        },
        gender: {
            notEmpty: true,
            isIn: {
                options: [["male", "female"]],
                errorMessage: "Gender is invalid"
            },
            errorMessage: "Gender is required"
        }
    };
    req
            .checkBody("firstName")
            .trim()
            .notEmpty()
            .withMessage("First name is required.")
            .isLength({
                min: 2,
                max: 15
            })
            .withMessage("First name should be between 2 to 15 characters");

    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        var user_obj = {
            dateOfBirth: req.body.dateOfBirth ? req.body.dateOfBirth : null,
            modifiedAt: new Date()
        }
        if (typeof req.body.lastName !== "undefined") {
            user_obj.lastName = req.body.lastName;
        }
        if (typeof req.body.aboutMe !== "undefined") {
            user_obj.aboutMe = req.body.aboutMe;
        }
        if (typeof req.body.workoutLocation !== "undefined") {
            user_obj.workoutLocation = req.body.workoutLocation;
        }
        if (typeof req.body.height !== "undefined") {
            user_obj.height = req.body.height;
        }
        if (typeof req.body.weight !== "undefined") {
            user_obj.weight = req.body.weight;
        }
        if (req.body.firstName) {
            user_obj.firstName = req.body.firstName;
        }
        if (req.body.mobileNumber) {
            user_obj.mobileNumber = req.body.mobileNumber;
        }
        if (req.body.gender) {
            user_obj.gender = req.body.gender;
        }
        if (req.body.heightUnit) {
            var height = await common_helper.unit_converter(
                    req.body.height,
                    req.body.heightUnit
                    );
            user_obj.height = height.baseValue;
        }
        if (req.body.weightUnit) {
            var weight = await common_helper.unit_converter(
                    req.body.weight,
                    req.body.weightUnit
                    );
            user_obj.weight = weight.baseValue;
        }


        let user = await user_helper.get_user_by_id(authUserId);

        if (user.status == 1) {
            if (user.user.goal) {
                if (user.user.goal.name != req.body.goal) {
                    if (req.body.goal) {
                        user_obj.goal = {
                            name: req.body.goal,
                            start: 0
                        };
                    } else {
                        user_obj.goal = null;
                    }
                }
            } else {
                if (req.body.goal) {
                    user_obj.goal = {
                        name: req.body.goal,
                        start: 0
                    };
                } else {
                    user_obj.goal = null;
                }
            }
        }

        let user_data = await user_helper.update_user_by_id(authUserId, user_obj);

        if (user_data.status === 1) {
            res.status(config.OK_STATUS).json(user_data);
            await badgeAssign(authUserId);
        } else if (user_data.status === 2) {
            logger.error("Error while updating user data = ", user_data);
            res.status(config.INTERNAL_SERVER_ERROR).json({
                user_data
            });
        } else {
            logger.error("Error while updating user data = ", user_data);
            res.status(config.INTERNAL_SERVER_ERROR).json({
                user_data
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
 * @api {put} /user/profile/update_aboutme update aboutme - Update
 * @apiName update aboutme - Update
 * @apiGroup User
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} about about of user
 * @apiParam {String} height height of user
 * @apiParam {String} weight weight of user
 * @apiSuccess (Success 200) {JSON} user JSON of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/update_aboutme", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;

    var schema = {
        // height: {
        //   notEmpty: false,
        //   errorMessage: "height is required",
        //   isDecimal: {
        //     errorMessage: "Please enter numeric value"
        //   }
        // },
        // weight: {
        //   notEmpty: false,
        //   errorMessage: "weight is required",
        //   isDecimal: {
        //     errorMessage: "Please enter numeric value"
        //   }
        // }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();

    if (!errors) {
        var user_profile_obj = {};
        if (req.body.aboutMe) {
            user_profile_obj.aboutMe = req.body.aboutMe;
        }
        // if (req.body.weight) {
        //   user_profile_obj.weight = req.body.weight;
        // }
        // if (req.body.height) {
        //   user_profile_obj.height = req.body.height;
        // }
        user_profile_obj.height = 0;
        user_profile_obj.weight = 0;
        if (req.body.height) {
            if (req.body.heightUnit) {
                var height = await common_helper.unit_converter(
                        req.body.height,
                        req.body.heightUnit
                        );
            }
            user_profile_obj.height = height.baseValue;
        }
        if (req.body.weight) {
            if (req.body.weightUnit) {
                var weight = await common_helper.unit_converter(
                        req.body.weight,
                        req.body.weightUnit
                        );
            }
            user_profile_obj.weight = weight.baseValue;
        }

        let user_data = await user_helper.update_user_by_id(
                authUserId,
                user_profile_obj
                );
        if (user_data.status === 1) {
            res.status(config.OK_STATUS).json(user_data);
            var badges = await badgeAssign(authUserId);
        } else {
            logger.error("Error while updating user data = ", user_data);
            return res.status(config.BAD_REQUEST).json({
                user_data
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
 * @api {delete} /user/profile/photo Profile Picture - Delete
 * @apiName Profile Picture - Delete
 * @apiGroup User
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/photo", async (req, res) => {
    try {
        var decoded = jwtDecode(req.headers["authorization"]);
        var authUserId = decoded.sub;
        const resp_data = await user_helper.get_user_by_id(authUserId);
        if (resp_data.status === 1) {
            const user_profile_img = resp_data.user.avatar;
            if (user_profile_img) {
                fs.unlink(resp_data.user.avatar, function () { });
                const user_obj = {
                    avatar: ""
                };
                let user_data = await user_helper.update_user_by_id(authUserId, user_obj);
                if (user_data.status === 1) {
                    logger.info("Updated user profile", user_data);
                    res.status(config.OK_STATUS).json(user_data);
                    common_helper
                            .sync_user_data_to_auth(authUserId, {picture: ""})
                            .then(function (response) { })
                            .catch(function (error) { });
                } else {
                    logger.error("Error while deleting user avatar = ", user_data);
                    res.status(config.INTERNAL_SERVER_ERROR).json({
                        user_data
                    });
                }
            } else {
                return res.status(config.BAD_REQUEST).json({
                    status: 0,
                    message: "no image found"
                });
            }
        } else {
            return res.status(config.BAD_REQUEST).json({
                status: 0,
                message: "no user found"
            });
        }
    } catch (e) {
        return res.status(config.INTERNAL_SERVER_ERROR).json({
            status: 0,
            message: "Something went wrong"
        });
    }
});

/**
 * @api {put} /user/profile/photo Profile Picture - Update
 * @apiName Profile Picture - Update
 * @apiGroup User
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} user_img base64 encoded data
 * @apiSuccess (Success 200) {String} message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/photo", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;

    var user_obj = {
        avatar: ""
    };
    var base_url = config.BASE_URL;
    var dir = "./uploads/user";
    var filename = "user_" + new Date().getTime();
    var filepath = base64Img.imgSync(req.body.user_img, dir, filename);
    var filepath = filepath.replace(/\\/g, "/");

    if (filepath) {
        user_obj.avatar = base_url + filepath;

        resp_data = await user_helper.get_user_by_id(authUserId);
        try {
            fs.unlink(resp_data.user.avatar, function () { });
        } catch (err) {
        }
        let user_data = await user_helper.update_user_by_id(authUserId, user_obj);

        if (user_data.status === 1) {
            logger.info("Updated user profile", user_data);
            res.status(config.OK_STATUS).json(user_data);
            common_helper
                    .sync_user_data_to_auth(authUserId, {
                        picture: user_obj.avatar
                    })
                    .then(function (response) { })
                    .catch(function (error) { });
            var badges = await badgeAssign(authUserId);
        } else {
            logger.error("Error while updating user avatar = ", user_data);
            res.status(config.INTERNAL_SERVER_ERROR).json({
                user_data
            });
        }
    } else {
        return res.status(config.BAD_REQUEST).json({
            status: 2,
            message: "no image selected"
        });
    }
});

/**
 * @api {put} /user/profile/preferences Save User Preference
 * @apiName Save Preference
 * @apiGroup User
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} distance distance unit of user. <code>Enum : ["km", "mile"]</code>
 * @apiParam {String} weight weight unit of user. <code>Enum : ["kg", "lb"]</code>
 * @apiParam {String} bodyMeasurement body measurement unit of user. <code>Enum : ["cm", "inch"]</code>
 * @apiParam {String} postAccessibility post accessibility of user.
 * @apiParam {String} commentAccessibility comment accessibility of user.
 * @apiParam {String} messageAccessibility message accessibility of user.
 * @apiParam {String} friendRequestAccessibility friend request accessibility of user.
 * @apiSuccess (Success 200) {JSON} user_settings user preference in user_settings detail.
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/preferences", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;

    var schema = {};

    if (req.body.distance) {
        schema.distance = {
            notEmpty: false,
            isIn: {
                options: [["km", "mile"]],
                errorMessage: "distance is invalid"
            },
            errorMessage: "distance unit required"
        };
    }

    if (req.body.weight) {
        schema.weight = {
            notEmpty: false,
            isIn: {
                options: [["kg", "lb"]],
                errorMessage: "weight is invalid"
            },
            errorMessage: "weight unit required"
        };
    }

    if (req.body.bodyMeasurement) {
        schema.bodyMeasurement = {
            notEmpty: false,
            isIn: {
                options: [["cm", "inch"]],
                errorMessage: "body is invalid"
            },
            errorMessage: "body measurement unit required"
        };
    }

    if (req.body.postAccessibility) {
        schema.postAccessibility = {
            notEmpty: false,
            isDecimal: {
                errorMessage: "post accessibility is invalid"
            },
            errorMessage: "post accessibility is required"
        };
    }

    if (req.body.commentAccessibility) {
        schema.commentAccessibility = {
            notEmpty: false,
            isDecimal: {
                errorMessage: "comment accessibility is invalid"
            },
            errorMessage: "comment accessibility is required"
        };
    }

    if (req.body.messageAccessibility) {
        schema.messageAccessibility = {
            notEmpty: false,
            isDecimal: {
                errorMessage: "message accessibility is invalid"
            },
            errorMessage: "message accessibility is required"
        };
    }

    if (req.body.friendRequestAccessibility) {
        schema.friendRequestAccessibility = {
            notEmpty: false,
            isDecimal: {
                errorMessage: "friend request accessibility is invalid"
            },
            errorMessage: "friend request accessibility is required"
        };
    }

    req.checkBody(schema);
    var errors = req.validationErrors();

    if (!errors) {
        var setting_obj = {};
        if (req.body.distance) {
            setting_obj.distance = req.body.distance;
        }

        if (req.body.weight) {
            setting_obj.weight = req.body.weight;
        }

        if (req.body.bodyMeasurement) {
            setting_obj.bodyMeasurement = req.body.bodyMeasurement;
        }

        if (req.body.postAccessibility) {
            setting_obj.postAccessibility = req.body.postAccessibility;
        }

        if (req.body.commentAccessibility) {
            setting_obj.commentAccessibility = req.body.commentAccessibility;
        }

        if (req.body.messageAccessibility) {
            setting_obj.messageAccessibility = req.body.messageAccessibility;
        }

        if (req.body.friendRequestAccessibility) {
            setting_obj.friendRequestAccessibility =
                    req.body.friendRequestAccessibility;
        }

        setting_obj.modifiedAt = new Date();

        let settings_data = await user_settings_helper.save_settings(
                {
                    userId: authUserId
                },
                setting_obj
                );
        if (settings_data.status === 0) {
            logger.error("Error while saving setting  = ", settings_data);
            return res.status(config.BAD_REQUEST).json({
                settings_data
            });
        } else {
            return res.status(config.OK_STATUS).json(settings_data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
    }
});

async function badgeAssign(authUserId) {
    var user_data = await user_helper.get_user_by_id(authUserId);
    if (user_data.status === 1) {
        var data = user_data.user;

        var percentage = 0;
        for (const key of Object.keys(data)) {
            if (data[key]) {
                if (key == "gender") {
                    percentage += 10;
                } else if (key == "dateOfBirth") {
                    percentage += 15;
                } else if (key == "height") {
                    percentage += 10;
                } else if (key == "weight") {
                    percentage += 10;
                } else if (key == "avatar") {
                    percentage += 15;
                } else if (key == "aboutMe") {
                    percentage += 10;
                } else if (key == "lastName") {
                    percentage += 10;
                } else if (key == "mobileNumber") {
                    percentage += 10;
                } else if (key == "goal") {
                    percentage += 10;
                }
            }
        }

        //badge assign
        var badgeAssign = await badge_assign_helper.badge_assign(
                authUserId,
                constant.BADGES_TYPE.PROFILE,
                {
                    percentage: percentage
                }
        );
        return badgeAssign;
    }
    return {
        status: 0
    };
}

router.get("/foll/:username/:_for", async (req, res) => {
    try {
        const {username, _for} = req.params;
        const userDetailsRes = await user_helper.get_user_by({username});
        if (userDetailsRes && userDetailsRes.status === 1) {
            const {user} = userDetailsRes;
            if (_for === 'followers') {
                const result = await follow_helper.getFollowers(user.authUserId);
                console.log('result => ', result);
                res.status(config.OK_STATUS).json({
                    status: 1,
                    message: "Followers",
                    data: result.data
                });
            } else if (_for === 'followings') {
                const result = await follow_helper.getFollowings(user.authUserId);
                res.status(config.OK_STATUS).json({
                    status: 1,
                    message: "Followings",
                    data: result.data
                });
            } else {
                logger.error("Invalid param passed = ");
                res.status(config.BAD_REQUEST).json({
                    status: 0,
                    message: "Invalid param.",
                    error: ["Invalid param."]
                });
            }
        } else {
            logger.error("User not found by username = ");
            res.status(config.INTERNAL_SERVER_ERROR).json({
                status: 0,
                message: "Something went wrong! please try again.",
                error: ["Something went wrong! please try again."]
            });
        }
    } catch (error) {
        logger.error("Internal server error = ", error);
        res.status(config.INTERNAL_SERVER_ERROR).json({
            status: 0,
            message: "Something went wrong! please try again.",
            error: ["Something went wrong! please try again."]
        });
    }
});

module.exports = router;
