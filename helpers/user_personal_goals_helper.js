var PersonalGoal = require("./../models/user_personal_goals");
var user_personal_goals_helper = {};

/*
 * get_personal_goals is used to fetch personal_goals by user ID
 * @return  status 0 - If any internal error occured while fetching personal goals data, with error
 *          status 1 - If personal goal data found, with personal goals object
 *          status 2 - If personal goal data not found, with appropriate message
 */
user_personal_goals_helper.get_personal_goals = async (
  id,
  skip,
  limit,
  sort
) => {
  try {
    var personal_goals;

    personal_goals = await PersonalGoal.aggregate([
      { $match: id },
      {
        $group: {
          _id: "$category",
          category: { $first: "$category" },
          goals: { $push: "$$ROOT" }
        }
      },
      sort,
      skip,
      limit
    ]);

    if (personal_goals) {
      return {
        status: 1,
        message: "user's personal goals found",
        goals: personal_goals
      };
    } else {
      return { status: 2, message: "user's personal goals not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's personal goals ",
      error: err
    };
  }
};

/*
 * get_personal_goal_by_id is used to fetch personal_goals by goal ID
 * @return  status 0 - If any internal error occured while fetching personal goals data, with error
 *          status 1 - If personal goal data found, with personal goals object
 *          status 2 - If personal goal data not found, with appropriate message
 */
user_personal_goals_helper.get_personal_goal_by_id = async id => {
  try {
    personal_goal = await PersonalGoal.findOne(id);
    if (personal_goal) {
      return {
        status: 1,
        message: "user's personal goal found",
        goal: personal_goal
      };
    } else {
      return { status: 2, message: "user's personal goal not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's personal goal ",
      error: err
    };
  }
};

/*
 * count is used to count all personal goal record user id ID
 * @return  status 0 - If any internal error occured while couting personal goals data, with error
 *          status 1 - If personal goal data found, with personal goals object
 *          status 2 - If personal goal data not found, with appropriate message
 */
user_personal_goals_helper.count = async id => {
  try {
    count = await PersonalGoal.find(id).count();
    if (count) {
      return {
        status: 1,
        message: "user's personal goal found",
        count: count
      };
    } else {
      return { status: 2, message: "user's personal goal not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's personal goal ",
      error: err
    };
  }
};
/*
 * insert_personal_goal is used to insert into personal_goals
 * @param   personal_goal_object JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting personal_goal, with error
 *          status  1 - If personal_goal inserted, with inserted personal_goals document and appropriate message
 * @developed by "amc"
 */
user_personal_goals_helper.insert_personal_goal = async personal_goal_object => {
  let personal_goal = new PersonalGoal(personal_goal_object);
  try {
    let personal_goal_data = await personal_goal.save();
    return {
      status: 1,
      message: "User's personal goal inserted",
      goal: personal_goal_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user's personal goal",
      error: err
    };
  }
};

/*
 * update_personal_goal is used to update personal_goal data based on personal_goal ID
 * @param   personal_goal_id         String  _id of personal_goal that need to be update
 * @param   personal_goal_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating personal_goal, with error
 *          status  1 - If personal_goal updated successfully, with appropriate message
 *          status  2 - If personal_goal not updated, with appropriate message
 * @developed by "amc"
 */
user_personal_goals_helper.update_personal_goal_by_id = async (
  personal_goal_id,
  personal_goal_obj
) => {
  try {
    let personal_goal = await PersonalGoal.findOneAndUpdate(
      personal_goal_id,
      personal_goal_obj,
      { new: true }
    );
    if (!personal_goal) {
      return { status: 2, message: "personal goal has not updated" };
    } else {
      return {
        status: 1,
        message: "personal goal has been updated",
        goal: personal_goal
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user's personal goal",
      error: err
    };
  }
};

/*
 * delete_personal_goal is used to delete personal_goal data based on personal_goal ID
 * @param   personal_goal_id String  _id of personal_goal that need to be delete
 * @param   personal_goal_obj JSON object consist of all property that need to delete
 * @return  status  0 - If any error occur in updating personal goal, with error
 *          status  1 - If personal goal deleted successfully, with appropriate message
 *          status  2 - If personal goal not deleted, with appropriate message
 * @developed by "amc"
 */
user_personal_goals_helper.delete_personal_goal = async (
  personal_goal_id,
  personal_goal_obj
) => {
  try {
    let personal_goal = await PersonalGoal.remove(personal_goal_id);
    if (!personal_goal) {
      return { status: 2, message: "personal goal has not deleted" };
    } else {
      return {
        status: 1,
        message: "personal goal has been deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user's personal goal",
      error: err
    };
  }
};

module.exports = user_personal_goals_helper;
