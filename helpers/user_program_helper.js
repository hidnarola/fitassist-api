var UserPrograms = require("./../models/user_programs");
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
 * get_user_programs is used to fetch all user program data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user program data, with error
 *          status 1 - If user program data found, with user program object
 *          status 2 - If user program not found, with appropriate message
 */
user_program_helper.get_user_programs = async (condition, single = false) => {
  try {
    var user_program = await UserPrograms.aggregate([
      {
        $match: condition
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
    let user_program_data = await UserPrograms.remove({
      _id: user_program_id
    });

    if (!user_program_data) {
      return { status: 2, message: "User program not found" };
    } else {
      return { status: 1, message: "User program deleted" };
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
