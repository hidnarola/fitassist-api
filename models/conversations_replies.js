//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var ConversationsRepliesSchema = new Schema(
  {
    reply: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
      required: true
    },
    isDeleted: { type: Number, default: 0 },
    status: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var ConversationsReplies = mongoose.model(
  "conversations_replies",
  ConversationsRepliesSchema,
  "conversations_replies"
);

module.exports = ConversationsReplies;
