var UserNotifications = require("./../models/user_notifications");
var user_notifications_helper = {};

/*
 * get_notifications is used to fetch all user notification data
 * 
 * @return  status 0 - If any internal error occured while fetching notification data, with error
 *          status 1 - If notification data found, with notification object
 *          status 2 - If notification not found, with appropriate message
 */
user_notifications_helper.get_notifications = async userId => {
  try {
    var notifications = await UserNotifications.aggregate([
      {
        $match: userId
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    if (notifications && notifications.length > 0) {
      return {
        status: 1,
        message: "notifications found",
        notifications: notifications
      };
    } else {
      return { status: 2, message: "No notifications available" };
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
 * add_notifications is used to insert into user_notifications collection
 * 
 * @param   notificationObj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting user_notifications, with error
 *          status  1 - If user_notifications inserted, with inserted user_notifications document and appropriate message
 * 
 * @developed by "amc"
 */
user_notifications_helper.add_notifications = async notificationObj => {
  try {
    let notification_data = new UserNotifications(notificationObj);
    let notification = await notification_data.save();
    return {
      status: 1,
      message: "notification sent",
      notification: notification
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
      return { status: 2, message: "notifications not found" };
    } else {
      return { status: 1, message: "notifications seen" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while seen notifications",
      error: err
    };
  }
};

module.exports = user_notifications_helper;
