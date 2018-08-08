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
    var progress = await UserTestExerciseLogs.aggregate([{
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
      },
    ]);


    if (progress && progress.length > 0) {
      var returnArray = [];
      _.each(progress, p => {
        var tmp = {};
        var fieldCheckName = p.format;
        var subCategory = p._id;
        var first = _.first(p.exercises);
        var last = _.last(p.exercises);
        console.log('------------------------------------');
        console.log('first : ', first);
        console.log('------------------------------------');

        console.log('------------------------------------');
        console.log('last : ', last);
        console.log('------------------------------------');


        tmp.format = fieldCheckName;
        tmp.subCategory = subCategory;
        tmp.first = p.first[fieldCheckName];
        tmp.last = p.last[fieldCheckName];
        switch (fieldCheckName) {
          case "text_field":
            tmp.change = tmp.first - tmp.last;
            break;
          case "max_rep":
            var firstKeys = Object.keys(tmp.first); // key of first record
            var lastKeys = Object.keys(tmp.last); // key of last record
            var keys = _.union(firstKeys, lastKeys); // union of both record
            var differenceData = {};
            _.each(keys, key => {
              if (tmp.first[key] && tmp.last[key]) {
                differenceData[key] = tmp.first[key] - tmp.last[key];
              } else {
                differenceData[key] = tmp.first[key] ? tmp.first[key] : tmp.last[key];
              }
            });
            tmp.change = differenceData;
            break;
          case "multiselect":
            tmp.change = tmp.first - tmp.last;
            break;
          case "a_or_b":
            tmp.change = tmp.first - tmp.last;
            break;

          default:
            break;
        }
        returnArray.push(tmp);
      });
      return {
        status: 1,
        message: "progress found",
        progress: returnArray
      };
    } else {
      return {
        status: 2,
        message: "No progress available"
      };
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