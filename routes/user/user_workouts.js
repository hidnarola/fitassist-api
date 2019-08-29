var express = require("express");
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
var user_program_helper = require("../../helpers/user_program_helper");
var exercise_measurements_helper = require("../../helpers/exercise_measurements_helper");
var body_parts_helper = require("../../helpers/body_parts_helper");
var user_helper = require("../../helpers/user_helper");

/**
 * @api {get} /user/user_workouts/:workout_id Get User Workouts
 * @apiName Get User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} workouts JSON of user_workouts
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:workout_id", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    if (mongoose.Types.ObjectId.isValid(req.params.workout_id)) {
        var workout_id = mongoose.Types.ObjectId(req.params.workout_id);
        var resp_data = await get_respose_data_for_workout(workout_id, authUserId);

        if (resp_data.status === 1) {
            logger.trace("user workouts got successfully = ", resp_data);
            res.status(config.OK_STATUS).json(resp_data);
        } else {
            logger.error("Error occured while fetching user workouts = ", resp_data);
            res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
        }
    } else {
        logger.error("Invalid Object is passed= ", req.params.workout_id);
        res.status(config.BAD_REQUEST).json({
            status: 0,
            message: "Something went wrong"
        });

    }
});

/**
 * @api {post} /user/workout/calendar_list Get all user's workout for calendar
 * @apiName Get all user's workout for calendar
 * @apiGroup  User Workout
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} calendar_list list of user_workout document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/calendar_list", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var date = req.body.date;
    var check = await moment(date).utc(0);
    var startCheck = await moment(check).subtract(2, "month");
    var endCheck = await moment(check).add(2, "month");
    var resp_data = await user_workout_helper.get_workouts_for_calendar({
        userId: authUserId,
        date: {
            $gte: new Date(startCheck),
            $lt: new Date(endCheck)
        }
    });
    resp_data.calendar_list = resp_data.workouts;
    delete resp_data.workouts;

    if (resp_data.status == 1) {
        logger.trace(
                "user workouts detail for calendar got successfully = ",
                resp_data
                );
        res.status(config.OK_STATUS).json(resp_data);
    } else {
        logger.error(
                "Error occured while fetching user workouts details for calendar = ",
                resp_data
                );
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    }
});

/**
 * @api {post} /user/workout/first_workout Get all user's workout
 * @apiName Get all user's workout
 * @apiGroup  User Workout
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} workout_id Id of user_workout document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/first_workout", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var date = req.body.date;

    var start = moment(date).utcOffset(0);
    start.toISOString();
    start.format();

    var end = moment(date)
            .utcOffset(0)
            .add(23, "hours")
            .add(59, "minutes");
    end.toISOString();
    end.format();

    logger.trace("Get all user workouts by date  API called");
    var resp_data = await user_workout_helper.get_first_workout_by_date({
        userId: authUserId,
        date: {
            $gte: new Date(start),
            $lte: new Date(end)
        }
    });

    if (resp_data.status == 1) {
        logger.trace("user workouts got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    } else {
        logger.error("Error occured while fetching user workouts = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    }
});

/**
 * @api {post} /user/workout/today Get all user's workout
 * @apiName Get all user's workout
 * @apiGroup  User Workout
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_workouts JSON of user_workout document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/by_date", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var date = req.body.date;

    var start = moment(date).utcOffset(0);
    start.toISOString();
    start.format();

    var end = moment(date)
            .utcOffset(0)
            .add(23, "hours")
            .add(59, "minutes");
    end.toISOString();
    end.format();

    logger.trace("Get all user workouts by date  API called");
    var resp_data = await user_workout_helper.get_all_workouts_by_date({
        userId: authUserId,
        date: {
            $gte: new Date(start),
            $lte: new Date(end)
        }
    });

    if (resp_data.status == 1) {
        logger.trace("user workouts got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    } else {
        logger.error("Error occured while fetching user workouts = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
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

    if (resp_data.status == 1) {
        logger.trace("user workouts got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    } else {
        logger.error("Error occured while fetching user workouts = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
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

    var schema = {
        title: {
            notEmpty: true,
            trim: {options: [[" "]]},
            isLength: {
                errorMessage: "Title should be between 0 to 20 characters",
                options: {min: 0, max: 20}
            },
            errorMessage: "Title is required"
        }
    };

    req.checkBody('description', 'Description should be less than 200').isLength({max: 200});
    req.checkBody(schema);

    var errors = req.validationErrors();
    if (!errors) {
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
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
    }
});

/**
 * @api {post} /user/user_workouts/workout Add User Workouts
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
    var error = {};
    var isError = false;
    var schema = {
        type: {
            notEmpty: true,
            isIn: {
                options: [constant.WORKOUTS_TYPE],
                errorMessage: "Type is invalid"
            },
            errorMessage: "Exercise Type is required"
        },
        subType: {
            notEmpty: true,
            isIn: {
                options: [constant.WORKOUTS_SUB_TYPE],
                errorMessage: "Type is invalid"
            },
            errorMessage: "Exercise sub Type is required"
        },
        userWorkoutsId: {
            notEmpty: true,
            errorMessage: "userWorkoutsId is required"
        },
        exercises: {
            notEmpty: true,
            errorMessage: "exercises is required"
        }
    };
    req.checkBody(schema);
    errors = req.validationErrors();

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
                                if (
                                        (setsDetail.field2.unit === "effort" ||
                                                setsDetail.field2.unit === "one_rm") &&
                                        setsDetail.field2.value > 100
                                        ) {
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
                                if (
                                        (setsDetail.field2.unit === "effort" ||
                                                setsDetail.field2.unit === "one_rm") &&
                                        setsDetail.field2.value > 100
                                        ) {
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
                                if (
                                        (setsDetail.field2.unit === "effort" ||
                                                setsDetail.field2.unit === "one_rm") &&
                                        setsDetail.field2.value > 100
                                        ) {
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
                        _id: {
                            $in: totalExerciseIds
                        }
                    },
                    1
                    );

            for (let single of exercises) {
                single.exercises = _.find(exercise_data.exercise, exerciseDb => {
                    return exerciseDb._id.toString() === single.exerciseId.toString();
                });
                delete single.exerciseId;
                for (let tmp of single.setsDetails) {
                    var data = null;
                    if (req.body.subType === "exercise" && single.differentSets == 1) {
                        data = await common_helper.unit_converter(
                                tmp.restTime,
                                tmp.restTimeUnit
                                );
                    } else {
                        data = await common_helper.unit_converter(
                                single.restTime,
                                single.restTimeUnit
                                );
                    }
                    tmp.baseRestTimeUnit = data.baseUnit;
                    tmp.baseRestTime = data.baseValue;
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
                userWorkoutsId: req.body.userWorkoutsId,
                type: req.body.type,
                subType: req.body.subType,
                exercises: exercises,
                date: req.body.date,
                sequence: req.body.sequence
            };

            var workout_day = await user_workout_helper.insert_user_workouts_exercises(
                    insertObj,
                    authUserId
                    );

            if (workout_day.status == 1) {
                var workout_id = mongoose.Types.ObjectId(req.body.userWorkoutsId);
                var tmp = await user_workout_helper.in_complete_master_workout({_id: workout_id}, {isCompleted: 0});
                var resp_data = await get_respose_data_for_workout(
                        workout_id,
                        authUserId
                        );

                if (resp_data.status === 1) {
                    logger.trace("user workouts got successfully = ", resp_data);
                    res.status(config.OK_STATUS).json(resp_data);
                } else {
                    resp_data.message = "No workout found";
                    resp_data.status = 0;
                    logger.error(
                            "Error occured while fetching user workouts = ",
                            resp_data
                            );
                    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
                }
            } else {
                res.status(config.BAD_REQUEST).json(workout_day);
            }
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
    }
});

/**
 * @api {post} /user/user_workouts/copy Copy User Workouts
 * @apiName Copy User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} exerciseId exerciseId of workout
 * @apiParam {String} date date of workout
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/copy", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var exerciseId = mongoose.Types.ObjectId(req.body.exerciseId);
    var date = req.body.date;

    var workout_day = await user_workout_helper.copy_exercise_by_id(
            exerciseId,
            date,
            authUserId
            );

    if (workout_day.status == 1) {
        workout_day = await user_workout_helper.get_all_workouts_group_by(
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
 * @api {post} /user/user_workouts/cut Cut paste User Workouts
 * @apiName Cut paste User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} exerciseId exerciseId of workout
 * @apiParam {String} date date of workout
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/cut", async (req, res) => {
    var exerciseId = mongoose.Types.ObjectId(req.body.exerciseId);
    var date = req.body.date;
    var workout_day = await user_workout_helper.cut_exercise_by_id(exerciseId, date);
    if (workout_day.status === 1) {
        workout_day = await user_workout_helper.get_all_workouts_group_by({_id: mongoose.Types.ObjectId(exerciseId)}, true);
        workout_day.message = "Workout Pasted";
        res.status(config.OK_STATUS).json(workout_day);
    } else {
        res.status(config.BAD_REQUEST).json(workout_day);
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
    var returnErrorObject = {
        status: 0,
        message: "no workout exercise available"
    }
    var program_id = mongoose.Types.ObjectId(req.body.programId);
    var program_data = await user_program_helper.get_user_programs_in_details_for_assign(
            {
                _id: program_id
            }
    );

    if (program_data &&
            program_data.status === 1 &&
            typeof program_data.programs != undefined &&
            typeof program_data.programs[0] != undefined &&
            typeof program_data.programs[0].user_workouts_program != undefined &&
            program_data.programs[0].user_workouts_program.length > 0) {

        var user_workouts_program = program_data.programs[0].user_workouts_program;
        var user_workout_exercises_program = program_data.programs[0].user_workout_exercises_program;

        for (let program of user_workouts_program) {
            exForProgram = _.filter(user_workout_exercises_program, program_exercise => {
                return (
                        program_exercise.userWorkoutsProgramId.toString() === program._id.toString()
                        );
            });

            let newGeneratedDate = moment(date).utcOffset(0).add(program.day, "days");
            masterCollectionObject = {
                title: program.title,
                userId: authUserId,
                description: program.description,
                type: program.type,
                date: newGeneratedDate
            };

            var resp_data = await user_workout_helper.insert_user_workouts_day(
                    masterCollectionObject
                    );

            childCollectionObject = [];
            exForProgram.map(single => {
                var newSingle = Object.assign({}, single);
                delete newSingle._id;
                delete newSingle.userWorkoutsProgramId;
                newSingle.userWorkoutsId = resp_data.day._id;
                newSingle.date = newGeneratedDate;
                childCollectionObject.push(newSingle);
            });

            if (childCollectionObject.length > 0) {
                childCollectionObject.map(async (_childCollectionObject) => {
                    resp_data = await user_workout_helper.insert_user_workouts_exercises(
                            _childCollectionObject,
                            authUserId
                            );
                })
            }
        }

        logger.trace("Assign user programs  API called");
        if (resp_data.status === 1) {
            logger.trace("user programs assigning successfully = ", resp_data);
            res.status(config.OK_STATUS).json(resp_data);
        } else {
            logger.error("Error occured while assigning user programs = ", resp_data);
            res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
        }
    } else {
        logger.trace("no program available = ", program_data);
        res.status(config.OK_STATUS).json(returnErrorObject);
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
            authUserId,
            {
                isCompleted: isCompleted
            }
    );

    if (workout_data.status === 1) {
        res.status(config.OK_STATUS).json(workout_data);
        //CALL assign_badges function for assigning badges for workout
        // assign_badges(authUserId);
        let workoutPostData = {exerciseIds, authUserId, isCompleted};
        common_helper.makeWorkoutsAsPost(workoutPostData);
        common_helper.assign_badges(authUserId);
    } else {
        res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
    }
});

/**
 * @api {put} /user/user_workouts/workout Update User Workouts
 * @apiName Update User Workouts
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
router.put("/workout", async (req, res) => {
    var workout_id = mongoose.Types.ObjectId(req.body._id);
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var error = {};
    var isError = false;
    var schema = {
        type: {
            notEmpty: true,
            isIn: {
                options: [constant.WORKOUTS_TYPE],
                errorMessage: "Type is invalid"
            },
            errorMessage: "Exercise Type is required"
        },
        subType: {
            notEmpty: true,
            isIn: {
                options: [constant.WORKOUTS_SUB_TYPE],
                errorMessage: "Type is invalid"
            },
            errorMessage: "Exercise sub Type is required"
        },
        userWorkoutsId: {
            notEmpty: true,
            errorMessage: "User Workouts Id is required"
        },
        exercises: {
            notEmpty: true,
            errorMessage: "Exercises is required"
        }
    };
    req.checkBody(schema);
    errors = req.validationErrors();

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
                                if (
                                        (setsDetail.field2.unit === "effort" ||
                                                setsDetail.field2.unit === "one_rm") &&
                                        setsDetail.field2.value > 100
                                        ) {
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
                                if (
                                        (setsDetail.field2.unit === "effort" ||
                                                setsDetail.field2.unit === "one_rm") &&
                                        setsDetail.field2.value > 100
                                        ) {
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
                                if (
                                        (setsDetail.field2.unit === "effort" ||
                                                setsDetail.field2.unit === "one_rm") &&
                                        setsDetail.field2.value > 100
                                        ) {
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
                        _id: {
                            $in: totalExerciseIds
                        }
                    },
                    1
                    );

            for (let single of exercises) {
                single.exercises = _.find(exercise_data.exercise, exerciseDb => {
                    return exerciseDb._id.toString() === single.exerciseId.toString();
                });
                delete single.exerciseId;
                for (let tmp of single.setsDetails) {
                    var data = null;
                    if (req.body.subType === "exercise" && single.differentSets == 1) {
                        data = await common_helper.unit_converter(
                                tmp.restTime,
                                tmp.restTimeUnit
                                );
                    } else {
                        data = await common_helper.unit_converter(
                                single.restTime,
                                single.restTimeUnit
                                );
                    }
                    tmp.baseRestTimeUnit = data.baseUnit;
                    tmp.baseRestTime = data.baseValue;

                    if (tmp.restTime && tmp.restTime > 0) {
                        var data = await common_helper.unit_converter(
                                tmp.restTime,
                                tmp.restTimeUnit
                                );
                        tmp.baseRestTimeUnit = data.baseUnit;
                        tmp.baseRestTime = data.baseValue;
                    }

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
                    authUserId
                    );

            // if (workout_day.status == 1) {
            // 	workout_day = await user_workout_helper.get_all_workouts_group_by({
            // 			_id: mongoose.Types.ObjectId(req.body.userWorkoutsId)
            // 		},
            // 		true
            // 	);
            // 	workout_day.message = "Workout Updated";
            // 	res.status(config.OK_STATUS).json(workout_day);
            // } else {
            // 	res.status(config.BAD_REQUEST).json(workout_day);
            // }

            if (workout_day.status == 1) {
                var workout_id = mongoose.Types.ObjectId(req.body.userWorkoutsId);
                var resp_data = await get_respose_data_for_workout(
                        workout_id,
                        authUserId
                        );
                if (resp_data.status === 1) {
                    logger.trace("user workouts got successfully = ", resp_data);
                    res.status(config.OK_STATUS).json(resp_data);
                } else {
                    resp_data.message = "No workout found";
                    resp_data.status = 0;
                    logger.error(
                            "Error occured while fetching user workouts = ",
                            resp_data
                            );
                    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
                }
            } else {
                res.status(config.BAD_REQUEST).json(workout_day);
            }
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
    }
});

/**
 * @api {put} /user/user_workouts/reorder_exercises Update reorder of exercise
 * @apiName Update reorder of exercise
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} workoutId workoutId of exercise
 * @apiParam {Array} reorderExercises array of new exercise sequence
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/reorder_exercises", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var resp_data = await user_workout_helper.reorder_exercises(
            req.body.reorderExercises
            );

    if (resp_data.status === 1) {
        var group_by_data = await user_workout_helper.get_all_workouts_group_by(
                {
                    _id: mongoose.Types.ObjectId(req.body.workoutId)
                },
                false
                );
        if (group_by_data.status === 1) {
            res.status(config.OK_STATUS).json(group_by_data);
        } else {
            res.status(config.OK_STATUS).json(group_by_data);
        }
    } else {
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
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
    var schema = {
        title: {
            notEmpty: true,
            isLength: {
                errorMessage: "Site1 should be between 0 to 20 characters",
                options: {
                    min: 0,
                    max: 20
                }
            },
            errorMessage: "Title is required"
        }
    };
    req.checkBody('description', 'Description should be less than 200').isLength({max: 200});
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
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
    }
});

/**
 * @api {post} /user/user_workouts/exercises Update User Workouts
 * @apiName Update User Workouts
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
    var workout_id = req.params.workout_id;
    var insertWorkoutLogArray = [];
    if (req.body.type != "restday") {
        var exercises = req.body.exercises;
        var totalExerciseIds = _.pluck(exercises, "exerciseId");

        totalExerciseIds.forEach((id, index) => {
            totalExerciseIds[index] = mongoose.Types.ObjectId(id);
        });
        var exercise_data = await exercise_helper.get_exercise_id(
                {
                    _id: {
                        $in: totalExerciseIds
                    }
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
 * @api {post} /user/user_workouts/delete/exercise Delete User workout exercise
 * @apiName Delete User workout exercise
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String}  parentId Parent Id of workout.[ collection name : user_workouts]
 * @apiParam {String}  childId childId Id of workout's exercise.[ collection name : user_workouts_exercise ]
 * @apiParam {Array}  subChildIds subChildIds Ids of workout's exercise'subCollection
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/delete/exercise", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var parentId = mongoose.Types.ObjectId(req.body.parentId);
    var childId = mongoose.Types.ObjectId(req.body.childId);
    var subChildIds = req.body.subChildIds;

    subChildIds.forEach((id, index) => {
        subChildIds[index] = mongoose.Types.ObjectId(id);
    });

    logger.trace("Delete workout exercise API - Id = ", childId);
    let workout_data = await user_workout_helper.delete_user_workouts_exercise(
            childId,
            subChildIds
            );
    if (workout_data.status === 1) {
        var resp_data = await get_respose_data_for_workout(parentId, authUserId);
        if (resp_data.status === 1) {
            logger.trace("user workouts got successfully = ", resp_data);
            res.status(config.OK_STATUS).json(resp_data);
        } else {
            logger.error("Error occured while fetching user workouts = ", resp_data);
            res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
        }
    } else {
        res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
    }
});

/**
 * @api {post} /user/user_workouts/workout_delete Delete User workout
 * @apiName Delete User workout
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/workout_delete", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;

    var exerciseIds = req.body.exerciseIds;
    exerciseIds.forEach((id, index) => {
        exerciseIds[index] = mongoose.Types.ObjectId(id);
    });
    logger.trace("Delete workout API - Ids = ", exerciseIds);
    let workout_data = await user_workout_helper.delete_user_workouts_by_id(
            exerciseIds
            );

    if (workout_data.status === 1) {
        res.status(config.OK_STATUS).json(workout_data);
    } else {
        res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
    }
});

/**
 * @api {post} /user/user_workouts/workouts_list_by_date List of all workout by Date
 * @apiName List of all workout by Date
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} workouts_list Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/workouts_list_by_date", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var date = req.body.date;
    var start = moment(date).utcOffset(0);
    start.toISOString();
    start.format();
    var end = moment(date)
            .utcOffset(0)
            .add(23, "hours")
            .add(59, "minutes");
    end.toISOString();
    end.format();

    var related_date_data = await user_workout_helper.get_workouts_by_date({
        userId: authUserId,
        date: {
            $gte: new Date(start),
            $lte: new Date(end)
        }
    });

    if (related_date_data.status === 1) {
        res.status(config.OK_STATUS).json(related_date_data);
    } else {
        res.status(config.INTERNAL_SERVER_ERROR).json(related_date_data);
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
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var exerciseIds = req.body.exerciseIds;
    var parentId = mongoose.Types.ObjectId(req.body.parentId);
    exerciseIds.forEach((id, index) => {
        exerciseIds[index] = mongoose.Types.ObjectId(id);
    });

    logger.trace("Delete workout by - Id = ", exerciseIds);
    let workout_data = await user_workout_helper.delete_user_workouts_by_exercise_ids(
            exerciseIds
            );

    if (workout_data.status === 1) {
        var resp_data = await get_respose_data_for_workout(parentId, authUserId);
        if (resp_data.status === 1) {
            logger.trace("user workouts got successfully = ", resp_data);
            res.status(config.OK_STATUS).json(resp_data);
        } else {
            logger.error("Error occured while fetching user workouts = ", resp_data);
            res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
        }
    } else {
        res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
    }
});

//Function for send respose while adding,updating,completing workouts
async function get_respose_data_for_workout(workoutId, authUserId) {
    var workout_id = workoutId;
    var resp_data = await user_workout_helper.get_all_workouts_group_by(
            {
                _id: workout_id,
                userId: authUserId
            },
            false
            );

    if (resp_data.status === 1) {
        var date = resp_data.workouts.date;
        var start = moment(date).utcOffset(0);
        start.toISOString();
        start.format();

        var end = moment(date)
                .utcOffset(0)
                .add(23, "hours")
                .add(59, "minutes");
        end.toISOString();
        end.format();
        var related_date_data = await user_workout_helper.get_workouts_by_date({
            userId: authUserId,
            date: {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        });
        var check = await moment(date).utc(0);
        var startCheck = await moment(check).subtract(2, "month");
        var endCheck = await moment(check).add(2, "month");
        var calendar_data = await user_workout_helper.get_workouts_for_calendar({
            userId: authUserId,
            date: {
                $gte: new Date(startCheck),
                $lt: new Date(endCheck)
            }
        });

        var exerciseIds = _.union(
                _.pluck(resp_data.workouts.warmup, "_id"),
                _.pluck(resp_data.workouts.cooldown, "_id"),
                _.pluck(resp_data.workouts.exercise, "_id")
                );

        _.each(exerciseIds, id => {
            return mongoose.Types.ObjectId(id);
        });

        resp_data.workouts_list = related_date_data.workouts_list
                ? related_date_data.workouts_list
                : [];

        resp_data.calendar_list = calendar_data.workouts
                ? calendar_data.workouts
                : [];

        let workout_detail = await user_workout_helper.workout_detail_for_badges({
            userId: authUserId,
            exerciseId: {
                $in: exerciseIds
            }
        });
        var tmp = [];
        var warmupExercises = resp_data.workouts.warmup;
        warmupExercises.forEach(warmup => {
            warmup.exercises.forEach(w => {
                if (tmp.indexOf(w.exercises.mainMuscleGroup) < 0) {
                    tmp.push(w.exercises.mainMuscleGroup);
                }
            });
        });
        warmupExercises = resp_data.workouts.exercise;
        warmupExercises.forEach(warmup => {
            warmup.exercises.forEach(w => {
                if (tmp.indexOf(w.exercises.mainMuscleGroup) < 0) {
                    tmp.push(w.exercises.mainMuscleGroup);
                }
            });
        });
        warmupExercises = resp_data.workouts.cooldown;
        warmupExercises.forEach(warmup => {
            warmup.exercises.forEach(w => {
                if (tmp.indexOf(w.exercises.mainMuscleGroup) < 0) {
                    tmp.push(w.exercises.mainMuscleGroup);
                }
            });
        });

        var bodypartsNames = await body_parts_helper.get_all_body_parts({
            _id: {
                $in: tmp
            }
        });

        if (bodypartsNames.status == 1) {
            bodypartsNames = _.pluck(bodypartsNames.bodyparts, "bodypart");
        }

        if (workout_detail.status === 1) {
            var workouts_stat = {
                total_workout:
                        workout_detail.workouts && workout_detail.workouts.workouts_total
                        ? workout_detail.workouts.workouts_total
                        : 0,
                muscle_work:
                        bodypartsNames && bodypartsNames.length > 0 ? bodypartsNames : [],
                total_reps:
                        workout_detail.workouts && workout_detail.workouts.reps_total
                        ? workout_detail.workouts.reps_total
                        : 0,
                total_sets:
                        workout_detail.workouts && workout_detail.workouts.sets_total
                        ? workout_detail.workouts.sets_total
                        : 0,
                total_weight_lifted:
                        workout_detail.workouts && workout_detail.workouts.weight_lifted_total
                        ? workout_detail.workouts.weight_lifted_total
                        : 0
            };
            resp_data.workouts_stat = workouts_stat ? workouts_stat : null;
        }
    }
    return resp_data;
}

router.post("/get_by_month/:username", async (req, res) => {
    try {
        var userRes = await user_helper.get_user_by({
            username: req.params.username
        });
        if (userRes && userRes.status === 1 && userRes.user) {
            const authUserId = userRes.user.authUserId;
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

            if (resp_data.status == 1) {
                logger.trace("user workouts got successfully = ", resp_data);
                res.status(config.OK_STATUS).json(resp_data);
            } else {
                logger.error("Error occured while fetching user workouts = ", resp_data);
                res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
            }
        } else {
            logger.error("Error while fetching user data = ", null);
            const responseData = {
                status: 0,
                message: "Something went wrong! please try again.",
                error: ["Something went wrong! please try again."]
            };
            res.status(config.BAD_REQUEST).json(responseData);
        }
    } catch (error) {
        logger.error("Error occured while fetching user workouts = ", error);
        const responseData = {
            status: 0,
            message: "Something went wrong! please try again.",
            error: ["Something went wrong! please try again."]
        };
        res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
    }
});

router.get("/:username/:workout_id", async (req, res) => {
    try {
        var userRes = await user_helper.get_user_by({
            username: req.params.username
        });
        if (userRes && userRes.status === 1 && userRes.user) {
            const authUserId = userRes.user.authUserId;
            if (mongoose.Types.ObjectId.isValid(req.params.workout_id)) {
                var workout_id = mongoose.Types.ObjectId(req.params.workout_id);
                var resp_data = await get_respose_data_for_workout(workout_id, authUserId);
                if (resp_data.status === 1) {
                    logger.trace("user workouts got successfully = ", resp_data);
                    res.status(config.OK_STATUS).json(resp_data);
                } else {
                    logger.error("Error occured while fetching user workouts = ", resp_data);
                    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
                }
            } else {
                logger.error("Invalid Object is passed= ", req.params.workout_id);
                const responseData = {
                    status: 0,
                    message: "Something went wrong! please try again.",
                    error: ["Something went wrong! please try again."]
                };
                res.status(config.BAD_REQUEST).json(responseData);
            }
        } else {
            logger.error("Error while fetching user data = ", null);
            const responseData = {
                status: 0,
                message: "Something went wrong! please try again.",
                error: ["Something went wrong! please try again."]
            };
            res.status(config.BAD_REQUEST).json(responseData);
        }
    } catch (error) {
        logger.error("Error occured while fetching user workout = ", error);
        const responseData = {
            status: 0,
            message: "Something went wrong! please try again.",
            error: ["Something went wrong! please try again."]
        };
        res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
    }
});

router.post("/first_workout/:username", async (req, res) => {
    try {
        var userRes = await user_helper.get_user_by({
            username: req.params.username
        });
        if (userRes && userRes.status === 1 && userRes.user) {
            const authUserId = userRes.user.authUserId;
            var date = req.body.date;
            var start = moment(date).utcOffset(0);
            start.toISOString();
            start.format();

            var end = moment(date)
                    .utcOffset(0)
                    .add(23, "hours")
                    .add(59, "minutes");
            end.toISOString();
            end.format();

            logger.trace("Get all user workouts by date  API called");
            var resp_data = await user_workout_helper.get_first_workout_by_date({
                userId: authUserId,
                date: {
                    $gte: new Date(start),
                    $lte: new Date(end)
                }
            });

            if (resp_data.status == 1) {
                logger.trace("user workouts got successfully = ", resp_data);
                res.status(config.OK_STATUS).json(resp_data);
            } else {
                logger.error("Error occured while fetching user workouts = ", resp_data);
                res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
            }
        } else {
            logger.error("Error while fetching user data = ", null);
            const responseData = {
                status: 0,
                message: "Something went wrong! please try again.",
                error: ["Something went wrong! please try again."]
            };
            res.status(config.BAD_REQUEST).json(responseData);
        }
    } catch (error) {
        logger.error("Error occured while fetching user workout = ", error);
        const responseData = {
            status: 0,
            message: "Something went wrong! please try again.",
            error: ["Something went wrong! please try again."]
        };
        res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
    }
});

router.post("/calendar_list/:username", async (req, res) => {
    try {
        var userRes = await user_helper.get_user_by({
            username: req.params.username
        });
        if (userRes && userRes.status === 1 && userRes.user) {
            const authUserId = userRes.user.authUserId;
            var date = req.body.date;
            var check = await moment(date).utc(0);
            var startCheck = await moment(check).subtract(2, "month");
            var endCheck = await moment(check).add(2, "month");
            var resp_data = await user_workout_helper.get_workouts_for_calendar({
                userId: authUserId,
                date: {
                    $gte: new Date(startCheck),
                    $lt: new Date(endCheck)
                }
            });
            resp_data.calendar_list = resp_data.workouts;
            delete resp_data.workouts;

            if (resp_data.status == 1) {
                logger.trace(
                        "user workouts detail for calendar got successfully = ",
                        resp_data
                        );
                res.status(config.OK_STATUS).json(resp_data);
            } else {
                logger.error(
                        "Error occured while fetching user workouts details for calendar = ",
                        resp_data
                        );
                res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
            }
        } else {
            logger.error("Error while fetching user data = ", null);
            const responseData = {
                status: 0,
                message: "Something went wrong! please try again.",
                error: ["Something went wrong! please try again."]
            };
            res.status(config.BAD_REQUEST).json(responseData);
        }
    } catch (error) {
        logger.error("Error occured while fetching user workout = ", error);
        const responseData = {
            status: 0,
            message: "Something went wrong! please try again.",
            error: ["Something went wrong! please try again."]
        };
        res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
    }
});

router.post("/overview", async (req, res) => {
    try {
        var decoded = jwtDecode(req.headers["authorization"]);
        var authUserId = decoded.sub;
        var date = req.body.date
        var start = moment(date).startOf('day').utc(0);
        var end = moment(date).endOf('day').utc(0);
        var searchObj = {
            date : {
                $gte: new Date(start),
                $lte: new Date(end)
            },
            userId : authUserId
        }
        var resp_data = await user_workout_helper.get_workoutsDetails_by_date(searchObj)
        if (resp_data.status === 1) {
            logger.trace("user workouts got successfully = ", resp_data);
            res.status(config.OK_STATUS).json(resp_data);
        } else {
            logger.error("Error occured while fetching user workouts = ", resp_data);
            res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
        }
    }catch(error)
    {
        logger.error("Error occured while fetching user workout = ", error);
        const responseData = {
            status: 0,
            message: "Something went wrong! please try again.",
            error: ["Something went wrong! please try again."]
        };
        res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
    }
})

module.exports = router;
