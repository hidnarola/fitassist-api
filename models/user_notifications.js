//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserNotificationsSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    content: { type: String, required: true },
    isSeen: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserNotifications = mongoose.model(
  "user_notifications",
  UserNotificationsSchema,
  "user_notifications"
);

module.exports = UserNotifications;
