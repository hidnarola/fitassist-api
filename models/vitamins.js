//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var VitaminsSchema = new Schema({
    foodCode: {
        type: String
    },
    foodName: {
        type: String
    },
    description: {
        type: String
    },
    group: {
        type: String,
    },
    previous: {
        type: String
    },
    mainDataReference: {
        type: String
    },
    footNote: {
        type: String
    },
    retinol: {
        type: String
    },
    carotene: {
        type: String
    },
    retinolEquivalent: {
        type: String
    },
    vitaminD: {
        type: String
    },
    vitaminE: {
        type: String
    },
    vitaminK1: {
        type: String
    },
    thiamin: {
        type: String
    },
    riboflavin: {
        type: String
    },
    niacin: {
        type: String
    },
    tryptophan60: {
        type: String
    },
    niacinEquivalent: {
        type: String
    },
    vitaminB6: {
        type: String
    },
    vitaminB12: {
        type: String
    },
    folate: {
        type: String
    },
    pantothenate: {
        type: String
    },
    biotin: {
        type: String
    },
    vitaminC: {
        type: String
    },
}, {
        versionKey: false
    });

// Compile model from schema
var Vitamins = mongoose.model("vitamins", VitaminsSchema, "vitamins");

module.exports = Vitamins;