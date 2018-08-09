var TestExercises = require("./../models/test_exercises");
var UserTestExerciseLogs = require("./../models/user_test_exercise_logs");
var _ = require("underscore");
var workout_progress_helper = {};

/** get_progress_detail is used to fetch all user progress detail 
 * @return  status 0 - If any internal error occured while fetching progress data, with error
 * status 1 - If progress data found, with progress object
 * status 2 - If progress not found, with appropriate message
 * */
workout_progress_helper.get_progress_detail = async (condition = {}) => {
	try {
		var progress = await UserTestExerciseLogs.aggregate([{
			$match: condition.createdAt
		}, {
			$lookup: {
				from: "test_exercises",
				localField: "test_exercise_id",
				foreignField: "_id",
				as: "exercise"
			}
		}, {
			$unwind: "$exercise"
		}, {
			$match: {
				"exercise.category": {
					$in: condition.category
				}
			}
		}, {
			$group: {
				_id: {
					category: "$exercise.category",
					subCategory: "$exercise.subCategory",
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
		}]);


		if (progress && progress.length > 0) {
			var returnArray = [];
			_.each(progress, p => {
				var tmp = {};
				var subCategory = p.subCategory;
				var category = p.category;
				var name = p.name;
				var first = _.first(p.exercises);
				var last = _.last(p.exercises);
				var fieldCheckName = first.format;
				tmp.subCategory = subCategory;
				tmp.category = category;
				// tmp.name = "";
				tmp.name = name;
				if (category === "strength") {
					tmp.name = name;
				}

				if (category === "cardio") {

				} else if (condition.category.length === 1 && condition.category[0] === "strength") {
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
									differenceData[key] = {
										start: first[key] ? first[key] : 0,
										current: last[key] ? last[key] : 0,
										difference: first[key] ? first[key] : last[key],
										percentageChange: first[key] ? 100 : -100,
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
				} else if (condition.category.length > 1) {
					var lastDateOfTest = first.createdAt;
					var totalExercises = 0;
					var totalPassedExercises = 0;
					for (let x of p.exercises) {
						if (x.createdAt.toString() == lastDateOfTest.toString()) {
							totalExercises++;
							if (x[fieldCheckName] == 1) {
								totalPassedExercises++;
							}
						}
					}
					tmp.current = {
						totalExercises: totalExercises,
						totalPassedExercises: totalPassedExercises
					};
					var firstDateOfTest = last.createdAt;
					totalExercises = 0;
					totalPassedExercises = 0;
					for (let x of p.exercises) {
						if (x.createdAt.toString() == firstDateOfTest.toString()) {
							totalExercises++;
							if (x[fieldCheckName] == 1) {
								totalPassedExercises++;
							}
						}
					}
					tmp.start = {
						totalExercises: totalExercises,
						totalPassedExercises: totalPassedExercises
					};
				}
				returnArray.push(tmp);
			});
			return {
				status: 1,
				message: "progress found",
				progress: returnArray
			};
		} else {
			return {
				status: 2,
				message: "No progress available"
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