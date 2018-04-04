var Ingredients = require("./../models/ingredients");
var ingredients_helper = {};

/*
 * get_all_ingredients is used to fetch all ingredients data
 * 
 * @return  status 0 - If any internal error occured while fetching ingredients data, with error
 *          status 1 - If ingredients data found, with ingredients object
 *          status 2 - If ingrediens not found, with appropriate message
 */
ingredients_helper.get_all_ingredients = async () => {
    try {
        var ingredients = await Ingredients.find();
        if (ingredients) {
            return { "status": 1, "message": "ingredients found", "ingredients": ingredients };
        } else {
            return { "status": 2, "message": "No ingredients available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding ingredients", "error": err }
    }
}


/*
 * get_ingredient_id is used to fetch ingredient by ID
 * 
 * @return  status 0 - If any internal error occured while fetching ingredient data, with error
 *          status 1 - If ingredient data found, with ingredient object
 *          status 2 - If ingredient data not found, with appropriate message
 */
ingredients_helper.get_ingredient_id = async (id) => {
    try {
        var ingredient = await Ingredients.findOne({_id:id});
        if (ingredient) {
            return { "status": 1, "message": "ingredient found", "ingredient": ingredient };
        } else {
            return { "status": 2, "message": "No ingredient available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding ingredient", "error": err }
    }
}

/*
 * insert_ingredient is used to insert into ingredients collection
 * 
 * @param   ingredient_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting ingredient, with error
 *          status  1 - If ingredient inserted, with inserted ingredient document and appropriate message
 * 
 * @developed by "amc"
 */
ingredients_helper.insert_ingredient = async (ingredient_obj) => {
    console.log(ingredient_obj);
    let ingredient = new Ingredients(ingredient_obj);
    try {
        let ingredient_data = await ingredient.save();
        return { "status": 1, "message": "ingredient inserted", "ingredient": ingredient_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting ingredient", "error": err };
    }
};

/*
 * update_ingredient is used to update ingredient data based on ingredient_id
 * 
 * @param   ingredient_id         String  _id of ingredient that need to be update
 * @param   ingredient_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating ingredient, with error
 *          status  1 - If ingredient updated successfully, with appropriate message
 *          status  2 - If ingredient not updated, with appropriate message
 * 
 * @developed by "amc"
 */
ingredients_helper.update_ingredient = async (ingredient_id, ingredient_obj) => {
    console.log(ingredient_obj);
    try {
        let ingredient = await Ingredients.findOneAndUpdate({ _id: ingredient_id }, ingredient_obj, { new: true });
        if (!ingredient) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "ingredient": ingredient };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating ingredient", "error": err }
    }
};

/*
 * delete_ingredient_by_id is used to delete Ingredient from database
 * 
 * @param   ingredient_id String  _id of Ingredient that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of Ingredient, with error
 *          status  1 - If Ingredient deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
ingredients_helper.delete_ingredient_by_id = async (ingredient_id) => {
    try {
        let resp = await Ingredients.findOneAndRemove({ _id: ingredient_id });
        if (!resp) {
            return { "status": 2, "message": "Ingredient not found" };
        } else {
            return { "status": 1, "message": "Ingredient deleted" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while deleting Ingredient", "error": err };
    }
}


/*
 * get_filtered_records is used to fetch all filtered data
 * 
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
ingredients_helper.get_filtered_records = async (filter_obj) => {
    //console.log(filter_obj);
    queryObj = {};
    if (filter_obj.columnFilter && filter_obj.columnFilter.length > 0) {
      queryObj = filter_obj.columnFilter;
    }
  
    equalTo = {};
    if (filter_obj.columnFilterEqual && filter_obj.columnFilterEqual.length > 0) {
      equalTo = filter_obj.columnFilterEqual;
    }
    skip = filter_obj.pageSize * filter_obj.page;
    try {
      total_count = await Ingredients.count({}, function(err, cnt) {
        return cnt;
      });
      // var filtered_data = await Exercise.find(queryObj).sort(filter_obj.columnSort).limit(filter_obj.pageSize).skip(skip).exec();
  
      var andFilterArr = [];
      if (queryObj && queryObj.length > 0) {
        andFilterArr.push({ $and: queryObj });
      }
  
      if (equalTo && equalTo.length > 0) {
        andFilterArr.push({ $and: equalTo });
      }
      var andFilterObj = {};
      if (andFilterArr && andFilterArr.length > 0) {
        andFilterObj = { $and: andFilterArr };
      }
    var searched_record_count = await Ingredients.find(andFilterObj).count();
    //   var searched_record_count = await Ingredients.aggregate([
    //     {
    //       $match: filter_object.columnFilter,
    //     }
    //   ]);
      console.log(searched_record_count.length);
    //   var filtered_data = await Ingredients.find(andFilterObj)
    //     .sort(filter_obj.columnSort)
    //     .limit(filter_obj.pageSize)
    //     .skip(skip)
    //     .exec();

       var filtered_data = await Ingredients.aggregate([
      {
        $match: filter_object.columnFilter,
      },
      { $limit: filter_object.pageSize },
      { $skip: skip },
      { $sort: filter_obj.columnSort }
    ]);


  
      if (filtered_data) {
        return {
          status: 1,
          message: "filtered data is found",
          count: searched_record_count,
          filtered_total_pages: Math.ceil(total_count / filter_obj.pageSize),
          filtered_ingredients: filtered_data
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


module.exports = ingredients_helper;