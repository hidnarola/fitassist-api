var Exercise = require("./../models/exercise");
var exercise_helper = {};

/*
 * get_all_exercise is used to fetch all exercise data
 * @return  status 0 - If any internal error occured while fetching exercise data, with error
 *          status 1 - If exercise data found, with exercise object
 *          status 2 - If exercise not found, with appropriate message
 */
exercise_helper.get_all_exercise = async (condition = {}, project = {}) => {
  try {
    var exercise = await Exercise.find(condition, project);
    if (exercise) {
      return {
        status: 1,
        message: "Exercise found",
        exercises: exercise
      };
    } else {
      return {
        status: 2,
        message: "No exercise available"
      };
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
 * count_exercises is used to count all exercise data
 * @return  status 0 - If any internal error occured while couting exercise data, with error
 *          status 1 - If exercise data found, with exercise count
 *          status 2 - If exercise not found, with appropriate message
 */
exercise_helper.count_exercises = async (condition = {}) => {
  try {
    var count = await Exercise.count(condition);
    return {
      status: 1,
      message: "Exercise counted",
      count
    };
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
 * @return  status 0 - If any internal error occured while fetching exercise data, with error
 *          status 1 - If exercise data found, with exercise object
 *          status 2 - If exercise not found, with appropriate message
 */
exercise_helper.get_all_exercise_for_user = async (condition = {}) => {
  try {
    var exercise = await Exercise.aggregate([{
        $match: condition
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
        $group: {
          _id: "$_id",
          name: {
            $push: "$name"
          },
          // cols:filter_object.columnFilter,
          otherMuscleGroup: {
            $addToSet: "$otherMuscleGroup.bodypart"
          },
          detailedMuscleGroup: {
            $addToSet: "$detailedMuscleGroup.bodypart"
          },
          detailedMuscleGroup: {
            $addToSet: "$detailedMuscleGroup.bodypart"
          },
          equipments: {
            $addToSet: "$equipments.name"
          },
          mainMuscleGroup: {
            $first: "$mainMuscleGroup.bodypart"
          },
          name: {
            $first: "$name"
          },
          category: {
            $first: "$category"
          },
          subCategory: {
            $first: "$subCategory"
          },
          description: {
            $first: "$description"
          },
          mechanics: {
            $first: "$mechanics"
          },
          difficltyLevel: {
            $first: "$difficltyLevel"
          }
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
      return {
        status: 2,
        message: "No exercise available"
      };
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
 * @return  status 0 - If any internal error occured while fetching exercise data, with error
 *          status 1 - If exercise data found, with exercise object
 *          status 2 - If exercise not found, with appropriate message
 */
exercise_helper.get_exercise_id = async (id, flag = 0) => {
  try {
    var exercise = await Exercise.aggregate([{
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
        $group: {
          _id: "$_id",
          name: {
            $push: "$name"
          },
          // cols:filter_object.columnFilter,
          otherMuscleGroup: {
            $addToSet: "$otherMuscleGroup._id"
          },
          detailedMuscleGroup: {
            $addToSet: "$detailedMuscleGroup._id"
          },
          detailedMuscleGroup: {
            $addToSet: "$detailedMuscleGroup._id"
          },
          equipments: {
            $addToSet: "$equipments._id"
          },
          category: {
            $first: "$category"
          },
          subCategory: {
            $first: "$subCategory"
          },
          mainMuscleGroup: {
            $first: "$mainMuscleGroup._id"
          },
          name: {
            $first: "$name"
          },
          description: {
            $first: "$description"
          },
          images: {
            $first: "$images"
          },
          steps: {
            $first: "$steps"
          },
          tips: {
            $first: "$tips"
          },
          mechanics: {
            $first: "$mechanics"
          },
          difficltyLevel: {
            $first: "$difficltyLevel"
          },
          status: {
            $first: "$status"
          }
        }
      }
    ]);

    if (exercise) {
      return {
        status: 1,
        message: "Exercise found",
        exercise: flag ? exercise : exercise[0]
      };
    } else {
      return {
        status: 2,
        message: "No exercise available"
      };
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
 * insert_exercise is used to insert into exercise collection
 * @param   exercise     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting exercise, with error
 *          status  1 - If exercise inserted, with inserted exercise document and appropriate message
 * @developed by "amc"
 */
exercise_helper.insert_exercise = async exercise_object => {
  let exercise = new Exercise(exercise_object);
  try {
    let exercise_data = await exercise.save();
    return {
      status: 1,
      message: "Exercise inserted",
      exercise: exercise_data
    };
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
 * @return  status  0 - If any error occur in updating exercise, with error
 *          status  1 - If Exercise updated successfully, with appropriate message
 *          status  2 - If Exercise not updated, with appropriate message
 * @developed by "amc"
 */
exercise_helper.update_exercise_by_id = async (
  exercise_id,
  exercise_object
) => {
  try {
    let exercise = await Exercise.findByIdAndUpdate({
        _id: exercise_id
      },
      exercise_object, {
        new: true
      }
    );
    if (!exercise) {
      return {
        status: 2,
        message: "Record has not updated"
      };
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
 * @param   exercise_id String  _id of exercise that need to be delete
 * @return  status  0 - If any error occur in deletion of exercise, with error
 *          status  1 - If exercise deleted successfully, with appropriate message
 * @developed by "amc"
 */
exercise_helper.delete_exercise_by_id = async exercise_id => {
  try {
    let resp = await Exercise.findOneAndRemove({
      _id: exercise_id
    });
    if (!resp) {
      return {
        status: 2,
        message: "Exercise not found"
      };
    } else {
      return {
        status: 1,
        message: "Exercise deleted"
      };
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
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
exercise_helper.get_filtered_records = async filter_obj => {
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Exercise.aggregate([{
      $match: filter_object.columnFilter
    }]);
    var filtered_data = await Exercise.aggregate([{
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
        $group: {
          _id: "$_id",
          name: {
            $push: "$name"
          },
          category: {
            $first: "$category"
          },
          subCategory: {
            $first: "$subCategory"
          },
          mainMuscle: {
            $first: "$mainMuscle"
          },
          name: {
            $first: "$name"
          },
          description: {
            $first: "$description"
          },
          mainMuscleGroup: {
            $first: "$mainMuscleGroup"
          },
          mechanics: {
            $first: "$mechanics"
          },
          difficltyLevel: {
            $first: "$difficltyLevel"
          },
          status: {
            $first: "$status"
          },
          isDeleted: {
            $first: "$isDeleted"
          },
          createdAt: {
            $first: "$createdAt"
          }
        }
      },
      {
        $match: filter_object.columnFilter
      },
      {
        $sort: filter_obj.columnSort
      },
      {
        $skip: skip
      },
      {
        $limit: filter_object.pageSize
      },

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
      return {
        status: 2,
        message: "No filtered data available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while filtering data",
      error: err
    };
  }
};



// /*
//  * get_exercise_id is used to fetch exercise by ID
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
module.exports = exercise_helper;