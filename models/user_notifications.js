//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserNotificationsSchema = new Schema(
  {
    sender: { type: Object, required: true, default: null },
    receiver: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      enum: [
        "friend_request_approved",
        "like_post",
        "comment_post",
        "badge_awarded",
        "submit_post"
      ],
      required: true
    },
    timelineId: { type: String },
    body: { type: String, required: true },
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
