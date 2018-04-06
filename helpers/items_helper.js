var Items = require("./../models/items");
var items_helper = {};



/*
 * get_all_items is used to fetch all items data
 * 
 * @return  status 0 - If any internal error occured while fetching items data, with error
 *          status 1 - If items data found, with items object
 *          status 2 - If items not found, with appropriate message
 */
items_helper.get_all_items = async () => {
    try {
        var items = await Items.find();
        if (items) {
            return { "status": 1, "message": "items found", "items": items };
        } else {
            return { "status": 2, "message": "No items available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding items", "error": err }
    }
}

/*
 * get_item_by_id is used to fetch Items details by Items id
 * 
 * @params  item_id     _id field of items collection
 * 
 * @return  status 0 - If any internal error occured while fetching items data, with error
 *          status 1 - If Items data found, with items object
 *          status 2 - If Items not found, with appropriate message
 */
items_helper.get_item_by_id = async (item_id) => {
    try {
        var item = await Items.findOne({ "_id": { "$eq": item_id } });
        if (item) {
            return { "status": 1, "message": "Item details found", "item": item };
        } else {
            return { "status": 2, "message": "Item not found" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding Item", "error": err }
    }
};


/*
 * insert_item is used to insert into items collection
 * 
 * @param   item_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting item, with error
 *          status  1 - If item inserted, with inserted item's document and appropriate message
 * 
 * @developed by "ar"
 */
items_helper.insert_item = async (item_object) => {
    let item = new Items(item_object)
    try{
        let item_data = await item.save();
        return { "status": 1, "message": "item inserted", "item": item_data };
    } catch(err){
        return { "status": 0, "message":"Error occured while inserting items","error": err };
    }
};

/*
 * update_item_by_id is used to update Item data based on Item_id
 * 
 * @param   Item_id         String  _id of Item that need to be update
 * @param   Item_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating Item, with error
 *          status  1 - If Item updated successfully, with appropriate message
 *          status  2 - If Item not updated, with appropriate message
 * 
 * @developed by "amc"
 */
items_helper.update_item_by_id = async (item_id, item_obj) => {
    try {
        let item = await Items.findOneAndUpdate({ _id: item_id }, item_obj);
        if (!item) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "item": item };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating item", "error": err }
    }
};


/*
 * delete_item_by_id is used to delete item data based on item_id
 * 
 * @param   item_id         String  _id of item that need to be update
 * @param   item_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating item, with error
 *          status  1 - If item updated successfully, with appropriate message
 *          status  2 - If item not updated, with appropriate message
 * 
 * @developed by "amc"
 */
items_helper.delete_item_by_id = async (item_id, item_obj) => {
    try {
        let item = await Items.findOneAndUpdate({ _id: item_id }, item_obj);
        if (!item) {
            return { "status": 2, "message": "Record has not Deleted" };
        } else {
            return { "status": 1, "message": "Record has been Deleted"};
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while deleting item", "error": err }
    }
};


/*
 * get_filtered_records is used to fetch all filtered data
 * 
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
items_helper.get_filtered_records = async (filter_obj) => {
    console.log(filter_obj);
    queryObj = {};
    if (filter_obj.columnFilter && filter_obj.columnFilter.length > 0) {
      queryObj = filter_obj.columnFilter;
    }
  
    equalTo = {};
    if (filter_obj.columnFilterEqual && filter_obj.columnFilterEqual.length > 0) {
      equalTo = filter_obj.columnFilterEqual;
    }
    var skip = filter_obj.pageSize * filter_obj.page;
    try {
    //   total_count = await Items.count({}, function(err, cnt) {
    //     return cnt;
    //   });
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

      
      var searched_record_count = await Items.aggregate([
        {
          $match: filter_object.columnFilter,
        }
      ]);
  
      var filtered_data = await Items.aggregate([
        {
          $match: filter_object.columnFilter,
        },
        { $skip: skip },
        { $limit: filter_object.pageSize },
        { $sort: filter_obj.columnSort }
        
      ]);
  
      if (filtered_data) {
        return {
          status: 1,
          message: "filtered data is found",
          count: searched_record_count.length,
          filtered_total_pages: Math.ceil(searched_record_count.length / filter_obj.pageSize),
          filtered_items: filtered_data
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

module.exports = items_helper;