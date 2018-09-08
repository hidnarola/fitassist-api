var WidgetsSettings = require("./../models/widgets_settings");
var widgets_settings_helper = {};

/*
 * get_all_widgets is used to fetch all widgets
 * @return  status 0 - If any internal error occured while fetching widgets data, with error
 *          status 1 - If widgets data found, with widgets object
 *          status 2 - If widgets not found, with appropriate message
 */
widgets_settings_helper.get_all_widgets = async (condition = {}, project = {}) => {
  try {
    var widgets = await WidgetsSettings.findOne(condition, project).lean();
    if (widgets) {
      return {
        status: 1,
        message: "WidgetsSettings found",
        widgets: widgets
      };
    } else {
      return {
        status: 2,
        message: "No Widgets available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding Widgets",
      error: err
    };
  }
};

/*
 * checkWidgets is used to count all widgets
 * @return  status 0 - If any internal error occured while fetching widgets data, with error
 *          status 1 - If widgets data found, with widgets object
 *          status 2 - If widgets not found, with appropriate message
 */
widgets_settings_helper.checkWidgets = async (condition) => {
  try {
    var widgets = await WidgetsSettings.count(condition);
    if (widgets != 0) {
      return {
        status: 1,
        message: "WidgetsSettings found",
        widgets: widgets
      };
    } else {
      return {
        status: 2,
        message: "No Widgets available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding Widgets",
      error: err
    };
  }
};



// /*
//  * get_widgets_id is used to fetch widgets by ID
//  * @return  status 0 - If any internal error occured while fetching widgets data, with error
//  *          status 1 - If widgets data found, with widgets object
//  *          status 2 - If widgets not found, with appropriate message
//  */
// widgets_settings_helper.get_widgets_id = async id => {
//   try {
//     var widgets = await WidgetsSettings.findOne({
//       _id: id
//     });
//     if (widgets) {
//       return {
//         status: 1,
//         message: "Widgets found",
//         widgets: widgets
//       };
//     } else {
//       return {
//         status: 2,
//         message: "No widgets available"
//       };
//     }
//   } catch (err) {
//     return {
//       status: 0,
//       message: "Error occured while finding widgets",
//       error: err
//     };
//   }
// };

/*
 * save_widgets is used to save into widgets_settings collection
 * @param   widgets_object     JSON object consist of all property that need to save in collection
 * @return  status  0 - If any error occur in saving widgets, with error
 *          status  1 - If widgets saved, with saved widgets document and appropriate message
 * @developed by "amc"
 */
widgets_settings_helper.save_widgets = async (widgets_object, widgets_id = false) => {
  try {
    let widgets_data = false;
    if (widgets_id) {
      widgets_data = await WidgetsSettings.findOneAndUpdate(widgets_id, widgets_object, {
        new: true
      });
    } else {
      var widgets = new WidgetsSettings(widgets_object);
      widgets_data = await widgets.save();
    }
    return {
      status: 1,
      message: "Widgets saved",
      widgets: widgets_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while saving widgets",
      error: err
    };
  }
};

module.exports = widgets_settings_helper;