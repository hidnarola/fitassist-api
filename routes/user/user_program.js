var express = require("express");
var router = express.Router();

var config = require("../../config");
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose");
var _ = require("underscore");
var moment = require("moment");
var logger = config.logger;

var user_program_helper = require("../../helpers/user_program_helper");
var exercise_helper = require("../../helpers/exercise_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {get} /user/user_program/ Get user's program
 * @apiName Get user's program
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} programs JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get all user programs API called");
  var resp_data = await user_program_helper.get_user_programs({
    userId: authUserId
  });

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user programs = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/user_program/names Get user's program
 * @apiName Get user's program
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_programs JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/names", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get all user programs API called");
  var resp_data = await user_program_helper.get_user_programs({});

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user programs = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/user_program/:program_id Get user's program by _id
 * @apiName Get user's program by _id
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} program JSON of user_program document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:program_id", async (req, res) => {
  var program_id = mongoose.Types.ObjectId(req.params.program_id);

  logger.trace("Get all user programs API called ID:" + program_id);
  var resp_data = await user_program_helper.get_user_programs_in_details(
    {
      _id: program_id
    },
    true
  );

  if (resp_data.status == 1) {
    var returnObject = {
      status: resp_data.status,
      message: resp_data.message,
      program: {
        programDetails: {
          _id: resp_data.program[0]._id,
          name: resp_data.program[0].name,
          description: resp_data.program[0].description,
          userId: resp_data.program[0].userId,
          type: resp_data.program[0].type
        },
        workouts: []
      }
    };
    var data = resp_data.program[0];
    var programDetails = data.programDetails;
    var workouts = data.workouts;

    programDetails = programDetails.map(async ex => {
      if (workouts && workouts.length > 0) {
        var filteredExercises = _.filter(workouts, w => {
          return w.userWorkoutsProgramId.toString() === ex._id.toString();
        });
        if (filteredExercises && filteredExercises.length > 0) {
          ex.exercises = filteredExercises;
        }
      }
      return ex;
    });
    programDetails = await Promise.all(programDetails);
    programDetails = _.sortBy(programDetails, function(pd) {
      return pd.day;
    });
    returnObject.program.workouts = programDetails;

    logger.trace("user program got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(returnObject);
  } else {
    logger.error("Error occured while fetching user program = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

/**
 * @api {post} /user/user_program Add user's program
 * @apiName Add user's program
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  name name of program
 * @apiParam {String}  description description of program
 * @apiParam {Enum}  type type of program creator | Possible Values<code>Enum : ['admin','user'] </code>
 * @apiSuccess (Success 200) {JSON} program JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var programObj = {
    name: req.body.name,
    description: req.body.description,
    userId: authUserId,
    type: req.body.type
  };
  logger.trace("Add user programs  API called");
  var resp_data = await user_program_helper.add_program(programObj);
  if (resp_data.status == 0) {
    logger.error("Error occured while adding user programs = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs added successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_program/exercises Add user's program's exercises
 * @apiName Add user's program's exercises
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  programId Id of program
 * @apiParam {String} title title of workout
 * @apiParam {String} description description of workout
 * @apiParam {Enum} type type of workout | Possbile value <code>Enum: ["exercise","restday"]</code>
 * @apiParam {Date} date date of workout
 * @apiParam {Array} workouts list of exercises of workout
 * @apiSuccess (Success 200) {JSON} workout JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/exercises", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var masterProgramCollectionObject = {
    programId: req.body.programId,
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    day: req.body.day
  };

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

    var workout_data = await user_program_helper.insert_program_workouts(
      masterProgramCollectionObject,
      insertObj
    );

    if (workout_data.status == 1) {
      res.status(config.OK_STATUS).json(workout_data);
    } else {
      res.status(config.BAD_REQUEST).json(workout_data);
    }
  }
});

/**
 * @api {put} /user/user_program/exercises/:program_day_id Update user's program's exercises
 * @apiName Update user's program's exercises
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  programId Id of program
 * @apiParam {String} title title of workout
 * @apiParam {String} description description of workout
 * @apiParam {Enum} type type of workout | Possbile value <code>Enum: ["exercise","restday"]</code>
 * @apiParam {Date} date date of workout
 * @apiParam {Array} exercises list of exercises of workout
 * @apiSuccess (Success 200) {JSON} workout JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/exercises/:program_day_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var program_day_id = mongoose.Types.ObjectId(req.params.program_day_id);

  var masterProgramCollectionObject = {
    programId: req.body.programId,
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    day: req.body.day
  };
  var workouts = [];
  if (req.body.type != "restday") {
    workouts = req.body.workouts;
    var totalExerciseIds = [];
    var exercise_ids = [];
    for (let w of workouts) {
      exercise_ids = _.pluck(w.exercises, "exerciseId");

      totalExerciseIds = _.union(totalExerciseIds, exercise_ids);
    }
    totalExerciseIds.forEach((id, index) => {
      totalExerciseIds[index] = mongoose.Types.ObjectId(id);
    });
    var exercise_data = await exercise_helper.get_exercise_id(
      {
        _id: { $in: totalExerciseIds }
      },
      1
    );
    var workouts = workouts.map(async singleWorkout => {
      for (let single of singleWorkout.exercises) {
        single.exercises = _.find(exercise_data.exercise, exerciseDb => {
          return exerciseDb._id.toString() === single.exerciseId.toString();
        });
        delete single.exerciseId;
        var setsDetails = single.setsDetails;
        if (setsDetails) {
          for (let tmp of setsDetails) {
            if (tmp.weight) {
              var baseWeight = await common_helper.unit_converter(
                tmp.weight,
                tmp.weightUnit
              );
              tmp.baseWeightUnit = baseWeight.baseUnit;
              tmp.baseWeightValue = baseWeight.baseValue;
            }
            if (tmp.distance) {
              var baseDistance = await common_helper.unit_converter(
                tmp.distance,
                tmp.distanceUnit
              );
              tmp.baseDistanceUnits = baseDistance.baseUnit;
              tmp.baseDistanceValue = baseDistance.baseValue;
            }
            if (tmp.restTime) {
              var baseTime = await common_helper.unit_converter(
                tmp.restTime,
                tmp.restTimeUnit
              );
              tmp.baseRestTimeUnit = baseTime.baseUnit;
              tmp.baseRestTimeValue = baseTime.baseValue;
            }

            if (tmp.oneSetTime) {
              var baseOneSetTime = await common_helper.unit_converter(
                tmp.oneSetTime,
                tmp.oneSetTimeUnit
              );

              tmp.baseOneSetTimeUnits = baseOneSetTime.baseUnit;
              tmp.baseOneSetTimeValue = baseOneSetTime.baseValue;
            }
          }
        }
      }

      return singleWorkout;
    });
    workouts = await Promise.all(workouts);
  }

  var program_workout_data = await user_program_helper.update_program_workouts(
    program_day_id,
    masterProgramCollectionObject,
    workouts
  );

  if (program_workout_data.status == 1) {
    res.status(config.OK_STATUS).json(program_workout_data);
  } else {
    res.status(config.BAD_REQUEST).json(program_workout_data);
  }
});

/**
 * @api {put} /user/user_program update user's program
 * @apiName update user's program
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} program JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:program_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var program_id = mongoose.Types.ObjectId(req.params.program_id);
  var programObj = {
    name: req.body.name,
    description: req.body.description,
    userId: authUserId,
    type: req.body.type
  };
  logger.trace("Add user programs  API called");
  var resp_data = await user_program_helper.update_user_program_by_id(
    program_id,
    programObj
  );
  if (resp_data.status == 0) {
    logger.error("Error occured while adding user programs = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs added successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {delete} /user/user_program/:program_id Delete user's program by _id
 * @apiName Delete user's program by _id
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:program_id", async (req, res) => {
  var program_id = mongoose.Types.ObjectId(req.params.program_id);

  logger.trace("Delete user program  API called ID:" + program_id);
  var resp_data = await user_program_helper.delete_user_program(program_id);

  if (resp_data.status == 0) {
    logger.error("Error occured while deleting user program = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user program got delete successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_program/delete/exercises Delete user's program's exercise by _ids
 * @apiName Delete user's program's exercise by _ids
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Array}  exercisesIds Array list of exercises ids
 * @apiSuccess (Success 200) {String} message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/delete/exercises", async (req, res) => {
  var exercise_ids = req.body.exercisesIds ? req.body.exercisesIds : [];
  exercise_ids.forEach((id, index) => {
    exercise_ids[index] = mongoose.Types.ObjectId(id);
  });

  logger.trace(
    "Delete user program's exercise  API called IDs:" + exercise_ids
  );
  var resp_data = await user_program_helper.delete_user_program_exercise(
    exercise_ids
  );

  if (resp_data.status == 1) {
    logger.trace(
      "user program's exercise got delete successfully = ",
      resp_data
    );
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error(
      "Error occured while deleting user program's exercise = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});
module.exports = router;
