//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var IngredientSchema = new Schema({
    name: {type: String, required:true},
    description: {type: String, default:null},
    image: {type: String, default:null},
    allowInShopList: {type: Boolean, default:true},
    isDeleted: {type: Boolean, default:false},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}

}, {versionKey: false});

// Compile model from schema
var Ingredients = mongoose.model('ingredients', IngredientSchema, 'ingredients');

module.exports = Ingredients;