var Equipment = require("./../models/equipments");
var equipment_helper = {};

/*
 * get_all_equipment is used to fetch all equipment
 * 
 * @return  status 0 - If any internal error occured while fetching equipment data, with error
 *          status 1 - If equipment data found, with equipment object
 *          status 2 - If equipment not found, with appropriate message
 */
equipment_helper.get_all_equipment = async () => {
    try {
        var equipment = await Equipment.find();
        if (equipment) {
            return { "status": 1, "message": "Equipments found", "equipments": equipment };
        } else {
            return { "status": 2, "message": "No equipment available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding equipment", "error": err }
    }
}

/*
 * insert_equipment is used to insert into equipment collection
 * 
 * @param   equipment_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting equipment, with error
 *          status  1 - If equipment inserted, with inserted equipment document and appropriate message
 * 
 * @developed by "ar"
 */
equipment_helper.insert_equipment = async (equipment_object) => {
    console.log(equipment_object);
    let equipment = new Equipment(equipment_object);
    try {
        let equipment_data = await equipment.save();
        return { "status": 1, "message": "Equipment inserted", "equipment": equipment_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting equipment", "error": err };
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
 * @developed by "ar"
 */
equipment_helper.update_equipment_by_id = async (equipment_id, equipment_object) => {
    try {
        let equipment = await Equipment.findOneAndUpdate({ _id: equipment_id }, equipment_object, { new: true });
        if (!equipment) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "equipment": equipment };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating equipment", "error": err }
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
 * @developed by "ar"
 */
equipment_helper.delete_equipment_by_id = async (equipment_id) => {
    try {
        let resp = await Equipment.findOneAndRemove({ _id: equipment_id });
        if (!resp) {
            return { "status": 2, "message": "Equipment not found" };
        } else {
            return { "status": 1, "message": "Equipment deleted" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while deleting equipment", "error": err };
    }
}

module.exports = equipment_helper;