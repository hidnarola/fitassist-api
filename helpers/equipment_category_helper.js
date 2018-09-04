var Equipment_category = require("./../models/equipment_categories");
var equipment_category_helper = {};

/*
 * get_all_equipment_category is used to fetch all equipment_category
 * 
 * @return  status 0 - If any internal error occured while fetching equipment's category data, with error
 *          status 1 - If equipment's category data found, with equipment's category object
 *          status 2 - If equipment's category not found, with appropriate message
 */
equipment_category_helper.get_all_equipment_category = async (condition = {}) => {
  try {
    var equipment_category = await Equipment_category.find(condition);
    if (equipment_category) {
      return {
        status: 1,
        message: "Equipment's category details found",
        equipment_categories: equipment_category
      };
    } else {
      return {
        status: 2,
        message: "No equipment's category available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding equipment's category",
      error: err
    };
  }
};

/*
 * insert_equipment_category is used to insert into equipment_category collection
 * 
 * @param   equipment_category_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting equipment's category, with error
 *          status  1 - If equipment's category inserted, with inserted equipment's category document and appropriate message
 * 
 * @developed by "amc"
 */
equipment_category_helper.insert_equipment_category = async equipment_category_object => {
  try {
    let equipment_category = new Equipment_category(equipment_category_object);
    let equipment_category_data = await equipment_category.save();
    return {
      status: 1,
      message: "Equipment's category inserted",
      equipment_category: equipment_category_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting equipment_category",
      error: err
    };
  }
};

/*
 * update_equipment_category_by_id is used to update equipment_category data based on equipment_category_id
 * 
 * @param   equipment_category_id         String  _id of equipment_category that need to be update
 * @param   equipment_category_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating equipment_category, with error
 *          status  1 - If Equipment_category updated successfully, with appropriate message
 *          status  2 - If Equipment_category not updated, with appropriate message
 * 
 * @developed by "amc"
 */
equipment_category_helper.update_equipment_category_by_id = async (
  equipment_category_id,
  equipment_category_object
) => {
  try {
    let equipment_category = await Equipment_category.findOneAndUpdate({
        _id: equipment_category_id
      },
      equipment_category_object, {
        new: true
      }
    );
    if (!equipment_category) {
      return {
        status: 2,
        message: "Record has not updated"
      };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        equipment_category: equipment_category
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating equipment_category",
      error: err
    };
  }
};

/*
 * delete_equipment_category_by_id is used to delete equipment_category from database
 * 
 * @param   equipment_category_id String  _id of equipment_category that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of equipment_category, with error
 *          status  1 - If equipment_category deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
equipment_category_helper.delete_equipment_category_by_id = async equipment_category_id => {
  try {
    let resp = await Equipment_category.findOneAndRemove({
      _id: equipment_category_id
    });
    if (!resp) {
      return {
        status: 2,
        message: "Equipment_category not found"
      };
    } else {
      return {
        status: 1,
        message: "Equipment_category deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting equipment_category",
      error: err
    };
  }
};



/*
 * get_filtered_records is used to fetch all filtered data
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
equipment_category_helper.get_filtered_records = async filter_obj => {

  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Equipment_category.aggregate([{
      $match: filter_object.columnFilter
    }]);
    var filtered_data = await Equipment_category.aggregate([{
        $match: filter_object.columnFilter
      },
      {
        $sort: filter_obj.columnSort
      },
      {
        $skip: skip
      },
      {
        $limit: filter_object.pageSize
      },
    ]);

    if (filtered_data) {
      return {
        status: 1,
        message: "filtered data is found",
        count: searched_record_count.length,
        filtered_total_pages: Math.ceil(
          searched_record_count.length / filter_obj.pageSize
        ),
        filtered_equipment_categories: filtered_data
      };
    } else {
      return {
        status: 2,
        message: "No filtered data available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while filtering data",
      error: err
    };
  }
};

module.exports = equipment_category_helper;