var UserWorkouts = require("./../models/user_workouts");
var UserWorkoutExercises = require("./../models/user_workout_exercises");
var userWorkoutExercisesProgram = require("./../models/user_workout_exercises_program");
var WorkoutLogs = require("./../models/workout_logs");
var user_workouts_helper = {};
var _ = require("underscore");
var mongoose = require("mongoose");

/*
 * get_workouts_for_calendar is used to fetch all user exercises data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_workouts_helper.get_workouts_for_calendar = async (condition) => {
    try {
        var user_workouts = await UserWorkouts.aggregate([
            {
                $match: condition
            },
            {
                $group: {
                    _id: "$date"
                }
            },
            {
                $project: {
                    date: "$_id",
                    _id: 0
                }
            }
        ]);
        var dates = _.uniq(user_workouts, function (x) {
            return x.date;
        });
        if (user_workouts) {
            return {
                status: 1,
                message: "user workouts found",
                workouts: dates
            };
        } else {
            return {
                status: 2,
                message: "No user workouts available"
            };
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
 * get_all_workouts is used to fetch all user exercises data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_workouts_helper.get_all_workouts = async (condition, single = false) => {
    try {
        // var user_workouts = await UserWorkouts.aggregate([
        //   {
        //     $match: condition
        //   }
        // ]);
        var user_workouts = await UserWorkouts.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "user_workout_exercises",
                    foreignField: "userWorkoutsId",
                    localField: "_id",
                    as: "exercises"
                }
            }, {
                $group: {
                    _id: "$_id",
                    "isCompleted": {$first: "$isCompleted"},
                    "type": {$first: "$type"},
                    "title": {$first: "$title"},
                    "description": {$first: "$description"},
                    "userId": {$first: "$userId"},
                    "date": {$first: "$date"},
                    "createdAt": {$first: "$createdAt"},
                    "modifiedAt": {$first: "$modifiedAt"},
                    "exercises": {$first: "$exercises"},
                }
            }, {
                $project: {
                    _id: 1,
                    isCompleted: 1,
                    type: 1,
                    title: 1,
                    description: 1,
                    userId: 1,
                    date: 1,
                    createdAt: 1,
                    modifiedAt: 1,
                    // exercises: 1,
                    totalExercises:
                            {
                                $size: "$exercises"
                            }
                }
            }
        ]);

        // _.each(user_workouts, user_workout => {
        //   var tmp = [];
        //   tmp = _.sortBy(user_workout.exercises, function(o) {
        //     return o.sequence;
        //   });
        //   user_workout.exercises = tmp;
        // });

        if (user_workouts) {
            var message =
                    user_workouts.length > 0
                    ? "user workouts found"
                    : "user workouts not found";
            user_workouts = user_workouts;
            if (single) {
                if (user_workouts.length > 0) {
                    user_workouts = user_workouts[0];
                } else {
                    user_workouts = {};
                }
            }
            return {
                status: 1,
                message: message,
                workouts: user_workouts
            };
        } else {
            return {
                status: 2,
                message: "No user workouts available"
            };
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
 * count_all_workouts is used to count all user exercises data
 * @params condition condition of count records.
 * @return  status 0 - If any internal error occured while counting user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_workouts_helper.count_all_workouts = async (condition = {}) => {
    try {
        var count = await UserWorkouts.count(condition);
        return {
            status: 1,
            message: "Workouts counted",
            count
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while counting user workouts",
            error: err
        };
}
};


user_workouts_helper.countWorkouts = async (userId) => {
    try {
        let resource = await UserWorkouts.count({userId});
        return resource;
    } catch (error) {
        return 0;
    }
};

/*
 * in_complete_master_workout is used to in-complete master workout data
 * @return  status 0 - If any internal error occured while updating user exercises data, with error
 *          status 1 - If user exercises data updated, with user exercises object
 *          status 2 - If user exercises not updated, with appropriate message
 */
user_workouts_helper.in_complete_master_workout = async (condition, updateObj = {}) => {
    try {
        var count = await UserWorkouts.findByIdAndUpdate(condition, updateObj);
        return {
            status: 1,
            message: "Workouts updated",
            count
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while updating user workouts",
            error: err
        };
}
};

/*
 * get_first_workout_by_date is used to fetch first user exercises data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_workouts_helper.get_first_workout_by_date = async (condition = {}) => {
    try {
        var user_workouts = await UserWorkouts.findOne(condition, {
            _id: 1
        });

        return {
            status: 1,
            message:
                    user_workouts && user_workouts._id
                    ? "User's First workout of date found"
                    : "User's First workout of date not found",
            workout_id: user_workouts && user_workouts._id ? user_workouts._id : null
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding user's first workouts",
            error: err
        };
}
};

/*
 * get_all_workouts_by_date is used to fetch all user exercises data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_workouts_helper.get_all_workouts_by_date = async (condition = {}) => {
    try {
        var user_workouts = await UserWorkouts.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "user_workout_exercises",
                    foreignField: "userWorkoutsId",
                    localField: "_id",
                    as: "exercises"
                }
            },
            {
                $unwind: {
                    path: "$exercises",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    exercises: {
                        $addToSet: "$exercises"
                    },
                    isCompleted: {
                        $first: "$isCompleted"
                    },
                    dayType: {
                        $first: "$type"
                    },
                    title: {
                        $first: "$title"
                    },
                    description: {
                        $first: "$description"
                    },
                    userId: {
                        $first: "$userId"
                    },
                    date: {
                        $first: "$date"
                    }
                }
            }
        ]);

        if (user_workouts && user_workouts.length > 0) {
            _.each(user_workouts, workout => {
                var warmup = [];
                var exercise = [];
                var cooldown = [];
                _.each(workout.exercises, ex => {
                    if (ex.type == "warmup") {
                        warmup.push(ex);
                    } else if (ex.type == "cooldown") {
                        cooldown.push(ex);
                    } else if (ex.type == "exercise") {
                        exercise.push(ex);
                    }
                });
                workout.warmup = _.sortBy(warmup, function (w) {
                    return w.sequence;
                });
                workout.exercise = _.sortBy(exercise, function (w) {
                    return w.sequence;
                });
                workout.cooldown = _.sortBy(cooldown, function (w) {
                    return w.sequence;
                });
                delete workout.exercises;
            });

            return {
                status: 1,
                message: "User workouts found",
                workouts: user_workouts
            };
        } else {
            return {
                status: 2,
                message: "No user workouts available"
            };
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
 * get_workouts_by_date is used to fetch all user workouts data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user workouts data, with error
 *          status 1 - If user workouts data found, with user workouts object
 *          status 2 - If user workouts not found, with appropriate message
 */
user_workouts_helper.get_workouts_by_date = async (condition = {}) => {
    try {
        var user_workouts = await UserWorkouts.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "user_workout_exercises",
                    foreignField: "userWorkoutsId",
                    localField: "_id",
                    as: "exercises"
                }
            },
            {
                $unwind: {
                    path: "$exercises",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    exercises: {
                        $addToSet: "$exercises"
                    },
                    isCompleted: {
                        $first: "$isCompleted"
                    },
                    dayType: {
                        $first: "$type"
                    },
                    title: {
                        $first: "$title"
                    },
                    description: {
                        $first: "$description"
                    },
                    userId: {
                        $first: "$userId"
                    },
                    date: {
                        $first: "$date"
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    totalExercises: {$size: "$exercises"},
                    description: 1,
                    isCompleted: 1,
                    date: 1,
                    type: 1,
                    dayType: 1
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        if (user_workouts && user_workouts.length > 0) {
            return {
                status: 1,
                message: "User workouts found",
                workouts_list: user_workouts
            };
        } else {
            return {
                status: 2,
                message: "No user workouts available"
            };
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
 * get_all_workouts_group_by is used to fetch all user exercises data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_workouts_helper.get_all_workouts_group_by = async (condition = {}) => {
    try {
        var user_workouts = await UserWorkouts.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "user_workout_exercises",
                    foreignField: "userWorkoutsId",
                    localField: "_id",
                    as: "exercises"
                }
            },
            {
                $unwind: {
                    path: "$exercises",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$exercises.type",
                    userWorkoutsId: {
                        $first: "$_id"
                    },
                    type: {
                        $first: "$exercises.type"
                    },
                    exercises: {
                        $addToSet: "$exercises"
                    },
                    isCompleted: {
                        $first: "$isCompleted"
                    },
                    dayType: {
                        $first: "$type"
                    },
                    title: {
                        $first: "$title"
                    },
                    description: {
                        $first: "$description"
                    },
                    userId: {
                        $first: "$userId"
                    },
                    date: {
                        $first: "$date"
                    },
                    sequence: {
                        $first: "$sequence"
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    userWorkoutsId: 1,
                    type: 1,
                    exercises: 1,
                    isCompleted: 1,
                    dayType: 1,
                    title: 1,
                    description: 1,
                    userId: 1,
                    date: 1,
                    sequence: 1
                }
            }
        ]);

        if (user_workouts && user_workouts.length > 0) {
            var returnObj = {
                _id: user_workouts[0].userWorkoutsId,
                isCompleted: user_workouts[0].isCompleted,
                type: user_workouts[0].dayType,
                title: user_workouts[0].title,
                description: user_workouts[0].description,
                userId: user_workouts[0].userId,
                date: user_workouts[0].date,
                warmup: [],
                exercise: [],
                cooldown: []
            };

            _.each(user_workouts, o => {
                if (o.type === "cooldown") {
                    returnObj.cooldown = _.sortBy(o.exercises, "sequence");
                } else if (o.type === "exercise") {
                    returnObj.exercise = _.sortBy(o.exercises, "sequence");
                } else if (o.type === "warmup") {
                    returnObj.warmup = _.sortBy(o.exercises, "sequence");
                }
            });

            return {
                status: 1,
                message: "User workouts found",
                workouts: returnObj
            };
        } else {
            return {
                status: 2,
                message: "No user workouts available"
            };
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
 * count_all_completed_workouts is used to count all user completed exercises data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_workouts_helper.count_all_completed_workouts = async condition => {
    try {
        var user_workouts = await UserWorkouts.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "user_workout_exercises",
                    foreignField: "userWorkoutsId",
                    localField: "_id",
                    as: "exercises"
                }
            },
            {
                $unwind: "$exercises"
            },
            {
                $match: {
                    "exercises.isCompleted": 0
                }
            }
        ]);

        if (user_workouts) {
            return {
                status: 1,
                message: "user workouts found",
                count: user_workouts.length
            };
        } else {
            return {
                status: 2,
                message: "No user workouts available"
            };
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
 * workout_detail_for_badges is used to fetch all user workout data for badges
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user workout data, with error
 *          status 1 - If user workout data found, with user workout object
 *          status 2 - If user workout not found, with appropriate message
 */
user_workouts_helper.workout_detail_for_badges = async condition => {
    try {
        var user_workouts = await WorkoutLogs.aggregate([
            {
                $match: condition
            },
            {
                $group: {
                    _id: "$setsDetailId",
                    weight_lifted_total: {
                        $sum: "$weight"
                    },
                    weight_lifted_average: {
                        $avg: "$weight"
                    },
                    weight_lifted_most: {
                        $max: "$weight"
                    },
                    weight_lifted_least: {
                        $min: "$weight"
                    },
                    reps_least: {
                        $min: "$reps"
                    },
                    reps_total: {
                        $sum: "$reps"
                    },
                    reps_average: {
                        $avg: "$reps"
                    },
                    reps_most: {
                        $max: "$reps"
                    },
                    sets_least: {
                        $min: "$sets"
                    },
                    sets_total: {
                        $sum: "$sets"
                    },
                    sets_average: {
                        $avg: "$sets"
                    },
                    sets_most: {
                        $max: "$sets"
                    },
                    workouts_total: {
                        $first: 1
                    }
                }
            },
            {
                $project: {
                    weight_lifted_total: 1,
                    weight_lifted_average: 1,
                    weight_lifted_most: 1,
                    weight_lifted_least: 1,
                    reps_least: 1,
                    reps_total: 1,
                    reps_average: 1,
                    reps_most: 1,
                    sets_least: 1,
                    sets_total: 1,
                    sets_average: 1,
                    sets_most: 1,
                    workouts_total: 1
                }
            },
            {
                $group: {
                    _id: null,
                    weight_lifted_total: {
                        $sum: "$weight_lifted_total"
                    },
                    weight_lifted_average: {
                        $avg: "$weight_lifted_average"
                    },
                    weight_lifted_most: {
                        $max: "$weight_lifted_most"
                    },
                    weight_lifted_least: {
                        $min: "$weight_lifted_least"
                    },
                    reps_least: {
                        $min: "$reps_least"
                    },
                    reps_total: {
                        $sum: "$reps_total"
                    },
                    reps_average: {
                        $avg: "$reps_average"
                    },
                    reps_most: {
                        $max: "$reps_most"
                    },
                    sets_least: {
                        $min: "$sets_least"
                    },
                    sets_total: {
                        $sum: "$sets_total"
                    },
                    sets_average: {
                        $avg: "$sets_average"
                    },
                    sets_most: {
                        $max: "$sets_most"
                    },
                    workouts_total: {
                        $sum: "$workouts_total"
                    }
                }
            }
        ]);

        if (user_workouts) {
            return {
                status: 1,
                message: "user workouts found",
                workouts: user_workouts[0]
            };
        } else {
            return {
                status: 2,
                message: "No user workouts available"
            };
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
 * get_user_workouts_by_id is used to fetch User workout by ID
 * @params id id of user_workoutss
 * @return  status 0 - If any internal error occured while fetching user workouts data, with error
 *          status 1 - If User workouts data found, with user workouts object
 *          status 2 - If User workouts data not found, with appropriate message
 */
user_workouts_helper.get_user_workouts_by_id = async id => {
    try {
        var user_workout = await UserWorkouts.findOne(id);
        if (user_workout) {
            return {
                status: 1,
                message: "User workout found",
                workout: user_workout
            };
        } else {
            return {
                status: 2,
                message: "No User workout available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding User workout",
            error: err
        };
    }
};

/*
 * insert_exercises is used to insert into user_workouts's exercises collection
 * @param   childCollectionObject     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting User workout exercise, with error
 *          status  1 - If User workout inserted, with inserted User workout exercise document and appropriate message
 *
 * @developed by "amc"
 */
user_workouts_helper.insert_user_workouts_exercises = async (
        childCollectionObject,
        authUserId
        ) => {
    var workoutLogsObj = {};
    var insertWorkoutLogArray = [];
    try {
        let user_workouts_exercise = new UserWorkoutExercises(
                childCollectionObject
                );
        var user_workouts_exercise_data = await user_workouts_exercise.save();

        _.each(user_workouts_exercise_data.exercises, ex => {
            if (ex.differentSets) {
                var totalSetDetails = ex.setsDetails.length;
                var cnt = 0;
                _.each(ex.setsDetails, childDetail => {
                    var restTime = (time = distance = effort = weight = repTime = speed = setTime = reps = 0);
                    if (cnt < totalSetDetails - 1) {
                        restTime += childDetail.baseRestTime;
                    }
                    if (childDetail.field1) {
                        if (childDetail.field1.baseUnit === "second") {
                            time += childDetail.field1.baseValue;
                        } else if (childDetail.field1.baseUnit === "reps") {
                            reps += childDetail.field1.baseValue;
                        } else {
                            distance += childDetail.field1.baseValue;
                        }
                    }
                    if (childDetail.field2) {
                        if (childDetail.field2.baseUnit === "g") {
                            weight += childDetail.field2.baseValue;
                        } else if (childDetail.field2.baseUnit === "effort") {
                            effort += childDetail.field2.baseValue;
                        } else if (childDetail.field2.baseUnit === "kmph") {
                            speed += childDetail.field2.baseValue;
                        }
                    }
                    if (childDetail.field3) {
                        if (childDetail.field3.baseUnit === "reps") {
                            reps += childDetail.field3.baseValue;
                        } else if (childDetail.field3.baseUnit === "rep_time") {
                            repTime += childDetail.field3.baseValue;
                        } else if (childDetail.field3.baseUnit === "set_time") {
                            setTime += childDetail.field3.baseValue;
                        }
                    }

                    workoutLogsObj = {
                        workoutId: user_workouts_exercise_data._id,
                        setsDetailId: ex._id,
                        userId: authUserId,
                        exerciseId: ex.exercises._id,
                        name: ex.exercises.name,
                        type: ex.exercises.category,
                        subType: ex.exercises.subCategory,
                        time,
                        distance,
                        effort,
                        weight,
                        repTime,
                        speed,
                        restTime,
                        setTime,
                        reps,
                        logDate: childCollectionObject.date,
                        sets: 1
                    };
                    insertWorkoutLogArray.push(workoutLogsObj);
                    cnt++;
                });
            } else {
                var childDetail = ex.setsDetails[0];
                for (var i = 0; i < ex.sets; i++) {
                    var restTime = (time = distance = effort = weight = repTime = speed = setTime = reps = 0);
                    if (i < ex.sets - 1) {
                        restTime = childDetail.baseRestTime;
                    }
                    if (childDetail.field1) {
                        if (childDetail.field1.baseUnit === "second") {
                            time += childDetail.field1.baseValue;
                        } else if (childDetail.field1.baseUnit === "reps") {
                            reps += childDetail.field1.baseValue;
                        } else {
                            distance += childDetail.field1.baseValue;
                        }
                    }
                    if (childDetail.field2) {
                        if (childDetail.field2.baseUnit === "g") {
                            weight += childDetail.field2.baseValue;
                        } else if (childDetail.field2.baseUnit === "effort") {
                            effort += childDetail.field2.baseValue;
                        } else if (childDetail.field2.baseUnit === "kmph") {
                            speed += childDetail.field2.baseValue;
                        }
                    }
                    if (childDetail.field3) {
                        if (childDetail.field3.baseUnit === "reps") {
                            reps += childDetail.field3.baseValue;
                        } else if (childDetail.field3.baseUnit === "rep_time") {
                            repTime += childDetail.field3.baseValue;
                        } else if (childDetail.field3.baseUnit === "set_time") {
                            setTime += childDetail.field3.baseValue;
                        }
                    }

                    workoutLogsObj = {
                        workoutId: user_workouts_exercise_data._id,
                        setsDetailId: ex._id,
                        userId: authUserId,
                        exerciseId: ex.exercises._id,
                        name: ex.exercises.name,
                        type: ex.exercises.category,
                        subType: ex.exercises.subCategory,
                        time,
                        distance,
                        effort,
                        weight,
                        repTime,
                        speed,
                        restTime,
                        setTime,
                        reps,
                        logDate: childCollectionObject.date,
                        sets: 1
                    };

                    insertWorkoutLogArray.push(workoutLogsObj);
                }
            }
        });

        await WorkoutLogs.insertMany(insertWorkoutLogArray);
        if (user_workouts_exercise_data) {
            return {
                status: 1,
                message: "User workout exercises inserted",
                workout: user_workouts_exercise_data
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while inserting User workout exercises",
            error: err
        };
    }
};

/*
 * insert_user_workouts_day is used to insert into user_workouts master collection
 * @param   masterCollectionObject     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting User workout, with error
 *          status  1 - If User workout inserted, with inserted User workout document and appropriate message
 * @developed by "amc"
 */
user_workouts_helper.insert_user_workouts_day = async masterCollectionObject => {
    try {
        let user_workouts = new UserWorkouts(masterCollectionObject);
        var workout_day = await user_workouts.save();
        if (workout_day) {
            return {
                status: 1,
                message: "Day Added successfully",
                day: workout_day
            };
        } else {
            return {
                status: 2,
                message: "Error occured while inserting User workout day",
                error: null
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while inserting User workout day",
            error: err
        };
    }
};

/*
 * copy_exercise_by_id is used to insert into user_workouts master collection
 * @param   masterCollectionObject     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting User workout, with error
 *          status  1 - If User workout inserted, with inserted User workout document and appropriate message
 * @developed by "amc"
 */
user_workouts_helper.copy_exercise_by_id = async (
        workoutId,
        date,
        authUserId
        ) => {
    var workoutLogsObj = {};
    var insertWorkoutLogArray = [];
    try {
        var day_data = await UserWorkouts.findOne(
                {
                    _id: workoutId
                },
                {
                    _id: 0,
                    type: 1,
                    title: 1,
                    description: 1,
                    userId: 1
                }
        ).lean();

        day_data.date = date;

        let user_workouts = new UserWorkouts(day_data);
        var workout_day = await user_workouts.save();

        var exercise_data = await UserWorkoutExercises.find(
                {
                    userWorkoutsId: workoutId
                },
                {
                    isCompleted: 0,
                    userWorkoutsId: 0
                }
        ).lean();

        exercise_data.forEach(ex => {
            delete ex._id;
            for (let o of ex.exercises) {
                delete o._id;
            }
            ex.userWorkoutsId = workout_day._id;
        });

        var inserted_exercise_data = await UserWorkoutExercises.insertMany(
                exercise_data
                );

        if (inserted_exercise_data) {
            // var get_data_for_workout_log = await UserWorkoutExercises.find({
            //   userWorkoutsId: workout_day._id
            // });
            // _.each(get_data_for_workout_log, mainExercise => {
            for (let mainExercise of inserted_exercise_data) {
                // _.each(mainExercise.exercises, childExercises => {
                for (let childExercises of mainExercise.exercises) {
                    if (childExercises.differentSets) {
                        // _.each(childExercises.setsDetails, childDetail => {
                        let totalChildExercise = childExercises.setsDetails.length;
                        let cnt = 0;
                        for (let childDetail of childExercises.setsDetails) {
                            var restTime = (time = distance = effort = weight = repTime = speed = setTime = reps = 0);
                            if (cnt < totalChildExercise - 1) {
                                // restTime += childDetail.restTime;
                                restTime += childDetail.baseRestTime;
                            }
                            if (childDetail.field1) {
                                if (childDetail.field1.baseUnit === "second") {
                                    time += childDetail.field1.baseValue;
                                } else if (childDetail.field1.baseUnit === "reps") {
                                    reps += childDetail.field1.baseValue;
                                } else {
                                    distance += childDetail.field1.baseValue;
                                }
                            }
                            if (childDetail.field2) {
                                if (childDetail.field2.baseUnit === "g") {
                                    weight += childDetail.field2.baseValue;
                                } else if (childDetail.field2.baseUnit === "effort") {
                                    effort += childDetail.field2.baseValue;
                                } else if (childDetail.field2.baseUnit === "kmph") {
                                    speed += childDetail.field2.baseValue;
                                }
                            }
                            if (childDetail.field3) {
                                if (childDetail.field3.baseUnit === "reps") {
                                    reps += childDetail.field3.baseValue;
                                } else if (childDetail.field3.baseUnit === "rep_time") {
                                    repTime += childDetail.field3.baseValue;
                                } else if (childDetail.field3.baseUnit === "set_time") {
                                    setTime += childDetail.field3.baseValue;
                                }
                            }

                            workoutLogsObj = {
                                workoutId: mainExercise._id,
                                setsDetailId: childExercises._id,
                                userId: authUserId,
                                exerciseId: childExercises.exercises._id,
                                name: childExercises.exercises.name,
                                type: childExercises.exercises.category,
                                subType: childExercises.exercises.subCategory,
                                time,
                                distance,
                                effort,
                                weight,
                                repTime,
                                speed,
                                restTime,
                                setTime,
                                reps,
                                logDate: date,
                                sets: 1
                            };
                            insertWorkoutLogArray.push(workoutLogsObj);
                            cnt++;
                        }
                    } else {
                        var childDetail = childExercises.setsDetails[0];
                        for (var i = 0; i < childExercises.sets; i++) {
                            var restTime = (time = distance = effort = weight = repTime = speed = setTime = reps = 0);
                            if (i < childExercises.sets - 1) {
                                // restTime += childDetail.restTime ? childDetail.restTime : 0;
                                restTime += typeof childDetail.baseRestTime !== 'undefined' ? childDetail.baseRestTime : 0;
                            }
                            if (childDetail.field1) {
                                if (childDetail.field1.baseUnit === "second") {
                                    time += childDetail.field1.baseValue;
                                } else if (childDetail.field1.baseUnit === "reps") {
                                    reps += childDetail.field1.baseValue;
                                } else {
                                    distance += childDetail.field1.baseValue;
                                }
                            }
                            if (childDetail.field2) {
                                if (childDetail.field2.baseUnit === "g") {
                                    weight += childDetail.field2.baseValue;
                                } else if (childDetail.field2.baseUnit === "effort") {
                                    effort += childDetail.field2.baseValue;
                                } else if (childDetail.field2.baseUnit === "kmph") {
                                    speed += childDetail.field2.baseValue;
                                }
                            }
                            if (childDetail.field3) {
                                if (childDetail.field3.baseUnit === "reps") {
                                    reps += childDetail.field3.baseValue;
                                } else if (childDetail.field3.baseUnit === "rep_time") {
                                    repTime += childDetail.field3.baseValue;
                                } else if (childDetail.field3.baseUnit === "set_time") {
                                    setTime += childDetail.field3.baseValue;
                                }
                            }

                            workoutLogsObj = {
                                workoutId: mainExercise._id,
                                setsDetailId: childExercises._id,
                                userId: authUserId,
                                exerciseId: childExercises.exercises._id,
                                name: childExercises.exercises.name,
                                type: childExercises.exercises.category,
                                subType: childExercises.exercises.subCategory,
                                time,
                                distance,
                                effort,
                                weight,
                                repTime,
                                speed,
                                restTime,
                                setTime,
                                reps,
                                logDate: date,
                                sets: 1
                            };
                            insertWorkoutLogArray.push(workoutLogsObj);
                        }
                    }
                }
            }
        }
        var workout_logs_data = await WorkoutLogs.insertMany(insertWorkoutLogArray);

        if (inserted_exercise_data) {
            return {
                status: 1,
                message: "Copy successfully",
                day: inserted_exercise_data,
                copiedId: workout_day._id
            };
        } else {
            return {
                status: 2,
                message: "Error occured while copying User workout day",
                error: err
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while copying User workout day",
            error: err
        };
    }
};

/*
 * cut_exercise_by_id is used to insert into user_workouts master collection
 * @param   masterCollectionObject     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting User workout, with error
 *          status  1 - If User workout inserted, with inserted User workout document and appropriate message
 * @developed by "amc"
 */
user_workouts_helper.cut_exercise_by_id = async (workoutId, date) => {
    try {
        const workoutData = {date};
        const cond = {_id: mongoose.Types.ObjectId(workoutId)};
        const resource = await UserWorkouts.findOneAndUpdate(cond, workoutData);
        return {
            status: 1,
            message: "Workout is pasted",
            data: resource
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while copying User workout day",
            error: err
        };
    }
};

/*
 * update_user_workout_exercise is used to update user workout exercise data based on user workouts id
 * @param   id         String  _id of user_workouts exercise that need to be update
 * @param   childCollectionObject Object  childCollectionObject of user_workouts's exercise child collection that need to be update
 * @return  status  0 - If any error occur in updating user_workout exercise, with error
 *          status  1 - If user_workout exercise updated successfully, with appropriate message
 *          status  2 - If user_workout exercise not updated, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.update_user_workout_exercise = async (
        id,
        childCollectionObject,
        authUserId
        ) => {
    var insertWorkoutLogArray = [];
    var workoutLogsObj = {};
    try {
        var user_workouts_data = await UserWorkoutExercises.findOneAndUpdate(
                {
                    _id: id
                },
                childCollectionObject,
                {
                    new : true
                }
        );
        var delete_workout_log = await WorkoutLogs.remove({
            workoutId: id,
            isCompleted: 0
        });
        for (let childExercises of user_workouts_data.exercises) {
            if (childExercises.differentSets) {
                let totalChildExercise = childExercises.setsDetails.length;
                let cnt = 0;
                for (let childDetail of childExercises.setsDetails) {
                    var restTime = (time = distance = effort = weight = repTime = speed = setTime = reps = 0);
                    if (cnt < totalChildExercise - 1) {
                        restTime += childDetail.baseRestTime;
                    }
                    if (childDetail.field1) {
                        if (childDetail.field1.baseUnit === "second") {
                            time += childDetail.field1.baseValue;
                        } else if (childDetail.field1.baseUnit === "reps") {
                            reps += childDetail.field1.baseValue;
                        } else {
                            distance += childDetail.field1.baseValue;
                        }
                    }
                    if (childDetail.field2) {
                        if (childDetail.field2.baseUnit === "g") {
                            weight += childDetail.field2.baseValue;
                        } else if (childDetail.field2.baseUnit === "effort") {
                            effort += childDetail.field2.baseValue;
                        } else if (childDetail.field2.baseUnit === "kmph") {
                            speed += childDetail.field2.baseValue;
                        }
                    }
                    if (childDetail.field3) {
                        if (childDetail.field3.baseUnit === "reps") {
                            reps += childDetail.field3.baseValue;
                        } else if (childDetail.field3.baseUnit === "rep_time") {
                            repTime += childDetail.field3.baseValue;
                        } else if (childDetail.field3.baseUnit === "set_time") {
                            setTime += childDetail.field3.baseValue;
                        }
                    }

                    workoutLogsObj = {
                        workoutId: user_workouts_data._id,
                        setsDetailId: childExercises._id,
                        userId: authUserId,
                        exerciseId: childExercises.exercises._id,
                        name: childExercises.exercises.name,
                        type: childExercises.exercises.category,
                        subType: childExercises.exercises.subCategory,
                        time,
                        distance,
                        effort,
                        weight,
                        repTime,
                        speed,
                        restTime,
                        setTime,
                        reps,
                        logDate: childCollectionObject.date,
                        sets: 1
                    };
                    insertWorkoutLogArray.push(workoutLogsObj);
                    cnt++;
                }
            } else {
                var childDetail = childExercises.setsDetails[0];

                for (var i = 0; i < childExercises.sets; i++) {
                    var restTime = (time = distance = effort = weight = repTime = speed = setTime = reps = 0);

                    if (i < childExercises.sets - 1) {
                        restTime += childDetail.baseRestTime;
                    }

                    if (childDetail.field1) {
                        if (childDetail.field1.baseUnit === "second") {
                            time += childDetail.field1.baseValue;
                        } else if (childDetail.field1.baseUnit === "reps") {
                            reps += childDetail.field1.baseValue;
                        } else {
                            distance += childDetail.field1.baseValue;
                        }
                    }

                    if (childDetail.field2) {
                        if (childDetail.field2.baseUnit === "g") {
                            weight += childDetail.field2.baseValue;
                        } else if (childDetail.field2.baseUnit === "effort") {
                            effort += childDetail.field2.baseValue;
                        } else if (childDetail.field2.baseUnit === "kmph") {
                            speed += childDetail.field2.baseValue;
                        }
                    }

                    if (childDetail.field3) {
                        if (childDetail.field3.baseUnit === "reps") {
                            reps += childDetail.field3.baseValue;
                        } else if (childDetail.field3.baseUnit === "rep_time") {
                            repTime += childDetail.field3.baseValue;
                        } else if (childDetail.field3.baseUnit === "set_time") {
                            setTime += childDetail.field3.baseValue;
                        }
                    }

                    workoutLogsObj = {
                        workoutId: user_workouts_data._id,
                        setsDetailId: childExercises._id,
                        userId: authUserId,
                        exerciseId: childExercises.exercises._id,
                        name: childExercises.exercises.name,
                        type: childExercises.exercises.category,
                        subType: childExercises.exercises.subCategory,
                        time,
                        distance,
                        effort,
                        weight,
                        repTime,
                        speed,
                        restTime,
                        setTime,
                        reps,
                        logDate: childCollectionObject.date,
                        sets: 1
                    };
                    insertWorkoutLogArray.push(workoutLogsObj);
                }
            }
        }
        await WorkoutLogs.insertMany(insertWorkoutLogArray);
        if (user_workouts_data) {
            return {
                status: 1,
                message: "User workout updated",
                workout: user_workouts_data
            };
        } else {
            return {
                status: 2,
                message: "Error occured while updating User workout",
                error: err
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while inserting User workout",
            error: err
        };
    }
};

/*
 * update_user_workouts_by_id is used to update user workouts data based on user workouts id
 * @param   id         String  _id of user_workouts that need to be update
 * @param   masterCollectionObject Object  masterCollectionObject of user_workouts's master collection that need to be update
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts updated successfully, with appropriate message
 *          status  2 - If user_workouts not updated, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.update_user_workouts_by_id = async (
        id,
        masterCollectionObject
        ) => {
    try {
        var user_workouts_data = await UserWorkouts.findOneAndUpdate(
                {
                    _id: id
                },
                masterCollectionObject,
                {
                    new : true
                }
        );
        if (user_workouts_data) {
            return {
                status: 1,
                message: "User workout updated",
                workout: user_workouts_data
            };
        } else {
            return {
                status: 2,
                message: "Error occured while updating User workout",
                error: err
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while inserting User workout",
            error: err
        };
    }
};

/*
 * complete_master_event is used to complete user workouts data based on user workouts date
 * @param   condition         Object  condition of user_workouts that need to be complete
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts completed successfully, with appropriate message
 *          status  2 - If user_workouts not completed, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.complete_master_event = async (id, updateObject) => {
    try {
        let user_workouts_data = await UserWorkouts.findByIdAndUpdate(
                {
                    _id: id
                },
                updateObject,
                {
                    new : true
                }
        );

        return {
            status: 1,
            message: "Workout updated"
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while updating user workouts",
            error: err
        };
    }
};

/*
 * complete_all_workout is used to complete user workouts data based on user workouts date
 * @param   condition         Object  condition of user_workouts that need to be complete
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts completed successfully, with appropriate message
 *          status  2 - If user_workouts not completed, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.complete_all_workout = async (id, updateObject) => {
    try {
        let user_workouts_data1 = await UserWorkouts.update(
                {
                    _id: id
                },
                updateObject,
                {
                    new : true
                }
        );

        let user_workouts_data2 = await UserWorkoutExercises.updateMany(
                {
                    userWorkoutsId: id
                },
                updateObject,
                {
                    new : true
                }
        );

        let user_workoutsids = await UserWorkoutExercises.find(
                {
                    userWorkoutsId: id
                },
                {
                    _id: 1
                }
        );
        user_workoutsids = _.pluck(user_workoutsids, "_id");

        let user_workouts_data3 = await WorkoutLogs.updateMany(
                {
                    workoutId: {
                        $in: user_workoutsids
                    }
                },
                updateObject,
                {
                    new : true
                }
        );

        return {
            status: 1,
            message: "Workout updated"
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while updating user workouts",
            error: err
        };
    }
};

/*
 * complete_workout is used to complete user workouts data based on user workouts date
 *
 * @param   condition         Object  condition of user_workouts that need to be complete
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts completed successfully, with appropriate message
 *          status  2 - If user_workouts not completed, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.complete_workout = async (id, updateObject) => {
    try {
        let user_workout_exercises = await UserWorkoutExercises.updateMany(
                {
                    _id: {
                        $in: id
                    }
                },
                updateObject,
                {
                    new : true
                }
        );

        let user_workouts_data3 = await WorkoutLogs.updateMany(
                {
                    workoutId: {
                        $in: id
                    }
                },
                updateObject,
                {
                    new : true
                }
        );

        return {
            status: 1,
            message: "Workout updated"
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while updating user workouts",
            error: err
        };
    }
};

/*
 * delete_user_workouts_exercise is used to delete user_workouts exercise from database
 * @param   workoutId String  _id of user_workouts exercise that need to be delete
 * @return  status  0 - If any error occur in deletion of user_workouts exercise, with error
 *          status  1 - If user_workouts exercise deleted successfully, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.delete_user_workouts_exercise = async (
        childId,
        subChildIds
        ) => {
    try {
        let user_workouts_exercise = await UserWorkoutExercises.update(
                {
                    _id: childId
                },
                {
                    $pull: {
                        exercises: {
                            _id: {
                                $in: subChildIds
                            }
                        }
                    }
                },
                {
                    new : true
                }
        );
        let user_workouts_exercise2 = await WorkoutLogs.remove({
            setsDetailId: {
                $in: subChildIds
            },
            isCompleted: 0
        });
        let exercise = await UserWorkoutExercises.findOne({
            _id: childId
        });

        if (exercise && exercise.exercises.length === 0) {
            let data = await UserWorkoutExercises.remove({
                _id: childId
            });
        }
        return {
            status: 1,
            message: "User workouts exercise deleted"
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while deleting User workouts exercise",
            error: err
        };
    }
};

/*
 * delete_user_workouts_by_exercise_ids is used to delete user_workouts from database
 * @param   workoutIds String  _id of user_workouts that need to be delete
 * @return  status  0 - If any error occur in deletion of user_workouts, with error
 *          status  1 - If user_workouts deleted successfully, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.delete_user_workouts_by_exercise_ids = async workoutIds => {
    try {
        let ids = await UserWorkoutExercises.find(
                {
                    _id: {
                        $in: workoutIds
                    }
                },
                {
                    _id: 1
                }
        );
        ids = _.pluck(ids, "_id");

        let user_workouts_data = await UserWorkoutExercises.remove({
            _id: {
                $in: workoutIds
            }
        });

        let workout_logs_data = await WorkoutLogs.remove({
            workoutId: {
                $in: ids
            },
            isCompleted: 0
        });
        if (user_workouts_data) {
            return {
                status: 1,
                message: "User workouts deleted"
            };
        } else {
            return {
                status: 2,
                message: "User workouts not deleted"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while deleting User workouts",
            error: err
        };
    }
};

/*
 * delete_user_workouts_by_id is used to delete user_workouts from database
 * @param   user_workouts_id String  _id of user_workouts that need to be delete
 * @return  status  0 - If any error occur in deletion of user_workouts, with error
 *          status  1 - If user_workouts deleted successfully, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.delete_user_workouts_by_id = async workoutIds => {
    try {
        let user_workouts_data1 = await UserWorkouts.remove({
            _id: {
                $in: workoutIds
            }
        });

        let ids = await UserWorkoutExercises.find(
                {
                    userWorkoutsId: {
                        $in: workoutIds
                    }
                },
                {
                    _id: 1
                }
        );
        ids = _.pluck(ids, "_id");
        let user_workouts_data2 = await UserWorkoutExercises.remove({
            userWorkoutsId: {
                $in: workoutIds
            }
        });
        let workout_logs_data = await WorkoutLogs.remove({
            workoutId: {
                $in: ids
            },
            isCompleted: 0
        });
        return {
            status: 1,
            message: "User workouts deleted"
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while deleting User workouts",
            error: err
        };
    }
};

/*
 * complete_workout_by_days is used to complete user workouts data based on user workouts date
 * @param   id         Object  condition of user_workouts that need to be complete
 * @param   userId         userId of user
 * @param   updateObject         Object  condition of user_workouts that need to be complete
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts completed successfully, with appropriate message
 *          status  2 - If user_workouts not completed, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.complete_workout_by_days = async (
        id,
        userId,
        updateObject
        ) => {
    try {
        let user_workouts_data1 = await UserWorkouts.updateMany(
                {
                    _id: {
                        $in: id
                    },
                    userId: userId
                },
                updateObject,
                {
                    new : true
                }
        );
        if (user_workouts_data1) {
            let idsForWorkoutLog = await UserWorkoutExercises.find(
                    {
                        userWorkoutsId: {
                            $in: id
                        }
                    },
                    {
                        _id: 1
                    }
            );

            idsForWorkoutLog = _.pluck(idsForWorkoutLog, "_id");
            await UserWorkoutExercises.updateMany(
                    {
                        userWorkoutsId: {
                            $in: id
                        }
                    },
                    updateObject,
                    {
                        new : true
                    }
            );
            await WorkoutLogs.updateMany(
                    {
                        workoutId: {
                            $in: idsForWorkoutLog
                        },
                        userId: userId
                    },
                    updateObject,
                    {
                        new : true
                    }
            );
        }
        if (user_workouts_data1 && user_workouts_data1.nModified > 0) {
            return {
                status: 1,
                message: "Workout completed"
            };
        } else if (user_workouts_data1 && user_workouts_data1.nModified <= 0) {
            return {
                status: 0,
                message: "No effective changes"
            };
        }

    } catch (err) {
        return {
            status: 0,
            message: "Error occured while updating user workouts completed",
            error: err
        };
    }
};

/*
 * reorder_exercises is used to reorder user workouts data based on user workouts sequence
 * @param   condition         Object  condition of user_workouts that need to be order
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts updated successfully, with appropriate message
 *          status  2 - If user_workouts not updated, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.reorder_exercises = async reorderArray => {
    try {
        var condition = {};
        var updateObj = {};
        for (let x of reorderArray) {
            condition = {
                _id: mongoose.Types.ObjectId(x.id)
            };
            updateObj = {
                sequence: x.sequence
            };

            await UserWorkoutExercises.findByIdAndUpdate(
                    condition,
                    updateObj,
                    {
                        new : true
                    }
            );
        }
        return {
            status: 1,
            message: "Workout sequence updated"
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while updating user workouts updated",
            error: err
        };
    }
};

/*
 * totalGlobalUserWhoHaveCompletedExercises is used to count user
 * @param   condition         Object  condition of count user
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts completed successfully, with appropriate message
 *          status  2 - If user_workouts not completed, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.totalGlobalUserWhoHaveCompletedExercises = async () => {
    try {
        var count = await UserWorkouts.aggregate([
            {
                $group: {
                    _id: "$userId"
                }
            }
        ]);

        if (count.length > 0) {
            return {
                status: 1,
                message: "Total user count",
                count: count.length
            };
        } else {
            return {
                status: 2,
                message: "No user available",
                count: 0
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding user",
            error: err
        };
    }
};

user_workouts_helper.get_workoutsDetails_by_date = async(searchObj) => {
    try {
        var user_workouts = await UserWorkouts.aggregate([
            {
                $match: searchObj
            },
            {
                $lookup: {
                    from: "user_workout_exercises",
                    foreignField: "userWorkoutsId",
                    localField: "_id",
                    as: "exercises"
                }
            },
            {
                $unwind: {
                    path: "$exercises",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    userWorkoutsId: {
                        $first: "$_id"
                    },
                    exercises: {
                        $addToSet: "$exercises"
                    },
                    isCompleted: {
                        $first: "$isCompleted"
                    },
                    dayType: {
                        $first: "$type"
                    },
                    title: {
                        $first: "$title"
                    },
                    description: {
                        $first: "$description"
                    },
                    userId: {
                        $first: "$userId"
                    },
                    date: {
                        $first: "$date"
                    },
                    sequence: {
                        $first: "$sequence"
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    userWorkoutsId: 1,
                    type: 1,
                    exercises: 1,
                    isCompleted: 1,
                    dayType: 1,
                    title: 1,
                    description: 1,
                    userId: 1,
                    date: 1,
                    sequence: 1
                }
            }
        ])
        if (user_workouts && user_workouts.length > 0) {
            _.each(user_workouts, workout => {
                var warmup = [];
                var exercise = [];
                var cooldown = [];
                _.each(workout.exercises, ex => {
                    if (ex.type == "warmup") {
                        warmup.push(ex);
                    } else if (ex.type == "cooldown") {
                        cooldown.push(ex);
                    } else if (ex.type == "exercise") {
                        exercise.push(ex);
                    }
                });
                workout.warmup = _.sortBy(warmup, function (w) {
                    return w.sequence;
                });
                workout.exercise = _.sortBy(exercise, function (w) {
                    return w.sequence;
                });
                workout.cooldown = _.sortBy(cooldown, function (w) {
                    return w.sequence;
                });
                delete workout.exercises;
            });

            return {
                status: 1,
                message: "User workouts found",
                workouts: user_workouts
            };
        } else {
            return {
                status: 2,
                message: "No user workouts available"
            };
        }

    }catch (error){
        return {
            status: 0,
            message: "Error occured while finding user",
            error: error
        };
    }
}

module.exports = user_workouts_helper;
