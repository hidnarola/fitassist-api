var UserTestExerciseLogs = require("./../models/user_test_exercise_logs");
var Measurement = require("./../models/body_measurements");
var _ = require("underscore");
var moment = require("moment");
var workout_progress_helper = {};

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
					var first = first[fieldCheckName]; // first strength test data of user
					var last = last[fieldCheckName]; // last strength test data of user
					switch (fieldCheckName) {
						case "text_field":
							break;
						case "max_rep":
							var firstKeys = Object.keys(first); // key of first record 
							var lastKeys = Object.keys(last); // key of last record 
							var keys = _.union(firstKeys, lastKeys); // union of both record 
							var differenceData = {};
							_.each(keys, key => {
								if (first[key] && last[key]) {
									var diff = last[key] - first[key]; // difference between start and current reps data
									differenceData[key] = {
										start: first[key],
										current: last[key],
										difference: diff,
										percentageChange: Math.round(diff / first[key] * 100),
									}
								} else {
									var diff = last[key] ? last[key] : 0 - first[key] ? first[key] : 0;
									differenceData[key] = {
										start: first[key] ? first[key] : 0,
										current: last[key] ? last[key] : 0,
										difference: diff,
										percentageChange: Math.round(diff / first[key] * 100),
									}
								}
							});
							tmp.difference = differenceData;
							break;
						case "multiselect":
							tmp.difference = first - last;
							break;
						case "a_or_b":
							tmp.difference = first - last;
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
 * user_body_progress is used to fetch logdata by userID
 * 
 * @return  status 0 - If any internal error occured while fetching logdata data, with error
 *          status 1 - If logdata data found, with logdata object
 *          status 2 - If logdata not found, with appropriate message
 */
workout_progress_helper.user_body_progress = async id => {
	try {
		var logdata = await Measurement.aggregate([{
				$match: id
			},
			{
				$sort: {
					logDate: 1
				}
			},
			{
				$group: {
					_id: null,
					first: {
						$first: "$$ROOT"
					},
					last: {
						$last: "$$ROOT"
					}
				}
			},
		]);

		console.log('------------------------------------');
		console.log('logdata : ', logdata);
		console.log('------------------------------------');


		if (logdata) {
			return {
				status: 1,
				message: "body measurements found",
				body_progress: logdata
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