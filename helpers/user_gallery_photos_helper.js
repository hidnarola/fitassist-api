var UserGalleryPhotos = require("./../models/user_gallery_photos");
var user_gallery_photo_helper = {};

/*
 * get_user_gallery_photos is used to fetch all user's gallery photos
 * 
 * @return  status 0 - If any internal error occured while fetching user's gallery photos data, with error
 *          status 1 - If user's gallery photos data found, with user's gallery photos object
 *          status 2 - If user's gallery photos not found, with appropriate message
 */
user_gallery_photo_helper.get_user_gallery_photos = async user_auth_id => {
  try {
    var user_gallery_photos = await UserGalleryPhotos.aggregate([
      { $match: user_auth_id },
    ]);
    if (user_gallery_photos && user_gallery_photos.length != 0) {
      return {
        status: 1,
        message: "User gallery photos found",
        user_gallery_photos: user_gallery_photos
      };
    } else {
      return { status: 2, message: "No user gallery photos available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user gallery photos",
      error: err
    };
  }
};

/*
 * get_user_gallery_photo_by_id is used to fetch all user's gallery photos
 * 
 * @return  status 0 - If any internal error occured while fetching user's gallery photos data, with error
 *          status 1 - If user's gallery photos data found, with user's gallery photos object
 *          status 2 - If user's gallery photos not found, with appropriate message
 */
user_gallery_photo_helper.get_user_gallery_photo_by_id = async id => {
  try {
    var user_gallery_photo = await UserGalleryPhotos.findOne(id);
    if (user_gallery_photo && user_gallery_photo.length != 0) {
      return {
        status: 1,
        message: "User gallery photos found",
        user_gallery_photo: user_gallery_photo
      };
    } else {
      return { status: 2, message: "No user gallery photos available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user gallery photos",
      error: err
    };
  }
};

/*
 * insert_user_gallery_photo is used to add all user's gallery Photos
 * 
 * @return  status 0 - If any internal error occured while add user's gallery Photos data, with error
 *          status 1 - If user's gallery Photos data added, with user's gallery Photos object
 *          status 2 - If user's gallery Photos not added, with appropriate message
 */
user_gallery_photo_helper.insert_user_gallery_photo = async user_gallery_photo_obj => {
  let user_gallery_photo = new UserGalleryPhotos(user_gallery_photo_obj);
  try {
    let user_gallery_photo_data = await user_gallery_photo.save();
    return {
      status: 1,
      message: "user' photo inserted in gallery",
      user_gallery_photo: user_gallery_photo_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user's photo in gallery",
      error: err
    };
  }
};

/*
 * update_user_gallery_photo is used to update user's gallery photos
 * 
 * @return  status 0 - If any internal error occured while update user's gallery photos data, with error
 *          status 1 - If user's gallery photos data updated, with user's gallery photos object
 *          status 2 - If user's gallery photos not updated, with appropriate message
 */
user_gallery_photo_helper.update_user_gallery_photo = async (
  authUserId,
  user_gallery_photo_obj
) => {
  try {
    let user_gallery_photo = await UserGalleryPhotos.findOneAndUpdate(
      authUserId,
      user_gallery_photo_obj,
      { new: true }
    );
    if (!user_gallery_photo) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        user_gallery_photo:user_gallery_photo
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user gallery photo",
      error: err
    };
  }
};

/*
 * delete_user_gallery_photo is used to delete user's gallery photos
 * 
 * @return  status 0 - If any internal error occured while update user's gallery photos data, with error
 *          status 1 - If user's gallery photos data updated, with user's gallery photos object
 *          status 2 - If user's gallery photos not updated, with appropriate message
 */
user_gallery_photo_helper.delete_user_gallery_photo = async (id,user_gallery_photo_obj) => {
  try {
    let user_gallery_photo = await UserGalleryPhotos.findOneAndUpdate(
      id,user_gallery_photo_obj
    );
    if (!user_gallery_photo) {
      return { status: 2, message: "Record has not deleted" };
    } else {
      return {
        status: 1,
        message: "Record has been deleted",
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting user gallery photo",
      error: err
    };
  }
};
module.exports = user_gallery_photo_helper;
