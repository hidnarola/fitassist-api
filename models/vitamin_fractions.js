//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var VitaminFractionsSchema = new Schema({
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
    allTransRetinol: {
        type: String
    },
    _13CisRetinol: {
        type: String
    },
    dehydroretinol: {
        type: String
    },
    retinaldehyde: {
        type: String
    },
    alphaCarotene: {
        type: String
    },
    betaCarotene: {
        type: String
    },
    cryptoxanthins: {
        type: String
    },
    lutein: {
        type: String
    },
    lycopene: {
        type: String
    },
    _25HydroxyVitaminD3: {
        type: String
    },
    cholecalciferol: {
        type: String
    },
    _5MehtylFolate: {
        type: String
    },
    alphaTocopherol: {
        type: String
    },
    betaTocopherol: {
        type: String
    },
    deltaTocopherol: {
        type: String
    },
    gammaTocopherol: {
        type: String
    },
    alphaTocotrienol: {
        type: String
    },
    gammaTocotrienol: {
        type: String
    }
}, {
        versionKey: false
    });

// Compile model from schema
var VitaminFractions = mongoose.model("vitamin_fractions", VitaminFractionsSchema, "vitamin_fractions");

module.exports = VitaminFractions;