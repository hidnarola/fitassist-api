var UserProgressPhotos = require("./../models/users_progress_photos");
var Users = require("./../models/users");
var user_progress_photo_helper = {};

/*
 * count_all_progress_photo is used to count all user's progress photos
 * @return  status 0 - If any internal error occured while couting user's progress photos data, with error
 *          status 1 - If user's progress photos data found, with user's progress photos object
 *          status 2 - If user's progress photos not found, with appropriate message
 */
user_progress_photo_helper.count_all_progress_photo = async (search_obj) => {
  try {
    var count = await UserProgressPhotos.count(search_obj);
    return {
      status: 1,
      count: count
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user progress photos",
      error: err
    };
  }
};
/*
 * get_user_progress_photos is used to fetch all user's progress photos
 * @return  status 0 - If any internal error occured while fetching user's progress photos data, with error
 *          status 1 - If user's progress photos data found, with user's progress photos object
 *          status 2 - If user's progress photos not found, with appropriate message
 */
user_progress_photo_helper.get_user_progress_photos = async (
  search_obj,
  start,
  limit,
  sort
) => {
  try {
    var user_progress_photos = await UserProgressPhotos.aggregate(
      [
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "authUserId",
            as: "username"
          }
        },
        {
          $unwind: "$username"
        },
        {
          $group: {
            _id: "$_id",
            description: {
              $first: "$description"
            },
            status: {
              $first: "$status"
            },
            isDeleted: {
              $first: "$isDeleted"
            },
            userId: {
              $first: "$userId"
            },
            date: {
              $first: "$date"
            },
            image: {
              $first: "$image"
            },
            username: {
              $first: "$username.username"
            }
          }
        },
        {
          $match: search_obj
        },
        sort,
        start,
        limit,
      ]);
    if (user_progress_photos && user_progress_photos.length > 0) {
      return {
        status: 1,
        message: "User progress photos found",
        user_progress_photos: user_progress_photos
      };
    } else {
      return {
        status: 1,
        message: "No user progress photos available",
        user_progress_photos: []
      };
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
 * get_user_progress_photos_month_wise is used to fetch all user's progress photos by month wise
 * 
 * @return  status 0 - If any internal error occured while fetching user's progress photos data, with error
 *          status 1 - If user's progress photos by month wise data found, with user's progress photos by month wise object
 *          status 2 - If user's progress photos by month wise not found, with appropriate message
 */
user_progress_photo_helper.get_user_progress_photos_month_wise = async (
  search_obj,
  limit
) => {
  try {
    var user_progress_photos = await Users.aggregate([{
      $match: search_obj
    },
    {
      $lookup: {
        from: "user_progress_photos",
        localField: "authUserId",
        foreignField: "userId",
        as: "user_progress_photos"
      }
    },
    {
      $unwind: "$user_progress_photos"
    },
    {
      $project: {
        user_progress_photos: 1,
        // user_progress_photos: 1,
        // userId: 1,
        // description: 1,
        //  "year": { $year: "date" },
        month: {
          $month: "$user_progress_photos.date"
        }
        // day: { $dayOfMonth: "$date" }
      }
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          month: "$month"
        },
        description: {
          $first: "$user_progress_photos.description"
        },
        image: {
          $push: "$user_progress_photos.image"
        },
        date: {
          $first: "$user_progress_photos.date"
        },
        isDeleted: {
          $first: "$user_progress_photos.isDeleted"
        },
        userId: {
          $first: "$user_progress_photos.userId"
        }
        // month:"$month",
      }
    },
    {
      $match: {
        isDeleted: 0
      }
    },
    {
      $sort: {
        date: -1
      }
    },
      limit
    ]);

    if (user_progress_photos && user_progress_photos.length != 0) {
      return {
        status: 1,
        message: "User progress photos found",
        user_progress_photos: user_progress_photos
      };
    } else {
      return {
        status: 2,
        message: "No user progress photos available"
      };
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
      return {
        status: 2,
        message: "No user progress photos available"
      };
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
 * get_first_and_last_user_progress_photos is used to fetch all user's progress photos
 * 
 * @return  status 0 - If any internal error occured while fetching user's progress photos data, with error
 *          status 1 - If user's progress photos data found, with user's progress photos object
 *          status 2 - If user's progress photos not found, with appropriate message
 */
user_progress_photo_helper.get_first_and_last_user_progress_photos = async id => {
  try {
    var user_progress_photos = await UserProgressPhotos.aggregate([{
      $match: id
    },
    {
      $sort: {
        date: 1
      }
    },
    {
      $group: {
        _id: "$userId",
        beginning: {
          $first: "$image"
        },
        current: {
          $last: "$image"
        }
      }
    }
    ]);
    if (user_progress_photos && user_progress_photos.length != 0) {
      return {
        status: 1,
        message: "User progress photos found",
        user_progress_photos: user_progress_photos[0]
      };
    } else {
      return {
        status: 2,
        message: "No user progress photos available"
      };
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
  condition,
  user_progress_photo_obj
) => {
  try {
    let user_progress_photo = await UserProgressPhotos.findOneAndUpdate(condition,
      user_progress_photo_obj, {
        new: true
      }
    );
    if (!user_progress_photo) {
      return {
        status: 2,
        message: "Record has not updated"
      };
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
      return {
        status: 2,
        message: "Record has not deleted"
      };
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