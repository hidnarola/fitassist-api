var NutritionPreferences = require("./../models/nutrition_preferences");
var nutrition_preferences_helper = {};

/*
 * get_all_nutrition_preferences is used to fetch all nutrition preferences
 * 
 * @return  status 0 - If any internal error occured while fetching nutrition preferences data, with error
 *          status 1 - If nutrition preferences data found, with nutrition preferences object
 *          status 2 - If nutrition preferences not found, with appropriate message
 */
nutrition_preferences_helper.get_all_nutrition_preferences = async (userid={}) => {
  try {
    var nutrition_preferences = await NutritionPreferences.aggregate([
      {
        $match:userid
      },
      {
        $unwind: {
          path: "$dietRestrictionLabels",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$healthRestrictionLabels",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$nutritionTargets",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "nutritional_labels",
          localField: "dietRestrictionLabels",
          foreignField: "_id",
          as: "dietRestrictionLabels"
        }
      },
      {
        $unwind: {
          path: "$dietRestrictionLabels",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "nutritional_labels",
          localField: "healthRestrictionLabels",
          foreignField: "_id",
          as: "healthRestrictionLabels"
        }
      },
      {
        $unwind: {
          path: "$healthRestrictionLabels",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "nutritions",
          localField: "nutritionTargets.nutritionId",
          foreignField: "_id",
          as: "nutritionTargetsDetails"
        }
      },
      {
        $unwind: {
          path: "$nutritionTargetsDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id",
          dietRestrictionLabels: {
            $addToSet: "$dietRestrictionLabels.parameter"
          },
          healthRestrictionLabels: {
            $addToSet: "$healthRestrictionLabels.parameter"
          },
          excludeIngredients: { $first: "$excludeIngredients" },
          nutritionTargets: {
            $addToSet: {
              start: "$nutritionTargets.start",
              end: "$nutritionTargets.end",
              ntrCode: "$nutritionTargetsDetails.ntrCode",
              type: "$nutritionTargetsDetails.type"
            }
          },
          maxRecipeTime: { $addToSet: "$maxRecipeTime" },
          userId: { $first: "$userId" }
        }
      }
    ]);
    if (nutrition_preferences) {
      return {
        status: 1,
        message: "nutrition_preferences details found",
        nutrition_preferences: nutrition_preferences
      };
    } else {
      return { status: 2, message: "No nutrition_preferences available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding nutrition_preferences",
      error: err
    };
  }
};

/*
 * get_nutrition_preference_by_id is used to fetch get_nutrition_preference by ID
 * 
 * @return  status 0 - If any internal error occured while fetching nutrition_preference data, with error
 *          status 1 - If nutrition_preference data found, with nutrition_preference object
 *          status 2 - If nutrition_preference data not found, with appropriate message
 */
nutrition_preferences_helper.get_nutrition_preference_by_id = async id => {
  try {
    let resp = await NutritionPreferences.findOne(id);
    if (!resp) {
      return { status: 2, message: "Nutrition Preferences not found" };
    } else {
      return {
        status: 1,
        message: "Nutrition Preferences found",
        nutrition_preference: resp
      };
    }
  } catch (err) {
    return { status: 0, error: err };
  }
};

/*
 * get_nutrition_preference_by_user_id is used to fetch get_nutrition_preference by ID
 * 
 * @return  status 0 - If any internal error occured while fetching nutrition_preference data, with error
 *          status 1 - If nutrition_preference data found, with nutrition_preference object
 *          status 2 - If nutrition_preference data not found, with appropriate message
 */
nutrition_preferences_helper.get_nutrition_preference_by_user_id = async userid => {
  try {
    // look up aggregate mongoose
    let resp = await NutritionPreferences.findOne(userid);
    if (!resp || resp.length == 0) {
      return { status: 2, message: "Nutrition Preferences not found" };
    } else {
      return {
        status: 1,
        message: "Nutrition Preferences found",
        nutrition_preference: resp
      };
    }
  } catch (err) {
    return { status: 0, error: err };
  }
};

/*
 * insert_nutrition_preference is used to insert into nutrition_preferences collection
 * 
 * @param   nutrition_preferences_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting nutrition preference , with error
 *          status  1 - If nutrition_preference inserted, with inserted nutrition_preference's document and appropriate message
 * 
 * @developed by "amc"
 */
nutrition_preferences_helper.insert_nutrition_preference = async nutrition_preferences_object => {
  let nutrition_preference = new NutritionPreferences(
    nutrition_preferences_object
  );
  try {
    let nutrition_preference_data = await nutrition_preference.save();
    return {
      status: 1,
      message: "Nutrition preference inserted",
      nutrition_preference: nutrition_preference_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting nutrition preference",
      error: err
    };
  }
};

/*
 * update_nutrition_preference_by_id is used to update nutrition_preference data based on nutrition_preference_id
 * 
 * @param   nutrition_preference_id         String  _id of nutrition that need to be update
 * @param   nutrition_preferences_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating nutrition preference, with error
 *          status  1 - If Nutrition preference pr updated successfully, with appropriate message
 *          status  2 - If Nutrition preference not updated, with appropriate message
 * 
 * @developed by "amc"
 */
nutrition_preferences_helper.update_nutrition_preference_by_id = async (
  nutrition_preference_id,
  nutrition_preferences_object
) => {
  try {
    let nutrition_preference = await NutritionPreferences.findOneAndUpdate(
      { _id: nutrition_preference_id },
      nutrition_preferences_object,
      { new: true }
    );
    if (!nutrition_preference) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        nutrition_preference: nutrition_preference
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating nutrition_preference",
      error: err
    };
  }
};

/*
 * update_nutrition_preference_by_userid is used to update nutrition_preference data based on user_id
 * 
 * @param   user_id         String  user_id of nutrition that need to be update
 * @param   nutrition_preferences_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating nutrition preference, with error
 *          status  1 - If Nutrition preference pr updated successfully, with appropriate message
 *          status  2 - If Nutrition preference not updated, with appropriate message
 * 
 * @developed by "amc"
 */
nutrition_preferences_helper.update_nutrition_preference_by_userid = async (
  user_id,
  nutrition_preferences_object
) => {
  try {
    let nutrition_preference = await NutritionPreferences.findOneAndUpdate(
      { userId: user_id },
      nutrition_preferences_object,
      { new: true }
    );
    if (!nutrition_preference) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        nutrition_preference: nutrition_preference
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating nutrition_preference",
      error: err
    };
  }
};

/*
 * delete_nutrition_preference_by_id is used to delete nutrition_preference from database
 * 
 * @param   nutrition_preference_id String  _id of nutrition_preference that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of nutrition_preference, with error
 *          status  1 - If nutrition_preference deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
nutrition_preferences_helper.delete_nutrition_preference_by_id = async nutrition_preference_id => {
  try {
    let resp = await NutritionPreferences.findOneAndRemove({
      _id: nutrition_preference_id
    });
    if (!resp) {
      return { status: 2, message: "Nutrition Preferences not found" };
    } else {
      return { status: 1, message: "Nutrition Preferences deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting nutrition preferences",
      error: err
    };
  }
};

module.exports = nutrition_preferences_helper;
