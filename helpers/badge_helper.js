var Badges = require("./../models/badges");
var badge_helper = {};

/*
 * get_badges is used to fetch all badges data
 * 
 * @return  status 0 - If any internal error occured while fetching badges data, with error
 *          status 1 - If badges data found, with badges object
 *          status 2 - If badges not found, with appropriate message
 */
badge_helper.get_badges = async () => {
  try {
    var badge = await Badges.find();
    if (badge) {
      return {
        status: 1,
        message: "badges found",
        badges: badge
      };
    } else {
      return { status: 2, message: "No badge available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badge",
      error: err
    };
  }
};

/*
 * get_badge_id is used to fetch badge by ID
 * 
 * @return  status 0 - If any internal error occured while fetching badge data, with error
 *          status 1 - If badge data found, with badge object
 *          status 2 - If badge data not found, with appropriate message
 */
badge_helper.get_badge_id = async id => {
  try {
    var badge = await Badges.findOne({ _id: id });
    if (badge) {
      return { status: 1, message: "badge found", badge: badge };
    } else {
      return { status: 2, message: "No badge available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badge ",
      error: err
    };
  }
};

/*
 * insert_badge is used to insert into badge collection
 * 
 * @param   badge_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting badge, with error
 *          status  1 - If badge inserted, with inserted badge document and appropriate message
 * 
 * @developed by "amc"
 */
badge_helper.insert_badge = async badge_obj => {
  console.log(badge_obj);
  let badge = new Badges(badge_obj);
  try {
    let badge_data = await badge.save();
    return {
      status: 1,
      message: "badge inserted",
      badge: badge_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting badge",
      error: err
    };
  }
};

/*
 * update_badge_by_id is used to update badge data based on badge_id
 * 
 * @param   badge_id         String  _id of badge that need to be update
 * @param   badge_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating badge, with error
 *          status  1 - If badge updated successfully, with appropriate message
 *          status  2 - If badge not updated, with appropriate message
 * 
 * @developed by "amc"
 */
badge_helper.update_badge_by_id = async (badge_id, badge_obj) => {
  console.log(badge_obj);
  try {
    let badge = await Badges.findOneAndUpdate({ _id: badge_id }, badge_obj, {
      new: true
    });
    if (!badge) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        badge: badge
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating badge",
      error: err
    };
  }
};

/*
 * delete_badge_by_id is used to delete badge from database
 * 
 * @param   badge_id String  _id of badge that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of badge, with error
 *          status  1 - If badge deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
badge_helper.delete_badge_by_id = async badge_id => {
  try {
    let resp = await Badges.findOneAndUpdate(
      { _id: badge_id },
      { isDeleted: 1 }
    );
    if (!resp) {
      return { status: 2, message: "badge not found" };
    } else {
      return { status: 1, message: "badge deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting badge",
      error: err
    };
  }
};

/*
 * undo_badge_by_id is used to undo badge from database
 * 
 * @param   badge_id String  _id of badge that need to be undo
 * 
 * @return  status  0 - If any error occur in undo of badge, with error
 *          status  1 - If badge undo successfully, with appropriate message
 * 
 * @developed by "amc"
 */
badge_helper.undo_badge_by_id = async badge_id => {
  try {
    let resp = await Badges.findOneAndUpdate(
      { _id: badge_id },
      { isDeleted: 0 }
    );
    if (!resp) {
      return { status: 2, message: "badge not found" };
    } else {
      return { status: 1, message: "badge recovered" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while recovering badge",
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
badge_helper.get_filtered_records = async filter_obj => {
  console.log(filter_obj);
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Badges.aggregate([
      {
        $match: filter_object.columnFilter
      }
    ]);
    var filtered_data = await Badges.aggregate([
      {
        $match: filter_object.columnFilter
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
        filtered_total_pages: Math.ceil(
          searched_record_count.length / filter_obj.pageSize
        ),
        filtered_badges: filtered_data
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

module.exports = badge_helper;
