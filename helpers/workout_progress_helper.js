var UserTestExerciseLogs = require("./../models/user_test_exercise_logs");
var Measurement = require("./../models/body_measurements");
var BodyFatLogs = require("./../models/body_fat_logs");
var user_settings_helper = require("./../helpers/user_settings_helper")
var common_helper = require("./../helpers/common_helper")
var _ = require("underscore");
var moment = require("moment");
var workout_progress_helper = {};

/** graph_data_body_data is used to fetch all user progress detail 
 * @return  status 0 - If any internal error occured while fetching progress data, with error
 * status 1 - If progress data found, with progress object
 * status 2 - If progress not found, with appropriate message
 * */
workout_progress_helper.graph_data_body_data = async (condition = {}, type = "flexibility") => {
    try {
        var progress = await Measurement.aggregate([{
                $match: condition.createdAt
            }, {
                $group: {
                    _id: "$logDate",
                    data: {
                        $addToSet: "$$ROOT"
                    }
                }
            }, {
                $project: {
                    _id: 0,
                    date: "$_id",
                    data: 1
                }
            }, {
                $sort: {
                    date: 1
                }
            }]);

        if (progress && progress.length > 0) {
            // _.each(progress, function (o) {
            // 	o.date = moment(o.date).format("DD/MM/YYYY");
            // })
            return {
                status: 1,
                message: "progress found",
                progress: progress
            };
        } else {
            return {
                status: 2,
                message: "No progress available",
                progress: null
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding progress",
            error: err
        };
}
};
/** graph_data is used to fetch all user progress detail 
 * @return  status 0 - If any internal error occured while fetching progress data, with error
 * status 1 - If progress data found, with progress object
 * status 2 - If progress not found, with appropriate message
 * */
workout_progress_helper.graph_data = async (condition = {}, type = "flexibility") => {
    try {
        var progress = await UserTestExerciseLogs.aggregate([{
                $match: condition.createdAt
            },
            {
                $lookup: {
                    from: "test_exercises",
                    localField: "test_exercise_id",
                    foreignField: "_id",
                    as: "test_exercises"
                }
            },
            {
                $match: {
                    "test_exercises.category": type
                }
            },
            {
                $group: {
                    _id: "$createdAt",
                    count: {
                        $sum: "$$ROOT.a_or_b"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);

        if (progress && progress.length > 0) {
            _.each(progress, function (o) {
                // o.date = moment(o.date).format("DD/MM/YYYY");
            })
            return {
                status: 1,
                message: "progress found",
                progress: progress
            };
        } else {
            return {
                status: 2,
                message: "No progress available",
                progress: null
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding progress",
            error: err
        };
}
};
/** get_progress_detail is used to fetch all user progress detail 
 * @return  status 0 - If any internal error occured while fetching progress data, with error
 * status 1 - If progress data found, with progress object
 * status 2 - If progress not found, with appropriate message
 * */
workout_progress_helper.get_progress_detail = async (condition = {}) => {
    try {
        var progress = await UserTestExerciseLogs.aggregate([{
                $match: condition.createdAt
            },
            {
                $lookup: {
                    from: "test_exercises",
                    localField: "test_exercise_id",
                    foreignField: "_id",
                    as: "exercise"
                }
            },
            {
                $unwind: "$exercise"
            },
            {
                $match: {
                    "exercise.isDeleted": 0
                }
            },
            {
                $match: {
                    "exercise.category": {
                        $in: condition.category
                    }
                }
            },
            {
                $group: {
                    _id: condition.category.length <= 1 ? "$exercise.name" : {
                        category: "$exercise.category",
                        subCategory: "$exercise.subCategory"
                    },
                    name: {
                        $first: "$exercise.name"
                    },
                    category: {
                        $first: "$exercise.category"
                    },
                    subCategory: {
                        $first: "$exercise.subCategory"
                    },
                    exercises: {
                        $addToSet: {
                            _id: "$_id",
                            text_field: "$text_field",
                            multiselect: "$multiselect",
                            max_rep: "$max_rep",
                            a_or_b: "$a_or_b",
                            userId: "$userId",
                            format: "$format",
                            createdAt: "$createdAt",
                            exercises: "$exercise"
                        }
                    }
                }
            },
        ]);


        if (progress && progress.length > 0) {
            var returnArray = [];
            var start_totalPostureExercises = 0;
            var start_totalPosturePassedExercises = 0;
            var start_totalFlexiblityExercises = 0;
            var start_totalFlexiblityPassedExercises = 0;
            var end_totalPostureExercises = 0;
            var end_totalPosturePassedExercises = 0;
            var end_totalFlexiblityExercises = 0;
            var end_totalFlexiblityPassedExercises = 0;
            var subCategory;
            var category;
            _.each(progress, p => {
                var tmp = {};
                subCategory = p.subCategory;
                category = p.category;

                var name = p.name;
                var sortedData = _.sortBy(p.exercises, function (p) {
                    return p.createdAt;
                });
                p.exercises = sortedData;

                var first = _.first(p.exercises);
                var last = _.last(p.exercises);

                var fieldCheckName = first.format;
                tmp.subCategory = subCategory;
                tmp.category = category;
                tmp.name = "";

                if (category === "strength") {
                    tmp.name = name;
                }

                if (category === "strength") {
                    var _first = first[fieldCheckName]; // first strength test data of user
                    var _last = last[fieldCheckName]; // last strength test data of user
                    switch (fieldCheckName) {
                        case "max_rep":
                            var firstKeys = Object.keys(_first); // key of _first record
                            var lastKeys = Object.keys(_last); // key of _last record 
                            var keys = _.union(firstKeys, lastKeys); // union of both record 
                            var differenceData = {};
                            _.each(keys, key => {
                                if (_first[key] && _last[key]) {
                                    var diff = _last[key] - _first[key]; // difference between start and current reps data
                                    differenceData[key] = {
                                        start: parseFloat((_first[key]).toFixed(2)),
                                        current: parseFloat((_last[key]).toFixed(2)),
                                        difference: parseFloat((diff).toFixed(2)),
                                        percentageChange: parseFloat((diff / _first[key] * 100).toFixed(2)),
                                    }
                                } else {
                                    var diff = _last[key] ? _last[key] : 0 - _first[key] ? _first[key] : 0;
                                    differenceData[key] = {
                                        start: _first[key] ? parseFloat((_first[key]).toFixed(2)) : 0,
                                        current: _last[key] ? parseFloat((_last[key]).toFixed(2)) : 0,
                                        difference: parseFloat((diff).toFixed(2)),
                                        percentageChange: parseFloat((diff / _first[key] * 100).toFixed(2)),
                                    }
                                }
                            });
                            tmp.difference = differenceData;
                            break;
                        default:
                            break;
                    }
                    returnArray.push(tmp);
                } else if (category === "flexibility") {
                    var firstDateOfTest = first.createdAt;
                    var lastDateOfTest = last.createdAt;
                    for (let x of p.exercises) {
                        if (x.createdAt.toString() == firstDateOfTest.toString()) {
                            start_totalFlexiblityExercises++;
                            if (x[fieldCheckName] == 1) {
                                start_totalFlexiblityPassedExercises++;
                            }
                        }
                    }
                    for (let x of p.exercises) {
                        if (x.createdAt.toString() == lastDateOfTest.toString()) {
                            end_totalFlexiblityExercises++;
                            if (x[fieldCheckName] == 1) {
                                end_totalFlexiblityPassedExercises++;
                            }
                        }
                    }
                } else if (category === "posture") {
                    var firstDateOfTest = first.createdAt;
                    var lastDateOfTest = last.createdAt;
                    for (let x of p.exercises) {
                        if (x.createdAt.toString() == firstDateOfTest.toString()) {
                            start_totalPostureExercises++;
                            if (x[fieldCheckName] == 1) {
                                start_totalPosturePassedExercises++;
                            }
                        }
                    }
                    for (let x of p.exercises) {
                        if (x.createdAt.toString() == lastDateOfTest.toString()) {
                            end_totalPostureExercises++;
                            if (x[fieldCheckName] == 1) {
                                end_totalPosturePassedExercises++;
                            }
                        }
                    }
                }
            });


            if (category === "flexibility" || category === "posture") {
                returnArray = {
                    "posture": {
                        start: {
                            total: start_totalPostureExercises,
                            passed: start_totalPosturePassedExercises
                        },
                        current: {
                            total: end_totalPostureExercises,
                            passed: end_totalPosturePassedExercises
                        },

                    },
                    "flexibility": {
                        start: {
                            total: start_totalFlexiblityExercises,
                            passed: start_totalFlexiblityPassedExercises
                        },
                        current: {
                            total: end_totalFlexiblityExercises,
                            passed: end_totalFlexiblityPassedExercises
                        },
                    }
                };
            }
            return {
                status: 1,
                message: "progress found",
                progress: {
                    data: returnArray
                }
            };
        } else {
            return {
                status: 2,
                message: "No progress available",
                progress: null
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding progress",
            error: err
        };
}
};
/*
 * user_endurance_test is used to fetch logdata by userID
 * @return  status 0 - If any internal error occured while fetching logdata data, with error
 *          status 1 - If logdata data found, with logdata object
 *          status 2 - If logdata not found, with appropriate message
 */
workout_progress_helper.user_endurance_test = async (condition, type) => {
    try {
        var enduranceData = await UserTestExerciseLogs.aggregate([{
                $match: condition.createdAt
            },
            {
                $lookup: {
                    from: "test_exercises",
                    localField: "test_exercise_id",
                    foreignField: "_id",
                    as: "test_exercises"
                }
            },
            {
                $unwind: "$test_exercises"
            },
            {
                $match: {
                    "test_exercises.category": type
                }
            },
            {
                $group: {
                    _id: "$test_exercises._id",
                    data: {
                        $addToSet: "$$ROOT"
                    }
                }
            },
        ]);

        if (enduranceData && enduranceData.length > 0) {
            var returnArray = [];
            _.each(enduranceData, function (e) {
                tmp = _.sortBy(e.data, function (o) {
                    return o.createdAt;
                });
                var returnObj = {
                    name: "",
                    start: "",
                    current: "",
                    difference: "",
                    percentageChange: "",
                }

                var first = _.first(tmp);
                var last = _.last(tmp);
                var checkField = first.format;
                returnObj.name = first.test_exercises.name;
                returnObj.unit = "min";
                returnObj.start = first[checkField];
                returnObj.current = last[checkField];
                try {
                    returnObj.difference = last[checkField] - first[checkField];
                } catch (error) {
                    returnObj.difference = 0;
                }
                try {
                    returnObj.percentageChange = (last[checkField] - first[checkField]) / first[checkField] * 100;
                } catch (error) {
                    returnObj.percentageChange = 0
                }
                returnArray.push(returnObj);
            })
            return {
                status: 1,
                message: "Endurance progress found",
                progress: {
                    data: returnArray
                }
            };
        } else {
            return {
                status: 2,
                message: "No Endurance progress found"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding Endurance progress",
            error: err
        };
    }
};
/*
 * user_body_progress is used to fetch logdata by userID
 * @return  status 0 - If any internal error occured while fetching logdata data, with error
 *          status 1 - If logdata data found, with logdata object
 *          status 2 - If logdata not found, with appropriate message
 */
workout_progress_helper.user_body_progress = async (id) => {
    try {
        var body_progress = await Measurement.aggregate([
            {
                $match: id
            },
            {
                $sort: {
                    logDate: 1
                }
            }
        ]);

        var measurement_unit_data = await user_settings_helper.get_setting({
            userId: id.userId
        });

        if (measurement_unit_data.status === 1) {
            var bodyMeasurementUnit = measurement_unit_data.user_settings.bodyMeasurement;
            var weightUnit = measurement_unit_data.user_settings.weight;
        }

        if (body_progress && body_progress.length > 0) {
            var neck = [];
            var shoulders = [];
            var chest = [];
            var upperArm = [];
            var waist = [];
            var forearm = [];
            var hips = [];
            var thigh = [];
            var calf = [];
            var weight = [];
            var height = [];
            var heartRate = [];

            for (let bodypart of body_progress) {
                // var date = moment(bodypart.logDate).format("DD/MM/YYYY");
                var date = bodypart.logDate;
                neck.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.neck)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "Neck"
                    }
                })
                shoulders.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.shoulders)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "Shoulders"
                    }
                })
                chest.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.chest)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "Chest"
                    }
                })
                upperArm.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.upperArm)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "UpperArm"
                    }
                })

                waist.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.waist)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "Waist"
                    }
                })
                forearm.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.forearm)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "Forearm"
                    }
                })
                hips.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.hips)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "Hips"
                    }
                })
                thigh.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.thigh)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "Thigh"
                    }
                })
                calf.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.calf)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "Calf"
                    }
                })
                weight.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("gram", weightUnit, bodypart.weight)).toFixed(2)),
                    metaData: {
                        unit: weightUnit,
                        name: "Weight"
                    }
                })
                height.push({
                    date,
                    count: parseFloat((await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.height)).toFixed(2)),
                    metaData: {
                        unit: bodyMeasurementUnit,
                        name: "Height"
                    }
                })
                heartRate.push({
                    date,
                    count: bodypart.heartRate,
                    metaData: {
                        unit: "BPM",
                        name: "Heart rate"
                    }
                })
            }

            var first = Object.create(_.first(body_progress));
            var last = Object.create(_.last(body_progress));
            
            var bodypartKeys = ["neck", "shoulders", "chest", "upperArm", "waist", "forearm", "hips", "thigh", "calf", "height"];
            
            for (let key of bodypartKeys) {
                first[key] = await common_helper.convertUnits("cm", bodyMeasurementUnit, first[key]);
                first[key] = parseFloat(first[key]).toFixed(2);
                last[key] = await common_helper.convertUnits("cm", bodyMeasurementUnit, last[key]);
                last[key] = parseFloat(last[key]).toFixed(2);
            }
            
            first.weight = (await common_helper.convertUnits("gram", weightUnit, first.weight)).toFixed(2);            
            last.weight = (await common_helper.convertUnits("gram", weightUnit, last.weight)).toFixed(2);
                  
            var bodyProgress = {
                "neck": {
                    start: first.neck,
                    current: last.neck,
                    unit: bodyMeasurementUnit,
                    difference: (last.neck - first.neck).toFixed(2),
                    percentageChange: ((last.neck - first.neck) / first.neck * 100).toFixed(2),
                    graphData: neck
                },
                "shoulders": {
                    start: first.shoulders,
                    current: last.shoulders,
                    unit: bodyMeasurementUnit,
                    difference: (last.shoulders - first.shoulders).toFixed(2),
                    percentageChange: ((last.shoulders - first.shoulders) / first.shoulders * 100).toFixed(2),
                    graphData: shoulders
                },
                "chest": {
                    start: first.chest,
                    current: last.chest,
                    unit: bodyMeasurementUnit,
                    difference: (last.chest - first.chest).toFixed(2),
                    percentageChange: ((last.chest - first.chest) / first.chest * 100).toFixed(2),
                    graphData: chest
                },
                "upperArm": {
                    start: first.upperArm,
                    current: last.upperArm,
                    unit: bodyMeasurementUnit,
                    difference: (last.upperArm - first.upperArm).toFixed(2),
                    percentageChange: ((last.upperArm - first.upperArm) / first.upperArm * 100).toFixed(2),
                    graphData: upperArm
                },
                "waist": {
                    start: first.waist,
                    current: last.waist,
                    unit: bodyMeasurementUnit,
                    difference: (last.waist - first.waist).toFixed(2),
                    percentageChange: ((last.waist - first.waist) / first.waist * 100).toFixed(2),
                    graphData: waist
                },
                "forearm": {
                    start: first.forearm,
                    current: last.forearm,
                    unit: bodyMeasurementUnit,
                    difference: (last.forearm - first.forearm).toFixed(2),
                    percentageChange: ((last.forearm - first.forearm) / first.forearm * 100).toFixed(2),
                    graphData: forearm

                },
                "hips": {
                    start: first.hips,
                    current: last.hips,
                    unit: bodyMeasurementUnit,
                    difference: (last.hips - first.hips).toFixed(2),
                    percentageChange: ((last.hips - first.hips) / first.hips * 100).toFixed(2),
                    graphData: hips
                },
                "thigh": {
                    start: first.thigh,
                    current: last.thigh,
                    unit: bodyMeasurementUnit,
                    difference: (last.thigh - first.thigh).toFixed(2),
                    percentageChange: ((last.thigh - first.thigh) / first.thigh * 100).toFixed(2),
                    graphData: thigh
                },
                "calf": {
                    start: first.calf,
                    current: last.calf,
                    unit: bodyMeasurementUnit,
                    difference: (last.calf - first.calf).toFixed(2),
                    percentageChange: ((last.calf - first.calf) / first.calf * 100).toFixed(2),
                    graphData: calf
                },
                "weight": {
                    start: first.weight,
                    current: last.weight,
                    unit: weightUnit,
                    difference: (last.weight - first.weight).toFixed(2),
                    percentageChange: ((last.weight - first.weight) / first.weight * 100).toFixed(2),
                    graphData: weight
                },
                "height": {
                    start: first.height,
                    current: last.height,
                    unit: bodyMeasurementUnit,
                    difference: (last.height - first.height).toFixed(2),
                    percentageChange: ((last.height - first.height) / first.height * 100).toFixed(2),
                    graphData: height
                },
                "heartRate": {
                    start: first.heartRate,
                    current: last.heartRate,
                    unit: "BPM",
                    difference: (last.heartRate - first.heartRate).toFixed(2),
                    percentageChange: ((last.heartRate - first.heartRate) / first.heartRate * 100).toFixed(2),
                    graphData: heartRate
                }
            }
            return {
                status: 1,
                message: "body measurements found",
                progress: {
                    data: bodyProgress
                }
            };
        } else {
            return {
                status: 2,
                message: "No body measurements found"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding logdata",
            error: err
        };
    }
};
/*
 * user_body_fat is used to fetch logdata by userID
 * @return  status 0 - If any internal error occured while fetching logdata data, with error
 *          status 1 - If logdata data found, with logdata object
 *          status 2 - If logdata not found, with appropriate message
 */
workout_progress_helper.user_body_fat = async (id) => {
    try {
        var body_progress = await BodyFatLogs.aggregate([{
                $match: id
            },
            {
                $sort: {
                    logDate: 1
                }
            },
        ]);
        if (body_progress && body_progress.length > 0) {
            var first = _.first(body_progress);
            var last = _.last(body_progress);
            var bodyProgress = {
                "body_fat": {
                    start: first.bodyFatPer,
                    current: last.bodyFatPer,
                    difference: (last.bodyFatPer - first.bodyFatPer).toFixed(2),
                    percentageChange: ((last.bodyFatPer - first.bodyFatPer) / first.bodyFatPer * 100).toFixed(2),
                },
            }
            return {
                status: 1,
                message: "Body fat found",
                progress: {
                    data: bodyProgress
                }
            };
        } else {
            return {
                status: 2,
                message: "No body fat found",
                progress: {}
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding logdata",
            error: err
        };
    }
};

/** graph_data_body_fat is used to fetch all user fat progress detail 
 * @return  status 0 - If any internal error occured while fetching progress data, with error
 * status 1 - If progress data found, with progress object
 * status 2 - If progress not found, with appropriate message
 * */
workout_progress_helper.graph_data_body_fat = async (condition = {}) => {
    try {
        var progress = await BodyFatLogs.aggregate([{
                $match: condition.createdAt
            },
            {
                $group: {
                    _id: "$logDate",
                    count: {
                        $first: "$$ROOT.bodyFatPer"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);

        if (progress && progress.length > 0) {
            // _.each(progress, function (o) {
            // 	o.count = parseFloat(o.count.toFixed(2));
            // })
            return {
                status: 1,
                message: "progress found",
                progress: progress
            };
        } else {
            return {
                status: 2,
                message: "No progress available",
                progress: null
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding progress",
            error: err
        };
}
};
module.exports = workout_progress_helper;