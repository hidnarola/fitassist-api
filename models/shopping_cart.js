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
    userId: {type: String, ref: "users", field:"authUserId", required: true},
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var ShoppingCart = mongoose.model(
  "shopping_cart",
  ShoppingCartSchema,
  "shopping_cart"
);

module.exports = ShoppingCart;
