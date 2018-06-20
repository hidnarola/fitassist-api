//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var ConversationsRepliesSchema = new Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
      required: true
    },
    message: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true
    },
    isSeen: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
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
