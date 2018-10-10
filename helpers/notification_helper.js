var UserNotifications = require("./../models/user_notifications");
var user_notifications_helper = {};
// var socket = require("../socket/socketServer");

/*
 * get_notifications is used to fetch all user notification data
 * 
 * @return  status 0 - If any internal error occured while fetching notification data, with error
 *          status 1 - If notification data found, with notification object
 *          status 2 - If notification not found, with appropriate message
 */
user_notifications_helper.get_notifications = async (userId, skip = false, limit = false, sort = false) => {
    try {
        var count = await UserNotifications.count(userId);

        var aggregate = [{
            $match: userId
        }];

        if (sort) {
            aggregate.push(sort);
        } else {
            aggregate.push({
                $sort: {
                    _id: -1
                }
            });
        }
        if (skip) {
            aggregate.push(skip);
        }
        if (limit) {
            aggregate.push(limit);
        }
        var notifications = await UserNotifications.aggregate(aggregate);

        if (notifications) {
            return {
                status: 1,
                message: "notifications found",
                notifications: notifications
            };
        } else {
            return {
                status: 1,
                message: "No notifications available",
                notifications: []
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding notifications",
            error: err
        };
    }
};

/*
 * get_notifications_count is used to count all user notifications data
 * 
 * @return  status 0 - If any internal error occured while counting notification data, with error
 *          status 1 - If notification data count, with notification object
 *          status 2 - If notification not count, with appropriate message
 */
user_notifications_helper.get_notifications_count = async userId => {
    try {
        var count = await UserNotifications.find(userId).count();
        return {
            status: 1,
            message: "notifications found",
            count: count
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding notifications",
            error: err
        };
    }
};

/*
 * add_notifications is used to insert into user_notifications collection
 * 
 * @param   notificationObj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting user_notifications, with error
 *          status  1 - If user_notifications inserted, with inserted user_notifications document and appropriate message
 * 
 * @developed by "amc"
 */
user_notifications_helper.add_notifications = async (
    notificationObj,
    socket,
    type = ""
) => {
    var authUserId = "";
    let notification_data;
    try {
        if (type != "") {
            notification_data = await UserNotifications.insertMany(notificationObj);
            authUserId = notificationObj[0].receiver.authUserId;
        } else {
            let notification = new UserNotifications(notificationObj);
            notification_data = await notification.save();
            authUserId = notificationObj.receiver.authUserId;
        }

        var user_notifications_count = await user_notifications_helper.get_notifications_count({
            "receiver.authUserId": authUserId,
            isSeen: 0
        });
        var user = socket.users.get(authUserId);
        if (user) {
            var socketIds = user.socketIds;
            socketIds.forEach(socketId => {
                socket.io.to(socketId).emit("receive_user_notification_count", {
                    count: user_notifications_count.count
                });
            });
        }
        return {
            status: 1,
            message: "notification sent",
            notification: notification_data
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while sending notification",
            error: err
        };
    }
};

/*
 * notification_seen is used to update status of notification unread to read from database
 * 
 * @param   id String  _id of user that need to be delete
 * @param   updateObject Object  Object of record need to be delete
 * 
 * @return  status  0 - If any error occur in updating of notification, with error
 *          status  1 - If notification updating successfully, with appropriate message
 * 
 * @developed by "amc"
 */
user_notifications_helper.notification_seen = async (id, updateObject) => {
    try {
        let resp = await UserNotifications.updateMany(id, updateObject);
        if (!resp) {
            return {
                status: 2,
                message: "notification not found"
            };
        } else {
            return {
                status: 1,
                message: "notification marked as read"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while marking as read notification",
            error: err
        };
    }
};

module.exports = user_notifications_helper;