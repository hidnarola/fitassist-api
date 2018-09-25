var Exercise_preference = require("./../models/exercise_preferences");
var exercise_preference_helper = {};

/*
 * get_exercise_preference_by_user_id is used to fetch exercise_preference by user ID
 * 
 * @return  status 0 - If any internal error occured while fetching exercise_preference data, with error
 *          status 1 - If exercise_preference data found, with exercise_preference object
 *          status 2 - If exercise_preference data not found, with appropriate message
 */
exercise_preference_helper.get_exercise_preference_by_user_id = async id => {
  try {
    var exercise_preference = await Exercise_preference.aggregate([{
      $match: id
    }]);
    if (exercise_preference && exercise_preference.length > 0) {
      return {
        status: 1,
        message: "exercise_preference found",
        exercise_preference: exercise_preference[0]
      };
    } else {
      return {
        status: 2,
        message: "exercise_preference not available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding exercise_preference ",
      error: err
    };
  }
};

/*
 * insert_prefernece is used to insert into exercise preference
 * @param   preference_object     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting preference, with error
 *          status  1 - If prefernece inserted, with inserted prefernece document and appropriate message
 * @developed by "amc"
 */
exercise_preference_helper.insert_exercise_prefernece = async exercise_preference_object => {
  let exercise_preference = new Exercise_preference(exercise_preference_object);
  try {
    let preference_data = await exercise_preference.save();
    return {
      status: 1,
      message: "User's exercise preference inserted",
      exercise_preference: preference_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user's exercise prefernece",
      error: err
    };
  }
};

/*
 * update_exercise_preference_by_userid is used to update exercise_preference data based on exercise_preference_id
 * @param   exercise_preference_id         String  _id of nutrition that need to be update
 * @param   exercise_preference_object     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating nutrition preference, with error
 *          status  1 - If exercise_preference pr updated successfully, with appropriate message
 *          status  2 - If exercise_preference not updated, with appropriate message
 * @developed by "amc"
 */
exercise_preference_helper.update_exercise_preference_by_userid = async (
  authUserId,
  exercise_preference_object
) => {
  try {
    let exercise_preference = await Exercise_preference.findOneAndUpdate({
        userId: authUserId
      },
      exercise_preference_object, {
        new: true
      }
    );
    if (!exercise_preference) {
      return {
        status: 2,
        message: "Record has not updated"
      };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        exercise_preference: exercise_preference
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating exercise_preference",
      error: err
    };
  }
};

module.exports = exercise_preference_helper;