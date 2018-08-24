var UserTestExerciseLogs = require("./../models/user_test_exercise_logs");
var Measurement = require("./../models/body_measurements");
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
			},
			{
				$group: {
					_id: "$logDate",
					data: {
						$addToSet: "$$ROOT"
					}
				}
			},
			{
				$project: {
					_id: 0,
					date: "$_id",
					data: 1
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
				o.date = moment(o.date).format("DD/MM/YYYY");
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
				o.date = moment(o.date).format("DD/MM/YYYY");
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
					// _id: {
					// 	category: "$exercise.category",
					// 	subCategory: "$exercise.subCategory"
					// },
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

		// return {
		// 	status: 1,
		// 	data: progress
		// }


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
				var first = _.first(p.exercises);
				var last = _.last(p.exercises);

				var fieldCheckName = first.format;
				tmp.subCategory = subCategory;
				tmp.category = category;
				tmp.name = "";
				if (category === "strength") {
					tmp.name = name;
				}
				if (category === "cardio") {

				} else if (category === "strength") {
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
										start: _first[key],
										current: _last[key],
										difference: diff,
										percentageChange: Math.round(diff / _first[key] * 100),
									}
								} else {
									var diff = _last[key] ? _last[key] : 0 - _first[key] ? _first[key] : 0;
									differenceData[key] = {
										start: _first[key] ? _first[key] : 0,
										current: _last[key] ? _last[key] : 0,
										difference: diff,
										percentageChange: Math.round(diff / _first[key] * 100),
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
					var lastDateOfTest = first.createdAt;
					for (let x of p.exercises) {
						if (x.createdAt.toString() == lastDateOfTest.toString()) {
							start_totalFlexiblityExercises++;
							if (x[fieldCheckName] == 1) {
								start_totalFlexiblityPassedExercises++;
							}
						}
					}
					var firstDateOfTest = last.createdAt;
					for (let x of p.exercises) {
						if (x.createdAt.toString() == firstDateOfTest.toString()) {
							end_totalFlexiblityExercises++;
							if (x[fieldCheckName] == 1) {
								end_totalFlexiblityPassedExercises++;
							}
						}
					}
				} else if (category === "posture") {
					var lastDateOfTest = first.createdAt;
					for (let x of p.exercises) {
						if (x.createdAt.toString() == lastDateOfTest.toString()) {
							start_totalPostureExercises++;
							if (x[fieldCheckName] == 1) {
								start_totalPosturePassedExercises++;
							}
						}
					}
					var firstDateOfTest = last.createdAt;
					for (let x of p.exercises) {
						if (x.createdAt.toString() == firstDateOfTest.toString()) {
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
				returnObj.start = first[checkField];
				returnObj.current = last[checkField];
				returnObj.difference = last[checkField] - first[checkField];
				returnObj.percentageChange = Math.round((last[checkField] - first[checkField]) / first[checkField] * 100);
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
		var body_progress = await Measurement.aggregate([{
				$match: id
			},
			{
				$sort: {
					logDate: 1
				}
			},
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
			_.each(body_progress, async function (bodypart) {

				var date = moment(bodypart.logDate).format("DD/MM/YYYY");

				neck.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.neck),
					obj: {
						developer1: "Sahil",
						developer2: "Amit"
					}
				})
				shoulders.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.shoulders)
				})
				chest.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.chest)
				})
				upperArm.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.upperArm)
				})
				waist.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.waist)
				})
				forearm.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.forearm)
				})
				hips.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.hips)
				})
				thigh.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.thigh)
				})
				calf.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.calf)
				})

				weight.push({
					date,
					count: await common_helper.convertUnits("gram", weightUnit, bodypart.weight)
				})
				height.push({
					date,
					count: await common_helper.convertUnits("cm", bodyMeasurementUnit, bodypart.height)
				})
			});

			var first = _.first(body_progress);
			var last = _.last(body_progress);

			var bodypartKeys = ["neck", "shoulders", "chest", "upperArm", "waist", "forearm", "hips", "thigh", "calf", "height"];

			_.each(bodypartKeys, async function (key) {
				first[key] = await common_helper.convertUnits("cm", bodyMeasurementUnit, first[key]);
				first[key] = first[key].toFixed(2);
				last[key] = await common_helper.convertUnits("cm", bodyMeasurementUnit, last[key]);
				last[key] = last[key].toFixed(2);
			});


			first.weight = await common_helper.convertUnits("gram", weightUnit, first.weight);
			first.weight = first.weight.toFixed(2);
			last.weight = await common_helper.convertUnits("gram", weightUnit, last.weight);
			last.weight = last.weight.toFixed(2);

			var bodyProgress = {
				"neck": {
					start: first.neck,
					current: last.neck,
					unit: bodyMeasurementUnit,
					difference: last.neck - first.neck,
					percentageChange: Math.round((last.neck - first.neck) / first.neck * 100),
					graphData: neck
				},
				"shoulders": {
					start: first.shoulders,
					current: last.shoulders,
					unit: bodyMeasurementUnit,
					difference: last.shoulders - first.shoulders,
					percentageChange: Math.round((last.shoulders - first.shoulders) / first.shoulders * 100),
					graphData: shoulders

				},
				"chest": {
					start: first.chest,
					current: last.chest,
					unit: bodyMeasurementUnit,
					difference: last.chest - first.chest,
					percentageChange: Math.round((last.chest - first.chest) / first.chest * 100),
					graphData: chest

				},
				"upperArm": {
					start: first.upperArm,
					current: last.upperArm,
					unit: bodyMeasurementUnit,
					difference: last.upperArm - first.upperArm,
					percentageChange: Math.round((last.upperArm - first.upperArm) / first.upperArm * 100),
					graphData: upperArm

				},
				"waist": {
					start: first.waist,
					current: last.waist,
					unit: bodyMeasurementUnit,
					difference: last.waist - first.waist,
					percentageChange: Math.round((last.waist - first.waist) / first.waist * 100),
					graphData: waist

				},
				"forearm": {
					start: first.forearm,
					current: last.forearm,
					unit: bodyMeasurementUnit,
					difference: last.forearm - first.forearm,
					percentageChange: Math.round((last.forearm - first.forearm) / first.forearm * 100),
					graphData: forearm

				},
				"hips": {
					start: first.hips,
					current: last.hips,
					unit: bodyMeasurementUnit,
					difference: last.hips - first.hips,
					percentageChange: Math.round((last.hips - first.hips) / first.hips * 100),
					graphData: hips

				},
				"thigh": {
					start: first.thigh,
					current: last.thigh,
					unit: bodyMeasurementUnit,
					difference: last.thigh - first.thigh,
					percentageChange: Math.round((last.thigh - first.thigh) / first.thigh * 100),
					graphData: thigh

				},
				"calf": {
					start: first.calf,
					current: last.calf,
					unit: bodyMeasurementUnit,
					difference: last.calf - first.calf,
					percentageChange: Math.round((last.calf - first.calf) / first.calf * 100),
					graphData: calf

				},
				"weight": {
					start: first.weight,
					current: last.weight,
					unit: weightUnit,
					difference: last.weight - first.weight,
					percentageChange: Math.round((last.weight - first.weight) / first.weight * 100),
					graphData: weight

				},
				"height": {
					start: first.height,
					current: last.height,
					unit: bodyMeasurementUnit,
					difference: last.height - first.height,
					percentageChange: Math.round((last.height - first.height) / first.height * 100),
					graphData: height

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
module.exports = workout_progress_helper;