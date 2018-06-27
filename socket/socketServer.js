var io = require("socket.io")();
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose");
var user_notification_helper = require("../helpers/notification_helper");
var chat_helper = require("../helpers/chat_helper");
var user_helper = require("../helpers/user_helper");
var config = require("../config");
var logger = config.logger;

var myIo = {};
var users = new Map();
var socketToUsers = new Map();
myIo.init = function(server) {
  io.attach(server);
  io.on("connection", function(socket) {
    socket.on("join", function(token) {
      var decoded = jwtDecode(token);
      var authUserId = decoded.sub;
      var user = users.get(authUserId);
      if (user) {
        if (user.socketIds.indexOf(socket.id) < 0) {
          user.socketIds.push(socket.id);
        }
      } else {
        var obj = {
          socketIds: [socket.id]
        };
        users.set(authUserId, obj);
      }

      socketToUsers.set(socket.id, authUserId);
    });

    /**
     * @api {socket on} user_notifications_count  Get user notification counts
     * @apiName Get user notification counts
     * @apiGroup  Sokets
     * @apiParam {String} token Token of user
     * @apiSuccess (Success 200) {Number} count count of notifications
     */

    socket.on("user_notifications_count", async function(token) {
      var decoded = jwtDecode(token);
      var authUserId = decoded.sub;
      var user = users.get(authUserId);
      var user_notifications_count = await user_notification_helper.get_notifications_count(
        {
          "receiver.authUserId": authUserId,
          isSeen: 0
        }
      );

      var socketIds = user.socketIds;
      socketIds.forEach(socketId => {
        io.to(socketId).emit("receive_user_notification_count", {
          count: user_notifications_count.count
        });
      });
    });

    /**
     * @api {socket on} request_users_conversation_channels  Get user channels
     * @apiName Get user channels
     * @apiGroup  Sokets
     * @apiParam {Object} data Data of user
     * @apiSuccess (Success 200) {JSON} resp_data resp_data of channel
     */
    socket.on("request_users_conversation_channels", async function(data) {
      var resp_data = {};
      var decoded = jwtDecode(data.token);
      var authUserId = decoded.sub;
      var user = users.get(authUserId);
      var socketIds = user.socketIds;
      var start = parseInt(data.start ? data.start : 0);
      var limit = parseInt(data.limit ? data.limit : 10);

      try {
        resp_data = await chat_helper.get_messages(
          authUserId,
          { $skip: start },
          { $limit: limit }
        );

        if (resp_data.status == 0) {
          logger.error(
            "Error occured while fetching chat messages = ",
            resp_data
          );
        } else {
          logger.trace("chat messages got successfully = ", resp_data);
        }
      } catch (error) {
        resp_data.message = "Internal server error! please try again later.";
        resp_data.status = 0;
      } finally {
        socketIds.forEach(socketId => {
          io.to(socketId).emit("receive_users_conversation_channel", resp_data);
        });
      }
    });

    /**
     * @api {socket on} get_user_conversation_by_channel  Get user's messages by channel ID
     * @apiName Get user's messages by channel ID
     * @apiGroup  Sokets
     * @apiParam {Object} data Data of user(token,channel_id,start,end)
     * @apiSuccess (Success 200) {JSON} resp_data resp_data of channel
     */
    socket.on("get_user_conversation_by_channel", async function(data) {
      var resp_data = {};
      var decoded = jwtDecode(data.token);
      var authUserId = decoded.sub;
      var user = users.get(authUserId);
      var socketIds = user.socketIds ? user.socketIds : [];
      var start = parseInt(data.start ? data.start : 0);
      var limit = parseInt(data.limit ? data.limit : 10);
      var condition = {
        _id: mongoose.Types.ObjectId(data.channel_id),
        $or: [{ userId: authUserId }, { friendId: authUserId }]
      };

      try {
        resp_data = await chat_helper.get_conversation(
          authUserId,
          condition,
          { $skip: start },
          { $limit: limit }
        );

        if (resp_data.status == 0) {
          logger.error(
            "Error occured while fetching chat messages = ",
            resp_data
          );
        } else {
          logger.trace("chat messages got successfully = ", resp_data);
        }
      } catch (error) {
        resp_data.message = "Internal server error! please try again later.";
        resp_data.status = 0;
        logger.error(
          "Error occured while fetching chat messages = ",
          resp_data
        );
      } finally {
        socketIds.forEach(socketId => {
          io.to(socketId).emit(
            "receive_users_conversation_by_channel",
            resp_data
          );
        });
      }
    });

    /**
     * @api {socket on} send_new_message  Get user's messages by channel ID
     * @apiName Get user's messages by channel ID
     * @apiGroup  Sokets
     * @apiParam {Object} data Data of user(token,channel_id,start,end)
     * @apiSuccess (Success 200) {JSON} resp_data resp_data of channel
     */
    socket.on("send_new_message", async function(data) {
      var resp_data = {};
      var decoded = jwtDecode(data.token);
      var authUserId = decoded.sub;

      var sender = users.get(authUserId);

      var socketIdsForSender =
        sender && sender.socketIds ? sender.socketIds : [];

      var reciever = users.get(data.friendId);

      var socketIdsForReceiver =
        reciever && reciever.socketIds ? reciever.socketIds : [];

      var chat_data;

      try {
        var timestamp = data.timestamp;
        var respObj = {};

        var conversations_obj = {
          userId: authUserId,
          friendId: data.friendId
        };
        var conversations_replies_obj = {
          userId: authUserId,
          message: data.message
        };
        chat_data = await chat_helper.send_message(
          conversations_obj,
          conversations_replies_obj
        );

        if (chat_data.status === 1) {
          var user = await user_helper.get_user_by_id(chat_data.channel.userId);
          respObj.status = chat_data.status;
          respObj.message = chat_data.message;
          respObj.channel = {
            _id: chat_data.channel.conversationId,
            message: {},
            metadata: {}
          };
          respObj.channel.metadata = {
            timestamp: timestamp
          };
          respObj.channel.message = {
            _id: chat_data.channel._id,
            isSeen: chat_data.channel.isSeen,
            message: chat_data.channel.message,
            createdAt: chat_data.channel.createdAt,
            fullName:
              user.user.firstName +
              (user.user.lastName ? ` ${user.user.lastName}` : ""),
            authUserId: user.user.authUserId,
            username: user.user.username,
            avatar: user.user.avatar,
            flag: "sent"
          };

          return res.status(config.OK_STATUS).json(respObj);
        } else {
          logger.error("Error while sending message = ", chat_data);
          return res.status(config.BAD_REQUEST).json({ chat_data });
        }
      } catch (error) {
        chat_data.message = "Internal server error! please try again later.";
        chat_data.status = 0;
      } finally {
        socketIdsForSender.forEach(socketId => {
          io.to(socketId).emit("receive_sent_new_message_response", respObj);
        });
        socketIdsForReceiver.forEach(socketId => {
          io.to(socketId).emit("receive_new_message", respObj);
        });
      }
    });

    socket.on("disconnect", function() {
      var socketId = this.id;
      var socketToUser = socketToUsers.get(socketId);
      if (socketToUser) {
        var user = users.get(socketToUser);
        if (user) {
          var index = user.socketIds.indexOf(socketId);
          if (index >= 0) {
            user.socketIds.splice(index, 1);
          }
        }
        socketToUsers.delete(socketId);
      }
      console.log("Disconnect");
    });
    console.log("Connected : ", socket.id);
  });
  myIo.io = io;
  myIo.users = users;
  myIo.socketToUser = socketToUsers;
};
module.exports = myIo;
