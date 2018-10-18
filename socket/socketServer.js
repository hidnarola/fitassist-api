var io = require("socket.io")();
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose");
var _ = require("underscore");
var notification_helper = require("../helpers/notification_helper");
var chat_helper = require("../helpers/chat_helper");
var user_helper = require("../helpers/user_helper");
var friend_helper = require("../helpers/friend_helper");
var user_settings_helper = require("../helpers/user_settings_helper");
var config = require("../config");
var logger = config.logger;

var myIo = {};
var users = new Map();
var socketToUsers = new Map();
myIo.init = function (server) {
	io.attach(server);
	io.on("connection", function (socket) {

		/**
		 * @api {socket on} join Join user to socket
		 * @apiName Join user to socket
		 * @apiGroup  Sokets
		 */
		socket.on("join", async function (token) {
			var decoded = jwtDecode(token);
			var authUserId = decoded.sub;
			var user = users.get(authUserId);
			if (user) {
				if (user.socketIds.indexOf(socket.id) < 0) {
					user.socketIds.push(socket.id);
				}
			} else {
				var obj = {
					socketIds: [socket.id]
				};
				users.set(authUserId, obj);
			}
			socketToUsers.set(socket.id, authUserId);
			await broadcastOnlineOfflineFlagToFriends(authUserId, true);
		});

		/**
		 * @api {socket on} user_friends_count  Get user's friends count
		 * @apiName Get user's friends count
		 * @apiGroup  Sokets
		 * @apiParam {String} token Token of user
		 * @apiSuccess (Success 200) {Number} count count of friends
		 */
		socket.on("user_friends_count", async function (token) {
			var decoded = jwtDecode(token);
			var authUserId = decoded.sub;
			var user = users.get(authUserId);
			var socketIds = user && user.socketIds && user.socketIds.length > 0 ? user.socketIds : [];
			var user_friends_count = await friend_helper.count_friends(authUserId);
			socketIds.forEach(socketId => {
				io.to(socketId).emit("receive_user_friends_count", {
					count: user_friends_count.count
				});
			});
		});

		/**
		 * @api {socket on} user_messages_count  Get user's unread messages count
		 * @apiName Get user's unread messages count
		 * @apiGroup  Sokets
		 * @apiParam {String} token Token of user
		 * @apiSuccess (Success 200) {Number} count count of messages
		 */
		socket.on("user_messages_count", async function (token) {
			var decoded = jwtDecode(token);
			var authUserId = decoded.sub;
			var user = users.get(authUserId);
			var user_messages_count = await chat_helper.count_unread_messages(
				authUserId
			);

			var socketIds = user && user.socketIds && user.socketIds.length > 0 ? user.socketIds : [];
			socketIds.forEach(socketId => {
				io.to(socketId).emit("receive_user_messages_count", {
					count: user_messages_count.count
				});
			});
		});

		/**
		 * @api {socket on} user_notifications_count  Get user notification counts
		 * @apiName Get user notification counts
		 * @apiGroup  Sokets
		 * @apiParam {String} token Token of user
		 * @apiSuccess (Success 200) {Number} count count of notifications
		 */
		socket.on("user_notifications_count", async function (token) {
			var decoded = jwtDecode(token);
			var authUserId = decoded.sub;
			var user = users.get(authUserId);
			var user_notifications_count = await notification_helper.get_notifications_count({
				"receiver.authUserId": authUserId,
				isSeen: 0
			});

			var socketIds = user ? user.socketIds : [];
			socketIds.forEach(socketId => {
				io.to(socketId).emit("receive_user_notification_count", {
					count: user_notifications_count.count
				});
			});
		});

		/**
		 * @api {socket on} get_channel_id  User Channel
		 * @apiName User Channel
		 * @apiGroup  Sokets
		 * @apiParam {JSON} data Data of user
		 * @apiSuccess (Success 200) {JSON} channel channel of channel
		 */
		socket.on("get_channel_id", async function (data) {
			var resp_data = {
				status: 0,
				message: "error"
			};
			var user = users.get(data.userId);
			var socketIds = user && user.socketIds && user.socketIds.length ? user.socketIds : [];
			try {
				resp_data = await chat_helper.get_channel_id(
					data.userId,
					data.friendId
				);

				if (resp_data.status == 0) {
					logger.error("Error occured while fetching channel Id = ", resp_data);
				} else {
					logger.trace("channel Id got successfully = ", resp_data);
				}
			} catch (error) {
				resp_data.message = "Internal server error! please try again later.";
				resp_data.status = 0;
			} finally {
				socketIds.forEach(socketId => {
					io.to(socketId).emit("receive_channel_id", {
						resp_data
					});
				});
			}
		});

		/**
		 * @api {socket on} request_users_conversation_channels  Get user channels
		 * @apiName Get user channels
		 * @apiGroup  Sokets
		 * @apiParam {JSON} data Data of user
		 * @apiSuccess (Success 200) {JSON} resp_data resp_data of channel
		 */
		socket.on("request_users_conversation_channels", async function (data) {
			var resp_data = {};
			var decoded = jwtDecode(data.token);
			var authUserId = decoded.sub;
			var user = users.get(authUserId);
			var socketIds = user && user.socketIds && user.socketIds.length ? user.socketIds : [];
			var start = parseInt(data.start ? data.start : 0);
			var limit = parseInt(data.limit ? data.limit : 10);
			try {
				resp_data = await chat_helper.get_messages(
					authUserId, {
						$skip: start
					}, {
						$limit: limit
					}
				);

				if (resp_data.status == 0) {
					logger.error("Error occured while fetching chat messages = ", resp_data);
				} else {
					resp_data.total_records = 0;
					let count = await chat_helper.get_messages(
						authUserId
					);
					// let count = await chat_helper.get_messages_count(authUserId);
					if (count && count.status === 1) {
						resp_data.total_records = count.channels.length;
					}
					logger.trace("chat messages got successfully = ", resp_data);
				}
			} catch (error) {
				resp_data.message = "Internal server error! please try again later.";
				resp_data.status = 0;
			} finally {
				socketIds.forEach(socketId => {
					io.to(socketId).emit("receive_users_conversation_channel", resp_data);
				});
			}
		});

		/**
		 * @api {socket on} request_logged_user_friends  Get user's friends
		 * @apiName  Get user's friends
		 * @apiGroup  Sokets
		 * @apiParam {JSON} friends Data of user
		 * @apiSuccess (Success 200) {JSON} resp_data resp_data of channel
		 */
		socket.on("request_logged_user_friends", async function (data) {
			var resp_data = {};
			var decoded = jwtDecode(data.token);
			var authUserId = decoded.sub;
			var user = users.get(authUserId);
			var socketIds = user && user.socketIds && user.socketIds.length ? user.socketIds : [];
			var skip = parseInt(data.start ? data.start : 0);
			var limit = parseInt(data.limit ? data.limit : 10);
			var userData = await user_helper.get_user_by_id(authUserId);

			try {
				var resp_data = await friend_helper.get_friend_by_username({
					username: userData.user.username
				}, 2, {
						$skip: skip
					}, {
						$limit: limit
					});
				var count = await friend_helper.get_friend_by_username({
					username: userData.user.username
				}, 2);
				resp_data.total_records = 0;
				if (count && count.status === 1) {
					resp_data.total_records = count.friends.length;
				}

				_.map(resp_data.friends, function (friend) {
					var user = users.get(friend.authUserId);
					friend.isOnline = false;
					if (user) {
						friend.isOnline = true;
					}
				})
				if (resp_data.status == 0) {
					logger.error("Error occured while fetching friend = ", resp_data);
				} else {
					logger.trace("friend got successfully = ", resp_data);
				}
			} catch (error) {

			} finally {
				socketIds.forEach(socketId => {
					io.to(socketId).emit("receive_logged_user_friends", resp_data);
				});
			}
		});

		/**
		 * @api {socket on} get_user_conversation_by_channel  Get user's messages by channel ID
		 * @apiName Get user's messages by channel ID
		 * @apiGroup  Sokets
		 * @apiParam {JSON} data Data of user(token,channel_id,start,end)
		 * @apiSuccess (Success 200) {JSON} resp_data resp_data of channel
		 */
		socket.on("get_user_conversation_by_channel", async function (data) {
			var resp_data = {};
			var decoded = jwtDecode(data.token);
			var authUserId = decoded.sub;
			var user = users.get(authUserId);
			var socketIds = user && user.socketIds && user.socketIds.length > 0 ? user.socketIds : [];
			var start = parseInt(data.start ? data.start : 0);
			var limit = parseInt(data.limit ? data.limit : 10);
			var condition = {
				_id: mongoose.Types.ObjectId(data.channel_id),
				$or: [{
					userId: authUserId
				}, {
					friendId: authUserId
				}]
			};


			try {
				resp_data = await chat_helper.get_conversation(authUserId, condition,
					{ $skip: start },
					{ $limit: limit });

				let user_settings = await chat_helper.get_setting_for_chat({
					_id: mongoose.Types.ObjectId(data.channel_id)
				});

				let get_channel_data = await chat_helper.get_channel_data({
					_id: mongoose.Types.ObjectId(data.channel_id)
				});

				if (get_channel_data && get_channel_data.status === 1) {
					let userId = get_channel_data.channel.userId;
					let friendId = get_channel_data.channel.friendId;
					var searchObject = { $or: [{ $and: [{ userId: userId }, { friendId: friendId }] }, { $and: [{ userId: friendId }, { friendId: userId }] }] };
					let friendship_data = await friend_helper.checkFriend(searchObject);
					var friendshipStatus = "unknown";
					if (friendship_data && friendship_data.status === 1 && friendship_data.friends && friendship_data.friends.status === 2) {
						friendshipStatus = "friend";
					}
				}

				resp_data.user_settings = null;
				resp_data.friendshipStatus = friendshipStatus;

				if (user_settings && user_settings.status === 1) {
					resp_data.user_settings = user_settings.privacy[0];
				}

				if (resp_data.status == 0) {
					logger.error("Error occured while fetching chat messages = ", resp_data);
				} else {
					logger.trace("chat messages got successfully = ", resp_data);
				}
			} catch (error) {
				resp_data.message = "Internal server error! please try again later.";
				resp_data.status = 0;
				logger.error("Error occured while fetching chat messages = ", resp_data);
			} finally {
				socketIds.forEach(socketId => {
					io.to(socketId).emit(
						"receive_users_conversation_by_channel",
						resp_data
					);
				});
			}
		});

		/**
		 * @api {socket on} send_new_message  Get user's messages by channel ID
		 * @apiName Get user's messages by channel ID
		 * @apiGroup  Sokets
		 * @apiParam {JSON} data Data of user(token,channel_id,start,end)
		 * @apiSuccess (Success 200) {JSON} resp_data resp_data of channel
		 */
		socket.on("send_new_message", async function (data) {
			var respObj = {};
			var decoded = jwtDecode(data.token);
			var authUserId = decoded.sub;
			var sender = users.get(authUserId);
			var socketIdsForSender = sender && sender.socketIds && sender.socketIds.length > 0 ? sender.socketIds : [];
			var reciever = users.get(data.friendId);
			var socketIdsForReceiver = reciever && reciever.socketIds && reciever.socketIds.length > 0 ? reciever.socketIds : [];
			var chat_data;

			try {
				var timestamp = data.timestamp;
				var conversations_obj = {
					userId: authUserId,
					friendId: data.friendId
				};
				var conversations_replies_obj = {
					userId: authUserId,
					message: data.message
				};
				chat_data = await chat_helper.send_message(conversations_obj, conversations_replies_obj);

				if (chat_data.status === 1) {
					var user = await user_helper.get_user_by_id(chat_data.channel.userId);
					respObj.status = chat_data.status;
					respObj.message = chat_data.message;
					respObj.channel = {
						_id: chat_data.channel.conversationId,
						message: {},
						metadata: {}
					};
					respObj.channel.metadata = {
						timestamp: timestamp
					};
					respObj.channel.message = {
						_id: chat_data.channel._id,
						isSeen: chat_data.channel.isSeen,
						message: chat_data.channel.message,
						createdAt: chat_data.channel.createdAt,
						firstName: user.user.firstName,
						lastName: user.user.lastName,
						authUserId: user.user.authUserId,
						username: user.user.username,
						avatar: user.user.avatar,
						flag: "sent"
					};
				} else {
					logger.error("Error while sending message = ", chat_data);
				}
			} catch (error) {
				chat_data.message = "Internal server error! please try again later.";
				chat_data.status = 0;
			} finally {
				socketIdsForSender.forEach(socketId => {
					io.to(socketId).emit("receive_sent_new_message_response", respObj);
				});
				socketIdsForReceiver.forEach(socketId => {
					io.to(socketId).emit("receive_new_message", respObj);
				});
			}
		});

		/**
		 * @api {socket on} request_typing_start  Indicate user typing...
		 * @apiName Indicate user typing...
		 * @apiGroup  Sokets
		 * @apiParam {JSON} data {friendId:"",channelId:""} of friend
		 * @apiSuccess (Success 200) {String} flag flag
		 */
		socket.on("request_typing_start", async function (data) {
			var respObj = {
				status: 1,
				message: "typing"
			};
			var friendId = users.get(data.friendId);
			var socketIds = friendId && friendId.socketIds && friendId.socketIds.length > 0 ? friendId.socketIds : [];
			respObj.channel = {
				_id: data.channelId,
				isTyping: true
			};
			socketIds.forEach(socketId => {
				io.to(socketId).emit("message_typing_start", respObj);
			});
		});

		/**
		 * @api {socket on} request_typing_stop Indicate user typing stop
		 * @apiName Indicate user typing stop
		 * @apiGroup  Sokets
		 * @apiParam {JSON} data {friendId:"",channelId:""} of friend
		 * @apiSuccess (Success 200) {JSON} channel channel data
		 */
		socket.on("request_typing_stop", async function (data) {
			var respObj = {
				status: 1,
				message: "no typing"
			};
			var friendId = users.get(data.friendId);
			var socketIds = friendId && friendId.socketIds && friendId.socketIds.length > 0 ? friendId.socketIds : [];
			respObj.channel = {
				_id: data.channelId,
				isTyping: false
			};
			socketIds.forEach(socketId => {
				io.to(socketId).emit("message_typing_stop", respObj);
			});
		});

		/**
		 * @api {socket on} mark_message_as_read Mark messages as read
		 * @apiName Mark messages as read
		 * @apiGroup  Sokets
		 * @apiParam {JSON} data {userId:"",channelId:""} of user
		 * @apiSuccess (Success 200) {String} flag flag
		 */
		socket.on("mark_message_as_read", async function (data) {
			await chat_helper.mark_message_as_read({
				userId: data.friendId,
				conversationId: data.channelId,
				isSeen: 0
			}, {
					isSeen: 1
				});
		});
		/**
		 * @api {socket on} request_make_user_offline Make user offline
		 * @apiName Make user offline 
		 * @apiGroup  Sokets
		 */
		socket.on("request_make_user_offline", async function () {

			var socketId = this.id;

			var socketToUser = socketToUsers.get(socketId);
			if (socketToUser) {
				var user = users.get(socketToUser);
				if (user) {
					var index = user.socketIds.indexOf(socketId);
					if (index >= 0) {
						user.socketIds.splice(index, 1);
					}
				}
				if (user.socketIds.length <= 0) {
					await broadcastOnlineOfflineFlagToFriends(socketToUser, false);
				} else { }
				socketToUsers.delete(socketId);
			}
		});
		/**
		 * @api {socket on} disconnect Disconnect Socket
		 * @apiName Disconnect Socket
		 * @apiGroup  Sokets
		 * @apiSuccess (Success 200) {String} flag flag
		 */
		socket.on("disconnect", async function () {
			var socketId = this.id;
			var socketToUser = socketToUsers.get(socketId);
			if (socketToUser) {
				var user = users.get(socketToUser);
				if (user) {
					var index = user.socketIds.indexOf(socketId);
					if (index >= 0) {
						user.socketIds.splice(index, 1);
					}
				}
				if (user.socketIds.length <= 0) {
					await broadcastOnlineOfflineFlagToFriends(socketToUser, false);
				}
				socketToUsers.delete(socketId);
			}
		});
	});

	myIo.io = io;
	myIo.users = users;
	myIo.socketToUser = socketToUsers;
};

async function broadcastOnlineOfflineFlagToFriends(authUserId, flag) {
	var userdata = await user_helper.get_user_by_id(authUserId);
	var user_friends = await friend_helper.get_friend_by_username({
		username: userdata.user.username
	},
		2
	);

	var usersFriendsSocketIds = [];
	if (user_friends && user_friends.status === 1) {
		user_friends.friends.forEach((element) => {
			var socketId = users.get(element.authUserId);
			if (socketId) {
				usersFriendsSocketIds = _.union(
					usersFriendsSocketIds,
					socketId.socketIds
				);
			}
		});
	} else {

	}

	usersFriendsSocketIds.forEach(socketId => {
		io.to(socketId).emit("receive_online_friend_status", {
			isOnline: flag,
			authUserId: authUserId
		});
	});

}
module.exports = myIo;