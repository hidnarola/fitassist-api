var UserWorkouts = require("./../models/user_workouts");
var UserWorkoutExercises = require("./../models/user_workout_exercises");
var WorkoutLogs = require("./../models/workout_logs");
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
          userWorkoutsId: { $first: "$_id" },
          type: { $first: "$exercises.type" },
          exercises: { $addToSet: "$exercises" },
          isCompleted: { $first: "$isCompleted" },
          dayType: { $first: "$type" },
          title: { $first: "$title" },
          description: { $first: "$description" },
          userId: { $first: "$userId" },
          date: { $first: "$date" }
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
          date: 1
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
        date: user_workouts[0].date,
        warmup: [],
        exercise: [],
        cooldown: []
      };

      _.each(user_workouts, o => {
        if (o.type === "cooldown") {
          returnObj.cooldown = o.exercises;
        } else if (o.type === "exercise") {
          returnObj.exercise = o.exercises;
        } else if (o.type === "warmup") {
          returnObj.warmup = o.exercises;
        }
      });

      console.log("------------------------------------");
      console.log("returnObj : ", returnObj);
      console.log("------------------------------------");

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
        $group: {
          _id: null,
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
          reps_least: { $min: "$reps" },
          reps_total: { $sum: "$reps" },
          reps_average: { $avg: "$reps" },
          reps_most: { $max: "$reps" },
          sets_least: { $min: "$reps" },
          sets_total: { $sum: "$reps" },
          sets_average: { $avg: "$reps" },
          sets_most: { $max: "$reps" },
          workouts_total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
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
 * insert_user_workouts_exercises is used to insert into user_workouts's exercises collection
 * 
 * @param   childCollectionObject     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting User workout exercise, with error
 *          status  1 - If User workout inserted, with inserted User workout exercise document and appropriate message
 * 
 * @developed by "amc"
 */
user_workouts_helper.insert_user_workouts_exercises = async (
  childCollectionObject,
  workoutLogsArray
) => {
  try {
    let user_workouts_exercise = new UserWorkoutExercises(
      childCollectionObject
    );
    var user_workouts_exercise_data = await user_workouts_exercise.save();
    var exerciseIds = _.pluck(user_workouts_exercise_data.exercises, "_id");

    workoutLogsArray.forEach((element, index) => {
      element.exerciseId = user_workouts_exercise_data._id;
      // element.setsDetailId = exerciseIds[index];
    });

    let workout_logs_data = await WorkoutLogs.insertMany(workoutLogsArray);
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
 * 
 * @param   masterCollectionObject     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting User workout, with error
 *          status  1 - If User workout inserted, with inserted User workout document and appropriate message
 * 
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
        error: err
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
 * update_user_workouts_by_id is used to update user workouts data based on user workouts id
 * 
 * @param   id         String  _id of user_workouts that need to be update
 * @param   masterCollectionObject Object  masterCollectionObject of user_workouts's master collection that need to be update
 * 
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts updated successfully, with appropriate message
 *          status  2 - If user_workouts not updated, with appropriate message
 * 
 * @developed by "amc"
 */
user_workouts_helper.update_user_workouts_by_id = async (
  id,
  masterCollectionObject
) => {
  try {
    var user_workouts_data = await UserWorkouts.findOneAndUpdate(
      { _id: id },
      masterCollectionObject,
      { new: true }
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
 * 
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
    let user_workouts_data1 = await UserWorkouts.update(
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

    let user_workoutsids = await UserWorkoutExercises.find(
      {
        userWorkoutsId: id
      },
      { _id: 1 }
    );
    user_workoutsids = _.pluck(user_workoutsids, "_id");

    let user_workouts_data3 = await WorkoutLogs.updateMany(
      {
        workoutId: { $in: user_workoutsids }
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
user_workouts_helper.complete_workout = async (id, updateObject) => {
  try {
    let user_workouts_data = await UserWorkoutExercises.update(
      id,
      updateObject,
      {
        new: true
      }
    );

    let user_workoutsids = await UserWorkoutExercises.find(
      {
        _id: id
      },
      { _id: 1 }
    );
    user_workoutsids = _.pluck(user_workoutsids, "_id");

    let user_workouts_data3 = await WorkoutLogs.updateMany(
      {
        workoutId: { $in: user_workoutsids }
      },
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
 * delete_user_workouts_exercise is used to delete user_workouts exercise from database
 * @param   exerciseId String  _id of user_workouts exercise that need to be delete
 * @return  status  0 - If any error occur in deletion of user_workouts exercise, with error
 *          status  1 - If user_workouts exercise deleted successfully, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.delete_user_workouts_exercise = async exerciseId => {
  try {
    let ids = await UserWorkoutExercises.find(exerciseId, { _id: 1 });
    ids = _.pluck(ids, "_id");
    let user_workouts_exercise = await UserWorkoutExercises.remove(exerciseId);
    let user_workouts_exercise_workout_log = await UserWorkoutExercises.remove({
      exerciseId: { $in: ids }
    });
    if (user_workouts_exercise.n > 0) {
      return { status: 1, message: "User workouts exercise deleted" };
    } else {
      return { status: 0, message: "User workouts exercise not deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting User workouts exercise",
      error: err
    };
  }
};

/*
 * delete_user_workouts_by_days is used to delete user_workouts from database
 * @param   exerciseIds String  _id of user_workouts that need to be delete
 * @return  status  0 - If any error occur in deletion of user_workouts, with error
 *          status  1 - If user_workouts deleted successfully, with appropriate message
 * @developed by "amc"
 */
user_workouts_helper.delete_user_workouts_by_days = async exerciseIds => {
  try {
    let ids = await UserWorkoutExercises.find(
      {
        userWorkoutsId: { $in: exerciseIds }
      },
      { _id: 1 }
    );

    ids = _.pluck(user_workouts_data1, "_id");
    console.log("------------------------------------");
    console.log("ids : ", ids);
    console.log("------------------------------------");

    return { status: 1, message: "User workouts deleted" };

    let user_workouts_data1 = await UserWorkoutExercises.remove({
      userWorkoutsId: { $in: exerciseIds }
    });
    let user_workouts_data2 = await UserWorkouts.remove({
      _id: { $in: exerciseIds }
    });
    if (user_workouts_data2) {
      return { status: 1, message: "User workouts deleted" };
    } else {
      return { status: 1, message: "User workouts not deleted" };
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
user_workouts_helper.delete_user_workouts_by_id = async user_workouts_id => {
  try {
    let user_workouts_data1 = await UserWorkouts.remove({
      _id: user_workouts_id
    });
    let ids = await UserWorkoutExercises.find(
      {
        userWorkoutsId: user_workouts_id
      },
      { _id: 1 }
    );
    ids = _.pluck(ids, "_id");
    let user_workouts_data2 = await UserWorkoutExercises.remove({
      userWorkoutsId: user_workouts_id
    });
    let workout_logs_data = await WorkoutLogs.remove({
      exerciseId: { $in: ids }
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

/*
 * complete_workout_by_days is used to complete user workouts data based on user workouts date
 * 
 * @param   condition         Object  condition of user_workouts that need to be complete
 * @return  status  0 - If any error occur in updating user_workouts, with error
 *          status  1 - If user_workouts completed successfully, with appropriate message
 *          status  2 - If user_workouts not completed, with appropriate message 
 * @developed by "amc"
 */
user_workouts_helper.complete_workout_by_days = async (id, updateObject) => {
  try {
    let user_workouts_data1 = await UserWorkouts.updateMany(
      { _id: { $in: id } },
      updateObject,
      {
        new: true
      }
    );

    let user_workouts_data2 = await UserWorkoutExercises.updateMany(
      { userWorkoutsId: { $in: id } },
      updateObject,
      {
        new: true
      }
    );

    return {
      status: 1,
      message: "Workout completed"
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user workouts completed",
      error: err
    };
  }
};
module.exports = user_workouts_helper;
