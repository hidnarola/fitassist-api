var Conversations = require("./../models/conversations");
var ConversationsReplies = require("./../models/conversations_replies");
var _ = require("underscore");
var chat_helper = {};

/*
 * get_messages is used to fetch all messages data
 * 
 * @return  status 0 - If any internal error occured while fetching chat messages data, with error
 *          status 1 - If chat messages data found, with chat messages object
 *          status 2 - If chat messages not found, with appropriate message
 */
chat_helper.get_messages = async (userId, friendId) => {
  try {
    var conversation = await Conversations.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                {
                  $and: [{ userId: friendId }, { friendId: userId }]
                },
                {
                  $and: [{ userId: userId }, { friendId: friendId }]
                }
              ]
            },
            {
              isDeleted: 0
            }
          ]
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $lookup: {
          from: "conversations_replies",
          localField: "_id",
          foreignField: "conversationId",
          as: "message"
        }
      },
      {
        $unwind: "$message"
      },
      {
        $match: {
          "message.isDeleted": 0
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "authUserId",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "users",
          localField: "friendId",
          foreignField: "authUserId",
          as: "friend"
        }
      },
      {
        $unwind: "$friend"
      },
      {
        $group: {
          _id: "$_id",
          user: {
            $first: {
              firstName: "$user.firstName",
              lastName: "$user.lastName",
              avatar: "$user.avatar",
              username: "$user.username",
              authUserId: "$user.authUserId"
            }
          },
          friend: {
            $first: {
              firstName: "$friend.firstName",
              lastName: "$friend.lastName",
              avatar: "$friend.avatar",
              username: "$friend.username",
              authUserId: "$friend.authUserId"
            }
          },
          message: { $first: "$message.reply" },
          createdAt: { $first: "$message.createdAt" }
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          friend: 1,
          message: 1,
          createdAt: 1,
          flag: {
            $cond: {
              if: { $eq: ["$user.authUserId", userId] },
              then: "sent",
              else: "recieved"
            }
          }
        }
      }
    ]);

    if (conversation && conversation.length > 0) {
      return {
        status: 1,
        message: "conversation found",
        conversation: conversation
      };
    } else {
      return { status: 2, message: "No conversation available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding conversation",
      error: err
    };
  }
};

/*
 * send_message is used to insert into conversation_reply collection
 * 
 * @param   chat_message_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting chat_message, with error
 *          status  1 - If chat_message inserted, with inserted chat_message document and appropriate message
 * 
 * @developed by "amc"
 */
chat_helper.send_message = async (
  conversations_obj,
  conversations_replies_obj
) => {
  try {
    let chat_message_data = new Conversations(conversations_obj);
    let chat_message = await chat_message_data.save();
    conversations_replies_obj.conversationId = chat_message._id;
    chat_message_data = new ConversationsReplies(conversations_replies_obj);
    chat_message = await chat_message_data.save();
    return { status: 1, message: "message sent", conversation: chat_message };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while sending message",
      error: err
    };
  }
};

/*
 * delete_chat_message_by_user_id is used to delete chat_message from database
 * 
 * @param   updateObject String  _id of user that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of chat_message, with error
 *          status  1 - If chat_message deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
chat_helper.delete_chat_message_by_user_id = async (id, updateObject) => {
  try {
    let resp = await Conversations.updateMany(id, updateObject);
    let resp_data = await Conversations.find(id);
    deleteIds = [];
    _.each(resp_data, (single, index) => {
      deleteIds.push(single._id);
    });

    let resp2 = await ConversationsReplies.updateMany(
      { conversationId: { $in: deleteIds } },
      updateObject
    );
    if (!resp && !resp2) {
      return { status: 2, message: "chat message not found" };
    } else {
      return { status: 1, message: "chat message deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting chat message",
      error: err
    };
  }
};

module.exports = chat_helper;
