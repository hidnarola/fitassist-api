var BodyFatLogs = require("./../models/body_fat_logs");
var body_fat_helper = {};

/*
 * get_body_fat_logs is used to fetch bodymeasurement by ID
 * @return  status 0 - If any internal error occured while fetching bodymeasurement data, with error
 *          status 1 - If bodymeasurement data found, with bodymeasurement object
 *          status 2 - If bodymeasurement not found, with appropriate message
 */
body_fat_helper.get_body_fat_logs = async (
  id,
) => {
  try {
    var body_fat_logs = await BodyFatLogs.findOne(id);
    if (body_fat_logs) {
      return {
        status: 1,
        message: "body fat logs found",
        body_fat_logs: body_fat_logs
      };
    } else {
      return {
        status: 2,
        message: "No body_fat_logs available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding body_fat_logs",
      error: err
    };
  }
};

/*
 * update_body_fat_logs is used to insert into body_fat_logs collection
 * @param   bodyFatObject     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting body_fat_logs, with error
 *          status  1 - If body_fat_logs inserted, with inserted _body_fat_logs's document and appropriate message
 * @developed by "amc"
 */
body_fat_helper.update_body_fat_logs = async bodyFatObject => {
  let body_fat_logs = new User(bodyFatObject);
  try {
    let user_data = await body_fat_logs.save();
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
 * save_body_fat_logs is used to insert into body_fat_logs collection
 * @param   bodyFatObject     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting body_fat_logs, with error
 *          status  1 - If body_fat_logs inserted, with inserted _body_fat_logs's document and appropriate message
 * @developed by "amc"
 */
body_fat_helper.save_body_fat_logs = async (bodyFatObject, id = false) => {
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


module.exports = body_fat_helper;