var BadgeTask = require("./../models/badge_task");
var badge_task_helper = {};

/*
 * get_badge_task is used to fetch all badge_tasks data
 * 
 * @return  status 0 - If any internal error occured while fetching badge_tasks data, with error
 *          status 1 - If badge_tasks data found, with badge_tasks object
 *          status 2 - If badge_tasks not found, with appropriate message
 */
badge_task_helper.get_badge_tasks = async () => {
  try {
    var badge_tasks = await BadgeTask.find();
    if (badge_tasks) {
      return {
        status: 1,
        message: "badge_tasks found",
        badge_tasks: badge_tasks
      };
    } else {
      return {
        status: 2,
        message: "No badge_tasks available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badge_tasks",
      error: err
    };
  }
};

/*
 * get_badge_task_id is used to fetch badge_task by ID
 * 
 * @return  status 0 - If any internal error occured while fetching badge_task data, with error
 *          status 1 - If badge_task data found, with badge_task object
 *          status 2 - If badge_task data not found, with appropriate message
 */
badge_task_helper.get_badge_task_id = async id => {
  try {
    var badge_task = await BadgeTask.findOne({
      _id: id
    });
    if (badge_task) {
      return {
        status: 1,
        message: "badge_task found",
        badge_task: badge_task
      };
    } else {
      return {
        status: 2,
        message: "No badge_task available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badge_task ",
      error: err
    };
  }
};

/*
 * insert_badge_task is used to insert into badge_task collection
 * 
 * @param   badge_task_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting badge_task, with error
 *          status  1 - If badge_task inserted, with inserted badge_task document and appropriate message
 * 
 * @developed by "amc"
 */
badge_task_helper.insert_badge_task = async badge_task_obj => {
  let badge_task = new BadgeTask(badge_task_obj);
  try {
    let badge_task_data = await badge_task.save();
    return {
      status: 1,
      message: "badge_task inserted",
      badge_task: badge_task_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting badge_task",
      error: err
    };
  }
};

/*
 * update_badge_task_by_id is used to update badge_task data based on badge_task_id
 * 
 * @param   badge_task_id         String  _id of badge_task that need to be update
 * @param   badge_task_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating badge_task, with error
 *          status  1 - If badge_task updated successfully, with appropriate message
 *          status  2 - If badge_task not updated, with appropriate message
 * 
 * @developed by "amc"
 */
badge_task_helper.update_badge_task_by_id = async (
  badge_task_id,
  badge_task_obj
) => {
  try {
    let badge_task = await BadgeTask.findOneAndUpdate({
        _id: badge_task_id
      },
      badge_task_obj, {
        new: true
      }
    );
    if (!badge_task) {
      return {
        status: 2,
        message: "Record has not updated"
      };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        badge_task: badge_task
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating badge_task",
      error: err
    };
  }
};

/*
 * delete_badge_task_by_id is used to delete badge_task from database
 * 
 * @param   badge_task_id String  _id of badge_task that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of badge_task, with error
 *          status  1 - If badge_task deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
badge_task_helper.delete_badge_task_by_id = async badge_task_id => {
  try {
    let resp = await BadgeTask.findOneAndUpdate({
      _id: badge_task_id
    }, {
      isDeleted: 1
    });
    if (!resp) {
      return {
        status: 2,
        message: "badge task not found"
      };
    } else {
      return {
        status: 1,
        message: "badge task deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting badge task",
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
badge_task_helper.get_filtered_records = async filter_obj => {
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await BadgeTask.aggregate([{
      $match: filter_object.columnFilter
    }]);
    var filtered_data = await BadgeTask.aggregate([{
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
        filtered_badge_tasks: filtered_data
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
module.exports = badge_task_helper;