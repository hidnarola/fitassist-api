var Nutrition = require("./../models/nutritions");
var nutrition_helper = {};

/*
 * get_all_nutrition is used to fetch all nutrition
 * 
 * @return  status 0 - If any internal error occured while fetching nutrition data, with error
 *          status 1 - If nutrition data found, with nutrition object
 *          status 2 - If nutrition not found, with appropriate message
 */
nutrition_helper.get_all_nutrition = async () => {
  try {
    var nutrition = await Nutrition.find();
    if (nutrition) {
      return {
        status: 1,
        message: "Nutrition's details found",
        nutritions: nutrition
      };
    } else {
      return { status: 2, message: "No nutrition available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding nutrition",
      error: err
    };
  }
};

/*
 * get_nutrition_by_id is used to fetch get_nutrition by ID
 * 
 * @return  status 0 - If any internal error occured while fetching nutrition data, with error
 *          status 1 - If nutrition data found, with nutrition object
 *          status 2 - If nutrition data not found, with appropriate message
 */
nutrition_helper.get_nutrition_by_id = async nutrition_id => {
  try {
    let resp = await Nutrition.findOne({ _id: nutrition_id });
    if (!resp) {
      return { status: 2, message: "Nutrition not found" };
    } else {
      return { status: 1, message: "Nutrition found", nutrition: resp };
    }
  } catch (err) {
    return { status: 0, error: err };
  }
};

/*
 * insert_nutrition is used to insert into nutrition collection
 * 
 * @param   nutrition_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting nutrition, with error
 *          status  1 - If nutrition inserted, with inserted nutrition's document and appropriate message
 * 
 * @developed by "amc"
 */
nutrition_helper.insert_nutrition = async nutrition_object => {
  let nutrition = new Nutrition(nutrition_object);
  try {
    let nutrition_data = await nutrition.save();
    return {
      status: 1,
      message: "Nutrition inserted",
      nutrition: nutrition_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting nutrition",
      error: err
    };
  }
};

/*
 * update_nutrition_by_id is used to update nutrition data based on nutrition_id
 * 
 * @param   nutrition_id         String  _id of nutrition that need to be update
 * @param   nutrition_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating nutrition, with error
 *          status  1 - If Nutrition updated successfully, with appropriate message
 *          status  2 - If Nutrition not updated, with appropriate message
 * 
 * @developed by "amc"
 */
nutrition_helper.update_nutrition_by_id = async (
  nutrition_id,
  nutrition_object
) => {
  try {
    let nutrition = await Nutrition.findOneAndUpdate(
      { _id: nutrition_id },
      nutrition_object,
      { new: true }
    );
    if (!nutrition) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        nutrition: nutrition
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating nutrition",
      error: err
    };
  }
};

/*
 * delete_nutrition_by_id is used to delete nutrition from database
 * 
 * @param   nutrition_id String  _id of nutrition that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of nutrition, with error
 *          status  1 - If nutrition deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
nutrition_helper.delete_nutrition_by_id = async nutrition_id => {
  try {
    let resp = await Nutrition.findOneAndRemove({ _id: nutrition_id });
    if (!resp) {
      return { status: 2, message: "Nutrition not found" };
    } else {
      return { status: 1, message: "Nutrition deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting nutrition",
      error: err
    };
  }
};

module.exports = nutrition_helper;
