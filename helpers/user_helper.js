var User = require("./../models/users");
var user_helper = {};

/*
 * get_user_by_id is used to fetch user details by user id
 * 
 * @params  user_id     _id field of user collection
 * 
 * @return  status 0 - If any internal error occured while fetching user data, with error
 *          status 1 - If user data found, with user object
 *          status 2 - If user not found, with appropriate message
 */
user_helper.get_user_by_id = async (user_id) => {
    try {
        var user = await User.findOne({ "_id": { "$eq": user_id } });
        if (user) {
            return { "status": 1, "message": "User details found", "user": user };
        } else {
            return { "status": 2, "message": "User not found" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding user", "error": err }
    }
};

/*
 * get_user_by_email is used to fetch single user by email address
 * 
 * @param   email   Specify email address of user
 * 
 * @return  status  0 - If any error occur in finding user, with error
 *          status  1 - If User found, with found user document
 *          status  2 - If User not found, with appropriate error message
 * 
 * @developed by "ar"
 */
user_helper.get_user_by_email = async (email) => {
    try {
        var user = await User.findOne({ "email": email });
        if (user) {
            return { "status": 1, "message": "User details found", "user": user };
        } else {
            return { "status": 2, "message": "User not found" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding user", "error": err }
    }
};

/*
 * insert_user is used to insert into user collection
 * 
 * @param   user_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting faculty, with error
 *          status  1 - If faculty inserted, with inserted faculty's document and appropriate message
 * 
 * @developed by "ar"
 */
user_helper.insert_user = async (user_object) => {
    let user = new User(user_object)
    try{
        let user_data = await user.save();
        return { "status": 1, "message": "User inserted", "user": user_data };
    } catch(err){
        return { "status": 0, "message":"Error occured while inserting user","error": err };
    }
};

/*
 * update_user_by_id is used to update user data based on user_id
 * 
 * @param   user_id         String  _id of user that need to be update
 * @param   user_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating user, with error
 *          status  1 - If User updated successfully, with appropriate message
 *          status  2 - If User not updated, with appropriate message
 * 
 * @developed by "ar"
 */
user_helper.update_user_by_id = async (user_id, user_object) => {
    try {
        let user = await User.findOneAndUpdate({ _id: user_id }, user_object);
        if (!user) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "user": user };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating user", "error": err }
    }
};

module.exports = user_helper;