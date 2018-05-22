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
    var user_workout = await UserWorkout.find().populate({
      path: "schedule.exerciseId",
      populate: { path: 'exercise' }
    });
    if (user_workout) {
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

module.exports = user_workout_helper;
