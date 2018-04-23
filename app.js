var express = require("express");

var path = require("path");
var fs = require("fs");

var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var moment = require("moment");

var fileUpload = require("express-fileupload");
var expressValidator = require("express-validator");

// Create cluster environment
var cluster = require("cluster");
var numCPUs = require("os").cpus().length;

/* config files */
var config = require("./config");
var dbConnect = require("./database/mongoDbConnection");
var socket = require("./socket/socketServer");

var app = express();
app.use(fileUpload());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "doc")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(expressValidator());

// Support corss origin request
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "x-access-token,content-type,authorization"
  );

  // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // If option request, send okay response
  if (req.method == "OPTIONS") {
    res.status(200).json();
  } else {
    next();
  }
});

var static_data = require("./routes/static");
var index = require("./routes/index");
var admin = require("./routes/admin");
var user = require("./routes/user");

app.use("/", index);
app.use("/", static_data);
app.use("/user", user);
app.use("/admin", admin);

// error handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// development error handler, will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

// if (cluster.isMaster) {
//   for (var i = 0; i < numCPUs; i++) {
//     // Create a worker
//     cluster.fork();
//   }
// } else {
//   var server = app.listen((config.node_port || 3000), function () {
//     //console.log('Listening on port ' + (config.node_port || 3000) + '...');
//   });
//   socket.socketStartUp(server);
// }
// cluster.on('exit', function (worker, code, signal) {
//   console.log('Worker %d died with code/signal %s. Restarting worker...', worker.process.pid, signal || code);
//   cluster.fork();
// });

var server = app.listen(config.node_port || 3000, function() {
  console.log("Listening on port " + (config.node_port || 3000) + "...");
});

module.exports = app;
