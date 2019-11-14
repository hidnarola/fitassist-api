var UserTimeline = require("./../models/user_timeline");
var user_timeline_helper = {};

/*
 * get_user_timeline_by_user_id is used to fetch user_timeline by user ID
 * @return  status 0 - If any internal error occured while fetching user_timeline data, with error
 *          status 1 - If user_timeline data found, with user_timeline object
 *          status 2 - If user_timeline data not found, with appropriate message
 */
user_timeline_helper.get_user_timeline_by_user_id = async id => {
  try {
    var user_timeline = await UserTimeline.aggregate([
      {
        $match: id
      }
    ]);
    if (user_timeline && user_timeline.length > 0) {
      return {
        status: 1,
        message: "user timeline found",
        user_timeline: user_timeline[0]
      };
    } else {
      return {
        status: 2,
        message: "user timeline not available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user timeline ",
      error: err
    };
  }
};

/*
 * insert_timeline is used to insert into user_timeline
 * @param   preference_object JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting preference, with error
 *          status  1 - If timeline inserted, with inserted timeline document and appropriate message
 * @developed by "amc"
 */
user_timeline_helper.insert_timeline_data = async user_timeline_object => {
  let user_timeline = new UserTimeline(user_timeline_object);
  try {
    let preference_data = await user_timeline.save();
    return {
      status: 1,
      message: "User's user timeline inserted",
      user_timeline: preference_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user's timeline",
      error: err
    };
  }
};

/*
 * update_user_timeline_by_userid is used to update user_timeline data based on timeline ID
 * @param   condition String  _id of timeline that need to be update
 * @param   timelineObj JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating timeline, with error
 *          status  1 - If timeline updated successfully, with appropriate message
 *          status  2 - If timeline not updated, with appropriate message
 * @developed by "amc"
 */
user_timeline_helper.update_user_timeline_by_id = async (
  condition,
  user_timeline_object
) => {
  try {
    let user_timeline = await UserTimeline.findOneAndUpdate(
      condition,
      user_timeline_object,
      { new: true }
    );
    if (!user_timeline) {
      return {
        status: 2,
        message: "timeline has not updated"
      };
    } else {
      return {
        status: 1,
        message: "timeline has been updated",
        user_timeline: user_timeline
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user timeline",
      error: err
    };
  }
};

/*
 * delete_timeline_by_cond is used to delete user_timeline data based on condition
 * @param   condition object javascript object equavilent to mongoose condition
 * @return  status  0 - If any error occur in updating timeline, with error
 *          status  1 - If timeline deleted successfully, with appropriate message
 *          status  2 - If timeline not deleted, with appropriate message
 * @developed by "amc"
 */
user_timeline_helper.delete_timeline_by_cond = async condition => {
  try {
    let user_timeline = await UserTimeline.remove(condition);
    if (!user_timeline) {
      return {
        status: 2,
        message: "timeline has not deleted"
      };
    } else {
      return {
        status: 1,
        message: "timeline has been deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user timeline",
      error: err
    };
  }
};

user_timeline_helper.following_activity_data = async (
  userIds,
  privacyArray
) => {
  try {
    let user_timeline = await UserTimeline.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          privacy: { $in: privacyArray }
        }
      }
    ]);
    return {
      status: 1,
      message: "Following user activity data found",
      user_timeline: user_timeline
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while following user data",
      error: err
    };
  }
};
module.exports = user_timeline_helper;
