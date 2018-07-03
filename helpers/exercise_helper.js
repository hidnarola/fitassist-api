var Exercise = require("./../models/exercise");
var exercise_helper = {};

/*
 * get_all_exercise is used to fetch all exercise data
 * 
 * @return  status 0 - If any internal error occured while fetching exercise data, with error
 *          status 1 - If exercise data found, with exercise object
 *          status 2 - If exercise not found, with appropriate message
 */
exercise_helper.get_all_exercise = async (condition = {}, project = {}) => {
  try {
    var exercise = await Exercise.find(condition, project);
    if (exercise) {
      return { status: 1, message: "Exercise found", exercises: exercise };
    } else {
      return { status: 2, message: "No exercise available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding exercise",
      error: err
    };
  }
};

/*
 * get_all_exercise_for_user is used to fetch all exercise data
 * 
 * @return  status 0 - If any internal error occured while fetching exercise data, with error
 *          status 1 - If exercise data found, with exercise object
 *          status 2 - If exercise not found, with appropriate message
 */
exercise_helper.get_all_exercise_for_user = async () => {
  try {
    var exercise = await Exercise.aggregate([
      // { $unwind: "$otherMuscleGroup" },
      // { $unwind: "$detailedMuscleGroup" },
      {
        $unwind: {
          path: "$otherMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$detailedMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$mainMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$type",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$equipments",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "equipments",
          localField: "equipments",
          foreignField: "_id",
          as: "equipments"
        }
      },
      {
        $unwind: {
          path: "$equipments",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "bodyparts",
          localField: "mainMuscleGroup",
          foreignField: "_id",
          as: "mainMuscleGroup"
        }
      },
      {
        $unwind: {
          path: "$mainMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "bodyparts",
          localField: "otherMuscleGroup",
          foreignField: "_id",
          as: "otherMuscleGroup"
        }
      },
      {
        $unwind: {
          path: "$otherMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "bodyparts",
          localField: "detailedMuscleGroup",
          foreignField: "_id",
          as: "detailedMuscleGroup"
        }
      },
      {
        $unwind: {
          path: "$detailedMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "exercise_types",
          localField: "type",
          foreignField: "_id",
          as: "type"
        }
      },
      {
        $unwind: {
          path: "$type",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id",
          name: { $push: "$name" },
          // cols:filter_object.columnFilter,
          otherMuscleGroup: { $addToSet: "$otherMuscleGroup.bodypart" },
          detailedMuscleGroup: { $addToSet: "$detailedMuscleGroup.bodypart" },
          detailedMuscleGroup: { $addToSet: "$detailedMuscleGroup.bodypart" },
          equipments: { $addToSet: "$equipments.name" },
          type: { $first: "$type.name" },
          mainMuscleGroup: { $first: "$mainMuscleGroup.bodypart" },
          name: { $first: "$name" },
          description: { $first: "$description" },
          mechanics: { $first: "$mechanics" },
          difficltyLevel: { $first: "$difficltyLevel" },
          measures: { $first: "$measures" }
        }
      }
    ]);

    if (exercise) {
      return {
        status: 1,
        message: "Exercise found",
        exercises: exercise
      };
    } else {
      return { status: 2, message: "No exercise available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding exercise",
      error: err
    };
  }
};

/*
 * get_exercise_id is used to fetch all exercise data
 * 
 * @return  status 0 - If any internal error occured while fetching exercise data, with error
 *          status 1 - If exercise data found, with exercise object
 *          status 2 - If exercise not found, with appropriate message
 */
exercise_helper.get_exercise_id = async id => {
  try {
    var exercise = await Exercise.aggregate([
      {
        $match: id
      },
      {
        $unwind: {
          path: "$otherMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$detailedMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$mainMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$type",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$equipments",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "equipments",
          localField: "equipments",
          foreignField: "_id",
          as: "equipments"
        }
      },
      {
        $unwind: {
          path: "$equipments",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "bodyparts",
          localField: "mainMuscleGroup",
          foreignField: "_id",
          as: "mainMuscleGroup"
        }
      },
      {
        $unwind: {
          path: "$mainMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "bodyparts",
          localField: "otherMuscleGroup",
          foreignField: "_id",
          as: "otherMuscleGroup"
        }
      },
      {
        $unwind: {
          path: "$otherMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "bodyparts",
          localField: "detailedMuscleGroup",
          foreignField: "_id",
          as: "detailedMuscleGroup"
        }
      },
      {
        $unwind: {
          path: "$detailedMuscleGroup",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "exercise_types",
          localField: "type",
          foreignField: "_id",
          as: "type"
        }
      },
      {
        $unwind: {
          path: "$type",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id",
          name: { $push: "$name" },
          // cols:filter_object.columnFilter,
          otherMuscleGroup: { $addToSet: "$otherMuscleGroup.bodypart" },
          detailedMuscleGroup: { $addToSet: "$detailedMuscleGroup.bodypart" },
          detailedMuscleGroup: { $addToSet: "$detailedMuscleGroup.bodypart" },
          equipments: { $addToSet: "$equipments.name" },
          type: { $first: "$type.name" },
          mainMuscleGroup: { $first: "$mainMuscleGroup.bodypart" },
          name: { $first: "$name" },
          description: { $first: "$description" },
          mechanics: { $first: "$mechanics" },
          difficltyLevel: { $first: "$difficltyLevel" },
          measures: { $first: "$measures" }
        }
      }
    ]);

    if (exercise) {
      return {
        status: 1,
        message: "Exercise found",
        exercise: exercise[0]
      };
    } else {
      return { status: 2, message: "No exercise available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding exercise",
      error: err
    };
  }
};

// /*
//  * get_exercise_id is used to fetch exercise by ID
//  *
//  * @return  status 0 - If any internal error occured while fetching exercise data, with error
//  *          status 1 - If exercise data found, with exercise object
//  *          status 2 - If exercise not found, with appropriate message
//  */
// exercise_helper.get_exercise_id = async id => {
//   try {
//     var exercise = await Exercise.findOne({ _id: id });
//     if (exercise) {
//       return { status: 1, message: "exercise found", exercise: exercise };
//     } else {
//       return { status: 2, message: "No exercise available" };
//     }
//   } catch (err) {
//     return {
//       status: 0,
//       message: "Error occured while finding exercise",
//       error: err
//     };
//   }
// };

/*
 * insert_exercise is used to insert into exercise collection
 * 
 * @param   exercise     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting exercise, with error
 *          status  1 - If exercise inserted, with inserted exercise document and appropriate message
 * 
 * @developed by "amc"
 */
exercise_helper.insert_exercise = async exercise_object => {
  let exercise = new Exercise(exercise_object);
  try {
    let exercise_data = await exercise.save();
    return { status: 1, message: "Exercise inserted", exercise: exercise_data };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting Exercise",
      error: err
    };
  }
};

/*
 * update_exercise_by_id is used to update exercise data based on exercise_id
 * @param   exercise_id         String  _id of exercise that need to be update
 * @param   exercise_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating exercise, with error
 *          status  1 - If Exercise updated successfully, with appropriate message
 *          status  2 - If Exercise not updated, with appropriate message
 * 
 * @developed by "amc"
 */
exercise_helper.update_exercise_by_id = async (
  exercise_id,
  exercise_object
) => {
  try {
    let exercise = await Exercise.findOneAndUpdate(
      { _id: exercise_id },
      exercise_object,
      { new: true }
    );
    if (!exercise) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        exercise: exercise
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating exercise",
      error: err
    };
  }
};

/*
 * delete_exercise_by_id is used to delete exercise from database
 * 
 * @param   exercise_id String  _id of exercise that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of exercise, with error
 *          status  1 - If exercise deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
exercise_helper.delete_exercise_by_id = async exercise_id => {
  try {
    let resp = await Exercise.findOneAndRemove({ _id: exercise_id });
    if (!resp) {
      return { status: 2, message: "Exercise not found" };
    } else {
      return { status: 1, message: "Exercise deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting exercise",
      error: err
    };
  }
};

/*
 * get_filtered_records is used to fetch all filtered data
 * 
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
exercise_helper.get_filtered_records = async filter_obj => {
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Exercise.aggregate([
      {
        $match: filter_object.columnFilter
      }
    ]);
    var filtered_data = await Exercise.aggregate([
      { $unwind: "$otherMuscleGroup" },
      { $unwind: "$detailedMuscleGroup" },
      {
        $lookup: {
          from: "bodyparts",
          localField: "mainMuscleGroup",
          foreignField: "_id",
          as: "mainMuscle"
        }
      },
      {
        $unwind: "$mainMuscle"
      },
      {
        $lookup: {
          from: "bodyparts",
          localField: "otherMuscleGroup",
          foreignField: "_id",
          as: "otherMuscle"
        }
      },
      {
        $unwind: "$otherMuscle"
      },
      {
        $lookup: {
          from: "bodyparts",
          localField: "detailedMuscleGroup",
          foreignField: "_id",
          as: "detailedMuscle"
        }
      },
      {
        $unwind: "$detailedMuscle"
      },
      {
        $lookup: {
          from: "exercise_types",
          localField: "type",
          foreignField: "_id",
          as: "type"
        }
      },
      {
        $unwind: "$type"
      },

      {
        $group: {
          _id: "$_id",
          name: { $push: "$name" },
          // cols:filter_object.columnFilter,
          otherMuscle: { $addToSet: "$otherMuscle" },
          detailedMuscle: { $addToSet: "$detailedMuscle" },
          detailedMuscleGroup: { $addToSet: "$detailedMuscleGroup" },
          type: { $addToSet: "$type" },
          mainMuscle: { $first: "$mainMuscle" },
          name: { $first: "$name" },
          description: { $first: "$description" },
          mainMuscleGroup: { $first: "$mainMuscleGroup" },
          otherMuscleGroup: { $addToSet: "$otherMuscleGroup" },
          mechanics: { $first: "$mechanics" },
          difficltyLevel: { $first: "$difficltyLevel" },
          measures: { $first: "$measures" },
          type: { $first: "$type" }
        }
      },
      {
        $match: filter_object.columnFilter
      },
      { $skip: skip },
      { $limit: filter_object.pageSize },
      { $sort: filter_obj.columnSort }
    ]);

    if (filtered_data) {
      return {
        status: 1,
        message: "filtered data is found",
        count: searched_record_count.length,
        filtered_total_pages: Math.ceil(
          searched_record_count.length / filter_obj.pageSize
        ),
        filtered_exercises: filtered_data
      };
    } else {
      return { status: 2, message: "No filtered data available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while filtering data",
      error: err
    };
  }
};

module.exports = exercise_helper;
