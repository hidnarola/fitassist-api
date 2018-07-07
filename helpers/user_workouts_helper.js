var UserWorkouts = require("./../models/user_workouts");
var UserWorkoutExercises = require("./../models/user_workout_exercises");
var user_workouts_helper = {};
var _ = require("underscore");

/*
 * get_all_workouts is used to fetch all user exercises data
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user exercises data, with error
 *          status 1 - If user exercises data found, with user exercises object
 *          status 2 - If user exercises not found, with appropriate message
 */
user_workouts_helper.get_all_workouts = async (condition, single = false) => {
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

    _.each(user_workouts, user_workout => {
      var tmp = [];
      tmp = _.sortBy(user_workout.exercises, function(o) {
        return o.sequence;
      });
      user_workout.exercises = tmp;
    });

    if (user_workouts) {
      return {
        status: 1,
        message: "user workouts found",
        workouts: !single ? user_workouts : user_workouts[0]
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
 * workout_detail_for_badges is used to fetch all user workout data for badges
 * @params condition condition of aggregate pipeline.
 * @return  status 0 - If any internal error occured while fetching user workout data, with error
 *          status 1 - If user workout data found, with user workout object
 *          status 2 - If user workout not found, with appropriate message
 */
user_workouts_helper.workout_detail_for_badges = async condition => {
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
          "exercises.isCompleted": 1
        }
      },
      {
        $group: {
          _id: null,
          weight_lifted_total: { $sum: "$exercises.baseWeightValue" },
          weight_lifted_average: { $avg: "$exercises.baseWeightValue" },
          weight_lifted_most: { $max: "$exercises.baseWeightValue" },
          weight_lifted_least: { $min: "$exercises.baseWeightValue" },
          workouts_total: { $sum: 1 },
          workouts_average: { $sum: 1 },
          reps_least: { $min: "$exercises.reps" },
          reps_total: { $sum: "$exercises.reps" },
          reps_average: { $avg: "$exercises.reps" },
          reps_most: { $max: "$exercises.reps" },
          sets_least: { $min: "$exercises.sets" },
          sets_total: { $sum: "$exercises.sets" },
          sets_average: { $avg: "$exercises.sets" },
          sets_most: { $max: "$exercises.sets" }
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
  let user_workouts = new UserWorkouts(masterCollectionObject);
  try {
    var user_workouts_data = await user_workouts.save();
    if (user_workouts_data) {
      if (childCollectionObject && childCollectionObject.length > 0) {
        childCollectionObject.forEach(element => {
          element.userWorkoutsId = user_workouts_data._id;
        });
        var user_workouts_exercise = await UserWorkoutExercises.insertMany(
          childCollectionObject
        );
        if (user_workouts_exercise) {
          return {
            status: 1,
            message: "User workout inserted",
            workout: user_workouts_exercise
          };
        }
      }

      if (user_workouts_data) {
        return {
          status: 1,
          message: "User workout inserted",
          workout: user_workouts_data
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
 * @param   id         String  _id of user_workouts that need to be update
 * @param   masterCollectionObject Object  masterCollectionObject of user_workouts's master collection that need to be update
 * @param   childCollectionObject Object childCollectionObject of user_workout's child collection consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts updated successfully, with appropriate message
 *          status  2 - If user_workouts not updated, with appropriate message
 * 
 * @developed by "amc"
 */
user_workouts_helper.update_user_workouts_by_id = async (
  id,
  masterCollectionObject,
  childCollectionObject
) => {
  try {
    var user_workouts_data = await UserWorkouts.findOneAndUpdate(
      { _id: id },
      masterCollectionObject,
      { new: true }
    );
    if (user_workouts_data) {
      var user_workouts_exercise = await UserWorkoutExercises.remove({
        userWorkoutsId: id
      });
      if (user_workouts_exercise) {
        if (childCollectionObject && childCollectionObject.length > 0) {
          childCollectionObject.forEach(element => {
            element.userWorkoutsId = user_workouts_data._id;
          });
          var user_workouts_exercise = await UserWorkoutExercises.insertMany(
            childCollectionObject
          );
          if (user_workouts_exercise) {
            return {
              status: 1,
              message: "User workout updated",
              workout: user_workouts_exercise
            };
          }
        }
      }
      if (user_workouts_data) {
        return {
          status: 1,
          message: "User workout updated",
          workout: user_workouts_data
        };
      }
    } else {
      var delete_user_workouts = await UserWorkouts.findByIdAndRemove({
        _id: mongoose.Types.ObjectId(user_workouts_data._id)
      });
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
 * 
 * @param   condition         Object  condition of user_workouts that need to be complete
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts completed successfully, with appropriate message
 *          status  2 - If user_workouts not completed, with appropriate message 
 * @developed by "amc"
 */
user_workouts_helper.complete_master_event = async (id, updateObject) => {
  try {
    let user_workouts_data1 = await UserWorkouts.findByIdAndUpdate(
      {
        _id: id
      },
      updateObject,
      {
        new: true
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
 * 
 * @param   condition         Object  condition of user_workouts that need to be complete
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts completed successfully, with appropriate message
 *          status  2 - If user_workouts not completed, with appropriate message 
 * @developed by "amc"
 */
user_workouts_helper.complete_all_workout = async (id, updateObject) => {
  try {
    let user_workouts_data1 = await UserWorkouts.findByIdAndUpdate(
      {
        _id: id
      },
      updateObject,
      {
        new: true
      }
    );
    let user_workouts_data2 = await UserWorkoutExercises.updateMany(
      {
        userWorkoutsId: id
      },
      updateObject,
      {
        new: true
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
user_workouts_helper.complete_workout = async (condition, updateObject) => {
  try {
    let user_workouts_data = await UserWorkoutExercises.update(
      condition,
      updateObject,
      {
        new: true
      }
    );

    if (!user_workouts_data) {
      return { status: 2, message: "Workout not updated" };
    } else {
      return {
        status: 1,
        message: "Workout updated",
        data: user_workouts_data
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user workouts",
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
    let user_workouts_data1 = await UserWorkouts.remove({
      _id: user_workouts_id
    });
    let user_workouts_data2 = await UserWorkoutExercises.remove({
      userWorkoutsId: user_workouts_id
    });
    if (!user_workouts_data1 && !user_workouts_data2) {
      return { status: 2, message: "User workouts not found" };
    } else {
      return { status: 1, message: "User workouts deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting User workouts",
      error: err
    };
  }
};

module.exports = user_workouts_helper;
