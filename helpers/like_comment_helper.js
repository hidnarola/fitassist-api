var Likes = require("./../models/likes");
var Comments = require("./../models/comments");
var like_comment_helper = {};

/*
 * get_like is used to fetch like by post id and userid
 * 
 * @return  status 0 - If any internal error occured while fetching like data, with error
 *          status 1 - If like data found, with like object
 *          status 2 - If like data not found, with appropriate message
 */
like_comment_helper.get_like = async id => {
  try {
    var like = await Likes.findOne(id);
    if (like) {
      return { status: 1, message: "like found", like: like };
    } else {
      return { status: 2, message: "No like available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding like",
      error: err
    };
  }
};

/*
 * insert_comment is used to insert into comment collection
 * 
 * @param   comment_obj     JSON object consist of all property that need to insert in comment collection
 * 
 * @return  status  0 - If any error occur in inserting comment, with error
 *          status  1 - If comment inserted, with inserted comment document and appropriate message
 * 
 * @developed by "amc"
 */
like_comment_helper.insert_comment = async comment_obj => {
  let comment = new Comments(comment_obj);
  try {
    let comment_data = await comment.save();
    return { status: 1, message: "comment inserted", comment: comment_data };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting comment",
      error: err
    };
  }
};

/*
 * insert_like is used to insert into like collection
 * 
 * @param   like_obj     JSON object consist of all property that need to insert in like collection
 * 
 * @return  status  0 - If any error occur in inserting like, with error
 *          status  1 - If like inserted, with inserted like document and appropriate message
 * 
 * @developed by "amc"
 */
like_comment_helper.insert_like = async like_obj => {
  let like = new Likes(like_obj);
  try {
    let like_data = await like.save();
    return { status: 1, message: "like inserted", like: like_data };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting like",
      error: err
    };
  }
};

/*
 * update_comment is used to update comment 
 * 
 * @param   comment_id         String  comment_id of comment need to be update
 * @param   comment_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating comment, with error
 *          status  1 - If comment updated successfully, with appropriate message
 *          status  2 - If comment not updated, with appropriate message
 * 
 * @developed by "amc"
 */
like_comment_helper.update_comment = async (comment_id, comment_obj) => {
  try {
    let comment_data = await Comments.findOneAndUpdate(
      comment_id,
      comment_obj,
      { new: true }
    );
    if (!comment_data) {
      return { status: 2, message: "comment has not updated" };
    } else {
      return {
        status: 1,
        message: "comment has been updated",
        comment: comment_data
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating comment",
      error: err
    };
  }
};

/*
 * delete_comment is used to delete comment from database
 * 
 * @param   comment_id String  _id of comment that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of comment, with error
 *          status  1 - If comment deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
like_comment_helper.delete_comment = async id => {
  try {
    let resp = await Comments.findOneAndRemove(id);
    if (!resp) {
      return { status: 2, message: "comment not found" };
    } else {
      return { status: 1, message: "comment deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting comment",
      error: err
    };
  }
};

/*
 * dislike is used to delete like from database
 * 
 * @param   id String  id of like that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of like, with error
 *          status  1 - If like deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
like_comment_helper.delete_like = async id => {
  try {
    let resp = await Likes.findOneAndRemove(id);
    if (!resp) {
      return { status: 2, message: "no like record found" };
    } else {
      return { status: 1, message: "dislike successfully" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting like",
      error: err
    };
  }
};

module.exports = like_comment_helper;
