//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var FavouriteBadgesSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    badgesId: { type: mongoose.Schema.Types.ObjectId, ref: "badges" },
    isFavourite: { type: Boolean, default: false, required: true }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "modifiedAt"
    }
  }
);

// Compile model from schema
var FavouriteBadges = mongoose.model(
  "favourite_badges",
  FavouriteBadgesSchema,
  "favourite_badges"
);

module.exports = FavouriteBadges;
