var UserPost = require("./../models/user_posts");
var UserPostsImages = require("./../models/user_posts_images");
var user_post_helper = {};

/*
 * get_user_post_photos is used to fetch all user's post photos
 * 
 * @return  status 0 - If any internal error occured while fetching user's post photos data, with error
 *          status 1 - If user's post photos data found, with user's post photos object
 *          status 2 - If user's post photos not found, with appropriate message
 */
user_post_helper.get_user_post_photos = async (username, skip, limit) => {
  try {
    var user_post_photos = await UserPost.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "authUserId",
          as: "users"
        }
      },
      {
        $unwind: "$users"
      },
      {
        $match: { "users.username": username, isDeleted: 0 }
      },
      {
        $lookup: {
          from: "user_posts_images",
          localField: "_id",
          foreignField: "postId",
          as: "images"
        }
      },
      {
        $unwind: "$images"
      },
      {
        $match: { "images.isDeleted": 0 }
      },
      {
        $group: {
          _id: "$_id",
          description: { $first: "$description" },
          privacy: { $first: "$privacy" },
          postType: { $first: "$postType" },
          status: { $first: "$status" },
          userId: { $first: "$userId" },
          images: { $addToSet: "$images" }
        }
      },
      skip,
      limit
    ]);
    if (user_post_photos || user_post_photos.length != 0) {
      return {
        status: 1,
        message: "User post photos found",
        user_gallery_photos: user_post_photos
      };
    } else {
      return { status: 2, message: "No user post photos available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user post photos",
      error: err
    };
  }
};

/*
 * get_user_timeline is used to fetch all user's timeline data
 * 
 * @return  status 0 - If any internal error occured while fetching user's post
 * photos data, with error
 *          status 1 - If user's post photos data found, with user's post 
 * photos object
 *          status 2 - If user's post photos not found, with appropriate message
 */
user_post_helper.get_user_timeline = async user_auth_id => {
  try {
    var timeline = await UserPost.aggregate([
      {
        $match: user_auth_id
      },
      {
        $lookup: {
          from: "user_posts_images",
          localField: "_id",
          foreignField: "postId",
          as: "timeline_images"
        }
      },
      {
        $unwind: {
          path: "$timeline_images",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "authUserId",
          as: "createdDetail"
        }
      },
      {
        $unwind: {
          path: "$createdDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "authUserId",
          as: "ownerDetail"
        }
      },
      {
        $unwind: {
          path: "$ownerDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likes"
        }
      },
      {
        $unwind: {
          path: "$likes",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "likes.userId",
          foreignField: "authUserId",
          as: "likesDetails"
        }
      },
      {
        $unwind: {
          path: "$likesDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments"
        }
      },
      {
        $unwind: {
          path: "$comments",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.userId",
          foreignField: "authUserId",
          as: "commentsDetails"
        }
      },
      {
        $unwind: {
          path: "$commentsDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id",
          firstName: { $first: "$ownerDetail.firstName" },
          lastName: { $first: "$ownerDetail.lastName" },
          description: { $first: "$$ROOT.description" },
          privacy: { $first: "$$ROOT.privacy" },
          timeline_images: { $addToSet: "$timeline_images" },
          created_by: {
            $first: {
              _id: "$$ROOT.createdDetail._id",
              userAuthId: "$$ROOT.createdDetail.userId",
              firstName: "$$ROOT.createdDetail.firstName",
              lastName: "$$ROOT.createdDetail.lastName",
              avatar: "$$ROOT.createdDetail.avatar"
            }
          },
          owner_by: {
            $first: {
              _id: "$ownerDetail._id",
              userAuthId: "$ownerDetail.userId",
              firstName: "$ownerDetail.firstName",
              lastName: "$ownerDetail.lastName",
              avatar: "$ownerDetail.avatar"
            }
          },
          // likes: { $addToSet: "$likes" },
          // comments: { $addToSet: "$comments" },
          likes: {
            $addToSet: {
              authUserId: "$likesDetails.authUserId",
              firstName: "$likesDetails.firstName",
              lastName: "$likesDetails.lastName",
              avatar: "$likesDetails.avatar",
              username: "$likesDetails.username",
              create_date: "$likes.createdAt"
            }
          },
          // comments_by: { $addToSet: "$commentsDetails" },
          comments: {
            $addToSet: {
              authUserId: "$commentsDetails.authUserId",
              firstName: "$commentsDetails.firstName",
              lastName: "$commentsDetails.lastName",
              avatar: "$commentsDetails.avatar",
              username: "$commentsDetails.username",
              comment: "$comments.comment",
              create_date: "$comments.createdAt"
            }
          }
        }
      }
    ]);
    if (timeline || timeline.length != 0) {
      return {
        status: 1,
        message: "User timeline found",
        timeline: timeline
      };
    } else {
      return { status: 2, message: "No user timeline available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user timeline",
      error: err
    };
  }
};

/*
 * get_user_post_photo_by_id is used to fetch all user's post photos
 * 
 * @return  status 0 - If any internal error occured while fetching user's post photos data, with error
 *          status 1 - If user's post photos data found, with user's post photos object
 *          status 2 - If user's post photos not found, with appropriate message
 */
user_post_helper.get_user_post_photo_by_id = async id => {
  try {
    var user_post_photo = await UserPostsImages.findOne(id);
    if (user_post_photo && user_post_photo.length != 0) {
      return {
        status: 1,
        message: "User post photos found",
        user_post_photo: user_post_photo
      };
    } else {
      return { status: 2, message: "No user post photos available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user post photos",
      error: err
    };
  }
};

/*
 * insert_user_post is used to add all user's post 
 * 
 * @return  status 0 - If any internal error occured while add user's post  data, with error
 *          status 1 - If user's post  data added, with user's post Photos object
 *          status 2 - If user's post  not added, with appropriate message
 */
user_post_helper.insert_user_post = async user_post_photo_obj => {
  let user_post_photo = new UserPost(user_post_photo_obj);
  try {
    let user_post_data = await user_post_photo.save();
    if (user_post_data) {
      return {
        status: 1,
        message: "user' inserted in post",
        user_post_photo: user_post_data
      };
    } else {
      return {
        status: 2,
        message: "user' not inserted in post",
        user_post_photo: user_post_data
      };
    }
    return {
      status: 1,
      message: "user' photo inserted in post",
      user_post_photo: user_post_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user's photo in post",
      error: err
    };
  }
};

/*
 * insert_user_post_image is used to add all user's post Photos
 * 
 * @return  status 0 - If any internal error occured while add user's post Photos data, with error
 *          status 1 - If user's post Photos data added, with user's post Photos object
 *          status 2 - If user's post Photos not added, with appropriate message
 */
user_post_helper.insert_user_post_image = async user_post_photo_obj => {
  let user_post_photo = new UserPostsImages(user_post_photo_obj);
  try {
    let user_post_photo_data = await user_post_photo.save();
    if (user_post_photo_data) {
      return {
        status: 1,
        message: "user' photo inserted in post images",
        user_post_photo: user_post_photo_data
      };
    } else {
      return {
        status: 2,
        message: "user' photo not inserted in post images",
        user_post_photo: user_post_photo_data
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user's photo in post",
      error: err
    };
  }
};

/*
 * update_user_post_photo is used to update user's post photos
 * 
 * @return  status 0 - If any internal error occured while update user's post photos data, with error
 *          status 1 - If user's post photos data updated, with user's post photos object
 *          status 2 - If user's post photos not updated, with appropriate message
 */
user_post_helper.update_user_post_photo = async (
  authUserId,
  user_post_photo_obj
) => {
  try {
    let user_post_photo = await UserPostsImages.findOneAndUpdate(
      authUserId,
      user_post_photo_obj,
      { new: true }
    );
    if (!user_post_photo) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        user_post_photo: user_post_photo
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user post photo",
      error: err
    };
  }
};

/*
 * delete_user_post_photo is used to delete user's post photos
 * 
 * @return  status 0 - If any internal error occured while update user's post photos data, with error
 *          status 1 - If user's post photos data updated, with user's post photos object
 *          status 2 - If user's post photos not updated, with appropriate message
 */
user_post_helper.delete_user_post_photo = async (id, user_post_photo_obj) => {
  try {
    let user_post_photo = await UserPostsImages.findOneAndUpdate(
      id,
      user_post_photo_obj
    );
    if (!user_post_photo) {
      return { status: 2, message: "Record has not deleted" };
    } else {
      return {
        status: 1,
        message: "Record has been deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting user post photo",
      error: err
    };
  }
};
module.exports = user_post_helper;
