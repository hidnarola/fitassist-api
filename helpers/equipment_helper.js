var Equipment = require("./../models/equipments");
var equipment_helper = {};

/*
 * get_all_equipment is used to fetch all equipment
 * @return  status 0 - If any internal error occured while fetching equipment data, with error
 *          status 1 - If equipment data found, with equipment object
 *          status 2 - If equipment not found, with appropriate message
 */
equipment_helper.get_all_equipment = async (condition = {}) => {
  try {
    var equipment = await Equipment.find(condition);
    if (equipment) {
      return {
        status: 1,
        message: "Equipments found",
        equipments: equipment
      };
    } else {
      return {
        status: 2,
        message: "No equipment available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding equipment",
      error: err
    };
  }
};



/*
 * get_equipment_id is used to fetch equipment by ID
 * 
 * @return  status 0 - If any internal error occured while fetching equipment data, with error
 *          status 1 - If equipment data found, with equipment object
 *          status 2 - If equipment not found, with appropriate message
 */
equipment_helper.get_equipment_id = async id => {
  try {
    var equipment = await Equipment.findOne({
      _id: id
    });
    if (equipment) {
      return {
        status: 1,
        message: "Equipment found",
        equipment: equipment
      };
    } else {
      return {
        status: 2,
        message: "No equipment available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding equipment",
      error: err
    };
  }
};

/*
 * insert_equipment is used to insert into equipment collection
 * 
 * @param   equipment_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting equipment, with error
 *          status  1 - If equipment inserted, with inserted equipment document and appropriate message
 * 
 * @developed by "amc"
 */
equipment_helper.insert_equipment = async equipment_object => {
  let equipment = new Equipment(equipment_object);
  try {
    let equipment_data = await equipment.save();
    return {
      status: 1,
      message: "Equipment inserted",
      equipment: equipment_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting equipment",
      error: err
    };
  }
};

/*
 * update_equipment_by_id is used to update equipment data based on equipment_id
 * 
 * @param   equipment_id         String  _id of equipment that need to be update
 * @param   equipment_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating equipment, with error
 *          status  1 - If Equipment updated successfully, with appropriate message
 *          status  2 - If Equipment not updated, with appropriate message
 * 
 * @developed by "amc"
 */
equipment_helper.update_equipment_by_id = async (
  equipment_id,
  equipment_object
) => {
  try {
    let equipment = await Equipment.findOneAndUpdate({
      _id: equipment_id
    },
      equipment_object, {
        new: true
      }
    );
    if (!equipment) {
      return {
        status: 2,
        message: "Record has not updated"
      };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        equipment: equipment
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating equipment",
      error: err
    };
  }
};

/*
 * delete_equipment_by_id is used to delete equipment from database
 * 
 * @param   equipment_id String  _id of equipment that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of equipment, with error
 *          status  1 - If equipment deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
equipment_helper.delete_equipment_by_id = async (id, update) => {
  try {
    let resp = await Equipment.findByIdAndUpdate(id, update, {
      new: true
    });
    if (!resp) {
      return {
        status: 2,
        message: "Equipment not found"
      };
    } else {
      return {
        status: 1,
        message: "Equipment deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting equipment",
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
equipment_helper.get_filtered_records = async filter_obj => {
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Equipment.aggregate([{
      $match: filter_object.columnFilter
    }]);

    var filtered_data = await Equipment.aggregate([{
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
        filtered_equipments: filtered_data
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
module.exports = equipment_helper;