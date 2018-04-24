var UserProgressPhotos = require("./../models/users_progress_photos");
var user_progress_photo_helper = {};

/*
 * get_user_progress_photos is used to fetch all user's progress photos
 * 
 * @return  status 0 - If any internal error occured while fetching user's progress photos data, with error
 *          status 1 - If user's progress photos data found, with user's progress photos object
 *          status 2 - If user's progress photos not found, with appropriate message
 */
user_progress_photo_helper.get_user_progress_photos = async user_auth_id => {
  try {
    var user_progress_photos = await UserProgressPhotos.aggregate([
      { $match: user_auth_id }
    ]);
    if (user_progress_photos && user_progress_photos.length != 0) {
      return {
        status: 1,
        message: "User progress photos found",
        user_progress_photos: user_progress_photos
      };
    } else {
      return { status: 2, message: "No user progress photos available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user progress photos",
      error: err
    };
  }
};

/*
 * get_user_progress_photo_by_id is used to fetch all user's progress photos
 * 
 * @return  status 0 - If any internal error occured while fetching user's progress photos data, with error
 *          status 1 - If user's progress photos data found, with user's progress photos object
 *          status 2 - If user's progress photos not found, with appropriate message
 */
user_progress_photo_helper.get_user_progress_photo_by_id = async id => {
  try {
    var user_progress_photos = await UserProgressPhotos.findOne(id);
    if (user_progress_photos && user_progress_photos.length != 0) {
      return {
        status: 1,
        message: "User progress photos found",
        user_progress_photo: user_progress_photos
      };
    } else {
      return { status: 2, message: "No user progress photos available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user progress photos",
      error: err
    };
  }
};

/*
 * insert_user_progress_photo is used to add all user's progress Photos
 * 
 * @return  status 0 - If any internal error occured while add user's progress Photos data, with error
 *          status 1 - If user's progress Photos data added, with user's progress Photos object
 *          status 2 - If user's progress Photos not added, with appropriate message
 */
user_progress_photo_helper.insert_user_progress_photo = async user_progress_photo_obj => {
  console.log(user_progress_photo_obj);
  let user_progress_photo = new UserProgressPhotos(user_progress_photo_obj);
  try {
    let user_progress_photo_data = await user_progress_photo.save();
    return {
      status: 1,
      message: "user progress photo inserted",
      user_progress_photo: user_progress_photo_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user progress photo",
      error: err
    };
  }
};

/*
 * update_user_progress_photo is used to update user's progress photos
 * 
 * @return  status 0 - If any internal error occured while update user's progress photos data, with error
 *          status 1 - If user's progress photos data updated, with user's progress photos object
 *          status 2 - If user's progress photos not updated, with appropriate message
 */
user_progress_photo_helper.update_user_progress_photo = async (
  authUserId,
  user_progress_photo_obj
) => {
  try {
    let user_progress_photo = await UserProgressPhotos.findOneAndUpdate(
      { userId: authUserId },
      user_progress_photo_obj,
      { new: true }
    );
    if (!user_progress_photo) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        user_progress_photo: user_progress_photo
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user progress photo",
      error: err
    };
  }
};

/*
 * delete_user_progress_photo is used to delete user's progress photos
 * 
 * @return  status 0 - If any internal error occured while update user's progress photos data, with error
 *          status 1 - If user's progress photos data updated, with user's progress photos object
 *          status 2 - If user's progress photos not updated, with appropriate message
 */
user_progress_photo_helper.delete_user_progress_photo = async (
  id,
  user_progress_photo_obj
) => {
  try {
    let user_progress_photo = await UserProgressPhotos.findOneAndUpdate(
      id,
      user_progress_photo_obj
    );
    if (!user_progress_photo) {
      return { status: 2, message: "Record has not deleted" };
    } else {
      return {
        status: 1,
        message: "Record has been deleted",
        user_progress_photo: user_progress_photo
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting user progress photo",
      error: err
    };
  }
};
module.exports = user_progress_photo_helper;
