var UserWorkouts = require("./../models/user_workouts");
var UserWorkoutExercises = require("./../models/user_workout_exercises");
var user_workouts_helper = {};

/*
 * get_all_workouts is used to fetch all user exercises data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_workouts_helper.get_all_workouts = async condition => {
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
      }
    ]);
    if (user_workouts) {
      return {
        status: 1,
        message: "user workouts found",
        workouts: user_workouts
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
 * get_user_workouts_by_id is used to fetch User workout by ID
 * 
 * @params id id of user_workoutss
 * @return  status 0 - If any internal error occured while fetching user workouts data, with error
 *          status 1 - If User workouts data found, with user workouts object
 *          status 2 - If User workouts data not found, with appropriate message
 */
user_workouts_helper.get_user_workouts_by_id = async id => {
  try {
    var user_workout = await UserWorkouts.findOne({ _id: id });
    if (user_workout) {
      return {
        status: 1,
        message: "User workout found",
        workout: user_workout
      };
    } else {
      return { status: 2, message: "No User workout available" };
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
 * insert_user_workouts is used to insert into user_workouts collection
 * 
 * @param   user_workouts_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting User workout, with error
 *          status  1 - If User workout inserted, with inserted User workout document and appropriate message
 * 
 * @developed by "amc"
 */
user_workouts_helper.insert_user_workouts = async (
  masterCollectionObject,
  childCollectionObject
) => {
  console.log("------------------------------------");
  console.log("masterCollectionObject : ", masterCollectionObject);
  console.log("------------------------------------");
  console.log("------------------------------------");
  console.log("BEFORE childCollectionObject : ", childCollectionObject);
  console.log("------------------------------------");

  let user_workouts = new UserWorkouts(masterCollectionObject);
  try {
    var user_workouts_data = await user_workouts.save();
    if (user_workouts_data) {
      childCollectionObject.userWorkoutsId = user_workouts_data._id;
      console.log("------------------------------------");
      console.log(
        "AFTER ADDED IN MASTER childCollectionObject : ",
        childCollectionObject
      );
      console.log("------------------------------------");

      let user_workout_exercise = new UserWorkoutExercises(
        childCollectionObject
      );
      var user_workouts_exercise = await user_workout_exercise.save();
      if (user_workouts_exercise) {
        return {
          status: 1,
          message: "User workout inserted",
          workout: user_workouts_exercise
        };
      }
    } else {
      var delete_user_workouts = await UserWorkouts.findByIdAndRemove({
        _id: mongoose.Types.ObjectId(user_workouts_data._id)
      });
      return {
        status: 2,
        message: "Error occured while inserting User workout",
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
 * 
 * @param   user_workouts_id         String  _id of user_workouts that need to be update
 * @param   user_workouts_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts updated successfully, with appropriate message
 *          status  2 - If user_workouts not updated, with appropriate message
 * 
 * @developed by "amc"
 */
user_workouts_helper.update_user_workouts_by_id = async (
  user_workouts_id,
  user_workouts_obj
) => {
  try {
    let user_workouts_data = await UserWorkouts.findOneAndUpdate(
      { _id: user_workouts_id },
      user_workouts_obj,
      { new: true }
    );
    if (!user_workouts_data) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        workout: user_workouts_data
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user_workouts",
      error: err
    };
  }
};

/*
 * delete_user_workouts_by_id is used to delete user_workouts from database
 * 
 * @param   user_workouts_id String  _id of user_workouts that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of user_workouts, with error
 *          status  1 - If user_workouts deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
user_workouts_helper.delete_user_workouts_by_id = async user_workouts_id => {
  try {
    let user_workouts_data = await UserWorkouts.remove(user_workouts_id);
    if (!user_workouts_data) {
      return { status: 2, message: "User workout not found" };
    } else {
      return { status: 1, message: "User workout deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting User workout",
      error: err
    };
  }
};

module.exports = user_workouts_helper;
