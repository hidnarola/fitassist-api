var SecondaryGoal = require("./../models/user_secondary_goals");
var user_secondary_goals_helper = {};

/*
 * get_secondary_goal is used to fetch secondary_goals by user ID
 * @return  status 0 - If any internal error occured while fetching secondary goals data, with error
 *          status 1 - If secondary goal data found, with secondary goals object
 *          status 2 - If secondary goal data not found, with appropriate message
 */
user_secondary_goals_helper.get_secondary_goal = async id => {
  try {
    var secondary_goals;

    secondary_goals = await SecondaryGoal.findOne(id);

    if (secondary_goals) {
      return {
        status: 1,
        message: "user's secondary goals found",
        goal: secondary_goals
      };
    } else {
      return { status: 2, message: "user's secondary goals not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's secondary goals ",
      error: err
    };
  }
};

/*
 * get_secondary_goals is used to fetch secondary_goals by user ID
 * @return  status 0 - If any internal error occured while fetching secondary goals data, with error
 *          status 1 - If secondary goal data found, with secondary goals object
 *          status 2 - If secondary goal data not found, with appropriate message
 */
user_secondary_goals_helper.get_secondary_goals = async id => {
  try {
    var secondary_goals;

    secondary_goals = await SecondaryGoal.aggregate([{ $match: id }]);

    if (secondary_goals) {
      return {
        status: 1,
        message: "user's secondary goals found",
        goals: secondary_goals
      };
    } else {
      return { status: 2, message: "user's secondary goals not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's secondary goals ",
      error: err
    };
  }
};

/*
 * get_secondary_goal_by_id is used to fetch secondary_goals by goal ID
 * @return  status 0 - If any internal error occured while fetching secondary goals data, with error
 *          status 1 - If secondary goal data found, with secondary goals object
 *          status 2 - If secondary goal data not found, with appropriate message
 */
user_secondary_goals_helper.get_secondary_goal_by_id = async id => {
  try {
    secondary_goal = await SecondaryGoal.findOne(id);
    if (secondary_goal) {
      return {
        status: 1,
        message: "user's secondary goal found",
        goal: secondary_goal
      };
    } else {
      return { status: 2, message: "user's secondary goal not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's secondary goal ",
      error: err
    };
  }
};

/*
 * insert_secondary_goal is used to insert into secondary_goals
 * @param   secondary_goal_object JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting secondary_goal, with error
 *          status  1 - If secondary_goal inserted, with inserted secondary_goals document and appropriate message
 * @developed by "amc"
 */
user_secondary_goals_helper.insert_secondary_goal = async secondary_goal_object => {
  let secondary_goal = new SecondaryGoal(secondary_goal_object);
  try {
    let secondary_goal_data = await secondary_goal.save();
    return {
      status: 1,
      message: "User's secondary goal inserted",
      goal: secondary_goal_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user's secondary goal",
      error: err
    };
  }
};

/*
 * update_secondary_goal is used to update secondary_goal data based on secondary_goal ID
 * @param   secondary_goal_id         String  _id of secondary_goal that need to be update
 * @param   secondary_goal_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating secondary_goal, with error
 *          status  1 - If secondary_goal updated successfully, with appropriate message
 *          status  2 - If secondary_goal not updated, with appropriate message
 * @developed by "amc"
 */
user_secondary_goals_helper.update_secondary_goal_by_id = async (
  secondary_goal_id,
  secondary_goal_obj
) => {
  try {
    let secondary_goal = await SecondaryGoal.findOneAndUpdate(
      secondary_goal_id,
      secondary_goal_obj,
      { new: true }
    );
    if (!secondary_goal) {
      return { status: 2, message: "secondary goal has not updated" };
    } else {
      return {
        status: 1,
        message: "secondary goal has been updated",
        goal: secondary_goal
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user's secondary goal",
      error: err
    };
  }
};

/*
 * delete_secondary_goal is used to delete secondary_goal data based on secondary_goal ID
 * @param   secondary_goal_id String  _id of secondary_goal that need to be delete
 * @param   secondary_goal_obj JSON object consist of all property that need to delete 
 * @return  status  0 - If any error occur in updating secondary goal, with error
 *          status  1 - If secondary goal deleted successfully, with appropriate message
 *          status  2 - If secondary goal not deleted, with appropriate message
 * @developed by "amc"
 */
user_secondary_goals_helper.delete_secondary_goal = async secondary_goal_id => {
  try {
    let secondary_goal = await SecondaryGoal.remove(secondary_goal_id);
    if (!secondary_goal) {
      return { status: 2, message: "secondary goal has not deleted" };
    } else {
      return {
        status: 1,
        message: "secondary goal has been deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user's secondary goal",
      error: err
    };
  }
};

module.exports = user_secondary_goals_helper;
