var io = require("socket.io")();
var socketFunction = {};
socketFunction.socketStartUp = function(server) {
  io.attach(server);
  io.on("connection", function(socket) {
    // socket.on("subscribeToTimer", interval => {
    //   console.log("client is subscribing to timer with interval ", interval);
    //   setInterval(() => {
    //     socket.emit("timer", new Date());
    //   }, interval);
    // });
    console.log("New user is connected with socket:", socket.id);
  });
};
module.exports = socketFunction;
