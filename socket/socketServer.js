var io = require("socket.io")();
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose");
var user_notification_helper = require("../helpers/notification_helper");
var chat_helper = require("../helpers/chat_helper");
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
        user.socketIds.push(socket.id);
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
     * @api {socket on} user_notifications_count  Get user notification counts
     * @apiName Get user notification counts
     * @apiGroup  Sokets
     * @apiParam {String} token Token of user
     * @apiSuccess (Success 200) {Number} count count of notifications
     */

    socket.on("messages_by_channel", async function(data) {
      var decoded = jwtDecode(data.token);
      var authUserId = decoded.sub;
      var user = users.get(authUserId);
      var channel_id = {
        _id: mongoose.Types.ObjectId(data.channel_id)
      };

      var start = parseInt(data.start ? data.start : 0);
      var limit = parseInt(data.limit ? data.limit : 10);

      var resp_data = await chat_helper.get_conversation(
        channel_id,
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

      // var socketIds = user.socketIds;
      // socketIds.forEach(socketId => {
      //   io.to(socketId).emit("receive_user_notification_count", {
      //     count: user_notifications_count.count
      //   });
      // });
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
      console.log("------------------------------------");
      console.log("start,limit : ", start, limit);
      console.log("------------------------------------");

      try {
        resp_data = await chat_helper.get_messages(
          authUserId,
          { $skip: start },
          { $limit: limit }
        );
        console.log("------------------------------------");
        console.log("resp_data : ", resp_data);
        console.log("------------------------------------");

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
      console.log("------------------------------------");
      console.log("disconnect : ");
      console.log("------------------------------------");
    });

    console.log("Socket Connected With socket id : -", socket.id);
  });
  myIo.io = io;
  myIo.users = users;
  myIo.socketToUser = socketToUsers;
};
module.exports = myIo;
