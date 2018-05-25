var UserWorkout = require("./../models/user_workouts");
var user_workout_helper = {};

/*
 * get_user_workout is used to fetch  user workouts details by userId
 * 
 * @params  userId     _id field of user_workouts  collection
 * 
 * @return  status 0 - If any internal error occured while fetching user workouts data, with error
 *          status 1 - If user workouts data found, with user workouts object
 *          status 2 - If user workouts not found, with appropriate message
 */
user_workout_helper.get_user_workout = async userId => {
  try {
    var user_workout = await UserWorkout.find(userId).populate({
      path: "schedule.exerciseId",
      populate: { path: "exercise" }
    });
    if (user_workout && user_workout.length) {
      return {
        status: 1,
        message: "user workouts details found",
        user_workouts: user_workout
      };
    } else {
      return { status: 2, message: "user workouts not found" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user workouts",
      error: err
    };
  }
};

/*
 * get_user_workout_by_id is used to fetch  user workouts details by workout_id
 * 
 * @params  workout_id     _id field of user_workouts  collection
 * @return  status 0 - If any internal error occured while fetching use
 * workouts data, with error
 *          status 1 - If user workouts data found, with user workouts object
 *          status 2 - If user workouts not found, with appropriate message
 */
user_workout_helper.get_user_workout_by_id = async workout_id => {
  try {
    var user_workout = await UserWorkout.findOne(workout_id).populate({
      path: "schedule.exerciseId",
      populate: { path: "exercise" }
    });
    if (user_workout) {
      return {
        status: 1,
        message: "user workout details found",
        user_workout: user_workout
      };
    } else {
      return { status: 2, message: "user workout not found" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user workout",
      error: err
    };
  }
};

/*
 * delete_user_workout is used to delete  user workouts details by _id
 * 
 * @params  _id     _id field of user_workouts  collection
 * 
 * @return  status 0 - If any internal error occured while fetching user
 * workouts data, with error
 *          status 1 - If user workouts data found, with user workouts object
 *          status 2 - If user workouts not found, with appropriate message
 */
user_workout_helper.delete_user_workout = async id => {
  try {
    var user_workout = await UserWorkout.remove(id);
    if (user_workout) {
      return {
        status: 1,
        message: "user workout detail deleted"
      };
    } else {
      return { status: 2, message: "user workout not delete" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting user workout",
      error: err
    };
  }
};

module.exports = user_workout_helper;
