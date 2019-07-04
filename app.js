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
require("./database/mongoDbConnection");

//helper

var user_helper = require("./helpers/user_helper");
var fs = require('fs');
var http = require('http');
var https = require('https');

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
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({
    extended: false, limit: "50mb", parameterLimit: 50000
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "doc")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
        expressValidator({
            customValidators: {
                isUniqueName: async (collection, condition) => {
                    var count = await collection.count(condition);
                    if (count === 0) {
                        return true;
                    } else {
                        return false;
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
var nutrition = require("./routes/nutritiondb");

app.use("/", index);
app.use("/user", user);
app.use("/admin", admin);
app.use("/nutritiondb", nutrition);

// error handlers

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

var serverpath = "http://localhost:3300/";
if (app.get("env") != "development") {
    serverpath = "https://167.99.90.169:3300/";
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

var server = {};
if (config.IS_HTTPS === 'true') {
    var cert = fs.readFileSync(config.SSL_CERT);
    var key = fs.readFileSync(config.SSL_KEY);

    var options = {
        key: key,
        cert: cert
    };
    server = https.createServer(options, app);
} else {
    server = http.createServer(app);
}

server.listen(config.node_port || 3000, function () {
    console.log('Server is running on :',serverpath, (config.node_port || 3300));
});

socket.init(server);

module.exports = app;