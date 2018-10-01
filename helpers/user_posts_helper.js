var UserPost = require("./../models/user_posts");
var UserPostsImages = require("./../models/user_posts_images");
var UserTimeline = require("./../models/user_timeline");
var user_progress_photos_helper = require("./user_progress_photos_helper");
var _ = require("underscore");
var user_post_helper = {};

/*
 * count_post is used to count all user's post photos
 * 
 * @return  status 0 - If any internal error occured while couting user's post photos data, with error
 *          status 1 - If user's post photos data counted, with user's post photos object
 *          status 2 - If user's post photos not counted, with appropriate message
 */
user_post_helper.count_post = async id => {
  try {
    var user_post_photos = await UserPost.find(id).count();

    if (user_post_photos) {
      return {
        status: 1,
        message: "User photos found",
        count: user_post_photos
      };
    } else {
      return {
        status: 2,
        message: "No user photos available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while couting user photos",
      error: err
    };
  }
};

/*
 * get_user_post_photos is used to fetch all user's post photos
 * 
 * @return  status 0 - If any internal error occured while fetching user's post photos data, with error
 *          status 1 - If user's post photos data found, with user's post photos object
 *          status 2 - If user's post photos not found, with appropriate message
 */
user_post_helper.get_user_post_photos = async (
  username,
  skip,
  limit,
  sort = {
    $sort: {
      createdAt: -1
    }
  }
) => {
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
        $match: {
          "users.username": username,
          isDeleted: 0
        }
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
        $match: {
          "images.isDeleted": 0
        }
      },
      {
        $group: {
          _id: "$_id",
          description: {
            $first: "$description"
          },
          privacy: {
            $first: "$privacy"
          },
          postType: {
            $first: "$postType"
          },
          status: {
            $first: "$status"
          },
          userId: {
            $first: "$userId"
          },
          images: {
            $addToSet: "$images"
          }
        }
      },
      sort,
      skip,
      limit
    ]);

    if (user_post_photos || user_post_photos.length != 0) {
      return {
        status: 1,
        message: "User photos found",
        user_gallery_photos: user_post_photos
      };
    } else {
      return {
        status: 2,
        message: "No user photos available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user photos",
      error: err
    };
  }
};

/*
 * get_user_timeline_by_id is used to fetch all user's timeline data
 * @return  status 0 - If any internal error occured while fetching user's post photos data, with error
 *          status 1 - If user's post photos data found, with user's post photos object
 *          status 2 - If user's post photos not found, with appropriate message
 */
user_post_helper.get_user_timeline_by_id = async condition => {
  try {
    //#region timeline old query
    var timeline = await UserTimeline.aggregate([
      {
        $match: condition
      },
      {
        $lookup: {
          from: "user_progress_photos",
          localField: "progressPhotoId",
          foreignField: "_id",
          as: "user_progress_photos"
        }
      },
      {
        $unwind: {
          path: "$user_progress_photos",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "user_posts",
          localField: "postPhotoId",
          foreignField: "_id",
          as: "user_posts"
        }
      },
      {
        $unwind: {
          path: "$user_posts",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "user_posts_images",
          localField: "user_posts._id",
          foreignField: "postId",
          as: "user_post_images"
        }
      },
      {
        $unwind: {
          path: "$user_post_images",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "authUserId",
          as: "users"
        }
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "authUserId",
          as: "created_by"
        }
      },
      {
        $unwind: {
          path: "$created_by",
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
        $sort: {
          "likes.createdAt": 1
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
        $sort: {
          "comments.createdAt": 1
        }
      },
      {
        $group: {
          _id: "$_id",
          progress_photos: {
            $addToSet: "$user_progress_photos"
          },
          post_images: {
            $addToSet: "$user_post_images"
          },
          tag_line: {
            $first: "$tagLine"
          },
          type: {
            $first: "$type"
          },
          progress_description: {
            $first: "$user_progress_photos.description"
          },
          post_description: {
            $first: "$user_posts.description"
          },
          created_by: {
            $first: {
              authUserId: "$created_by.authUserId",
              firstName: "$created_by.firstName",
              lastName: "$created_by.lastName",
              avatar: "$created_by.avatar",
              username: "$created_by.username"
            }
          },
          owner_by: {
            $first: {
              authUserId: "$users.authUserId",
              firstName: "$users.firstName",
              lastName: "$users.lastName",
              avatar: "$users.avatar",
              username: "$users.username"
            }
          },
          privacy: {
            $first: "$user_posts.privacy"
          },
          createdAt: {
            $first: "$createdAt"
          },
          likes: {
            $addToSet: {
              _id: "$likes._id",
              authUserId: "$likesDetails.authUserId",
              firstName: "$likesDetails.firstName",
              lastName: "$likesDetails.lastName",
              avatar: "$likesDetails.avatar",
              username: "$likesDetails.username",
              create_date: "$likes.createdAt"
            }
          },
          comments: {
            $addToSet: {
              _id: "$comments._id",
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

    if (timeline && timeline.length != 0) {
      _.each(timeline, t => {
        var likes = [];
        var comments = [];
        _.each(t.likes, like => {
          if (Object.keys(like).length > 0) {
            likes.push(like);
          }
        });

        _.each(t.comments, comment => {
          if (Object.keys(comment).length > 0) {
            comments.push(comment);
          }
        });
        t.likes = likes;
        t.comments = comments;
      });
      // var tmp = _.sortBy(timeline[0].comments, function (o) {
      //   return o.createdAt;
      // });

      // // timeline[0].comments = tmp;

      return {
        status: 1,
        message: "User timeline found",
        timeline: timeline[0]
      };
    } else {
      return {
        status: 2,
        message: "No user timeline available"
      };
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
 * get_user_timeline is used to fetch all user's timeline data
 * @return  status 0 - If any internal error occured while fetching user's post photos data, with error 
 *        status 1 - If user's post photos data found, with user's post  
 *        status 2 - If user's post photos not found, with appropriate message
 */
user_post_helper.get_user_timeline = async (
  condition,
  skip = {},
  offset = {}
) => {
  try {
    //#region timeline old query
    var timeline = await UserTimeline.aggregate([
      {
        $match: condition
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      skip,
      offset,
      {
        $lookup: {
          from: "user_progress_photos",
          localField: "progressPhotoId",
          foreignField: "_id",
          as: "user_progress_photos"
        }
      },
      {
        $unwind: {
          path: "$user_progress_photos",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "user_posts",
          localField: "postPhotoId",
          foreignField: "_id",
          as: "user_posts"
        }
      },
      {
        $unwind: {
          path: "$user_posts",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "user_posts_images",
          localField: "user_posts._id",
          foreignField: "postId",
          as: "user_post_images"
        }
      },
      {
        $unwind: {
          path: "$user_post_images",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "authUserId",
          as: "users"
        }
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "authUserId",
          as: "created_by"
        }
      },
      {
        $unwind: {
          path: "$created_by",
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
        $sort: {
          "likes.createdAt": 1
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
        $sort: {
          "comments.createdAt": -1
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
          progress_photos: {
            $addToSet: "$user_progress_photos"
          },
          post_images: {
            $addToSet: "$user_post_images"
          },
          tag_line: {
            $first: "$tagLine"
          },
          type: {
            $first: "$type"
          },
          progress_description: {
            $first: "$user_progress_photos.description"
          },
          post_description: {
            $first: "$user_posts.description"
          },
          created_by: {
            $first: {
              firstName: "$created_by.firstName",
              lastName: "$created_by.lastName",
              avatar: "$created_by.avatar",
              username: "$created_by.username"
            }
          },
          owner_by: {
            $first: {
              firstName: "$users.firstName",
              lastName: "$users.lastName",
              avatar: "$users.avatar",
              username: "$users.username"
            }
          },
          privacy: {
            $first: "$privacy"
          },
          createdAt: {
            $first: "$createdAt"
          },
          likes: {
            $addToSet: {
              _id: "$likes._id",
              authUserId: "$likesDetails.authUserId",
              firstName: "$likesDetails.firstName",
              lastName: "$likesDetails.lastName",
              avatar: "$likesDetails.avatar",
              username: "$likesDetails.username",
              create_date: "$likes.createdAt"
            }
          },
          comments: {
            $addToSet: {
              _id: "$comments._id",
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
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    _.each(timeline, t => {
      var likes = [];
      var comments = [];
      var tmp = [];
      _.each(t.likes, like => {
        if (Object.keys(like).length > 0) {
          likes.push(like);
        }
      });
      _.each(t.comments, comment => {
        if (Object.keys(comment).length > 0) {
          comments.push(comment);
        }
      });
      tmp = _.sortBy(comments, function(o) {
        return o.create_date;
      });
      t.likes = likes;
      t.comments = tmp;
    });

    if (timeline || timeline.length != 0) {
      return {
        status: 1,
        message: "User timeline found",
        timeline: timeline
      };
    } else {
      return {
        status: 2,
        message: "No user timeline available"
      };
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
      return {
        status: 2,
        message: "No user post photos available"
      };
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
  condition,
  user_post_photo_obj
) => {
  try {
    let user_post_photo = await UserPostsImages.findOneAndUpdate(
      condition,
      user_post_photo_obj,
      {
        new: true
      }
    );
    if (!user_post_photo) {
      return {
        status: 2,
        message: "Record has not updated"
      };
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
      return {
        status: 2,
        message: "Record has not deleted"
      };
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
/*
 * delete_user_post_photo is used to delete user's post photos
 * 
 * @return  status 0 - If any internal error occured while update user's post photos data, with error
 *          status 1 - If user's post photos data updated, with user's post photos object
 *          status 2 - If user's post photos not updated, with appropriate message
 */
user_post_helper.delete_user_timeline_post = async (id, updateObj) => {
  try {
    let timeline_data = await UserTimeline.findOne(id);
    var progressPhotoId = timeline_data.progressPhotoId;
    var postPhotoId = timeline_data.postPhotoId;

    if (progressPhotoId) {
      let user_progress_photo = await user_progress_photos_helper.delete_user_progress_photo(
        {
          _id: progressPhotoId
        },
        {
          updateObj
        },
        {
          new: true
        }
      );
    }
    if (postPhotoId) {
      await UserPostsImages.findOneAndUpdate(
        {
          postId: postPhotoId
        },
        updateObj,
        {
          new: true
        }
      );
      await UserPost.findOneAndUpdate(
        {
          _id: postPhotoId
        },
        updateObj,
        {
          new: true
        }
      );
    }

    let timeline = await UserTimeline.findOneAndUpdate(id, updateObj, {
      new: true
    });
    if (!timeline) {
      return {
        status: 2,
        message: "Record has not deleted"
      };
    } else {
      return {
        status: 1,
        message: "Record has been deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting user timeline",
      error: err
    };
  }
};
module.exports = user_post_helper;
