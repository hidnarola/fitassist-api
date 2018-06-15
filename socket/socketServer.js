var io = require("socket.io")();
var myIo = {};
var users = new Map();
var socketToUsers = new Map();
myIo.init = function(server) {
  io.attach(server);
  io.on("connection", function(socket) {
    socket.on("join", function(userData) {
      var id = userData.authUserId;
      var user = users.get(id);
      if (user) {
        user.socketIds.push(socket.id);
      } else {
        var obj = {
          userData: userData,
          socketIds: []
        };
        users.set(id, obj);
      }
      socketToUsers.set(socket.id, id);
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
    console.log("Socket Connected With socket id : -", socket.id);
  });
  myIo.io = io;
  myIo.users = users;
  myIo.socketToUser = socketToUsers;
};
module.exports = myIo;
