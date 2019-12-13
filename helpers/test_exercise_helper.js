var TestExercies = require("./../models/test_exercises");
var _ = require("underscore");
var test_exercise_helper = {};

/*
 * get_test_exercises is used to fetch all test_exercises data
 * @return  status 0 - If any internal error occured while fetching test_exercises data, with error
 *          status 1 - If test_exercises data found, with test_exercises object
 *          status 2 - If test_exercises not found, with appropriate message
 */
test_exercise_helper.get_test_exercises = async () => {
  try {
    var test_exercises = await TestExercies.find({
      isDeleted: 0
    });
    if (test_exercises) {
      return {
        status: 1,
        message: "test exercises found",
        test_exercises: test_exercises
      };
    } else {
      return {
        status: 2,
        message: "No test exercises available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding test exercises",
      error: err
    };
  }
};
/*
 * count_test_exercises is used to count all test_exercises data
 * @return  status 0 - If any internal error occured while counting test_exercises data, with error
 *          status 1 - If test_exercises data found, with test_exercises object
 *          status 2 - If test_exercises not found, with appropriate message
 */
test_exercise_helper.count_test_exercises = async (condition = {}) => {
  try {
    var count = await TestExercies.count(condition);
    return {
      status: 1,
      message: "test exercises counted",
      count
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding test exercises",
      error: err
    };
  }
};

/*
 * get_all_test_exercises is used to fetch all test_exercises data
 * @return  status 0 - If any internal error occured while fetching test_exercises data, with error
 *          status 1 - If test_exercises data found, with test_exercises object
 *          status 2 - If test_exercises not found, with appropriate message
 */
test_exercise_helper.get_all_test_exercises = async (condition = {}) => {
  try {
    var test_exercises = await TestExercies.find(condition);
    if (test_exercises) {
      test_exercises = _.groupBy(test_exercises, category => {
        return category.category;
      });

      test_exercises = _.mapObject(test_exercises, (exercise, category) => {
        exercise = _.groupBy(exercise, subCatgory => {
          return subCatgory.subCategory;
        });
        return exercise;
      });

      return {
        status: 1,
        message: "test exercises found",
        test_exercises: test_exercises
      };
    } else {
      return {
        status: 2,
        message: "No test exercises available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding test exercises",
      error: err
    };
  }
};

test_exercise_helper.get_all_test_exercises_list = async (condition = {}) => {
  try {
    var test_exercises = await TestExercies.find(condition);
    if (test_exercises) {
      return {
        status: 1,
        message: "test exercises found",
        all_test: test_exercises
      };
    } else {
      return {
        status: 2,
        message: "No test exercises available",
        all_test: []
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding test exercises",
      error: err
    };
  }
};

/*
 * get_test_exerice_id is used to fetch test_exercise by ID
 * @return  status 0 - If any internal error occured while fetching test_exercise data, with error
 *          status 1 - If test_exercise data found, with test_exercise object
 *          status 2 - If test_exercise data not found, with appropriate message
 */
test_exercise_helper.get_test_exercise_id = async id => {
  try {
    var test_exercise = await TestExercies.findOne(id);
    if (test_exercise) {
      return {
        status: 1,
        message: "test exercise found",
        test_exercise: test_exercise
      };
    } else {
      return {
        status: 2,
        message: "No test exercise available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding test exercise ",
      error: err
    };
  }
};

/*
 * insert_test_exericse is used to insert into test_exercise collection
 * @param   test_exericse     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting test_exercise, with error
 *          status  1 - If test_exercise inserted, with inserted test_exercise document and appropriate message
 * @developed by "amc"
 */
test_exercise_helper.insert_test_exercise = async test_exercise_obj => {
  let test_exercise = new TestExercies(test_exercise_obj);
  try {
    let test_exercise_data = await test_exercise.save();
    return {
      status: 1,
      message: "Test exercise inserted",
      test_exercise: test_exercise_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting test exercise",
      error: err
    };
  }
};

/*
 * update_test_exercise_by_id is used to update test_exercise data based on test_exercise_id
 * @param   test_exercise_id         String  _id of test_exercise that need to be update
 * @param   test_exercise_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating test_exercise, with error
 *          status  1 - If test_exercise updated successfully, with appropriate message
 *          status  2 - If test_exercise not updated, with appropriate message
 * @developed by "amc"
 */
test_exercise_helper.update_test_exercise_by_id = async (
  test_exercise_id,
  test_exercise_obj
) => {
  try {
    let test_exercise = await TestExercies.findOneAndUpdate(
      {
        _id: test_exercise_id
      },
      test_exercise_obj,
      {
        new: true
      }
    );
    if (!test_exercise) {
      return {
        status: 2,
        message: "Record has not updated"
      };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        test_exercise: test_exercise
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating test exercise",
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
test_exercise_helper.get_filtered_records = async filter_obj => {
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await TestExercies.aggregate([
      {
        $match: filter_object.columnFilter
      }
    ]);
    var filtered_data = await TestExercies.aggregate([
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
      }
    ]);

    if (filtered_data) {
      return {
        status: 1,
        message: "filtered data is found",
        count: searched_record_count.length,
        filtered_total_pages: Math.ceil(
          searched_record_count.length / filter_obj.pageSize
        ),
        filtered_test_exercises: filtered_data
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

module.exports = test_exercise_helper;
