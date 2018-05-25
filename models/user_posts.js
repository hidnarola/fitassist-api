//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserPostsSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    createdBy: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true
    },
    description: { type: String, default: null },
    privacy: { type: Number, default: 3 },
    postType: {
      type: String,
      enum: ["gallery", "timeline"],
      required: true,
      default: "timeline"
    },
    status: { type: Number, default: 1 },
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserPost = mongoose.model("user_posts", UserPostsSchema, "user_posts");

module.exports = UserPost;
