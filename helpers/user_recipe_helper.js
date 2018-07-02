var UsersRecipe = require("./../models/users_recipe");
var users_recipe_helper = {};

/*
 * get_user_recipe_by_id is used to fetch all user_recipe by ID
 * 
 * @return  status 0 - If any internal error occured while fetching user's recipe data, with error
 *          status 1 - If user's recipe data found, with user's recipe object
 *          status 2 - If user's recipe not found, with appropriate message
 */
users_recipe_helper.get_user_recipe_by_id = async id => {
  try {
    var user_recipe = await UsersRecipe.find(id);
    if (user_recipe && user_recipe.length > 0) {
      return {
        status: 1,
        message: "user's recipe details found",
        todays_meal: user_recipe
      };
    } else {
      return { status: 2, message: "No user's recipe available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's recipe",
      error: err
    };
  }
};

/*
 * get_user_nutritions_by_id is used to fetch all user_recipe's nutrition
 * 
 * @return  status 0 - If any internal error occured while fetching user's recipe nutrition data, with error
 *          status 1 - If user's recipe nutrition data found, with user's recipe nutrition object
 *          status 2 - If user's recipe nutrition not found, with appropriate message
 */
users_recipe_helper.get_user_nutritions = async condition => {
  try {
    var user_nutrients = await UsersRecipe.aggregate([
      {
        $project: {
          _id: 1,
          isDeleted: 1,
          userId: 1,
          totalNutrients: 1,
          isCompleted: 1
        }
      },
      {
        $match: condition
      },
      { $unwind: "$totalNutrients" },
      {
        $group: {
          _id: "null",
          calories_total: { $sum: "$totalNutrients.ENERC_KCAL.quantity" },
          calories_average: { $avg: "$totalNutrients.ENERC_KCAL.quantity" },
          calories_most: { $max: "$totalNutrients.ENERC_KCAL.quantity" },
          calories_least: { $min: "$totalNutrients.ENERC_KCAL.quantity" },
          saturated_total: { $sum: "$totalNutrients.FASAT.quantity" },
          saturated_average: { $avg: "$totalNutrients.FASAT.quantity" },
          saturated_most: { $sum: "$totalNutrients.FASAT.quantity" },
          saturated_least: { $sum: "$totalNutrients.FASAT.quantity" },
          trans_total: { $sum: "$totalNutrients.FATRN.quantity" },
          trans_average: { $avg: "$totalNutrients.FATRN.quantity" },
          trans_most: { $sum: "$totalNutrients.FATRN.quantity" },
          trans_least: { $sum: "$totalNutrients.FATRN.quantity" },
          folate_total: { $sum: "$totalNutrients.FOLDFE.quantity" },
          folate_average: { $avg: "$totalNutrients.FOLDFE.quantity" },
          folate_most: { $sum: "$totalNutrients.FOLDFE.quantity" },
          folate_least: { $sum: "$totalNutrients.FOLDFE.quantity" },
          potassium_total: { $sum: "$totalNutrients.K.quantity" },
          potassium_average: { $avg: "$totalNutrients.K.quantity" },
          potassium_most: { $sum: "$totalNutrients.K.quantity" },
          potassium_least: { $sum: "$totalNutrients.K.quantity" },
          magnesium_total: { $sum: "$totalNutrients.MG.quantity" },
          magnesium_average: { $avg: "$totalNutrients.MG.quantity" },
          magnesium_most: { $sum: "$totalNutrients.MG.quantity" },
          magnesium_least: { $sum: "$totalNutrients.MG.quantity" },
          sodium_total: { $sum: "$totalNutrients.NA.quantity" },
          sodium_average: { $avg: "$totalNutrients.NA.quantity" },
          sodium_most: { $sum: "$totalNutrients.NA.quantity" },
          sodium_least: { $sum: "$totalNutrients.NA.quantity" },
          protein_total: { $sum: "$totalNutrients.PROCNT.quantity" },
          protein_average: { $avg: "$totalNutrients.PROCNT.quantity" },
          protein_most: { $sum: "$totalNutrients.PROCNT.quantity" },
          protein_least: { $sum: "$totalNutrients.PROCNT.quantity" },
          calcium_total: { $sum: "$totalNutrients.CA.quantity" },
          calcium_average: { $avg: "$totalNutrients.CA.quantity" },
          calcium_most: { $sum: "$totalNutrients.CA.quantity" },
          calcium_least: { $sum: "$totalNutrients.CA.quantity" },
          carbs_total: { $sum: "$totalNutrients.CHOCDF.quantity" },
          carbs_average: { $avg: "$totalNutrients.CHOCDF.quantity" },
          carbs_most: { $sum: "$totalNutrients.CHOCDF.quantity" },
          carbs_least: { $sum: "$totalNutrients.CHOCDF.quantity" },
          cholesterol_total: { $sum: "$totalNutrients.CHOLE.quantity" },
          cholesterol_average: { $avg: "$totalNutrients.CHOLE.quantity" },
          cholesterol_most: { $sum: "$totalNutrients.CHOLE.quantity" },
          cholesterol_least: { $sum: "$totalNutrients.CHOLE.quantity" },
          polyunsaturated_total: { $sum: "$totalNutrients.FAPU.quantity" },
          polyunsaturated_average: { $avg: "$totalNutrients.FAPU.quantity" },
          polyunsaturated_most: { $sum: "$totalNutrients.FAPU.quantity" },
          polyunsaturated_least: { $sum: "$totalNutrients.FAPU.quantity" },
          monounsaturated_total: { $sum: "$totalNutrients.FAMS.quantity" },
          monounsaturated_average: { $avg: "$totalNutrients.FAMS.quantity" },
          monounsaturated_most: { $sum: "$totalNutrients.FAMS.quantity" },
          monounsaturated_least: { $sum: "$totalNutrients.FAMS.quantity" },
          iron_total: { $sum: "$totalNutrients.FE.quantity" },
          iron_average: { $avg: "$totalNutrients.FE.quantity" },
          iron_most: { $sum: "$totalNutrients.FE.quantity" },
          iron_least: { $sum: "$totalNutrients.FE.quantity" },
          fiber_total: { $sum: "$totalNutrients.FIBTG.quantity" },
          fiber_average: { $avg: "$totalNutrients.FIBTG.quantity" },
          fiber_most: { $sum: "$totalNutrients.FIBTG.quantity" },
          fiber_least: { $sum: "$totalNutrients.FIBTG.quantity" }
        }
      }
    ]);
    if (user_nutrients) {
      return {
        status: 1,
        message: "user's nutrients details found",
        user_nutrients: user_nutrients
      };
    } else {
      return { status: 2, message: "No user's nutrients available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's nutrients",
      error: err
    };
  }
};
/*
 * get_user_recipe_by_recipe_id is used to fetch all user_recipe by recipe ID
 * 
 * @return  status 0 - If any internal error occured while fetching user's recipe data, with error
 *          status 1 - If user's recipe data found, with user's recipe object
 *          status 2 - If user's recipe not found, with appropriate message
 */
users_recipe_helper.get_user_recipe_by_recipe_id = async id => {
  try {
    var user_recipe = await UsersRecipe.findOne(id);
    if (user_recipe) {
      return {
        status: 1,
        message: "user's recipe details found",
        user_recipe: user_recipe
      };
    } else {
      return { status: 2, message: "No user's recipe available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's recipe",
      error: err
    };
  }
};
/*
 * insert_user_recipe is used to insert into user_recipes collection
 * 
 * @param   user_recipe_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting user's recipe, with error
 *          status  1 - If user's recipe inserted, with inserted user's recipe document and appropriate message
 * 
 * @developed by "amc"
 */
users_recipe_helper.insert_user_recipe = async user_recipe_object => {
  let user_recipe = new UsersRecipe(user_recipe_object);
  try {
    let user_recipe_data = await UsersRecipe.insertMany(user_recipe_object);
    return {
      status: 1,
      message: "user's recipe inserted",
      user_recipe: user_recipe_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user_recipe",
      error: err
    };
  }
};

/*
 * complete_recipe is used to Complete user_recipes collection
 * 
 * @param   id     JSON object consist of all property that need to complete in collection
 * 
 * @return  status  0 - If any error occur in completing user's recipe, with error
 *          status  1 - If user's recipe completed, with completed user's recipe document and appropriate message
 * 
 * @developed by "amc"
 */
users_recipe_helper.complete_recipe = async condition => {
  try {
    let user_recipe_data = await UsersRecipe.updateMany(
      condition,
      {
        isCompleted: 1
      },
      {
        new: true
      }
    );

    if (!user_recipe_data && user_recipe_data.n == 0) {
      return { status: 2, message: "recipe not found" };
    } else {
      return {
        status: 1,
        message: "recipe is completed"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while completing user's recipe",
      error: err
    };
  }
};

/*
 * delete_user_recipe is used to delete user_recipes collection
 * 
 * @param   id     JSON object consist of all property that need to delete in collection
 * 
 * @return  status  0 - If any error occur in deleting user's recipe, with error
 *          status  1 - If user's recipe deleted, with deleted user's recipe document and appropriate message
 * 
 * @developed by "amc"
 */
users_recipe_helper.delete_user_recipe = async id => {
  try {
    let user_recipe_data = await UsersRecipe.remove(id);

    if (!user_recipe_data && user_recipe_data.n == 0) {
      return { status: 2, message: "recipe not found" };
    } else {
      return {
        status: 1,
        message: "recipe is deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting user's recipe",
      error: err
    };
  }
};

module.exports = users_recipe_helper;
