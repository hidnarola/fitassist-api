var io = require("socket.io")();
var jwtDecode = require("jwt-decode");
var user_notification_helper = require("../helpers/notification_helper");
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
    });
    // console.log("Socket Connected With socket id : -", socket.id);
  });
  myIo.io = io;
  myIo.users = users;
  myIo.socketToUser = socketToUsers;
};
module.exports = myIo;
