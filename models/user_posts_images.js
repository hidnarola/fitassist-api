//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserPostsImagesSchema = new Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_posts",
      required: true
    },
    image: { type: String, required: true },
    privacy: { type: Number, default: 3 },
    status: { type: Number, default: 1 },
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserPostsImages = mongoose.model(
  "user_posts_images",
  UserPostsImagesSchema,
  "user_posts_images"
);

module.exports = UserPostsImages;
