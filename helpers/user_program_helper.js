var UserPrograms = require("./../models/user_programs");
var userWorkoutsProgram = require("./../models/user_workouts_program");
var userWorkoutExercisesProgram = require("./../models/user_workout_exercises_program");
var user_program_helper = {};
var _ = require("underscore");

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
        $unwind: "$user_workouts_program"
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
        $unwind: "$user_workout_exercises_program"
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          userId: { $first: "$userId" },
          type: { $first: "$type" },
          programdetail: {
            $addToSet: {
              _id: "$user_workouts_program._id",
              programId: "$user_workouts_program.programId",
              title: "$user_workouts_program.title",
              description: "$user_workouts_program.description",
              type: "$user_workouts_program.type",
              day: "$user_workouts_program.day"
            }
          },
          workouts: {
            $addToSet: "$user_workout_exercises_program"
          }
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
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          userId: { $first: "$userId" },
          type: { $first: "$type" },
          totalDays: { $addToSet: "$programId" }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          userId: 1,
          type: 1,
          totalDays: { $size: "$totalDays" }
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
 * 
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
 * add_program is used to insert into user_program collection
 * 
 * @param   user_program_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting User program, with error
 *          status  1 - If User program inserted, with inserted User program document and appropriate message
 * 
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
 * 
 * @param   masterCollectionObject     JSON object consist of all property that need to insert in to master collection
 * @param   childCollectionObject     JSON object consist of all property that need to insert in to child collection
 * 
 * @return  status  0 - If any error occur in inserting User Program, with error
 *          status  1 - If User Program inserted, with inserted User Program document and appropriate message
 * 
 * @developed by "amc"
 */
user_program_helper.insert_program_workouts = async (
  masterCollectionObject,
  childCollectionObject
) => {
  let user_program = new userWorkoutsProgram(masterCollectionObject);
  try {
    var user_master_program_data = await user_program.save();
    if (user_master_program_data) {
      if (childCollectionObject && childCollectionObject.length > 0) {
        childCollectionObject.forEach(element => {
          element.userWorkoutsProgramId = user_master_program_data._id;
        });
        var user_program_workouts_exercise = await userWorkoutExercisesProgram.insertMany(
          childCollectionObject
        );
        if (user_program_workouts_exercise) {
          return {
            status: 1,
            message: "Program workout inserted",
            workout: user_program_workouts_exercise
          };
        }
      }

      if (user_master_program_data) {
        return {
          status: 1,
          message: "Program workout inserted",
          workout: user_master_program_data
        };
      }
    } else {
      var delete_user_program = await UserPrograms.findByIdAndRemove({
        _id: mongoose.Types.ObjectId(user_master_program_data._id)
      });
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
 * 
 * @param   id         String  _id of user program workouts that need to be update
 * @param   masterCollectionObject Object  masterCollectionObject of user program workouts's master collection that need to be update
 * @param   childCollectionObject Object childCollectionObject of user program workout's child collection consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating user program workouts, with error
 *          status  1 - If user program workouts updated successfully, with appropriate message
 *          status  2 - If use program workouts not updated, with appropriate message
 * 
 * @developed by "amc"
 */
user_program_helper.update_program_workouts = async (
  id,
  masterCollectionObject,
  childCollectionObject
) => {
  try {
    var user_program_workout = await userWorkoutsProgram.findOneAndUpdate(
      { _id: id },
      masterCollectionObject,
      { new: true }
    );

    if (user_program_workout) {
      var user_workout_exercises_program = await userWorkoutExercisesProgram.remove(
        {
          userWorkoutsProgramId: id
        }
      );

      if (user_workout_exercises_program) {
        if (childCollectionObject && childCollectionObject.length > 0) {
          childCollectionObject.forEach(element => {
            element.userWorkoutsProgramId = user_program_workout._id;
          });
          var user_workout_exercises_program = await userWorkoutExercisesProgram.insertMany(
            childCollectionObject
          );
          if (user_workout_exercises_program) {
            return {
              status: 1,
              message: "User Program Exercises updated",
              program: user_workout_exercises_program
            };
          }
        }
      }
      if (user_program_workout) {
        return {
          status: 1,
          message: "User Program Exercises updated",
          program: user_program_workout
        };
      }
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
      message: "Error occured while inserting User Program Exercises",
      error: err
    };
  }
};

/*
 * assign_program is used to assign program 
 * 
 * @param   user_program_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in assigning User program, with error
 *          status  1 - If User program assigned, with inserted User program document and appropriate message
 * 
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
 * update_user_program_by_id is used to update user program data based on user program id
 * 
 * @param   id         String  _id of user_program that need to be update
 * @param   programObj Object programObj of user_programs's programObj consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating user_program, with error
 *          status  1 - If user_program updated successfully, with appropriate message
 *          status  2 - If user_program not updated, with appropriate message
 * 
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
 * 
 * @param   user_program_id String  _id of user_program that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of user_program, with error
 *          status  1 - If user_program deleted successfully, with appropriate message
 * 
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

module.exports = user_program_helper;
