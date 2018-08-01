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
var exercise_measurements_helper = require("../../helpers/exercise_measurements_helper");

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
 * @api {get} /user/user_program/workout/:workout_id Get user's program by workout_id
 * @apiName Get Group by workout
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} workouts JSON of user_program document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/workout/:workout_id", async (req, res) => {
  var workout_id = mongoose.Types.ObjectId(req.params.workout_id);

  logger.trace("Get all user workout API called ID:" + workout_id);
  var resp_data = await user_program_helper.get_all_program_workouts_group_by({
    _id: workout_id
  });

  if (resp_data.status == 1) {
    // var returnObject = {
    //   status: resp_data.status,
    //   message: resp_data.message,
    //   program: {
    //     programDetails: {
    //       _id: resp_data.program[0]._id,
    //       name: resp_data.program[0].name,
    //       description: resp_data.program[0].description,
    //       userId: resp_data.program[0].userId,
    //       type: resp_data.program[0].type
    //     },
    //     workouts: []
    //   }
    // };
    // var data = resp_data.program[0];
    // var programDetails = data.programDetails;
    // var workouts = data.workouts;

    // programDetails = programDetails.map(async ex => {
    //   if (workouts && workouts.length > 0) {
    //     var filteredExercises = _.filter(workouts, w => {
    //       return w.userWorkoutsProgramId.toString() === ex._id.toString();
    //     });
    //     if (filteredExercises && filteredExercises.length > 0) {
    //       ex.exercises = filteredExercises;
    //     }
    //   }
    //   return ex;
    // });
    // programDetails = await Promise.all(programDetails);
    // programDetails = _.sortBy(programDetails, function(pd) {
    //   return pd.day;
    // });
    // returnObject.program.workouts = programDetails;

    logger.trace("user program got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
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
 * @api {post} /user/user_program/day Add User program day
 * @apiName Add User program day
 * @apiGroup  User Program
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} title title of workout
 * @apiParam {String} description description of workout
 * @apiParam {Enum} type type of workout | Possbile value <code>Enum: ["exercise","restday"]</code>
 * @apiParam {Date} day day of workout
 * @apiSuccess (Success 200) {JSON} program workout day details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/day", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    title: {
      notEmpty: true,
      errorMessage: "Title is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var masterCollectionObject = {
      programId: req.body.programId,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      userId: authUserId,
      day: req.body.day
    };

    var workout_day = await user_program_helper.add_workouts_program(
      masterCollectionObject
    );

    if (workout_day.status == 1) {
      res.status(config.OK_STATUS).json(workout_day);
    } else {
      res.status(config.BAD_REQUEST).json(workout_day);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {post} /user/user_program/workout Add user's program's exercises
 * @apiName Add user's program's exercises
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  programId Id of program
 * @apiParam {String} title title of workout
 * @apiParam {String} description description of workout
 * @apiParam {Enum} type type of workout | Possbile value <code>Enum: ["exercise","restday"]</code>
 * @apiParam {Date} day day of workout
 * @apiParam {Array} exercises list of exercises of workout
 * @apiSuccess (Success 200) {JSON} workout JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/workout", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var isError = false;
  var schema = {
    userWorkoutsId: {
      notEmpty: true,
      errorMessage: "userWorkoutsId is required"
    },
    type: {
      notEmpty: true,
      errorMessage: "type is required"
    },
    subType: {
      notEmpty: true,
      errorMessage: "subType is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var errors = [];
  }

  if (req.body.exercises && req.body.exercises.length < 0) {
    error = {
      param: "exercises",
      msg: "Exercises is empty",
      value: req.body.exercises
    };
    errors.push(error);
  } else {
    var measerment_data = await exercise_measurements_helper.get_all_measurements();
    measerment_data = measerment_data.measurements;

    switch (req.body.subType) {
      case "exercise":
        if (req.body.exercises.length != 1) {
          isError = true;
        } else {
          req.body.exercises.forEach((ex, index) => {
            if (typeof ex.sets == "undefined" || ex.sets <= 0) {
              isError = true;
            } else if (typeof ex.sets != "undefined" && ex.sets > 12) {
              isError = true;
            } else if (
              ex.differentSets == 0 &&
              index < ex.sets - 1 &&
              typeof ex.restTime === "undefined"
            ) {
              isError = true;
            }
            var data = _.findWhere(measerment_data, {
              category: ex.exerciseObj.cat,
              subCategory: ex.exerciseObj.subCat
            });
            ex.setsDetails.forEach(setsDetail => {
              if (data.field1.length > 0) {
                if (data.field1.indexOf(setsDetail.field1.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field1.value || setsDetail.field1.value < 0) {
                  isError = true;
                }
              }
              if (data.field2.length > 0) {
                if (data.field2.indexOf(setsDetail.field2.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field2.value || setsDetail.field2.value < 0) {
                  isError = true;
                }
              }
              if (data.field3.length > 0) {
                if (data.field3.indexOf(setsDetail.field3.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field3.value || setsDetail.field3.value < 0) {
                  isError = true;
                }
              }
              if (
                ex.differentSets == 1 &&
                index < ex.sets - 1 &&
                typeof setsDetail.restTime === "undefined"
              ) {
                isError = true;
              }
            });
          });
        }
        break;
      case "superset":
        if (req.body.exercises.length != 2) {
          isError = true;
        } else {
          req.body.exercises.forEach((ex, index) => {
            if (typeof ex.sets == "undefined" || ex.sets <= 0) {
              isError = true;
            } else if (typeof ex.sets != "undefined" && ex.sets > 12) {
              isError = true;
            } else if (
              typeof ex.sets != "undefined" &&
              ex.sets > 1 &&
              typeof ex.restTime === "undefined"
            ) {
              isError = true;
            }
            var data = _.findWhere(measerment_data, {
              category: ex.exerciseObj.cat,
              subCategory: ex.exerciseObj.subCat
            });
            ex.setsDetails.forEach(setsDetail => {
              if (data.field1.length > 0) {
                if (data.field1.indexOf(setsDetail.field1.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field1.value || setsDetail.field1.value < 0) {
                  isError = true;
                }
              }
              if (data.field2.length > 0) {
                if (data.field2.indexOf(setsDetail.field2.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field2.value || setsDetail.field2.value < 0) {
                  isError = true;
                }
              }
              if (data.field3.length > 0) {
                if (data.field3.indexOf(setsDetail.field3.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field3.value || setsDetail.field3.value < 0) {
                  isError = true;
                }
              }
            });
          });
        }
        break;
      case "circuit":
        if (req.body.exercises.length <= 0) {
          isError = true;
        } else {
          req.body.exercises.forEach((ex, index) => {
            if (typeof ex.sets == "undefined" || ex.sets <= 0) {
              isError = true;
            } else if (typeof ex.sets != "undefined" && ex.sets > 12) {
              isError = true;
            } else if (
              typeof ex.sets != "undefined" &&
              ex.sets > 1 &&
              typeof ex.restTime === "undefined"
            ) {
              isError = true;
            }
            var data = _.findWhere(measerment_data, {
              category: ex.exerciseObj.cat,
              subCategory: ex.exerciseObj.subCat
            });
            ex.setsDetails.forEach(setsDetail => {
              if (data.field1.length > 0) {
                if (data.field1.indexOf(setsDetail.field1.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field1.value || setsDetail.field1.value < 0) {
                  isError = true;
                }
              }
              if (data.field2.length > 0) {
                if (data.field2.indexOf(setsDetail.field2.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field2.value || setsDetail.field2.value < 0) {
                  isError = true;
                }
              }
              if (data.field3.length > 0) {
                if (data.field3.indexOf(setsDetail.field3.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field3.value || setsDetail.field3.value < 0) {
                  isError = true;
                }
              }
            });
          });
        }
        break;
    }
  }
  if (isError) {
    error = {
      msg: "Invalid input"
    };
    errors.push(error);
  }

  if (!errors || errors.length <= 0) {
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
          }

          if (tmp.field2) {
            var data = await common_helper.unit_converter(
              tmp.field2.value,
              tmp.field2.unit
            );
            tmp.field2.baseUnit = data.baseUnit;
            tmp.field2.baseValue = data.baseValue;
          }

          if (tmp.field3) {
            var data = await common_helper.unit_converter(
              tmp.field3.value,
              tmp.field3.unit
            );
            tmp.field3.baseUnit = data.baseUnit;
            tmp.field3.baseValue = data.baseValue;
          }
        }
      }

      var insertObj = {
        userWorkoutsProgramId: req.body.userWorkoutsId,
        type: req.body.type,
        subType: req.body.subType,
        exercises: exercises
      };

      var workout_day = await user_program_helper.insert_program_workouts(
        insertObj
      );

      var returnObject = await user_program_helper.get_all_program_workouts_group_by(
        {
          _id: mongoose.Types.ObjectId(req.body.userWorkoutsProgramId)
        }
      );

      if (workout_day.status == 1) {
        res.status(config.OK_STATUS).json(returnObject);
      } else {
        res.status(config.BAD_REQUEST).json(workout_day);
      }
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {post} /user/user_program/copy Copy User Program
 * @apiName Copy User Program
 * @apiGroup  User Program
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} workoutId workoutId of workout
 * @apiParam {String} day day of workout
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/copy", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var workoutId = mongoose.Types.ObjectId(req.body.workoutId);
  var day = req.body.day;

  var workout_day = await user_program_helper.copy_exercise_by_id(
    workoutId,
    day,
    authUserId
  );

  if (workout_day.status == 1) {
    workout_day = await user_program_helper.get_all_program_workouts_group_by(
      {
        _id: mongoose.Types.ObjectId(workout_day.copiedId)
      },
      true
    );
    workout_day.message = "Workout Copied";
    delete workout_day.copiedId;
    res.status(config.OK_STATUS).json(workout_day);
  } else {
    res.status(config.BAD_REQUEST).json(workout_day);
  }
});

/**
 * @api {put} /user/user_program/workout/:workout_day_id Update user's program's exercises
 * @apiName Update user's program's exercises
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  type type of program
 * @apiParam {String}  subType subType of program
 * @apiParam {String}  userWorkoutsId userWorkoutsId of program
 * @apiParam {Array} exercises list of exercises of workout
 * @apiParam {Array} sequence sequence of exercises of workout
 * @apiSuccess (Success 200) {JSON} workouts JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/workout", async (req, res) => {
  var isError = false;
  var workout_day_id = mongoose.Types.ObjectId(req.body._id);
  var schema = {
    userWorkoutsId: {
      notEmpty: true,
      errorMessage: "userWorkoutsId is required"
    },
    type: {
      notEmpty: true,
      errorMessage: "type is required"
    },
    subType: {
      notEmpty: true,
      errorMessage: "subType is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var errors = [];
  }

  if (req.body.exercises && req.body.exercises.length < 0) {
    error = {
      param: "exercises",
      msg: "Exercises is empty",
      value: req.body.exercises
    };
    errors.push(error);
  } else {
    var measerment_data = await exercise_measurements_helper.get_all_measurements();
    measerment_data = measerment_data.measurements;

    switch (req.body.subType) {
      case "exercise":
        if (req.body.exercises.length > 1) {
          isError = true;
        } else {
          req.body.exercises.forEach((ex, index) => {
            if (typeof ex.sets == "undefined" || ex.sets <= 0) {
              isError = true;
            } else if (typeof ex.sets != "undefined" && ex.sets > 12) {
              isError = true;
            } else if (
              ex.differentSets == 0 &&
              index < ex.sets - 1 &&
              typeof ex.restTime === "undefined"
            ) {
              isError = true;
            }

            var data = _.findWhere(measerment_data, {
              category: ex.exerciseObj.cat,
              subCategory: ex.exerciseObj.subCat
            });
            ex.setsDetails.forEach(setsDetail => {
              if (data.field1.length > 0) {
                if (data.field1.indexOf(setsDetail.field1.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field1.value || setsDetail.field1.value < 0) {
                  isError = true;
                }
              }
              if (data.field2.length > 0) {
                if (data.field2.indexOf(setsDetail.field2.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field2.value || setsDetail.field2.value < 0) {
                  isError = true;
                }
              }
              if (data.field3.length > 0) {
                if (data.field3.indexOf(setsDetail.field3.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field3.value || setsDetail.field3.value < 0) {
                  isError = true;
                }
              }

              if (
                ex.differentSets == 1 &&
                index < ex.sets - 1 &&
                typeof setsDetail.restTime === "undefined"
              ) {
                isError = true;
              }
            });
          });
        }
        break;
      case "superset":
        if (req.body.exercises.length != 2) {
          isError = true;
        } else {
          req.body.exercises.forEach((ex, index) => {
            if (typeof ex.sets == "undefined" || ex.sets <= 0) {
              isError = true;
            } else if (typeof ex.sets != "undefined" && ex.sets > 12) {
              isError = true;
            } else if (
              typeof ex.sets != "undefined" &&
              ex.sets > 1 &&
              typeof ex.restTime === "undefined"
            ) {
              isError = true;
            }
            var data = _.findWhere(measerment_data, {
              category: ex.exerciseObj.cat,
              subCategory: ex.exerciseObj.subCat
            });
            ex.setsDetails.forEach(setsDetail => {
              if (data.field1.length > 0) {
                if (data.field1.indexOf(setsDetail.field1.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field1.value || setsDetail.field1.value < 0) {
                  isError = true;
                }
              }
              if (data.field2.length > 0) {
                if (data.field2.indexOf(setsDetail.field2.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field2.value || setsDetail.field2.value < 0) {
                  isError = true;
                }
              }
              if (data.field3.length > 0) {
                if (data.field3.indexOf(setsDetail.field3.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field3.value || setsDetail.field3.value < 0) {
                  isError = true;
                }
              }
            });
          });
        }
        break;
      case "circuit":
        if (req.body.exercises.length <= 0) {
          isError = true;
        } else {
          req.body.exercises.forEach((ex, index) => {
            if (typeof ex.sets == "undefined" || ex.sets <= 0) {
              isError = true;
            } else if (typeof ex.sets != "undefined" && ex.sets > 12) {
              isError = true;
            } else if (
              typeof ex.sets != "undefined" &&
              ex.sets > 1 &&
              typeof ex.restTime === "undefined"
            ) {
              isError = true;
            }
            var data = _.findWhere(measerment_data, {
              category: ex.exerciseObj.cat,
              subCategory: ex.exerciseObj.subCat
            });
            ex.setsDetails.forEach(setsDetail => {
              if (data.field1.length > 0) {
                if (data.field1.indexOf(setsDetail.field1.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field1.value || setsDetail.field1.value < 0) {
                  isError = true;
                }
              }
              if (data.field2.length > 0) {
                if (data.field2.indexOf(setsDetail.field2.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field2.value || setsDetail.field2.value < 0) {
                  isError = true;
                }
              }
              if (data.field3.length > 0) {
                if (data.field3.indexOf(setsDetail.field3.unit) < 0) {
                  isError = true;
                }
                if (!setsDetail.field3.value || setsDetail.field3.value < 0) {
                  isError = true;
                }
              }
            });
          });
        }
        break;
    }
  }
  if (isError) {
    error = {
      msg: "Invalid input"
    };
    errors.push(error);
  }

  if (!errors || errors.length <= 0) {
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
          }

          if (tmp.field2) {
            var data = await common_helper.unit_converter(
              tmp.field2.value,
              tmp.field2.unit
            );
            tmp.field2.baseUnit = data.baseUnit;
            tmp.field2.baseValue = data.baseValue;
          }

          if (tmp.field3) {
            var data = await common_helper.unit_converter(
              tmp.field3.value,
              tmp.field3.unit
            );
            tmp.field3.baseUnit = data.baseUnit;
            tmp.field3.baseValue = data.baseValue;
          }
        }
      }

      var insertObj = {
        userWorkoutsProgramId: req.body.userWorkoutsId,
        type: req.body.type,
        subType: req.body.subType,
        exercises: exercises
      };

      var workout_day = await user_program_helper.update_program_workouts(
        workout_day_id,
        insertObj
      );

      var returnObject = await user_program_helper.get_all_program_workouts_group_by(
        {
          _id: mongoose.Types.ObjectId(req.body.userWorkoutsId)
        }
      );

      if (workout_day.status == 1) {
        res.status(config.OK_STATUS).json(returnObject);
      } else {
        res.status(config.BAD_REQUEST).json(workout_day);
      }
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
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
 * @api {put} /user/user_program/day/:program_day_id update user's program
 * @apiName update user's program
 * @apiGroup  User Program
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} program JSON of user_programs document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/day/:program_day_id", async (req, res) => {
  var program_day_id = mongoose.Types.ObjectId(req.params.program_day_id);
  var programObj = {
    title: req.body.title,
    description: req.body.description
  };
  logger.trace(
    "user programs title and description edit  API called " + program_day_id
  );
  var resp_data = await user_program_helper.update_user_program_by_day_id(
    program_day_id,
    programObj
  );
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while updating user programs title and description = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user programs updated successfully = ", resp_data);
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
