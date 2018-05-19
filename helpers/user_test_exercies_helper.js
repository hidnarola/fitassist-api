var User_test_exercise = require("./../models/user_test_exercise");
var user_test_exercise_helper = {};

/*
 * get_user_test_exercies_by_user_id is used to fetch user_test_exercies by user ID
 * 
 * @return  status 0 - If any internal error occured while fetching user_test_exercies data, with error
 *          status 1 - If user_test_exercies data found, with user_test_exercies object
 *          status 2 - If user_test_exercies data not found, with appropriate message
 */
user_test_exercise_helper.get_user_test_exercies_by_user_id = async id => {
  try {
    var user_test_exercises = await User_test_exercise.find(id);
    if (user_test_exercises) {
      return {
        status: 1,
        message: "user_test_exercies found",
        user_test_exercises: user_test_exercises
      };
    } else {
      return { status: 2, message: "user_test_exercies not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user_test_exercies ",
      error: err
    };
  }
};

/*
 * insert_user_test_exercies is used to insert into user_test_exercies
 * 
 * @param   user_test_exercies_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting user_test_exercies, with error
 *          status  1 - If prefernece inserted, with inserted prefernece document and appropriate message
 * 
 * @developed by "ar"
 */
user_test_exercise_helper.insert_user_test_exercies = async user_test_exercies_array => {
  
  try {
    let user_recipe_data = await User_test_exercise.insertMany(user_test_exercies_array);    
    return {
      status: 1,
      message: "User's test exercise inserted",
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user's test exercise prefernece",
      error: err
    };
  }
};

/*
 * update_user_test_exercies is used to delete user_test_exercies data based on user_test_exercise_id
 * 
 * @param   user_test_exercise_id         String  _id of user's test exercise that need to be delete
 * @param   nutrition_preferences_object     JSON    object consist of all property that need to delete
 * 
 * @return  status  0 - If any error occur in updating user's test exercise preference, with error
 *          status  1 - If user's test exercise preference pr updated successfully, with appropriate message
 *          status  2 - If user's test exercise preference not updated, with appropriate message
 * 
 * @developed by "amc"
 */
user_test_exercise_helper.update_user_test_exercies = async (
  authUserId,
  user_test_exercies_obj
) => {
  try {
    let user_test_exercies = await User_test_exercise.findOneAndUpdate(
      { userId: authUserId },
      user_test_exercies_obj,
      { new: true }
    );
    if (!user_test_exercies) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        user_test_exercies: user_test_exercies
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user_test_exercies",
      error: err
    };
  }
};

/*
 * delete_user_test_exercies is used to delete user_test_exercies data based on user_test_exercise_id
 * 
 * @param   user_test_exercise_id         String  _id of user's test exercise that need to be delete
 * @param   nutrition_preferences_object     JSON    object consist of all property that need to delete
 * 
 * @return  status  0 - If any error occur in updating user's test exercise preference, with error
 *          status  1 - If user's test exercise preference pr updated successfully, with appropriate message
 *          status  2 - If user's test exercise preference not updated, with appropriate message
 * 
 * @developed by "amc"
 */
user_test_exercise_helper.delete_user_test_exercies = async authUserId => {

  try {
    let user_test_exercises = await User_test_exercise.remove(authUserId);
    if (!user_test_exercises) {
      return { status: 2, message: "Record has not deleted" };
    } else {
      return {
        status: 1,
        message: "Record has been deleted",
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting user_test_exercies",
      error: err
    };
  }
};
module.exports = user_test_exercise_helper;