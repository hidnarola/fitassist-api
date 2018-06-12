var PrimaryGoal = require("./../models/user_primary_goals");
var user_primary_goals_helper = {};

/*
 * get_primary_goal is used to fetch primary_goal by user ID
 * @return  status 0 - If any internal error occured while fetching primary goals data, with error
 *          status 1 - If primary goal data found, with primary goals object
 *          status 2 - If primary goal data not found, with appropriate message
 */
user_primary_goals_helper.get_primary_goal = async (
  id,
  skip = null,
  limit = null
) => {
  try {
    var primary_goal;

    if (skip != null && limit != null) {
      primary_goal = await PrimaryGoal.aggregate([{ $match: id }, skip, limit]);
    } else {
      primary_goal = await PrimaryGoal.findOne(id);
    }

    if (primary_goal) {
      return {
        status: 1,
        message: "user's primary goals found",
        goals: primary_goal
      };
    } else {
      return { status: 2, message: "user's primary goals not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's primary goals ",
      error: err
    };
  }
};

/*
 * get_primary_goal_by_id is used to fetch primary_goal by goal ID
 * @return  status 0 - If any internal error occured while fetching primary goals data, with error
 *          status 1 - If primary goal data found, with primary goals object
 *          status 2 - If primary goal data not found, with appropriate message
 */
user_primary_goals_helper.get_primary_goal_by_id = async id => {
  try {
    primary_goal = await PrimaryGoal.findOne(id);
    if (primary_goal) {
      return {
        status: 1,
        message: "user's primary goal found",
        goal: primary_goal
      };
    } else {
      return { status: 2, message: "user's primary goal not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's primary goal ",
      error: err
    };
  }
};

/*
 * insert_primary_goal is used to insert into primary_goal
 * @param   primary_goal_object JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting primary_goal, with error
 *          status  1 - If primary_goal inserted, with inserted primary_goal document and appropriate message
 * @developed by "amc"
 */
user_primary_goals_helper.insert_primary_goal = async primary_goal_object => {
  let primary_goal = new PrimaryGoal(primary_goal_object);
  try {
    let primary_goal_data = await primary_goal.save();
    return {
      status: 1,
      message: "User's primary goal inserted",
      goal: primary_goal_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user's primary goal",
      error: err
    };
  }
};

/*
 * update_primary_goal is used to update primary_goal data based on primary_goal ID
 * @param   primary_goal_id         String  _id of primary_goal that need to be update
 * @param   primary_goal_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating primary_goal, with error
 *          status  1 - If primary_goal updated successfully, with appropriate message
 *          status  2 - If primary_goal not updated, with appropriate message
 * @developed by "amc"
 */
user_primary_goals_helper.update_primary_goal_by_id = async (
  primary_goal_id,
  primary_goal_obj
) => {
  try {
    let primary_goal = await PrimaryGoal.findOneAndUpdate(
      primary_goal_id,
      primary_goal_obj,
      { new: true }
    );
    if (!primary_goal) {
      return { status: 2, message: "primary goal has not updated" };
    } else {
      return {
        status: 1,
        message: "primary goal has been updated",
        goal: primary_goal
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user's primary goal",
      error: err
    };
  }
};

/*
 * delete_primary_goal is used to delete primary_goal data based on primary_goal ID
 * @param   primary_goal_id String  _id of primary_goal that need to be delete
 * @param   primary_goal_obj JSON object consist of all property that need to delete 
 * @return  status  0 - If any error occur in updating primary goal, with error
 *          status  1 - If primary goal deleted successfully, with appropriate message
 *          status  2 - If primary goal not deleted, with appropriate message
 * @developed by "amc"
 */
user_primary_goals_helper.delete_primary_goal = async (
  primary_goal_id,
  primary_goal_obj
) => {
  try {
    let primary_goal = await PrimaryGoal.remove(primary_goal_id);
    if (!primary_goal) {
      return { status: 2, message: "primary goal has not deleted" };
    } else {
      return {
        status: 1,
        message: "primary goal has been deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user's primary goal",
      error: err
    };
  }
};

module.exports = user_primary_goals_helper;
