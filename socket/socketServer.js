var io = require("socket.io")();
var socketFunction = {};
var socketMap = [];
socketFunction.socketStartUp = function(server) {
  io.attach(server);
  io.on("connection", function(socket) {
    newUser(socket);
    recieveMessage(socket);
  });
};
function newUser(socket) {
  socket.on("joinUser", username => {
    var newObj = {
      username,
      socket
    };
    socketMap.push(newObj);
    console.log("------------------------------------");
    console.log(" USER CONNECTED: ", newObj.username);
    console.log("------------------------------------");
  });
}
function recieveMessage(socket) {
  socket.on("recieveMessage", function(obj) {
    var receiver = obj.receiver;
    var receiverSocket = {};
    socketMap.map((user, index) => {
      if (user.username === receiver) {
        receiverSocket = user.socket;
      }
    });
    if (receiverSocket) {
      receiverSocket.emit("sendMessage", { msg: obj.msg });
    }
  });
}
module.exports = socketFunction;
