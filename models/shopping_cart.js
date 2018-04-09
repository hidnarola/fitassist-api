//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var ShoppingCartSchema = new Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ingredients",
      required: true
    },
    qty: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var BodyPart = mongoose.model(
  "shoppingcart",
  ShoppingCartSchema,
  "shoppingcart"
);

module.exports = BodyPart;
