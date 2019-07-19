//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var SfaFoodSchema = new Schema({
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
    c4_Food: {
        type: String
    },
    c6_Food: {
        type: String
    },
    c8_Food: {
        type: String
    },
    "c10_Food": {
        type: String
    },
    "c11_Br_Food": {
        type: String
    },
    "c12_Food": {
        type: String
    },
    "C12_Br_Food": {
        type: String
    },
    "c13_Food": {
        type: String
    },
    "c13_Br_Food": {
        type: String
    },
    "c14_Food": {
        type: String
    },
    "c14_Br_Food": {
        type: String
    },
    "c15_Food": {
        type: String
    },
    "c15_Br_Food": {
        type: String
    },
    "c16_Food": {
        type: String
    },
    "c16_Br_Food": {
        type: String
    },
    "c17_Food": {
        type: String
    },
    "c17_Br_Food": {
        type: String
    },
    "c18_Food": {
        type: String
    },
    "c18_Br_Food": {
        type: String
    },
    "c19_Food": {
        type: String
    },
    "c20_Food": {
        type: String
    },
    "c20_Br_Food": {
        type: String
    },
    "c22_Food": {
        type: String
    },
    "c22_Br_Food": {
        type: String
    },
    "c24_Food": {
        type: String
    },
    "c24_Br_Food": {
        type: String
    },
    "c25_Br_Food": {
        type: String
    }
}, {
        versionKey: false
    });

// Compile model from schema
var SfaFood = mongoose.model("sfaFood", SfaFoodSchema, "sfaFood");

module.exports = SfaFood;