//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var ConversationSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true
    },
    friendId: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true
    },
    isDeletedBy: { type: Number, default: null },
    isDeleted: { type: Number, default: 0 },
    status: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var Conversations = mongoose.model(
  "conversations",
  ConversationSchema,
  "conversations"
);

module.exports = Conversations;
