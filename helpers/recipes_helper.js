var Recipes = require("./../models/recipes");
var recipe_helper = {};

/*
 * get_recipes is used to fetch all Recipes data
 * 
 * @return  status 0 - If any internal error occured while fetching recipes data, with error
 *          status 1 - If recipes data found, with recipes object
 *          status 2 - If recipes not found, with appropriate message
 */
recipe_helper.get_all_recipes = async () => {
  try {
    var recipes = await Recipes.find();
    if (recipes) {
      return { status: 1, message: "recipes found", recipes: recipes };
    } else {
      return { status: 2, message: "No recipes available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding recipes",
      error: err
    };
  }
};

/*
 * get_recipe_by_id is used to fetch recipe by ID
 * 
 * @return  status 0 - If any internal error occured while fetching recipe data, with error
 *          status 1 - If recipe data found, with recipe object
 *          status 2 - If recipe data not found, with appropriate message
 */
recipe_helper.get_recipe_by_id = async id => {
  try {
    var recipe = await Recipes.findOne({ _id: id });
    if (recipe) {
      return { status: 1, message: "recipe found", recipe: recipe };
    } else {
      return { status: 2, message: "No recipe available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding recipe",
      error: err
    };
  }
};

/*
 * insert_body_part is used to insert into bodyparts collection
 * 
 * @param   body_part_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting Body part, with error
 *          status  1 - If Body part inserted, with inserted Body part document and appropriate message
 * 
 * @developed by "amc"
 */
recipe_helper.insert_recipes = async recipes_obj => {
  let recipe = new Recipes(recipes_obj);
  try {
    let recipe_data = await recipe.save();
    return { status: 1, message: "recipe inserted", recipe: recipe_data };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting recipe",
      error: err
    };
  }
};

/*
 * update_recipes_by_id is used to update recipe data based on recipes_id
 * 
 * @param   recipes_id         String  _id of recipe that need to be update
 * @param   recipes_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating recipe, with error
 *          status  1 - If recipe updated successfully, with appropriate message
 *          status  2 - If recipe not updated, with appropriate message
 * 
 * @developed by "amc"
 */
recipe_helper.update_recipes_by_id = async (recipes_id, recipes_obj) => {
  try {
    let recipe_data = await Recipes.findOneAndUpdate(
      { _id: recipes_id },
      recipes_obj,
      { new: true }
    );
    if (!recipe_data) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        recipe: recipe_data
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating recipe_data",
      error: err
    };
  }
};

/*
 * delete_bodypart_by_id is used to delete bodypart from database
 * 
 * @param   bodypart_id String  _id of bodypart that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of bodypart, with error
 *          status  1 - If bodypart deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
recipe_helper.delete_recipes_by_id = async recipes_id => {
  try {
    let resp = await Recipes.findOneAndRemove({ _id: recipes_id });
    if (!resp) {
      return { status: 2, message: "Recipe not found" };
    } else {
      return { status: 1, message: "Recipe deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting Recipe",
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
recipe_helper.get_filtered_records = async filter_obj => {
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Recipes.aggregate([
      {
        $match: filter_object.columnFilter
      }
    ]);

    var filtered_data = await Recipes.aggregate([
      {
        $match: filter_object.columnFilter
      },
      { $sort: filter_obj.columnSort },
      { $skip: skip },
      { $limit: filter_object.pageSize },
    ]);

    if (filtered_data) {
      return {
        status: 1,
        message: "filtered data is found",
        count: searched_record_count.length,
        filtered_total_pages: Math.ceil(
          searched_record_count.length / filter_obj.pageSize
        ),
        filtered_recipes: filtered_data
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
module.exports = recipe_helper;
