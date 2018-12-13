var BodyFatLogs = require("./../models/body_fat_logs");
var body_fat_helper = {};

/*
 * body_fat_data is used to fetch body_fat_data by ID
 * @return  status 0 - If any internal error occured while fetching body_fat_data data, with error
 *          status 1 - If body_fat_data data found, with body_fat_data object
 *          status 2 - If body_fat_data not found, with appropriate message
 */
body_fat_helper.body_fat_data = async (
  id
) => {
  try {
    var body_fat_log = await BodyFatLogs.aggregate([{
        $match: id
      },
      {
        $group: {
          _id: null,
          body_fat_gain: {
            $last: "$bodyFatPer"
          },
          body_fat_loss: {
            $last: "$bodyFatPer"
          },
          body_fat_average: {
            $avg: "$bodyFatPer"
          },
          body_fat_most: {
            $max: "$bodyFatPer"
          },
          body_fat_least: {
            $min: "$bodyFatPer"
          }
        }
      }
    ])
    if (body_fat_log && body_fat_log.length > 0) {
      return {
        status: 1,
        message: "body fat log found",
        body_fat_log: body_fat_log[0]
      };
    } else {
      return {
        status: 2,
        message: "No body_fat_log available",
        body_fat_log: null
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding body_fat_log",
      error: err
    };
  }
};
/*
 * get_body_fat_logs is used to fetch bodymeasurement by ID
 * @return  status 0 - If any internal error occured while fetching bodymeasurement data, with error
 *          status 1 - If bodymeasurement data found, with bodymeasurement object
 *          status 2 - If bodymeasurement not found, with appropriate message
 */
body_fat_helper.get_body_fat_logs = async (
  id,
  sort = {},
  limit = 0
) => {
  try {
    var body_fat_log = await BodyFatLogs.findOne(id).sort(sort)
      .limit(limit);;
    if (body_fat_log) {
      return {
        status: 1,
        message: "body fat log found",
        body_fat_log: body_fat_log
      };
    } else {
      return {
        status: 2,
        message: "No body_fat_log available",
        body_fat_log: null
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding body_fat_log",
      error: err
    };
  }
};


/*
 * save_body_fat_log is used to insert into body_fat_logs collection
 * @param   bodyFatObject     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting body_fat_logs, with error
 *          status  1 - If body_fat_logs inserted, with inserted _body_fat_logs's document and appropriate message
 * @developed by "amc"
 */
body_fat_helper.save_body_fat_log = async (bodyFatObject, id = false) => {
  try {
    let user_data;
    if (id) {
      user_data = await BodyFatLogs.findOneAndUpdate(id, bodyFatObject, {
        new: true
      });
    } else {
      let body_fat_logs = new BodyFatLogs(bodyFatObject);
      user_data = await body_fat_logs.save();
    }

    return {
      status: 1,
      message: "Body fat logs saved",
      body_fat_logs: user_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while saving body fat logs",
      error: err
    };
  }
};

/*
 * get_body_fat_log_by_date is used to fetch bodymeasurement by date and user id
 * @return  status 0 - If any internal error occured while fetching bodymeasurement data, with error
 *          status 1 - If bodymeasurement data found, with bodymeasurement object
 *          status 2 - If bodymeasurement not found, with appropriate message
 */
body_fat_helper.get_body_fat_log_by_date = async (cond) => {
  try {
    var body_fat_log = await BodyFatLogs.findOne(cond);
    if (body_fat_log) {
      return {
        status: 1,
        message: "body fat log found",
        body_fat_log: body_fat_log
      };
    } else {
      return {
        status: 2,
        message: "No body_fat_log available",
        body_fat_log: null
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding body_fat_log",
      error: err
    };
  }
};


module.exports = body_fat_helper;