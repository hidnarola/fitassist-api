var TestExercises = require("./../models/test_exercises");
var UserTestExerciseLogs = require("./../models/user_test_exercise_logs");
var _ = require("underscore");
var workout_progress_helper = {};

/*
 * get_progress_detail is used to fetch all user progress detail
 * 
 * @return  status 0 - If any internal error occured while fetching progress data, with error
 *          status 1 - If progress data found, with progress object
 *          status 2 - If progress not found, with appropriate message
 */
workout_progress_helper.get_progress_detail = async (condition = {}) => {
  try {
    var progress = await UserTestExerciseLogs.aggregate([
      {
        $match: condition.createdAt
      },
      {
        $lookup: {
          from: "test_exercises",
          localField: "test_exercise_id",
          foreignField: "_id",
          as: "exercise"
        }
      },
      {
        $unwind: "$exercise"
      },
      {
        $match: condition.category
      },
      {
        $group: {
          _id: "$exercise.subCategory",
          exercises: {
            $addToSet: {
              _id: "$_id",
              text_field: "$text_field",
              multiselect: "$multiselect",
              max_rep: "$max_rep",
              a_or_b: "$a_or_b",
              userId: "$userId",
              format: "$format",
              exercises: "$exercise"
            }
          }
        }
      }
    ]);
    console.log("------------------------------------");
    console.log("progress.length : ", progress.length);
    console.log("------------------------------------");

    if (progress && progress.length > 0) {
      _.each(progress, p => {
        var fieldCheckName = p.format;
      });
      return {
        status: 1,
        message: "progress found",
        progress: progress
      };
    } else {
      return { status: 2, message: "No progress available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding progress",
      error: err
    };
  }
};

module.exports = workout_progress_helper;
