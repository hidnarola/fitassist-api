var UserProgress = require("./../models/users_progress");
var UserProgressPhotos = require("./../models/users_progress_photos");
var UserProgressActivityPhotos = require("./../models/users_progress_activity_photos");
var Users = require("./../models/users");
var user_progress_photo_helper = {};

/*
 * count_all_progress_photo is used to count all user's progress photos
 * @return  status 0 - If any internal error occured while couting user's progress photos data, with error
 *          status 1 - If user's progress photos data found, with user's progress photos object
 *          status 2 - If user's progress photos not found, with appropriate message
 */
user_progress_photo_helper.count_all_progress_photo = async search_obj => {
  try {
    let aggregateCond = [];
    if (search_obj) {
      aggregateCond = aggregateCond.concat([{ $match: search_obj }]);
    }
    aggregateCond = aggregateCond.concat([
      {
        $lookup: {
          from: "user_progress_photos",
          foreignField: "progressId",
          localField: "_id",
          as: "user_progress_photos"
        }
      },
      {
        $unwind: {
          path: "$user_progress_photos"
        }
      },
      {
        $group: {
          _id: "$_id",
          count: { $sum: 1 }
        }
      }
    ]);
    var resource = await UserProgressPhotos.aggregate(aggregateCond);
    if (resource && resource.length > 0) {
      return {
        status: 1,
        message: "Success",
        count: resource[0] && resource[0].count ? resource[0].count : 0
      };
    } else {
      return {
        status: 0,
        message: "Error occurec while finding user progress photos",
        error: null
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
    var user_progress_photos = await UserProgress.aggregate([
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
          description: { $first: "$description" },
          userId: { $first: "$userId" },
          date: { $first: "$date" },
          username: { $first: "$username.username" }
        }
      },
      {
        $match: search_obj
      },
      {
        $lookup: {
          from: "user_progress_photos",
          foreignField: "progressId",
          localField: "_id",
          as: "user_progress_photos"
        }
      },
      {
        $unwind: {
          path: "$user_progress_photos"
        }
      },
      {
        $sort: {
          "user_progress_photos._id": 1
        }
      },
      sort,
      start,
      limit,
      {
        $project: {
          _id: "$user_progress_photos._id",
          progressId: "$_id",
          description: "$description",
          userId: "$userId",
          date: "$date",
          image: "$user_progress_photos.image",
          category: "$user_progress_photos.category",
          basic: "$user_progress_photos.basic",
          isolation: "$user_progress_photos.isolation",
          posed: "$user_progress_photos.posed",
          caption: "$user_progress_photos.caption",
          username: "$username"
        }
      }
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
    var user_progress_photos = await Users.aggregate([
      {
        $match: search_obj
      },
      {
        $lookup: {
          from: "user_progress",
          localField: "authUserId",
          foreignField: "userId",
          as: "user_progress"
        }
      },
      {
        $unwind: "$user_progress"
      },
      {
        $project: {
          _id: "$user_progress._id",
          user_progress: 1,
          month: { $month: "$user_progress.date" }
        }
      },
      {
        $lookup: {
          from: "user_progress_photos",
          foreignField: "progressId",
          localField: "_id",
          as: "user_progress_photos"
        }
      },
      {
        $unwind: {
          path: "$user_progress_photos"
        }
      },
      {
        $sort: {
          "user_progress_photos._id": 1
        }
      },
      {
        $group: {
          _id: { _id: "$_id", month: "$month" },
          description: { $first: "$user_progress.description" },
          image: { $push: "$user_progress_photos.image" },
          date: { $first: "$user_progress.date" },
          userId: { $first: "$user_progress.userId" },
          user_progress_photos: { $addToSet: "$user_progress_photos" }
        }
      },
      {
        $sort: { date: -1 }
      },
      limit
    ]);

    if (user_progress_photos && user_progress_photos.length !== 0) {
      return {
        status: 1,
        message: "User progress photos found",
        user_progress_photos: user_progress_photos
      };
    } else {
      return {
        status: 2,
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
 * get_user_progress_photo_by_id is used to fetch all user's progress photos
 *
 * @return  status 0 - If any internal error occured while fetching user's progress photos data, with error
 *          status 1 - If user's progress photos data found, with user's progress photos object
 *          status 2 - If user's progress photos not found, with appropriate message
 */
user_progress_photo_helper.get_user_progress_photo_by_id = async id => {
  try {
    var user_progress_photos = await UserProgressPhotos.aggregate([
      {
        $match: id
      },
      {
        $lookup: {
          from: "user_progress",
          foreignField: "_id",
          localField: "progressId",
          as: "user_progress"
        }
      },
      {
        $unwind: {
          path: "$user_progress"
        }
      }
    ]);
    if (
      user_progress_photos &&
      user_progress_photos.length !== 0 &&
      user_progress_photos[0]
    ) {
      return {
        status: 1,
        message: "User progress photos found",
        user_progress_photo: user_progress_photos[0]
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
    var user_progress_photos = await UserProgress.aggregate([
      {
        $match: id
      },
      {
        $lookup: {
          from: "user_progress_photos",
          foreignField: "progressId",
          localField: "_id",
          as: "user_progress_photos"
        }
      },
      {
        $unwind: {
          path: "$user_progress_photos"
        }
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          date: { $first: "$date" },
          user_progress_photos: { $first: "$user_progress_photos" }
        }
      },
      {
        $sort: {
          date: 1
        }
      },
      {
        $group: {
          _id: "$userId",
          beginning: { $first: "$user_progress_photos.image" },
          current: { $last: "$user_progress_photos.image" }
        }
      }
    ]);
    if (user_progress_photos && user_progress_photos.length !== 0) {
      return {
        status: 1,
        message: "User progress photos found",
        user_progress_photos: user_progress_photos[0]
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
 * insert_user_progress is used to add user's progress data
 *
 * @return  status 0 - If any internal error occured while add user's progress data, with error
 *          status 1 - If user's progress data added, with user's progress object
 *          status 2 - If user's progress not added, with appropriate message
 */
user_progress_photo_helper.insert_user_progress = async user_progress_obj => {
  let user_progress = new UserProgress(user_progress_obj);
  try {
    let user_progress_data = await user_progress.save();
    return {
      status: 1,
      message: "user progress inserted",
      user_progress_photo: user_progress_data
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
 * insert_user_progress_photo is used to add all user's progress Photos
 *
 * @return  status 0 - If any internal error occured while add user's progress Photos data, with error
 *          status 1 - If user's progress Photos data added, with user's progress Photos object
 *          status 2 - If user's progress Photos not added, with appropriate message
 */
user_progress_photo_helper.insert_user_progress_photo = async user_progress_photo_obj => {
  try {
    let user_progress_photo = await UserProgressPhotos.insertMany(
      user_progress_photo_obj
    );
    return {
      status: 1,
      message: "user progress photos inserted",
      user_progress_photo: user_progress_photo
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
 * delete_user_progress_photo is used to delete user's progress photos
 *
 * @return  status 0 - If any internal error occured while update user's progress photos data, with error
 *          status 1 - If user's progress photos data updated, with user's progress photos object
 *          status 2 - If user's progress photos not updated, with appropriate message
 */
user_progress_photo_helper.delete_user_progress_photo = async id => {
  try {
    let userProgressPhoto = await UserProgressPhotos.findOne(id);
    if (userProgressPhoto) {
      let userProgressId = userProgressPhoto.progressId
        ? userProgressPhoto.progressId
        : null;
      let deleteResource = await UserProgressPhotos.deleteOne(
        userProgressPhoto
      );
      let remainingProgressPhotos = await UserProgressPhotos.count({
        progressId: userProgressId
      });
      if (
        typeof remainingProgressPhotos === "undefined" ||
        remainingProgressPhotos <= 0
      ) {
        await UserProgress.deleteOne({ _id: userProgressId });
      }
      let responseObj = {
        status: 1,
        message: "Record has been deleted",
        user_progress_photo: deleteResource
      };
      return responseObj;
    } else {
      let responseObj = { status: 0, message: "Record not found", error: null };
      return responseObj;
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting user progress photo",
      error: err
    };
  }
};

user_progress_photo_helper.deleteUserProgressById = async _id => {
  try {
    let cond = { _id };
    let deleteResource = await UserProgress.deleteOne(cond);
    if (deleteResource) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

user_progress_photo_helper.getUserProgressByDate = async cond => {
  try {
    let aggrCond = [
      {
        $match: cond
      },
      {
        $lookup: {
          from: "user_progress_photos",
          foreignField: "progressId",
          localField: "_id",
          as: "user_progress_photos"
        }
      }
    ];
    let userProgress = await UserProgress.aggregate(aggrCond);
    if (userProgress && userProgress.length > 0) {
      let responseData = {
        status: 1,
        message: "User progress photos found",
        data: userProgress
      };
      return responseData;
    } else {
      let responseData = {
        status: 0,
        message: "Something went wrong! please try again later.",
        error: null
      };
      return responseData;
    }
  } catch (error) {
    let responseData = {
      status: 0,
      message: "Something went wrong! please try again later.",
      error: error
    };
    return responseData;
  }
};

user_progress_photo_helper.countTotalUsersProgresPhotos = async userId => {
  try {
    const resource = await UserProgressPhotos.count({ userId });
    return resource;
  } catch (error) {
    return 0;
  }
};

user_progress_photo_helper.insert_user_progress_activity_photo = async user_progress_photo_obj => {
  try {
    let user_progress_photo = await UserProgressActivityPhotos.insertMany(
      user_progress_photo_obj
    );
    console.log("===========user_progress_photo===========");
    console.log(user_progress_photo);
    console.log("==========================");
    return {
      status: 1,
      message: "user progress photos inserted",
      user_progress_photo: user_progress_photo
    };
  } catch (err) {
    console.log("===========err===========");
    console.log(err);
    console.log("==========================");
    return {
      status: 0,
      message: "Error occured while inserting user progress photo",
      error: err
    };
  }
};

user_progress_photo_helper.get_recent_hashTags = async (limit, userId) => {
  try {
    let resp_data = await UserProgressPhotos.aggregate([
      {
        $match: {
          userId: userId
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $unwind: "$hashTags"
      },
      {
        $group: {
          _id: "$hashTags"
        }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          tag: "$_id"
        }
      }
    ]);
    return {
      status: 1,
      message: "user progress recent hashTags",
      hashTags: resp_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user hashTags",
      error: err
    };
  }
};
module.exports = user_progress_photo_helper;
