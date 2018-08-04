var UserPrograms = require("./../models/user_programs");
var userWorkoutsProgram = require("./../models/user_workouts_program");
var userWorkoutExercisesProgram = require("./../models/user_workout_exercises_program");
var user_program_helper = {};
var _ = require("underscore");

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
      return { status: 2, message: "No user program available" };
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
user_program_helper.get_user_programs_data = async condition => {
  try {
    var user_program = await userWorkoutsProgram.find(condition);

    if (user_program) {
      return {
        status: 1,
        message: "user program found",
        program: user_program
      };
    } else {
      return { status: 2, message: "No user program available" };
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
user_program_helper.get_all_program_workouts_group_by = async (
  condition = {}
) => {
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
          userWorkoutsId: { $first: "$_id" },
          type: { $first: "$exercises.type" },
          exercises: { $addToSet: "$exercises" },
          dayType: { $first: "$type" },
          title: { $first: "$title" },
          description: { $first: "$description" },
          userId: { $first: "$userId" },
          day: { $first: "$day" },
          sequence: { $first: "$sequence" }
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
          day: 1,
          sequence: 1
        }
      }
    ]);

    if (user_workouts) {
      var returnObj = {
        _id: user_workouts[0].userWorkoutsId,
        isCompleted: user_workouts[0].isCompleted,
        type: user_workouts[0].dayType,
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
      return { status: 2, message: "No user workouts available" };
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
 * @return  status 0 - If any internal error occured while fetching user program data, with error
 *          status 1 - If user program data found, with user program object
 *          status 2 - If user program not found, with appropriate message
 */
user_program_helper.get_user_programs = async (
  condition = {},
  single = false
) => {
  try {
    var user_program = await UserPrograms.aggregate([
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
          name: { $first: "$name" },
          description: { $first: "$description" },
          userId: { $first: "$userId" },
          type: { $first: "$type" },
          totalDays: { $addToSet: "$userWorkoutsProgramId" },
          totalWorkouts: { $addToSet: "$programId" }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          userId: 1,
          type: 1,
          totalWorkouts: { $size: "$totalWorkouts" }
        }
      }
    ]);

    if (user_program) {
      if (!single) {
        return {
          status: 1,
          message: "user programs found",
          programs: user_program
        };
      } else {
        return {
          status: 1,
          message: "user program found",
          program: user_program[0]
        };
      }
    } else {
      return { status: 2, message: "No user program available" };
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
    var user_programs = await UserPrograms.findOne({ _id: id });
    if (user_programs) {
      return {
        status: 1,
        message: "User program found",
        program: user_programs
      };
    } else {
      return { status: 2, message: "No User program available" };
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
      { _id: id },
      childCollectionObject,
      { new: true }
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
      { _id: id },
      programObj,
      { new: true }
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
      { _id: id },
      programObj,
      { new: true }
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
        $match: { programId: user_program_id }
      },
      {
        $project: {
          _id: 1
        }
      }
    ]);
    var ids = _.pluck(programId, "_id");

    let programExercise = await userWorkoutExercisesProgram.remove({
      userWorkoutsProgramId: { $in: ids }
    });

    let programDays = await userWorkoutsProgram.remove({
      _id: { $in: ids }
    });

    let program = await UserPrograms.remove({
      _id: user_program_id
    });

    if (program && program.n > 0) {
      return { status: 1, message: "User program deleted" };
    } else {
      return { status: 0, message: "User program not deleted" };
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
    let programExercise = await userWorkoutExercisesProgram.remove({
      userWorkoutsProgramId: { $in: exercise_ids }
    });

    let programDays = await userWorkoutsProgram.remove({
      _id: { $in: exercise_ids }
    });
    if (programDays) {
      return { status: 1, message: "User program's exercises deleted" };
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
user_program_helper.copy_exercise_by_id = async (
  exerciseId,
  day,
  authUserId
) => {
  var workoutLogsObj = {};
  var insertWorkoutLogArray = [];
  try {
    var day_data = await userWorkoutsProgram
      .findOne(
        { _id: exerciseId },
        { _id: 0, type: 1, title: 1, description: 1, userId: 1, programId: 1 }
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
        { _id: 0 }
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
      _id: { $in: exerciseIds }
    });

    if (user_workouts_data) {
      return { status: 1, message: "User program workouts deleted" };
    } else {
      return { status: 2, message: "User program workouts not deleted" };
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
      { _id: childId },
      { $pull: { exercises: { _id: { $in: subChildIds } } } },
      { new: true }
    );

    let exercise = await userWorkoutExercisesProgram.findOne({
      _id: childId
    });

    if (exercise && exercise.exercises.length === 0) {
      let data = await userWorkoutExercisesProgram.remove({
        _id: childId
      });
    }
    return { status: 1, message: "User workouts exercise deleted" };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting User workouts exercise",
      error: err
    };
  }
};

module.exports = user_program_helper;
