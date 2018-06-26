var UsersNutritions = require("./../models/users_nutritions");
var users_nutritions_helper = {};

/*
 * get_user_nutritions_by_id is used to fetch all user_nutritions by ID
 * 
 * @return  status 0 - If any internal error occured while fetching user's nutritions data, with error
 *          status 1 - If user's nutritions data found, with user's nutritions object
 *          status 2 - If user's nutritions not found, with appropriate message
 */
users_nutritions_helper.get_user_nutritions_by_id = async condition => {
  try {
    var user_nutritions = await UsersNutritions.findOne(condition);
    if (user_nutritions) {
      return {
        status: 1,
        message: "user's nutritions details found",
        user_nutritions: user_nutritions
      };
    } else {
      return { status: 2, message: "No user's nutritions available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's nutritions",
      error: err
    };
  }
};

/*
 * insert_user_nutritions is used to insert into user_nutritionss collection
 * 
 * @param   user_nutritions_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting user's nutritions, with error
 *          status  1 - If user's nutritions inserted, with inserted user's nutritions document and appropriate message
 * 
 * @developed by "amc"
 */
users_nutritions_helper.insert_user_nutritions = async user_nutritions_object => {
  let user_nutritions = new UsersNutritions(user_nutritions_object);
  try {
    let user_nutritions_data = await user_nutritions.save();
    return {
      status: 1,
      message: "user's nutritions inserted",
      user_nutritions: user_nutritions_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user nutritions",
      error: err
    };
  }
};

/*
 * update_user_nutritions is used to update user_nutritionss collection
 * 
 * @param   id JSON object consist of all property that need to update in collection
 * @param   nutrition_obj JSON object consist of all property that need to update in collection
 * 
 * @return  status  0 - If any error occur in updating user's nutritions, with error
 *          status  1 - If user's nutritions updated, with updated user's nutritions document and appropriate message
 * 
 * @developed by "amc"
 */
users_nutritions_helper.update_user_nutritions = async (id, nutrition_obj) => {
  try {
    let user_nutritions_data = await UsersNutritions.updateOne(
      id,
      nutrition_obj,
      {
        new: true
      }
    );

    if (!user_nutritions_data && user_nutritions_data.n == 0) {
      return { status: 2, message: "nutritions not found" };
    } else {
      return {
        status: 1,
        message: "nutritions is updated"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user's nutritions",
      error: err
    };
  }
};

module.exports = users_nutritions_helper;
