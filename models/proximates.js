//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var ProximatesSchema = new Schema({
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
    water: {
        type: String
    },
    totalNitrogen: {
        type: String,
    },
    protein: {
        type: String,
    },
    fat: {
        type: String,
    },
    carbohydrate: {
        type: String
    },
    energyKcal: {
        type: String
    },
    energyKj: {
        type: String
    },
    starch: {
        type: String
    },
    oligosaccharide: {
        type: String
    },
    totalSugars: {
        type: String
    },
    glucose: {
        type: String
    },
    galactose: {
        type: String
    },
    fructose: {
        type: String
    },
    sucrose: {
        type: String
    },
    maltose: {
        type: String
    },
    lactose: {
        type: String
    },
    alcohol: {
        type: String
    },
    nsp: {
        type: String
    },
    aoacFibre: {
        type: String
    },
    satdFaFa: {
        type: String
    },
    satdFaFd: {
        type: String
    },
    n6PolyFa: {
        type: String
    },
    n6PolyFood: {
        type: String
    },
    n3PolyFa: {
        type: String
    },
    n3PolyFood: {
        type: String
    },
    cisMonoFa: {
        type: String
    },
    cisMonoFaFood: {
        type: String
    },
    monoFaFood: {
        type: String
    },
    cisPolyuFa: {
        type: String
    },
    cisPolyFaFood: {
        type: String
    },
    polyFaFood: {
        type: String
    },
    satFaExclBrFa: {
        type: String
    },
    satFaExclBrFood: {
        type: String
    },
    branchedChainFaFa: {
        type: String
    },
    branchedChainFaFood: {
        type: String
    },
    transFasFa: {
        type: String
    },
    transFasFood: {
        type: String
    },
    cholesterol: {
        type: String
    },
    monoFaFa: {
        type: String
    },
    polyFaFa: {
        type: String
    },
    _1tsp: {
        type: String
    },
    _1tbsp: {
        type: String
    },
    _1cup: {
        type: String
    },
    _1leaf: {
        type: String
    },
    _1large: {
        type: String
    },
    _1medium: {
        type: String
    },
    _1root: {
        type: String
    },
    _1small: {
        type: String
    },
    _1extra_large:{
        type: String
    },
    _1tip: {
        type: String
    }
}, {
        versionKey: false
    });

// Compile model from schema
var Proximates = mongoose.model("proximates", ProximatesSchema, "proximates");

module.exports = Proximates;