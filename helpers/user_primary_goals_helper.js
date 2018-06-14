var Users = require("./../models/users");
var user_primary_goals_helper = {};

user_primary_goals_helper.get_primary_goal_by_id = async id => {
  try {
    primary_goal = await Users.findOne(id);
    if (primary_goal) {
      return {
        status: 1,
        message: "user's primary goal found",
        goal: primary_goal.goal
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

module.exports = user_primary_goals_helper;
