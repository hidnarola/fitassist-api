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
chat_helper.get_messages = async (userId, skip = {}, limit = {}) => {
  console.log("------------------------------------");
  console.log("userId : ", userId);
  console.log("------------------------------------");

  try {
    var conversation = await Conversations.aggregate([
      {
        $match: {
          $or: [
            {
              userId: userId
            },
            {
              friendId: userId
            }
          ]
        }
      },
      skip,
      limit,
      {
        $lookup: {
          from: "conversations_replies",
          foreignField: "conversationId",
          localField: "_id",
          as: "conversations"
        }
      },
      {
        $unwind: "$conversations"
      },
      {
        $lookup: {
          from: "users",
          foreignField: "authUserId",
          localField: "userId",
          as: "userId"
        }
      },
      {
        $unwind: "$userId"
      },
      {
        $lookup: {
          from: "users",
          foreignField: "authUserId",
          localField: "friendId",
          as: "friendId"
        }
      },
      {
        $unwind: "$friendId"
      },
      {
        $sort: {
          "conversations.createdAt": -1
        }
      },
      {
        $group: {
          _id: "$_id",
          lastReplyAt: { $first: "$lastReplyAt" },
          userData: { $first: "$userId" },
          friendData: { $first: "$friendId" },
          conversation: { $first: "$conversations" }
        }
      },
      {
        $sort: {
          lastReplyAt: -1
        }
      }
    ]);
    console.log("------------------------------------");
    console.log("conversation : ", conversation);
    console.log("------------------------------------");
    if (conversation) {
      return {
        status: 1,
        message: "conversation found",
        channels: conversation
      };
    } else {
      return { status: 2, message: "No messages available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding messages",
      error: err
    };
  }
};
/*
 * get_conversation is used to fetch all conversation data
 * 
 * @return  status 0 - If any internal error occured while fetching chat conversation data, with error
 *          status 1 - If chat conversation data found, with chat conversation object
 *          status 2 - If chat conversation not found, with appropriate message
 */
chat_helper.get_conversation = async (
  authUserId,
  condition,
  skip = {},
  limit = {}
) => {
  try {
    var conversation = await Conversations.aggregate([
      {
        $match: condition
      },
      {
        $lookup: {
          from: "conversations_replies",
          foreignField: "conversationId",
          localField: "_id",
          as: "messages"
        }
      },
      {
        $unwind: "$messages"
      },
      {
        $lookup: {
          from: "users",
          foreignField: "authUserId",
          localField: "messages.userId",
          as: "messages2"
        }
      },
      {
        $unwind: "$messages2"
      },
      skip,
      limit,
      { $sort: { "messages.createdAt": 1 } },
      {
        $group: {
          _id: "$_id",
          messages: {
            $push: {
              _id: "$messages._id",
              isSeen: "$messages.isSeen",
              message: "$messages.message",
              createdAt: "$messages.createdAt",
              fullName: {
                $concat: [
                  { $ifNull: ["$messages2.firstName", ""] },
                  " ",
                  { $ifNull: ["$messages2.lastName", ""] }
                ]
              },
              authUserId: "$messages2.authUserId",
              username: "$messages2.username",
              avatar: "$messages2.avatar",
              flag: {
                $cond: {
                  if: { $eq: ["$messages.userId", authUserId] },
                  then: "sent",
                  else: "recieved"
                }
              }
            }
          }
        }
      }
    ]);
    if (conversation) {
      return {
        status: 1,
        message: "conversation found",
        channel: conversation[0]
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
 * count_unread_messages is used to count all unread conversation message data
 * 
 * @return  status 0 - If any internal error occured while couting chat conversation data, with error
 *          status 1 - If chat conversation data count, with chat conversation object
 *          status 2 - If chat conversation not count, with appropriate message
 */
chat_helper.count_unread_messages = async userId => {
  try {
    var conversation = await Conversations.aggregate([
      {
        $match: {
          $or: [
            {
              userId: userId
            },
            {
              friendId: userId
            }
          ]
        }
      },
      {
        $lookup: {
          from: "conversations_replies",
          foreignField: "conversationId",
          localField: "_id",
          as: "messages"
        }
      },
      {
        $unwind: "$messages"
      },
      {
        $match: {
          "messages.isSeen": 0
        }
      },

      { $group: { _id: "$_id", messages: { $push: "$messages" } } }
    ]);

    console.log("------------------------------------");
    console.log("conversation : ", conversation);
    console.log("------------------------------------");

    var count = 0;
    _.each(conversation, function(single, index) {
      _.each(single.messages, function(single_msg) {
        if (single_msg.isSeen == 0) count++;
      });
    });

    if (conversation) {
      return {
        status: 1,
        message: `total ${count} unread messages`,
        count: conversation
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
    var conversation_pair = {
      $or: [
        {
          $and: [
            { userId: conversations_obj.userId },
            { friendId: conversations_obj.friendId }
          ]
        },
        {
          $and: [
            { userId: conversations_obj.friendId },
            { friendId: conversations_obj.userId }
          ]
        }
      ]
    };

    let check_conversation_channel = await Conversations.findOne(
      conversation_pair
    );
    if (check_conversation_channel) {
      conversation_id = check_conversation_channel._id;
    } else {
      let chat_message_data = new Conversations(conversations_obj);
      let chat_message = await chat_message_data.save();
      conversation_id = chat_message._id;
    }
    conversations_replies_obj.conversationId = conversation_id;

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
