var UserEquipments = require("./../models/user_equipment");
var user_equipments_helper = {};

/*
 * get_all_user_equipment is used to fetch all user's equipment
 * 
 * @return  status 0 - If any internal error occured while fetching user's equipment data, with error
 *          status 1 - If user's equipment data found, with user's equipment object
 *          status 2 - If user's equipment not found, with appropriate message
 */
user_equipments_helper.get_all_user_equipment = async user_auth_id => {
    try {
      var user_equipment = await UserEquipments.findOne({userId:user_auth_id});
      if (user_equipment) {
        return { status: 1, message: "User Equipments found", user_equipments: user_equipment };
      } else {
        return { status: 2, message: "No user equipments available" };
      }
    } catch (err) {
      return {
        status: 0,
        message: "Error occured while finding user equipment",
        error: err
      };
    }
  };


/*
 * insert_user_equipment is used to add all user's equipment
 * 
 * @return  status 0 - If any internal error occured while add user's equipment data, with error
 *          status 1 - If user's equipment data added, with user's equipment object
 *          status 2 - If user's equipment not added, with appropriate message
 */
user_equipments_helper.insert_user_equipment = async (user_equipment_obj) => {
    let userequipment = new UserEquipments(user_equipment_obj);
  try {
    let user_equipment_data = await userequipment.save();
    return { status: 1, message: "user equipments inserted", user_equipments: user_equipment_data };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user equipments",
      error: err
    };
  }
  };

/*
 * update_user_equipment is used to update all user's equipment
 * 
 * @return  status 0 - If any internal error occured while update user's equipment data, with error
 *          status 1 - If user's equipment data updated, with user's equipment object
 *          status 2 - If user's equipment not updated, with appropriate message
 */
user_equipments_helper.update_user_equipment = async (id,user_equipment_obj) => {
  try {
    let user_equipments = await UserEquipments.findOneAndUpdate({ _id: id }, user_equipment_obj, { new: true });
    if (!user_equipments) {
        return { "status": 2, "message": "Record has not updated" };
    } else {
        return { "status": 1, "message": "Record has been updated", "user_equipments": user_equipments };
    }
} catch (err) {
    return { "status": 0, "message": "Error occured while updating Exercise Types", "error": err }
}
};
module.exports = user_equipments_helper;