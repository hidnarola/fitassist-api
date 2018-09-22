var UserSettings = require("./../models/user_settings");
var user_settings_helper = {};

/*
 * get_setting is used to get user settings data 
 * @param   setting_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating user_settings, with error
 *          status  1 - If user_settings found successfully, with appropriate message
 *          status  2 - If user_settings not found, with appropriate message
 * @developed by "amc"
 */
user_settings_helper.get_setting = async (userId, project = {}) => {
  try {
    let user_settings_data = await UserSettings.findOne(userId, project);

    if (user_settings_data) {
      return {
        status: 1,
        message: "user preferences found",
        user_settings: user_settings_data
      };
    } else {
      return {
        status: 2,
        message: "user preferences not found",
        user_settings: user_settings_data
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user settings",
      error: err
    };
  }
};
/*
 * insert_setting is used to insert user settings data 
 * @param   setting_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating user_settings, with error
 *          status  1 - If user_settings inserted successfully, with appropriate message
 *          status  2 - If user_settings not inserted, with appropriate message
 * @developed by "amc"
 */
user_settings_helper.insert_setting = async setting_obj => {
  try {
    let user_settings_obj = new UserSettings(setting_obj);
    user_settings = await user_settings_obj.save();

    if (!user_settings) {
      return {
        status: 2,
        message: "Record has not added"
      };
    } else {
      return {
        status: 1,
        message: "Record has been added",
        user_settings: user_settings
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user settings",
      error: err
    };
  }
};

/*
 * save_settings is used to save user settings data based on userId
 * @param   userId         String  _id of user that need to be update
 * @param   setting_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating user_settings, with error
 *          status  1 - If user_settings updated successfully, with appropriate message
 *          status  2 - If user_settings not updated, with appropriate message
 * @developed by "amc"
 */
user_settings_helper.save_settings = async (userId, setting_obj) => {
  try {
    let user_settings_data = await UserSettings.findOne(userId);

    user_settings = await UserSettings.findOneAndUpdate(userId, setting_obj, {
      new: true
    });

    if (!user_settings) {
      return {
        status: 2,
        message: "Record has not updated"
      };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        user_settings: user_settings
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user_settings",
      error: err
    };
  }
};

module.exports = user_settings_helper;