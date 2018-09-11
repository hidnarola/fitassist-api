var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var fileUpload = require("express-fileupload");
var expressValidator = require("express-validator");

// Create cluster environment
var cluster = require("cluster");
var numCPUs = require("os").cpus().length;

/* config files */
var config = require("./config");
var socket = require("./socket/socketServer");

//helper

var user_helper = require("./helpers/user_helper");

var app = express();
// app.use(fileUpload());
app.use(fileUpload({
  limits: {
    fileSize: 15 * 1024 * 1024
  }
}));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "doc")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  expressValidator({
    customValidators: {
      isEmailAvailable: async (email, authUserId) => {
        var resp_data = await user_helper.get_user_by_id(authUserId);
        if (resp_data.status === 1) {
          if (resp_data.user.email != email) {
            var checkemaildata = await user_helper.checkvalue({
              email: email,
              authUserId: {
                $ne: authUserId
              }
            });
            return checkemaildata.count == 0;
          }
        }
      }
    },
    isImage: function (value, filename) {
      var extension = path.extname(filename).toLowerCase();
      switch (extension) {
        case ".jpg":
          return ".jpg";
        case ".jpeg":
          return ".jpeg";
        case ".png":
          return ".png";
        default:
          return false;
      }
    }
  })
);

// Support corss origin request
app.use(function (req, res, next) {
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

// var static_data = require("./routes/static");
var index = require("./routes/index");
var admin = require("./routes/admin");
var user = require("./routes/user");

app.use("/", index);
app.use("/user", user);
app.use("/admin", admin);

// error handlers

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

var serverpath = "http://localhost:3300/";
if (app.get("env") != "development") {
  serverpath = "http://167.99.90.169:3300/";
}


// development error handler, will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler, no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

var server = app.listen(config.node_port || 3000, function () {
  console.log('Server is running on :', (config.node_port || 3300));

});
socket.init(server);

module.exports = app;