var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();
var mongoose = require("mongoose");
var moment = require("moment");
var _ = require("underscore");
var constant = require("../../constant");

var config = require("../../config");
var logger = config.logger;

var user_workout_helper = require("../../helpers/user_workouts_helper");
var exercise_helper = require("../../helpers/exercise_helper");
var common_helper = require("../../helpers/common_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var user_program_helper = require("../../helpers/user_program_helper");
var socket = require("../../socket/socketServer");

/**
 * @api {get} /user/user_workouts/:workout_id Get User Workouts
 * @apiName Get User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} workouts JSON of user_workouts
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:workout_id", async (req, res) => {
  var workout_id = mongoose.Types.ObjectId(req.params.workout_id);
  var resp_data = await user_workout_helper.get_all_workouts_group_by(
    {
      _id: workout_id
    },
    false
  );

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user workouts = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user workouts got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_workouts/ Get User Workouts
 * @apiName Get User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Date}  date Date of user's workout program
 * @apiSuccess (Success 200) {JSON} workouts JSON of user_workouts
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/get_by_month", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;
  var check = await moment(date).utc(0);
  var startCheck = await moment(check).subtract(2, "month");
  var endCheck = await moment(check).add(2, "month");
  var resp_data = await user_workout_helper.get_all_workouts({
    userId: authUserId,
    date: {
      $gte: new Date(startCheck),
      $lt: new Date(endCheck)
    }
  });

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user workouts = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user workouts got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_workouts/day Add User Workouts day
 * @apiName Add User Workouts day
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} title title of workout
 * @apiParam {String} description description of workout
 * @apiParam {Enum} type type of workout | Possbile value <code>Enum: ["exercise","restday"]</code>
 * @apiParam {Date} date date of workout
 * @apiSuccess (Success 200) {JSON} day workout day details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/day", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var masterCollectionObject = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    userId: authUserId,
    date: req.body.date
  };

  var workout_day = await user_workout_helper.insert_user_workouts_day(
    masterCollectionObject
  );

  if (workout_day.status == 1) {
    res.status(config.OK_STATUS).json(workout_day);
  } else {
    res.status(config.BAD_REQUEST).json(workout_day);
  }
});

/**
 * @api {post} /user/user_workouts/exercises Add User Workouts
 * @apiName Add User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} type type of workout
 * @apiParam {String} subType subType of workout
 * @apiParam {String} userWorkoutsId userWorkoutsId of workout
 * @apiParam {Array} exercises exercises of workout
 * @apiSuccess (Success 200) {JSON} workout workout details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/workout", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var workoutLogsObj = {};
  var insertWorkoutLogArray = [];
  if (req.body.type != "restday") {
    var exercises = req.body.exercises;
    var totalExerciseIds = _.pluck(exercises, "exerciseId");

    totalExerciseIds.forEach((id, index) => {
      totalExerciseIds[index] = mongoose.Types.ObjectId(id);
    });
    var exercise_data = await exercise_helper.get_exercise_id(
      {
        _id: { $in: totalExerciseIds }
      },
      1
    );

    for (let single of exercises) {
      var time = 0;
      var distance = 0;
      var effort = 0;
      var weight = 0;
      var repTime = 0;
      var setTime = 0;
      var reps = 0;
      var sets = 0;
      sets += single.sets ? single.sets : 0;
      single.exercises = _.find(exercise_data.exercise, exerciseDb => {
        return exerciseDb._id.toString() === single.exerciseId.toString();
      });
      var data = await common_helper.unit_converter(
        single.restTime,
        single.restTimeUnit
      );

      single.baseRestTimeUnit = data.baseUnit;
      single.baseRestTime = data.baseValue;
      delete single.exerciseId;

      for (let tmp of single.setsDetails) {
        if (tmp.field1) {
          var data = await common_helper.unit_converter(
            tmp.field1.value,
            tmp.field1.unit
          );
          tmp.field1.baseUnit = data.baseUnit;
          tmp.field1.baseValue = data.baseValue;
          if (data.baseUnit === "second") {
            time += data.baseValue;
          } else if (data.baseUnit === "reps") {
            reps += data.baseValue;
          } else {
            distance += data.baseValue;
          }
        }

        if (tmp.field2) {
          var data = await common_helper.unit_converter(
            tmp.field2.value,
            tmp.field2.unit
          );
          tmp.field2.baseUnit = data.baseUnit;
          tmp.field2.baseValue = data.baseValue;
          if (data.baseUnit === "g") {
            weight += data.baseValue;
          } else if (data.baseUnit == "effort") {
            effort += data.baseValue;
          }

          if (tmp.field3) {
            var data = await common_helper.unit_converter(
              tmp.field3.value,
              tmp.field3.unit
            );
            tmp.field3.baseUnit = data.baseUnit;
            tmp.field3.baseValue = data.baseValue;
            if (data.baseUnit === "reps") {
              reps += data.baseValue;
            } else if (data.baseUnit === "rep_time") {
              repTime += data.baseValue;
            } else if (data.baseUnit === "set_time") {
              setTime += data.baseValue;
            }
          }
        }
        workoutLogsObj = {
          userId: authUserId,
          time,
          distance,
          effort,
          weight,
          repTime,
          setTime,
          reps,
          sets
        };
        insertWorkoutLogArray.push(workoutLogsObj);
      }
    }

    var insertObj = {
      userWorkoutsId: req.body.userWorkoutsId,
      type: req.body.type,
      subType: req.body.subType,
      exercises: exercises,
      date: req.body.date
    };

    var workout_day = await user_workout_helper.insert_user_workouts_exercises(
      insertObj,
      insertWorkoutLogArray
    );

    if (workout_day.status == 1) {
      workout_day = await user_workout_helper.get_all_workouts_group_by(
        {
          _id: mongoose.Types.ObjectId(req.body.userWorkoutsId)
        },
        true
      );
      workout_day.message = "Workout Added";
      res.status(config.OK_STATUS).json(workout_day);
    } else {
      res.status(config.BAD_REQUEST).json(workout_day);
    }
  }
});

/**
 * @api {post} /user/user_workouts/assign_program Assign user's program
 * @apiName Assign user's program
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  programId Program ID of program
 * @apiParam {Date}  date Date of program
 * @apiSuccess (Success 200) {JSON} workout JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/assign_program", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;
  var masterCollectionObject;
  var childCollectionObject;
  var exForProgram;

  var program_id = mongoose.Types.ObjectId(req.body.programId);
  var program_data = await user_program_helper.get_user_programs_in_details_for_assign(
    {
      _id: program_id
    }
  );

  var user_workouts_program = program_data.programs[0].user_workouts_program;
  var user_workout_exercises_program =
    program_data.programs[0].user_workout_exercises_program;
  for (let program of user_workouts_program) {
    exForProgram = _.filter(
      user_workout_exercises_program,
      program_exercise => {
        return (
          program_exercise.userWorkoutsProgramId.toString() ===
          program._id.toString()
        );
      }
    );
    masterCollectionObject = {
      title: program.title,
      userId: authUserId,
      isCompleted: 0,
      description: program.description,
      type: program.type,
      date: moment(date)
        .utcOffset(0)
        .add(program.day, "days")
    };

    childCollectionObject = exForProgram.map(single => {
      var newSingle = Object.assign({}, single);
      delete newSingle._id;
      delete newSingle.userWorkoutsProgramId;
      return newSingle;
    });

    var resp_data = await user_workout_helper.insert_user_workouts(
      masterCollectionObject,
      childCollectionObject
    );
  }

  logger.trace("Assign user programs  API called");
  if (resp_data.status == 0) {
    logger.error("Error occured while assigning user programs = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs assigning successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_workouts/bulk_complete Multiple Workout completed by exerciseDay
 * @apiName Multiple Workout completed by exerciseDay
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Array} exerciseIds ids of Days
 * @apiParam {Object} isCompleted status of workout
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/bulk_complete", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var exerciseIds = req.body.exerciseIds;
  var isCompleted = req.body.isCompleted;
  exerciseIds.forEach((id, index) => {
    exerciseIds[index] = mongoose.Types.ObjectId(id);
  });
  logger.trace("Complete workout by id = ", exerciseIds);
  let workout_data = await user_workout_helper.complete_workout_by_days(
    exerciseIds,
    {
      isCompleted: isCompleted
    }
  );

  if (workout_data.status === 1) {
    res.status(config.OK_STATUS).json(workout_data);
    //CALL assign_badges function for assigning badges for workout
    assign_badges(authUserId);
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
  }
});

/**
 *
 * @api {put} /user/user_workouts/complete Complete User workout
 * @apiName Complete User workout
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} childId Id of Workout to be complete
 * @apiParam {String} parentId Id of Workout to be return as response
 * @apiParam {String} isCompleted isCompleted status of Workout to be complete
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/complete", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var childIds = req.body.childIds;
  childIds.forEach((id, index) => {
    childIds[index] = mongoose.Types.ObjectId(id);
  });

  var parentId = mongoose.Types.ObjectId(req.body.parentId);
  var isCompleted = {
    isCompleted: req.body.isCompleted
  };

  logger.trace("Complete workout API Called");
  let workout_data = await user_workout_helper.complete_workout(
    childIds,
    isCompleted
  );

  if (workout_data.status === 1) {
    let count = await user_workout_helper.count_all_completed_workouts({
      userId: authUserId,
      _id: parentId
    });

    if (count.status == 1) {
      var isCompleted = { isCompleted: 0 };
      if (count.count === 0) {
        isCompleted = { isCompleted: 1 };
      }
      let updateMasterCollectionCompleted = await user_workout_helper.complete_master_event(
        parentId,
        isCompleted
      );
    }

    let workout = await user_workout_helper.get_all_workouts(
      {
        _id: mongoose.Types.ObjectId(parentId)
      },
      true
    );
    workout.message = "Workout completed";
    res.status(config.OK_STATUS).json(workout);
    //CALL assign_badges function for assigning badges for workout
    assign_badges(authUserId);
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
  }
});

/**
 * @api {put} /user/user_workouts/:workout_id  Update User Workouts
 * @apiName Update User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} title title of workout
 * @apiParam {String} [description] description of workout
 * @apiParam {Enum} [type] type of workout | Possbile value <code>Enum: ["exercise","restday"]</code>
 * @apiParam {Date} [date] date of workout
 * @apiSuccess (Success 200) {JSON} friend approved friend detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:workout_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    title: {
      notEmpty: true,
      errorMessage: "title is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var masterCollectionObject = {
      title: req.body.title
    };
    if (req.body.description) {
      masterCollectionObject.description = req.body.description;
    }
    if (req.body.type) {
      masterCollectionObject.type = req.body.type;
    }
    if (req.body.date) {
      masterCollectionObject.date = req.body.date;
    }

    var workout_data = await user_workout_helper.update_user_workouts_by_id(
      req.params.workout_id,
      masterCollectionObject
    );

    if (workout_data.status == 1) {
      res.status(config.OK_STATUS).json(workout_data);
    } else {
      res.status(config.BAD_REQUEST).json(workout_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {post} /user/user_workouts/exercises Add User Workouts
 * @apiName Add User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} type type of workout
 * @apiParam {String} subType subType of workout
 * @apiParam {String} userWorkoutsId userWorkoutsId of workout
 * @apiParam {Array} exercises exercises of workout
 * @apiSuccess (Success 200) {JSON} workout workout details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/workout/:workout_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var workout_id = req.param.workout_id;
  var workoutLogsObj = {};
  var insertWorkoutLogArray = [];
  if (req.body.type != "restday") {
    var exercises = req.body.exercises;
    var totalExerciseIds = _.pluck(exercises, "exerciseId");

    totalExerciseIds.forEach((id, index) => {
      totalExerciseIds[index] = mongoose.Types.ObjectId(id);
    });
    var exercise_data = await exercise_helper.get_exercise_id(
      {
        _id: { $in: totalExerciseIds }
      },
      1
    );

    for (let single of exercises) {
      var time = 0;
      var distance = 0;
      var effort = 0;
      var weight = 0;
      var repTime = 0;
      var setTime = 0;
      var reps = 0;
      var sets = 0;
      sets += single.sets ? single.sets : 0;
      single.exercises = _.find(exercise_data.exercise, exerciseDb => {
        return exerciseDb._id.toString() === single.exerciseId.toString();
      });
      var data = await common_helper.unit_converter(
        single.restTime,
        single.restTimeUnit
      );

      single.baseRestTimeUnit = data.baseUnit;
      single.baseRestTime = data.baseValue;
      delete single.exerciseId;

      for (let tmp of single.setsDetails) {
        if (tmp.field1) {
          var data = await common_helper.unit_converter(
            tmp.field1.value,
            tmp.field1.unit
          );
          tmp.field1.baseUnit = data.baseUnit;
          tmp.field1.baseValue = data.baseValue;
          if (data.baseUnit === "second") {
            time += data.baseValue;
          } else if (data.baseUnit === "reps") {
            reps += data.baseValue;
          } else {
            distance += data.baseValue;
          }
        }

        if (tmp.field2) {
          var data = await common_helper.unit_converter(
            tmp.field2.value,
            tmp.field2.unit
          );
          tmp.field2.baseUnit = data.baseUnit;
          tmp.field2.baseValue = data.baseValue;
          if (data.baseUnit === "g") {
            weight += data.baseValue;
          } else if (data.baseUnit == "effort") {
            effort += data.baseValue;
          }

          if (tmp.field3) {
            var data = await common_helper.unit_converter(
              tmp.field3.value,
              tmp.field3.unit
            );
            tmp.field3.baseUnit = data.baseUnit;
            tmp.field3.baseValue = data.baseValue;
            if (data.baseUnit === "reps") {
              reps += data.baseValue;
            } else if (data.baseUnit === "rep_time") {
              repTime += data.baseValue;
            } else if (data.baseUnit === "set_time") {
              setTime += data.baseValue;
            }
          }
        }
        workoutLogsObj = {
          userId: authUserId,
          time,
          distance,
          effort,
          weight,
          repTime,
          setTime,
          reps,
          sets
        };
        insertWorkoutLogArray.push(workoutLogsObj);
      }
    }

    var updateObject = {
      userWorkoutsId: req.body.userWorkoutsId,
      type: req.body.type,
      subType: req.body.subType,
      exercises: exercises,
      date: req.body.date
    };

    var workout_day = await user_workout_helper.update_user_workout_exercise(
      workout_id,
      updateObject,
      insertWorkoutLogArray
    );

    if (workout_day.status == 1) {
      workout_day = await user_workout_helper.get_all_workouts_group_by(
        {
          _id: mongoose.Types.ObjectId(req.body.userWorkoutsId)
        },
        true
      );
      workout_day.message = "Workout Added";
      res.status(config.OK_STATUS).json(workout_day);
    } else {
      res.status(config.BAD_REQUEST).json(workout_day);
    }
  }
});

/**
 * @api {delete} /user/user_workouts/exercise/:exercise_id Delete User workout exercise
 * @apiName Delete User workout exercise
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/exercise/:exercise_id", async (req, res) => {
  exercise_id = mongoose.Types.ObjectId(req.params.exercise_id);
  logger.trace("Delete workout exercise API - Id = ", exercise_id);
  let workout_data = await user_workout_helper.delete_user_workouts_exercise({
    _id: exercise_id
  });
  if (workout_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
  } else {
    res.status(config.OK_STATUS).json(workout_data);
  }
});

/**
 * @api {delete} /user/user_workouts/:workout_id Delete User workout
 * @apiName Delete User workout
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:workout_id", async (req, res) => {
  console.log("here", req.params.workout_id);

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete workout API - Id = ", req.params.workout_id);
  let workout_data = await user_workout_helper.delete_user_workouts_by_id(
    req.params.workout_id
  );

  if (workout_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
  } else {
    res.status(config.OK_STATUS).json(workout_data);
  }
});

/**
 * @api {post} /user/user_workouts/delete Multiple Workout delete by Days
 * @apiName Multiple Workout delete by Days
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Array} exerciseIds ids of Days
 * @apiParam {Array} parentId parentId of Day
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/delete", async (req, res) => {
  var exerciseIds = req.body.exerciseIds;
  var parentId = req.body.parentId;
  exerciseIds.forEach((id, index) => {
    exerciseIds[index] = mongoose.Types.ObjectId(id);
  });
  logger.trace("Delete workout by - Id = ", exerciseIds);
  let workout_data = await user_workout_helper.delete_user_workouts_by_days(
    exerciseIds
  );
  var workout_day = await user_workout_helper.get_all_workouts_group_by(
    {
      _id: mongoose.Types.ObjectId(parentId)
    },
    true
  );
  workout_day.message = "Exercises Delete";
  if (workout_data.status === 1) {
    res.status(config.OK_STATUS).json(workout_day);
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
  }
});

//@param authUserId auth user id
async function assign_badges(authUserId) {
  let workout_detail = await user_workout_helper.workout_detail_for_badges({
    userId: authUserId
  });

  //badge assign start;
  var badges = await badge_assign_helper.badge_assign(
    authUserId,
    constant.BADGES_TYPE.WORKOUTS.concat(constant.BADGES_TYPE.WEIGHT_LIFTED),
    workout_detail.workouts
  );
  //badge assign end
}

// /**
//  * @api {put} /user/user_workouts/complete_all Complete all User workout
//  * @apiName Complete all User workout
//  * @apiGroup  User Workouts
//  * @apiHeader {String}  authorization User's unique access-key
//  * @apiParam {String} parentId parent Id of Workout's event to be complete
//  * @apiParam {String} isCompleted isCompleted status of Workout to be complete
//  * @apiSuccess (Success 200) {String} message Success message
//  * @apiError (Error 4xx) {String} message Validation or error message.
//  */
// router.put("/complete_all", async (req, res) => {
//   var decoded = jwtDecode(req.headers["authorization"]);
//   var authUserId = decoded.sub;

//   var parentId = mongoose.Types.ObjectId(req.body.parentId);
//   var isCompleted = {
//     isCompleted: req.body.isCompleted
//   };

//   logger.trace("Complete all workout API Called");
//   let workout_data = await user_workout_helper.complete_all_workout(
//     parentId,
//     isCompleted
//   );

//   if (workout_data.status === 1) {
//     let workout_detail = await user_workout_helper.workout_detail_for_badges({
//       userId: authUserId,
//       isCompleted: 1
//     });

//     delete workout_detail.workouts._id;

//     let workout = await user_workout_helper.get_all_workouts(
//       {
//         userId: authUserId,
//         _id: parentId
//       },
//       true
//     );

//     workout.message = "Workout completed";
//     res.status(config.OK_STATUS).json(workout);

//     //badge assign start;
//     var badges = await badge_assign_helper.badge_assign(
//       authUserId,
//       constant.BADGES_TYPE.WORKOUTS.concat(constant.BADGES_TYPE.WEIGHT_LIFTED),
//       workout_detail.workouts
//     );
//     //badge assign end
//   } else {
//     res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
//   }
// });
module.exports = router;
