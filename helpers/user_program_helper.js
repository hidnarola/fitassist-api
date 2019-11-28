var UserPrograms = require("./../models/user_programs");
var userWorkoutsProgram = require("./../models/user_workouts_program");
var userWorkoutExercisesProgram = require("./../models/user_workout_exercises_program");
var UserWorkouts = require("./../models/user_workouts");
var user_program_helper = {};
var _ = require("underscore");
const mongoose = require('mongoose');
const moment = require('moment');

/*
 * get_user_programs_in_details is used to fetch all user program data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user program data, with error
 *          status 1 - If user program data found, with user program object
 *          status 2 - If user program not found, with appropriate message
 */
user_program_helper.get_user_programs_in_details = async condition => {
    try {
        var user_program = await UserPrograms.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "user_workouts_program",
                    foreignField: "programId",
                    localField: "_id",
                    as: "user_workouts_program"
                }
            },
            {
                $unwind: {
                    path: "$user_workouts_program",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "user_workout_exercises_program",
                    foreignField: "userWorkoutsProgramId",
                    localField: "user_workouts_program._id",
                    as: "user_workout_exercises_program"
                }
            },
            {
                $unwind: {
                    path: "$user_workout_exercises_program",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: {
                        $first: "$name"
                    },
                    description: {
                        $first: "$description"
                    },
                    userId: {
                        $first: "$userId"
                    },
                    type: {
                        $first: "$type"
                    },
                    programDetails: {
                        $addToSet: "$user_workouts_program"
                    },
                    workouts: {
                        $addToSet: "$user_workout_exercises_program"
                    }
                }
            }
        ]);

        if (user_program && user_program.length > 0) {
            return {
                status: 1,
                message: "user program found",
                program: user_program
            };
        } else {
            return {
                status: 2,
                message: "No user program available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding user program",
            error: err
        };
    }
};
/*
 * count_total_programs is used to count all user program data
 * @params condition condition of count .
 * @return  status 0 - If any internal error occured while counting user program data, with error
 *          status 1 - If user program data found, with user program object
 *          status 2 - If user program not found, with appropriate message
 */
user_program_helper.count_total_programs = async (condition = {}) => {
    try {
        var count = await UserPrograms.count(condition);
        return {
            status: 1,
            message: "user program counted",
            count
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding user program",
            error: err
        };
}
};
/*
 * get_user_programs_in_details_for_assign is used to fetch all user program data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user program data, with error
 *          status 1 - If user program data found, with user program object
 *          status 2 - If user program not found, with appropriate message
 */
user_program_helper.get_user_programs_in_details_for_assign = async condition => {
    try {
        var user_program = await UserPrograms.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "user_workouts_program",
                    foreignField: "programId",
                    localField: "_id",
                    as: "user_workouts_program"
                }
            },
            {
                $lookup: {
                    from: "user_workout_exercises_program",
                    foreignField: "userWorkoutsProgramId",
                    localField: "user_workouts_program._id",
                    as: "user_workout_exercises_program"
                }
            }
        ]);

        if (user_program) {
            return {
                status: 1,
                message: "user program found",
                programs: user_program
            };
        } else {
            return {
                status: 2,
                message: "No user program available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding user program",
            error: err
        };
    }
};
/*
 * get_user_programs_data is used to fetch all user program data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user program data, with error
 *          status 1 - If user program data found, with user program object
 *          status 2 - If user program not found, with appropriate message
 */
user_program_helper.get_user_programs_data = async (condition, project = {}) => {
    try {
        var user_program = await userWorkoutsProgram.aggregate([
            {
                $match: condition,
            },
            {
                $group: {
                    _id: "$_id",
                    programId: {$first: "$programId"},
                    title: {$first: "$title"},
                    description: {$first: "$description"},
                    dayType: {$first: "$type"},
                    userId: {$first: "$userId"}
                }
            }
        ]);

        if (user_program) {
            return {
                status: 1,
                message: "user program found",
                program: user_program
            };
        } else {
            return {
                status: 2,
                message: "No user program available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding user program",
            error: err
        };
}
};
/*
 * get_all_program_workouts_group_by is used to fetch all user exercises data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_program_helper.get_all_program_workouts_group_by = async (condition = {}) => {
    try {
        var user_workouts = await userWorkoutsProgram.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "user_workout_exercises_program",
                    foreignField: "userWorkoutsProgramId",
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
                    programId: {
                        $first: "$programId"
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
                    day: {
                        $first: "$day"
                    },
                    sequence: {
                        $first: "$exercises.sequence"
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    userWorkoutsId: 1,
                    type: 1,
                    programId: 1,
                    exercises: 1,
                    dayType: 1,
                    title: 1,
                    description: 1,
                    userId: 1,
                    day: 1,
                    sequence: 1
                }
            }
        ]);
        if (user_workouts && user_workouts.length > 0) {
            var returnObj = {
                _id: user_workouts[0].userWorkoutsId,
                type: user_workouts[0].dayType,
                programId: user_workouts[0].programId,
                title: user_workouts[0].title,
                description: user_workouts[0].description,
                userId: user_workouts[0].userId,
                day: user_workouts[0].day,
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
 * get_user_programs is used to fetch all user program data
 * @params condition condition of aggregate pipeline.
 * @params withExerciseCountCheck withExerciseCountCheck for check if program has exercise pipeline.
 * @return  status 0 - If any internal error occured while fetching user program data, with error
 *          status 1 - If user program data found, with user program object
 *          status 2 - If user program not found, with appropriate message
 */
user_program_helper.get_user_programs = async (condition = {}, withExerciseCountCheck = false) => {
    try {
        let aggregate = [
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "user_workouts_program",
                    localField: "_id",
                    foreignField: "programId",
                    as: "programId"
                }
            },
            {
                $unwind: {
                    path: "$programId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "user_workout_exercises_program",
                    localField: "programId._id",
                    foreignField: "userWorkoutsProgramId",
                    as: "userWorkoutsProgramId"
                }
            },
            {
                $unwind: {
                    path: "$userWorkoutsProgramId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: {
                        $first: "$name"
                    },
                    description: {
                        $first: "$description"
                    },
                    userId: {
                        $first: "$userId"
                    },
                    type: {
                        $first: "$type"
                    },
                    totalDays: {
                        $addToSet: "$userWorkoutsProgramId"
                    },
                    totalWorkouts: {
                        $addToSet: "$programId"
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    userId: 1,
                    type: 1,
                    totalWorkouts: {
                        $size: "$totalWorkouts"
                    }
                }
            },
        ];
        if (withExerciseCountCheck) {
            aggregate.push({
                $match: {
                    totalWorkouts: {$gt: 0}
                }
            })
        }
        var user_program = await UserPrograms.aggregate(aggregate);
        if (user_program) {
            return {
                status: 1,
                message: "user program found",
                programs: user_program
            };
        } else {
            return {
                status: 2,
                message: "No user program available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding user program",
            error: err
        };
}
};
/*
 * get_user_program_by_id is used to fetch User program by ID
 * @params id id of user_programs
 * @return  status 0 - If any internal error occured while fetching user program data, with error
 *          status 1 - If User program data found, with user program object
 *          status 2 - If User program data not found, with appropriate message
 */
user_program_helper.get_user_program_by_id = async id => {
    try {
        var user_programs = await UserPrograms.findOne(id);
        if (user_programs) {
            return {
                status: 1,
                message: "User program found",
                program: user_programs
            };
        } else {
            return {
                status: 2,
                message: "No User program available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding User program",
            error: err
        };
    }
};
/*
 * add_workouts_program is used to insert into add_workouts_program collection
 * @param   user_program_obj     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting User program, with error
 *          status  1 - If User program inserted, with inserted User program document and appropriate message
 * @developed by "amc"
 */
user_program_helper.add_workouts_program = async programObj => {
    let user_program = new userWorkoutsProgram(programObj);
    try {
        var user_program_data = await user_program.save();
        return {
            status: 1,
            message: "User program workout inserted",
            program: user_program_data
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while inserting User program workout",
            error: err
        };
    }
};
/*
 * add_program is used to insert into user_program collection
 * @param   user_program_obj     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting User program, with error
 *          status  1 - If User program inserted, with inserted User program document and appropriate message
 * @developed by "amc"
 */
user_program_helper.add_program = async programObj => {
    let user_program = new UserPrograms(programObj);
    try {
        var user_program_data = await user_program.save();
        return {
            status: 1,
            message: "User program inserted",
            program: user_program_data
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while inserting User program",
            error: err
        };
    }
};
/*
 * insert_program_workouts is used to insert into user_programs collection
 * @param   masterCollectionObject     JSON object consist of all property that need to insert in to master collection
 * @param   childCollectionObject     JSON object consist of all property that need to insert in to child collection
 * @return  status  0 - If any error occur in inserting User Program, with error
 *          status  1 - If User Program inserted, with inserted User Program document and appropriate message
 * @developed by "amc"
 */
user_program_helper.insert_program_workouts = async childCollectionObject => {
    try {
        let user_program = new userWorkoutExercisesProgram(childCollectionObject);
        var user_program_exercise = await user_program.save();
        if (user_program_exercise) {
            return {
                status: 1,
                message: "Program workout inserted",
                workout: user_program_exercise
            };
        } else {
            return {
                status: 2,
                message: "Error occured while inserting Program workout",
                error: err
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while inserting Program workout",
            error: err
        };
    }
};

/*
 * update_program_workouts is used to update user program workouts data based on user program workouts id
 * @param   id         String  _id of user program workouts that need to be update
 * @param   masterCollectionObject Object  masterCollectionObject of user program workouts's master collection that need to be update
 * @param   childCollectionObject Object childCollectionObject of user program workout's child collection consist of all property that need to update
 * @return  status  0 - If any error occur in updating user program workouts, with error
 *          status  1 - If user program workouts updated successfully, with appropriate message
 *          status  2 - If use program workouts not updated, with appropriate message
 * @developed by "amc"
 */
user_program_helper.update_program_workouts = async (
        id,
        childCollectionObject
        ) => {
    try {
        user_workout_exercises_program = await userWorkoutExercisesProgram.findOneAndUpdate(
                {
                    _id: id
                },
                childCollectionObject,
                {
                    new : true
                }
        );

        if (user_workout_exercises_program) {
            return {
                status: 1,
                message: "Program exercises updated",
                program: user_workout_exercises_program
            };
        } else {
            return {
                status: 2,
                message: "Error occured while updating User Program Exercises",
                error: err
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while updating User Program Exercises",
            error: err
        };
    }
};
/*
 * assign_program is used to assign program
 * @param   user_program_obj     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in assigning User program, with error
 *          status  1 - If User program assigned, with inserted User program document and appropriate message
 * @developed by "amc"
 */
user_program_helper.assign_program = async programObj => {
    try {
        let user_program = new UserPrograms(programObj);
        var user_program_data = await user_program.save();
        return {
            status: 1,
            message: "User program inserted",
            program: user_program_data
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while inserting User program",
            error: err
        };
    }
};
/*
 * update_user_program_by_day_id is used to update user program day based on user program day id
 * @param   id         String  _id of user_program that need to be update
 * @param   programObj Object programObj of user_workouts_programs's programObj consist of all property that need to update
 * @return  status  0 - If any error occur in updating user_workouts_program, with error
 *          status  1 - If user_workouts_program updated successfully, with appropriate message
 *          status  2 - If user_workouts_program not updated, with appropriate message
 * @developed by "amc"
 */
user_program_helper.update_user_program_by_day_id = async (id, programObj) => {
    try {
        var user_program_data = await userWorkoutsProgram.findOneAndUpdate(
                {
                    _id: id
                },
                programObj,
                {
                    new : true
                }
        );
        if (user_program_data) {
            return {
                status: 1,
                message: "User program updated",
                program: user_program_data
            };
        } else {
            return {
                status: 2,
                message: "User program not updated"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while updating User program",
            error: err
        };
    }
};
/*
 * update_user_program_by_id is used to update user program data based on user program id
 * @param   id         String  _id of user_program that need to be update
 * @param   programObj Object programObj of user_programs's programObj consist of all property that need to update
 * @return  status  0 - If any error occur in updating user_program, with error
 *          status  1 - If user_program updated successfully, with appropriate message
 *          status  2 - If user_program not updated, with appropriate message
 * @developed by "amc"
 */
user_program_helper.update_user_program_by_id = async (id, programObj) => {
    try {
        var user_program_data = await UserPrograms.findOneAndUpdate(
                {
                    _id: id
                },
                programObj,
                {
                    new : true
                }
        );
        return {
            status: 1,
            message: "User program updated",
            program: user_program_data
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while updating User program",
            error: err
        };
    }
};
/*
 * delete_user_program is used to delete user_program from database
 * @param   user_program_id String  _id of user_program that need to be delete
 * @return  status  0 - If any error occur in deletion of user_program, with error
 *          status  1 - If user_program deleted successfully, with appropriate message
 * @developed by "amc"
 */
user_program_helper.delete_user_program = async user_program_id => {
    try {
        let programId = await userWorkoutsProgram.aggregate([
            {
                $match: {
                    programId: user_program_id
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ]);
        var ids = _.pluck(programId, "_id");

        let programExercise = await userWorkoutExercisesProgram.remove({
            userWorkoutsProgramId: {
                $in: ids
            }
        });

        let programDays = await userWorkoutsProgram.remove({
            _id: {
                $in: ids
            }
        });

        let program = await UserPrograms.remove({
            _id: user_program_id
        });

        if (program && program.n > 0) {
            return {
                status: 1,
                message: "User program deleted"
            };
        } else {
            return {
                status: 0,
                message: "User program not deleted"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while deleting User program",
            error: err
        };
    }
};
/*
 * delete_user_program_exercise is used to delete user_program's exercise from database
 * @param   exercise_ids String  _ids of user_program days that need to be delete
 * @return  status  0 - If any error occur in deletion of user_program, with error
 *          status  1 - If user_program deleted successfully, with appropriate message
 * @developed by "amc"
 */
user_program_helper.delete_user_program_exercise = async exercise_ids => {
    try {
        await userWorkoutExercisesProgram.remove({
            userWorkoutsProgramId: {
                $in: exercise_ids
            }
        });

        let programDays = await userWorkoutsProgram.remove({
            _id: {
                $in: exercise_ids
            }
        });
        if (programDays) {
            return {
                status: 1,
                message: "User program's exercises deleted"
            };
        } else {
            return {
                status: 0,
                message: "Error occured while deleting User program's exercises",
                error: err
            };
        }
    } catch (err) {
        return {
            status: 2,
            message: "Error occured while deleting User program's exercises",
            error: err
        };
    }
};

user_program_helper.cut_exercise_by_id = async (exerciseId, day) => {
    try {
        const workoutData = {day};
        const cond = {_id: mongoose.Types.ObjectId(exerciseId)};
        const resource = await userWorkoutsProgram.findOneAndUpdate(cond, workoutData);
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
 * copy_exercise_by_id is used to insert into user_workouts master collection
 *
 * @param   masterCollectionObject     JSON object consist of all property that need to insert in collection
 *
 * @return  status  0 - If any error occur in inserting User workout, with error
 *          status  1 - If User workout inserted, with inserted User workout document and appropriate message
 *
 * @developed by "amc"
 */
user_program_helper.copy_exercise_by_id = async (exerciseId, day, authUserId) => {
    var workoutLogsObj = {};
    var insertWorkoutLogArray = [];
    try {
        var day_data = await userWorkoutsProgram
                .findOne(
                        {
                            _id: exerciseId
                        },
                        {
                            _id: 0,
                            type: 1,
                            title: 1,
                            description: 1,
                            userId: 1,
                            programId: 1
                        }
                )
                .lean();

        day_data.day = day;

        let user_workouts = new userWorkoutsProgram(day_data);
        var workout_day = await user_workouts.save();

        var exercise_data = await userWorkoutExercisesProgram
                .find(
                        {
                            userWorkoutsProgramId: exerciseId
                        },
                        {
                            _id: 0
                        }
                )
                .lean();

        exercise_data.forEach(ex => {
            for (let o of ex.exercises) {
                delete o._id;
            }
            ex.userWorkoutsProgramId = workout_day._id;
        });

        let user_workout_exercise = await userWorkoutExercisesProgram.insertMany(
                exercise_data
                );

        if (user_workout_exercise) {
            return {
                status: 1,
                message: "Copy successfully",
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
 * delete_user_workouts_by_exercise_ids is used to delete user_workouts from database
 * @param   exerciseIds String  _id of user_workouts that need to be delete
 * @return  status  0 - If any error occur in deletion of user_workouts, with error
 *          status  1 - If user_workouts deleted successfully, with appropriate message
 * @developed by "amc"
 */
user_program_helper.delete_user_workouts_by_exercise_ids = async exerciseIds => {
    try {
        let user_workouts_data = await userWorkoutExercisesProgram.remove({
            _id: {
                $in: exerciseIds
            }
        });

        if (user_workouts_data) {
            return {
                status: 1,
                message: "User program workouts deleted"
            };
        } else {
            return {
                status: 2,
                message: "User program workouts not deleted"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while deleting User program workouts",
            error: err
        };
    }
};
/*
 * delete_user_workouts_exercise is used to delete user_workouts exercise from database
 * @param   exerciseId String  _id of user_workouts exercise that need to be delete
 * @return  status  0 - If any error occur in deletion of user_workouts exercise, with error
 *          status  1 - If user_workouts exercise deleted successfully, with appropriate message
 * @developed by "amc"
 */
user_program_helper.delete_user_workouts_exercise = async (
        childId,
        subChildIds
        ) => {
    try {
        let user_workouts_exercise = await userWorkoutExercisesProgram.update(
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

        let exercise = await userWorkoutExercisesProgram.findOne({
            _id: childId
        });

        if (exercise && exercise.exercises.length === 0) {
            let data = await userWorkoutExercisesProgram.remove({
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
 * reorder_exercises is used to reorder user workouts data based on user workouts sequence
 * @param   condition         Object  condition of user_workouts that need to be order
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts completed successfully, with appropriate message
 *          status  2 - If user_workouts not completed, with appropriate message
 * @developed by "amc"
 */
user_program_helper.reorder_exercises = async reorderArray => {
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
            await userWorkoutExercisesProgram.findByIdAndUpdate(
                    condition,
                    updateObj,
                    {
                        new : true
                    }
            );
        }
        return {
            status: 1,
            message: "Program Workout exercise sequence updated"
        };
    } catch (err) {
        return {
            status: 0,
            message:
                    "Error occured while updating user proggram workouts exercise updated",
            error: err
        };
    }
};

user_program_helper.generateFilterObj = (rawObj) => {
    let searchArr = [];
    let conditionArr = [];
    let rawObjSearchArr = (rawObj.searchColumns) ? rawObj.searchColumns : [];
    let searchTerm = (rawObj.search) ? rawObj.search : '';
    let sortObj = (rawObj.sort && Object.keys(rawObj.sort).length > 0) ? rawObj.sort : null;
    let condition = (rawObj.condition && Object.keys(rawObj.condition).length > 0) ? rawObj.condition : null;
    if (searchTerm) {
        let regexSearchTerm = {
            $regex: new RegExp(searchTerm, "i")
        };
        rawObjSearchArr.map((element) => {
            searchArr.push({
                [element]: regexSearchTerm
            });
        });
    }
    if (condition) {
        let conditionKeys = Object.keys(condition);
        conditionKeys.map((key) => {
            conditionArr.push({
                [key]: condition[key]
            });
        });
    }
    return{
        condition: conditionArr,
        search: searchArr,
        skip: rawObj.startFrom,
        limit: rawObj.noOfRecords,
        sort: sortObj
    };
};

/*
 * get_user_programs is used to fetch all user program data
 * @params condition condition of aggregate pipeline.
 * @params withExerciseCountCheck withExerciseCountCheck for check if program has exercise pipeline.
 * @return  status 0 - If any internal error occured while fetching user program data, with error
 *          status 1 - If user program data found, with user program object
 *          status 2 - If user program not found, with appropriate message
 */
user_program_helper.get_user_programs_filter = async (filterData) => {
    try {
        let matchCondition = {};
        let condition = filterData.condition;
        let search = filterData.search;
        let sort = filterData.sort;
        let skip = filterData.skip;
        let limit = filterData.limit;
        if (condition && condition.length > 0) {
            matchCondition['$and'] = condition;
        }
        if (search && search.length > 0) {
            matchCondition['$or'] = search;
        }
        let aggregate = [
            {
                $match: matchCondition,
            },
            {
                $lookup: {
                    from: "user_workouts_program",
                    localField: "_id",
                    foreignField: "programId",
                    as: "programId"
                }
            },
            {
                $unwind: {
                    path: "$programId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "user_workout_exercises_program",
                    localField: "programId._id",
                    foreignField: "userWorkoutsProgramId",
                    as: "userWorkoutsProgramId"
                }
            },
            {
                $unwind: {
                    path: "$userWorkoutsProgramId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "programs_rating",
                    localField: "_id",
                    foreignField: "programId",
                    as: "programRatings"
                }
            },
            {
                $unwind: {
                    path: "$programRatings",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: {
                        $first: "$name"
                    },
                    description: {
                        $first: "$description"
                    },
                    userId: {
                        $first: "$userId"
                    },
                    type: {
                        $first: "$type"
                    },
                    goal: {
                        $first: "$goal"
                    },
                    level: {
                        $first: "$level"
                    },
                    totalDays: {
                        $addToSet: "$userWorkoutsProgramId"
                    },
                    totalWorkouts: {
                        $addToSet: "$programId"
                    },
                    programsRating: {
                        $addToSet: "$programRatings"
                    },
                    avgRating: {$avg: "$programRatings.rating"},
                    privacy: {$first : "$privacy"}
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    userId: 1,
                    type: 1,
                    goal: 1,
                    level: 1,
                    privacy:1,
                    workouts: '$totalWorkouts',
                    rating: '$avgRating',
                    programsRating: {
                        $filter: {
                            input: "$programsRating",
                            as: "progRate",
                            cond: {
                                $eq: ["$$progRate.userId", filterData.authUserId]
                            }
                        }
                    },
                    programsRatingCount: {
                        $size: "$programsRating"
                    },
                    totalWorkouts: {
                        $size: "$totalWorkouts"
                    }
                }
            }
        ];
        if (sort) {
            aggregate.push({$sort: sort});
        }
        var totalPrograms = await UserPrograms.aggregate(aggregate);
        totalPrograms = totalPrograms.length;
        aggregate.push({$skip: skip});
        aggregate.push({$limit: limit});
        var user_program = await UserPrograms.aggregate(aggregate);
        user_program = getFrequency(user_program);
        if (user_program) {
            return {
                status: 1,
                message: "user program found",
                programs: user_program,
                totalRecords: totalPrograms
            };
        } else {
            return {
                status: 2,
                message: "No user program available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding user program",
            error: err
        };
    }
};

function getFrequency(programs) {
    programs.map((program) => {
        let workouts = program.workouts;
        if (workouts && workouts.length > 0) {
            let sortedWorkouts = _.sortBy(workouts, 'day');
            let maxDay = sortedWorkouts[(sortedWorkouts.length - 1)].day;
            let maxWeeks = ((maxDay + 1) / 7);
            let weekWiseExerciseCount = {};
            for (let i = 0; i < maxWeeks; i++) {
                weekWiseExerciseCount[i] = 0;
            }
            sortedWorkouts.map((workout) => {
                let day = workout.day;
                let belongWeek = Math.floor(day / 7);
                weekWiseExerciseCount[belongWeek]++;
            });
            let weekWiseExerciseCountValues = _.values(weekWiseExerciseCount);
            weekWiseExerciseCountValues.sort(function (a, b) {
                return a - b;
            });
            let weekWiseExerciseCountValuesLen = weekWiseExerciseCountValues.length;
            if (weekWiseExerciseCountValuesLen > 0) {
                let min = weekWiseExerciseCountValues[0];
                let max = 0;
                if (weekWiseExerciseCountValuesLen === 1) {
                    max = weekWiseExerciseCountValues[0];
                } else {
                    max = weekWiseExerciseCountValues[(weekWiseExerciseCountValuesLen - 1)];
                }
                program.minWorkoutsCount = min;
                program.maxWorkoutsCount = max;
            } else {
                program.minWorkoutsCount = 0;
                program.maxWorkoutsCount = 0;
            }
        } else {
            program.minWorkoutsCount = 0;
            program.maxWorkoutsCount = 0;
        }
        delete program.workouts;
    });
    return programs;
}

/*
 * get_user_program_ratings is used to fetch all user program ratings data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user program data, with error
 *          status 1 - If user program data found, with user program object
 */
user_program_helper.get_user_program_ratings = async condition => {
    try {
        var result = await UserPrograms.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "programs_rating",
                    foreignField: "programId",
                    localField: "_id",
                    as: "program_ratings"
                }
            },
            {
                $unwind: {
                    path: "$program_ratings",
                    includeArrayIndex: "program_ratings_index",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "authUserId",
                    localField: "program_ratings.userId",
                    as: "program_rating_user"
                }
            },
            {
                $unwind: {
                    path: "$program_rating_user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "program_ratings.userDetails": {
                        _id: "$program_rating_user._id",
                        firstName: "$program_rating_user.firstName",
                        lastName: "$program_rating_user.lastName",
                        email: "$program_rating_user.email",
                        authUserId: "$program_rating_user.authUserId",
                        username: "$program_rating_user.username",
                        avatar: "$program_rating_user.avatar"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: {
                        $first: "$name"
                    },
                    description: {
                        $first: "$description"
                    },
                    ownerUserId: {
                        $first: "$userId"
                    },
                    ratings: {
                        $addToSet: "$program_ratings"
                    },
                    ratingExists: {
                        $first: {
                            $cond: [
                                {$gte: ["$program_ratings_index", 0]},
                                true,
                                false
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    ownerUserId: 1,
                    ratings: {
                        $cond: [
                            {$eq: ["$ratingExists", true]},
                            "$ratings",
                            []
                        ]
                    }
                }
            }
        ]);
        if (result) {
            return {
                status: 1,
                message: "Success",
                program: result[0]
            };
        } else {
            return {
                status: 0,
                message: "Error occured while finding user program"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding user program",
            error: err
        };
    }
};

user_program_helper.createProgramWorkoutsFromIds = async (programId, workoutIds) => {
    try {
        let _workoutIds = workoutIds.map((o) => {
            return mongoose.Types.ObjectId(o);
        });
        let cond = [
            {
                $match: {
                    _id: {$in: _workoutIds}
                }
            },
            {
                $lookup: {
                    from: "user_workout_exercises",
                    foreignField: "userWorkoutsId",
                    localField: "_id",
                    as: "user_workout_exercises"
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ];
        const userWorkouts = await UserWorkouts.aggregate(cond);
        let day = 0;
        let i = 0;
        let prevDate = null;
        for (let o of userWorkouts) {
            if (i !== 0 && prevDate) {
                let currentDate = moment(o.date);
                let dayDiff = currentDate.diff(prevDate, 'days');
                day += dayDiff;
            }
            const workout = {
                programId: programId,
                type: o.type ? o.type : 'exercise',
                title: o.title ? o.title : '',
                description: o.description ? o.description : '',
                userId: o.userId ? o.userId : '',
                day: day
            };
            prevDate = moment(o.date);
            const newWorkoutProgram = new userWorkoutsProgram(workout);
            const newWorkoutRes = await newWorkoutProgram.save();
            if (newWorkoutRes) {
                const _newWorkoutId = newWorkoutRes._id;
                const workoutExercises = o.user_workout_exercises;
                let newWorkoutExercises = [];
                for (let we of workoutExercises) {
                    let weExercises = we && we.exercises ? we.exercises : [];
                    let _weExercises = weExercises.map((o) => {
                        delete o._id;
                        return o;
                    });
                    let nwe = {
                        sequence: we && typeof we.sequence !== 'undefined' ? we.sequence : 0,
                        userWorkoutsProgramId: _newWorkoutId,
                        type: we && we.type ? we.type : null,
                        subType: we && we.subType ? we.subType : null,
                        exercises: _weExercises
                    };
                    newWorkoutExercises.push(nwe);
                }
                await userWorkoutExercisesProgram.insertMany(newWorkoutExercises);
            }
            i++;
        }
        let responseObj = {
            status: 1,
            message: "Data added",
            data: null
        };
        return responseObj;
    } catch (error) {
        let responseObj = {
            status: 0,
            message: "Something went wrong! please try again",
            error: ["Something went wrong! please try again"]
        };
        return responseObj;
    }
};

user_program_helper.appendProgramWorkoutsFromIds = async (programId, workoutIds, startDay) => {
    try {
        let _workoutIds = workoutIds.map((o) => {
            return mongoose.Types.ObjectId(o);
        });
        let cond = [
            {
                $match: {
                    _id: {$in: _workoutIds}
                }
            },
            {
                $lookup: {
                    from: "user_workout_exercises",
                    foreignField: "userWorkoutsId",
                    localField: "_id",
                    as: "user_workout_exercises"
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ];
        const userWorkouts = await UserWorkouts.aggregate(cond);
        let day = startDay;
        let i = 0;
        let prevDate = null;
        for (let o of userWorkouts) {
            if (i !== 0 && prevDate) {
                let currentDate = moment(o.date);
                let dayDiff = currentDate.diff(prevDate, 'days');
                day += dayDiff;
            }
            const workout = {
                programId: programId,
                type: o.type ? o.type : 'exercise',
                title: o.title ? o.title : '',
                description: o.description ? o.description : '',
                userId: o.userId ? o.userId : '',
                day: day
            };
            prevDate = moment(o.date);
            const newWorkoutProgram = new userWorkoutsProgram(workout);
            const newWorkoutRes = await newWorkoutProgram.save();
            if (newWorkoutRes) {
                const _newWorkoutId = newWorkoutRes._id;
                const workoutExercises = o.user_workout_exercises;
                let newWorkoutExercises = [];
                for (let we of workoutExercises) {
                    let weExercises = we && we.exercises ? we.exercises : [];
                    let _weExercises = weExercises.map((o) => {
                        delete o._id;
                        return o;
                    });
                    let nwe = {
                        sequence: we && typeof we.sequence !== 'undefined' ? we.sequence : 0,
                        userWorkoutsProgramId: _newWorkoutId,
                        type: we && we.type ? we.type : null,
                        subType: we && we.subType ? we.subType : null,
                        exercises: _weExercises
                    };
                    newWorkoutExercises.push(nwe);
                }
                await userWorkoutExercisesProgram.insertMany(newWorkoutExercises);
            }
            i++;
        }
        let responseObj = {
            status: 1,
            message: "Data added",
            data: null
        };
        return responseObj;
    } catch (error) {
        console.log('error => ', error);
        let responseObj = {
            status: 0,
            message: "Something went wrong! please try again",
            error: ["Something went wrong! please try again"]
        };
        return responseObj;
    }
};

user_program_helper.getProgramLastDay = async (programId) => {
    try {
        const _programId = mongoose.Types.ObjectId(programId);
        const userWorkoutsProgramRes = await userWorkoutsProgram.find({programId: _programId}).sort({day: -1}).limit(1);
        if (userWorkoutsProgramRes && userWorkoutsProgramRes.length > 0) {
            return userWorkoutsProgramRes[0].day;
        }
        return 0;
    } catch (error) {
        return 0;
    }
};

module.exports = user_program_helper;
