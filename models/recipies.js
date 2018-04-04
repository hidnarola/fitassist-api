//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var RecipiesSchema = new Schema({
    name: {type: String, required:true},
    description: {type: String, default:null},
    image: {type: String, default:null},
    method: {type: String, default:null},
    ingredients: [{type: String, default:null}],
    preparationTime: {type: Number, default:null},
    cookTime: {type: Number, default:null},
    difficultyLevel: {type: String, enum: ['easy', 'meduim', 'hard'], default:'easy'},
    rating: {type: Number,default:0},
    recipeType: {type: String, enum: ["vegetarian","vegan","dairy-free","kosher","islam","coeliac","paleo","pescaterian"], required:true},
    nutritions: {type: String, required:true},
}, {versionKey: false});

// Compile model from schema
var BodyPart = mongoose.model('recipies', RecipiesSchema, 'recipies');

module.exports = BodyPart;