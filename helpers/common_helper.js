var bcrypt = require("bcrypt");
var common_helper = {};
var async = require("async");
var request = require("request");
var config = require("../config");
var _ = require("underscore");
var mongoose = require("mongoose");
var constant = require("../constant");
var NutritionalLabels = require("./../models/nutritional_labels");
var Nutritions = require("./../models/nutritions");
var user_helper = require("./../helpers/user_helper");
var user_workouts_helper = require("./../helpers/user_workouts_helper");
var notification_helper = require("./../helpers/notification_helper");
var badge_assign_helper = require("./../helpers/badge_assign_helper");
var user_timeline_helper = require("./../helpers/user_timeline_helper");
var user_posts_helper = require("./../helpers/user_posts_helper");
var socket = require("../socket/socketServer");

common_helper.hashPassword = function (callback) {
    bcrypt.compare(this.password, this.hash, function (err, res) {
        if (err) {
            callback({
                status: 0,
                error: err
            });
        } else {
            callback({
                status: 1,
                res: res
            });
        }
    });
};

common_helper.changeObject = function (data, callback) {
    columnFilter = {};
    columnSort = {};
    filter = [];
    //   columnFilterEqual = {};

    async.forEach(data.columnFilter, function (val, next) {
        var key = val.id;
        var value = val.value;
        if (val.isDigitFlag) {
            value = parseInt(val.value);
        } else if (!val.isEqualFlag) {
            re = new RegExp(val.value, "i");
            value = {
                $regex: re
            };
        }
        columnFilter[key] = value;
    });
    if (data.columnSort && data.columnSort.length > 0) {
        async.forEach(data.columnSort, function (val, next) {
            var key = val.id;
            var value = 1;
            if (val.desc) {
                value = -1;
            }
            columnSort[key] = value;
        });
    } else {
        columnSort["_id"] = -1;
    }

    data = {
        pageSize: data.pageSize,
        page: data.page,
        // columnFilterEqual,
        columnSort,
        columnFilter
    };
    return data;
};

/*
 * get_nutritional_labels is used to fetch all health_label data
 *
 * @return  status 0 - If any internal error occured while fetching get_nutritional_labels data, with error
 *          status 1 - If get_nutritional_labels data found, with get_nutritional_labels object
 *          status 2 - If get_nutritional_labels not found, with appropriate message
 */
common_helper.get_nutritional_labels = async type => {
    try {
        var nutritional_labels_data = await NutritionalLabels.find(type);
        if (nutritional_labels_data) {
            return {
                status: 1,
                message: "nutritional labels found",
                labels: nutritional_labels_data
            };
        } else {
            return {
                status: 2,
                message: "No nutritional labels available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding nutritional labels",
            error: err
        };
    }
};

/*
 * get_nutritions is used to fetch all nutrition
 *
 * @return  status 0 - If any internal error occured while fetching nutrition data, with error
 *          status 1 - If nutrition data found, with nutrition object
 *          status 2 - If nutrition not found, with appropriate message
 */
common_helper.get_nutritions = async () => {
    try {
        var nutrition = await Nutritions.find();
        if (nutrition) {
            return {
                status: 1,
                message: "Nutrition's details found",
                nutritions: nutrition
            };
        } else {
            return {
                status: 2,
                message: "No nutrition available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding nutrition",
            error: err
        };
    }
};


/*
 * unit_converter is used to convert  all unit
 *
 * @return  status 0 - If any internal error occured while converting unit data, with error
 *          status 1 - If unit data found, with unit object
 *          status 2 - If unit not found, with appropriate message
 */
common_helper.unit_converter = async (data, unit) => {
    var calculatedData;

    switch (unit) {
        case "cm":
            return {
                baseValue: data,
                baseUnit: unit
            };
        case "feet":
            calculatedData = data * 30.48;
            return {
                baseValue: calculatedData,
                baseUnit: "cm"
            };
        case "kg":
            calculatedData = data * 1000;
            return {
                baseValue: calculatedData,
                baseUnit: "g"
            };
        case "lb":
            calculatedData = data / 0.0022046;
            return {
                baseValue: calculatedData,
                baseUnit: "g"
            };
        case "in":
        case "inch":
            calculatedData = data * 2.54;
            return {
                baseValue: calculatedData,
                baseUnit: "cm"
            };
        case "hour":
            calculatedData = data * 60 * 60;
            return {
                baseValue: calculatedData,
                baseUnit: "second"
            };
        case "minute":
            calculatedData = data * 60;
            return {
                baseValue: calculatedData,
                baseUnit: "second"
            };
        case "km":
            calculatedData = data * 1000;
            return {
                baseValue: calculatedData,
                baseUnit: "meter"
            };
        case "meter":
            return {
                baseValue: data,
                baseUnit: unit
            };
        case "mile":
            calculatedData = data * 1609.344;
            return {
                baseValue: calculatedData,
                baseUnit: "meter"
            };
        case "g":
            return {
                baseValue: data,
                baseUnit: unit
            };
        case "mg":
            calculatedData = data / 1000;
            return {
                baseValue: calculatedData,
                baseUnit: "g"
            };
        case "kmph":
            return {
                baseValue: data,
                baseUnit: unit
            };
        case "mph":
            calculatedData = data * 1.60934;
            return {
                baseValue: calculatedData,
                baseUnit: "kmph"
            };
        default:
            return {
                baseValue: data,
                baseUnit: unit
            };
    }
};

/*
 * send_notification is used to send notification  to user
 *
 * @return  status 0 - If any internal error occured while sending notification data, with error
 *          status 1 - If notification inserted, with unit object
 *          status 2 - If notification not inserted, with appropriate message
 */
common_helper.send_notification = async (notificationData, socket) => {
    try {
        let receiver_data = await user_helper.get_user_by({
            authUserId: notificationData.receiverId
        });

        if (receiver_data.status == 1) {
            var receiver = {
                firstName: receiver_data.user.firstName,
                lastName: receiver_data.user.lastName
                        ? receiver_data.user.lastName
                        : "",
                avatar: receiver_data.user.avatar,
                username: receiver_data.user.username,
                authUserId: receiver_data.user.authUserId
            };
        }

        if (notificationData.senderId == "system") {
            var sender = {
                firstName: "System",
                lastName: ""
            };
        } else {
            let sender_data = await user_helper.get_user_by({
                authUserId: notificationData.senderId
            });
            if (sender_data.status == 1) {
                var sender = {
                    firstName: sender_data.user.firstName,
                    lastName: sender_data.user.lastName ? sender_data.user.lastName : "",
                    avatar: sender_data.user.avatar,
                    username: sender_data.user.username,
                    authUserId: sender_data.user.authUserId
                };
            }
        }

        if (sender && receiver) {
            var notificationObj = {
                sender: sender,
                receiver: receiver,
                type: notificationData.type,
                timelineId: notificationData.timelineId,
                body: `${sender.firstName} ${
                        sender.lastName ? " " + sender.lastName : ""
                        } ${notificationData.bodyMessage}`
            };
            let notification_data = await notification_helper.add_notifications(
                    notificationObj,
                    socket
                    );
            if (notification_data.status == 1) {
                return {
                    status: 1,
                    message: "notification sent",
                    notification: notification_data
                };
            } else {
                return {
                    status: 1,
                    message: "notification not sent"
                };
            }
        }
    } catch (error) {
        return {
            status: 1,
            message: "notification not sent"
        };
    }
};

common_helper.convertUnits = async (from, to, value) => {
    var result = value;
    switch (from) {
        case "inch":
            switch (to) {
                case "cm":
                    result = value * 2.54;
                    break;
                case "meter":
                    result = value * 0.0254;
                    break;
                case "feet":
                    result = value * 0.0833333;
                    break;
            }
            break;
        case "cm":
            switch (to) {
                case "inch":
                    result = value * 0.393701;
                    break;
                case "meter":
                    result = value * 0.01;
                    break;
                case "feet":
                    result = value * 0.0328084;
                    break;
            }
            break;
        case "meter":
            switch (to) {
                case "inch":
                    result = value * 39.3701;
                    break;
                case "cm":
                    result = value * 100;
                    break;
                case "feet":
                    result = value * 3.28084;
                    break;
                case "km":
                    result = value * 0.001;
                    break;
                case "mile":
                    result = value * 0.000621371;
                    break;
            }
            break;
        case "feet":
            switch (to) {
                case "inch":
                    result = value * 12;
                    break;
                case "cm":
                    result = value * 30.48;
                    break;
                case "meter":
                    result = value * 0.3048;
                    break;
            }
            break;
        case "gram":
            switch (to) {
                case "mg":
                    result = value * 1000;
                    break;
                case "kg":
                case "kgs":
                    result = value * 0.001;
                    break;
                case "lb":
                case "lbs":
                    result = value * 0.00220462;
                    break;
            }
            break;
        case "mg":
            switch (to) {
                case "gram":
                    result = value * 0.001;
                    break;
            }
            break;
        case "kg":
        case "kgs":
            switch (to) {
                case "lb":
                case "lbs":
                    result = value * 2.20462;
                    break;
                case "gram":
                    result = value * 1000;
                    break;
            }
            break;
        case "lb":
        case "lbs":
            switch (to) {
                case "kg":
                    result = value * 0.453592;
                    break;
                case "gram":
                    result = value * 453.592;
                    break;
            }
            break;
        case "second":
            switch (to) {
                case "minute":
                    result = value / 60;
                    break;
                case "hour":
                    result = value / 3600;
                    break;
            }
            break;
        case "minute":
            switch (to) {
                case "second":
                    result = value * 60;
                    break;
                case "hour":
                    result = value / 60;
                    break;
            }
            break;
        case "hour":
            switch (to) {
                case "second":
                    result = value * 3600;
                    break;
                case "minute":
                    result = value * 60;
                    break;
            }
            break;
    }
    return result;
};

//@param authUserId auth user id
common_helper.assign_badges = async authUserId => {
    let workout_detail = await user_workouts_helper.workout_detail_for_badges({
        userId: authUserId
    });

    //badge assign start;
    var badges = await badge_assign_helper.badge_assign(
            authUserId,
            constant.BADGES_TYPE.WORKOUTS.concat(constant.BADGES_TYPE.WEIGHT_LIFTED),
            workout_detail.workouts
            );
    //badge assign end
};

common_helper.sync_user_data_to_auth = async (authUserId, bodyContent) => {
    var options = {
        method: "POST",
        url: config.AUTH_TOKEN_URL,
        headers: {
            "content-type": "application/json"
        },
        body: {
            grant_type: config.GRANT_TYPE,
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            audience: config.AUDIENCE
        },
        json: true
    };
    var myPro = new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error)
                throw new Error(error);
            bodyContent.connection = "Username-Password-Authentication";
            if (body) {
                var options = {
                    method: "PATCH",
                    url: config.AUTH_USER_API_URL + authUserId,
                    headers: {
                        "content-type": "application/json",
                        Authorization: "Bearer " + body.access_token
                    },
                    body: bodyContent,
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(body);
                    }
                });
            }
        });
    });
    return myPro;
};

common_helper.makeWorkoutsAsPost = async (workoutData) => {
    let {exerciseIds, authUserId, isCompleted} = workoutData;
    if (typeof isCompleted !== 'undefined' && isCompleted === 1) {
        let userDetailsData = await user_helper.get_user_by_id(authUserId);
        let userFullName = "";
        if (userDetailsData.status === 1) {
            let userDetails = userDetailsData.user;
            userFullName = userDetails['firstName'] ? userDetails['firstName'] : '';
            userFullName += userDetails['lastName'] ? ' ' + userDetails['lastName'] : '';
        }
        for (let id of exerciseIds) {
            let checkTimeline = {
                userId: authUserId,
                createdBy: authUserId,
                workoutId: id,
                type: "workout"
            };
            let prevPostResult = await user_timeline_helper.get_user_timeline_by_user_id(checkTimeline);
            if (prevPostResult.status === 2) {
                let workoutCond = {_id: mongoose.Types.ObjectId(id)};
                let workoutData = await user_workouts_helper.get_user_workouts_by_id(workoutCond);
                let workoutTitle = "";
                if (workoutData.status === 1) {
                    let workoutDetails = workoutData.workout;
                    workoutTitle = workoutDetails['title'] ? workoutDetails['title'] : '';
                }
                let description = `<p><b>${userFullName}</b> has successfully completed <b>${workoutTitle}</b> workout</p>`;
                let postData = {
                    userId: authUserId,
                    createdBy: authUserId,
                    description: description,
                    postType: "timeline"
                };
                let newPostData = await user_posts_helper.insert_user_post(postData);
                if (newPostData.status === 1) {
                    let timelineData = {
                        userId: authUserId,
                        createdBy: authUserId,
                        workoutId: id,
                        tagLine: "has completed workout",
                        type: "workout",
                        postPhotoId: newPostData.user_post_photo._id
                    };
                    await user_timeline_helper.insert_timeline_data(timelineData);
                }
            }
        }
    } else {
        for (let id of exerciseIds) {
            let checkTimeline = {
                userId: authUserId,
                createdBy: authUserId,
                workoutId: id,
                type: "workout"
            };
            let prevPostResult = await user_timeline_helper.get_user_timeline_by_user_id(checkTimeline);
            if (prevPostResult.status === 1) {
                let timelineId = (prevPostResult.user_timeline && prevPostResult.user_timeline._id) ? prevPostResult.user_timeline._id : null;
                let postId = (prevPostResult.user_timeline && prevPostResult.user_timeline.postPhotoId) ? prevPostResult.user_timeline.postPhotoId : null;
                if (timelineId) {
                    let timelineCond = {_id: mongoose.Types.ObjectId(timelineId)};
                    await user_timeline_helper.delete_timeline_by_cond(timelineCond);
                }
                if (postId) {
                    let postCond = {_id: mongoose.Types.ObjectId(postId)};
                    await user_posts_helper.delete_post_by_cond(postCond);
                }
            }
        }
    }
}

module.exports = common_helper;
