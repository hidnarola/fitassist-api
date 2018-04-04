var Ingredients = require("./../models/ingredients");
var ingredients_helper = {};

/*
 * get_all_body_parts is used to fetch all body_parts data
 * 
 * @return  status 0 - If any internal error occured while fetching body_parts data, with error
 *          status 1 - If body_parts data found, with body_parts object
 *          status 2 - If body_parts not found, with appropriate message
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
 * get_body_part_id is used to fetch Body Part by ID
 * 
 * @return  status 0 - If any internal error occured while fetching body part data, with error
 *          status 1 - If Body parts data found, with body part object
 *          status 2 - If Body parts data not found, with appropriate message
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
 * insert_body_part is used to insert into bodyparts collection
 * 
 * @param   body_part_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting Body part, with error
 *          status  1 - If Body part inserted, with inserted Body part document and appropriate message
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
 * update_bodypart_by_id is used to update bodypart data based on body_part_id
 * 
 * @param   body_part_id         String  _id of bodypart that need to be update
 * @param   body_part_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating bodypart, with error
 *          status  1 - If bodypart updated successfully, with appropriate message
 *          status  2 - If bodypart not updated, with appropriate message
 * 
 * @developed by "amc"
 */
ingredients_helper.update_ingredient_by_id = async (ingredient_id, ingredient_obj) => {
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
 * delete_bodypart_by_id is used to delete bodypart from database
 * 
 * @param   bodypart_id String  _id of bodypart that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of bodypart, with error
 *          status  1 - If bodypart deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
ingredients_helper.delete_ingredient_by_id = async (ingredient_id) => {
    try {
        let resp = await BodyPart.findOneAndRemove({ _id: bodypart_id });
        if (!resp) {
            return { "status": 2, "message": "Bodypart not found" };
        } else {
            return { "status": 1, "message": "Bodypart deleted" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while deleting Bodypart", "error": err };
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
    console.log(filter_obj);
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
  
      var filtered_data = await Ingredients.find(andFilterObj)
        .sort(filter_obj.columnSort)
        .limit(filter_obj.pageSize)
        .skip(skip)
        .exec();
  
      if (filtered_data) {
        return {
          status: 1,
          message: "filtered data is found",
          count: searched_record_count,
          filtered_total_pages: Math.ceil(total_count / filter_obj.pageSize),
          filtered_ingredient: filtered_data
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