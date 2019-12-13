var NutritionProgramsRating = require("./../models/user_nutrition_programs_rating");
var user_nutrition_programs_rating_helper = {};
/**
 * Save program rating (it will serve both add and update)
 * @param object program rating object to save
 * @returns object status -> 1 = success with new data
 *                 status -> 0 = error
 */
user_nutrition_programs_rating_helper.save_program_rating = async program_rating_obj => {
  try {
    let selectCondition = {
      programId: program_rating_obj.programId,
      userId: program_rating_obj.userId
    };
    let result = await find_programs_ratings(selectCondition);
    if (result && result.status && result.status === 1) {
      let newData = null;
      let prevData = result.data;
      if (prevData && prevData.length > 0) {
        let condition = { _id: prevData[0]._id };
        newData = await NutritionProgramsRating.findOneAndUpdate(
          condition,
          program_rating_obj,
          { new: true }
        );
      } else {
        let newObj = new NutritionProgramsRating(program_rating_obj);
        newData = await newObj.save();
      }
      return {
        status: 1,
        message: "Success",
        data: newData
      };
    } else {
      return {
        status: 0,
        message: "Error while saving program rating",
        error: null
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error while saving program rating",
      error: err
    };
  }
};
async function find_programs_ratings(condition) {
  try {
    let result = await NutritionProgramsRating.find(condition);
    return {
      status: 1,
      message: "Success",
      data: result
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding programs ratings",
      error: err
    };
  }
}

module.exports = user_nutrition_programs_rating_helper;
