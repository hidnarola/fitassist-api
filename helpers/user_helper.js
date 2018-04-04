var User = require("./../models/users");
var user_helper = {};



/*
 * get_all_users is used to fetch all users data
 * 
 * @return  status 0 - If any internal error occured while fetching users data, with error
 *          status 1 - If users data found, with users object
 *          status 2 - If users not found, with appropriate message
 */
user_helper.get_all_users = async () => {
    try {
        var users = await User.find();
        if (users) {
            return { "status": 1, "message": "users found", "users": users };
        } else {
            return { "status": 2, "message": "No users available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding users", "error": err }
    }
}

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
 * @param   user_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating user, with error
 *          status  1 - If User updated successfully, with appropriate message
 *          status  2 - If User not updated, with appropriate message
 * 
 * @developed by "amc"
 */
user_helper.update_user_by_id = async (user_id, user_obj) => {
    try {
        let user = await User.findOneAndUpdate({ _id: user_id }, user_obj);
        if (!user) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "user": user };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating user", "error": err }
    }
};


/*
 * delete_user_by_id is used to delete user data based on user_id
 * 
 * @param   user_id         String  _id of user that need to be update
 * @param   user_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating user, with error
 *          status  1 - If User updated successfully, with appropriate message
 *          status  2 - If User not updated, with appropriate message
 * 
 * @developed by "amc"
 */
user_helper.delete_user_by_id = async (user_id, user_obj) => {
    try {
        let user = await User.findOneAndUpdate({ _id: user_id }, user_obj);
        if (!user) {
            return { "status": 2, "message": "Record has not Deleted" };
        } else {
            return { "status": 1, "message": "Record has been Deleted"};
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while deleting user", "error": err }
    }
};


/*
 * get_filtered_records is used to fetch all filtered data
 * 
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
user_helper.get_filtered_records = async (filter_obj) => {
    console.log(filter_obj);
    queryObj = {};
    if (filter_obj.columnFilter && filter_obj.columnFilter.length > 0) {
      queryObj = filter_obj.columnFilter;
    }
  
    equalTo = {};
    if (filter_obj.columnFilterEqual && filter_obj.columnFilterEqual.length > 0) {
      equalTo = filter_obj.columnFilterEqual;
    }
    skip = filter_obj.pageSize * filter_obj.page;
    try {
      total_count = await User.count({}, function(err, cnt) {
        return cnt;
      });
      // var filtered_data = await Exercise.find(queryObj).sort(filter_obj.columnSort).limit(filter_obj.pageSize).skip(skip).exec();
  
      var andFilterArr = [];
      if (queryObj && queryObj.length > 0) {
        andFilterArr.push({ $and: queryObj });
      }
  
      if (equalTo && equalTo.length > 0) {
        andFilterArr.push({ $and: equalTo });
      }
      var andFilterObj = {};
      if (andFilterArr && andFilterArr.length > 0) {
        andFilterObj = { $and: andFilterArr };
      }
      var searched_record_count = await User.find(andFilterObj).count();
  
      var filtered_data = await User.find(andFilterObj)
        .sort(filter_obj.columnSort)
        .limit(filter_obj.pageSize)
        .skip(skip)
        .exec();
  
      if (filtered_data) {
        return {
          status: 1,
          message: "filtered data is found",
          count: searched_record_count,
          filtered_total_pages: Math.ceil(searched_record_count / filter_obj.pageSize),
          filtered_users: filtered_data
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

module.exports = user_helper;