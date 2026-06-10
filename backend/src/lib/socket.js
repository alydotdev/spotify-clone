
import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: "http://localhost:3000",
			credentials: true,
		},
		pingInterval: 10000,
		pingTimeout: 5000,
	});

	const userSockets = new Map();
	const userActivities = new Map();

	io.on("connection", (socket) => {
		socket.on("user_connected", (userId) => {
			if (!userId) return;

			userSockets.set(userId, socket.id);
			socket.data.userId = userId;

			if (!userActivities.has(userId)) {
				userActivities.set(userId, "Idle");
			}

			socket.emit("users_online", Array.from(userSockets.keys()));
			socket.emit("activities", Array.from(userActivities.entries()));
			io.emit("user_connected", userId);
		});

		socket.on("update_activity", ({ userId, activity }) => {
			if (!userId || !activity) return;

			userActivities.set(userId, activity);
			io.emit("activity_updated", { userId, activity });
		});

		socket.on("send_message", async (data) => {
			try {
				const { senderId, receiverId, content } = data;

				if (!senderId || !receiverId || !content?.trim()) {
					socket.emit("message_error", "Invalid message data");
					return;
				}

				const message = await Message.create({
					senderId,
					receiverId,
					content: content.trim(),
				});

				const receiverSocketId = userSockets.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("receive_message", message);
				}

				socket.emit("message_sent", message);
			} catch (error) {
				console.error("Message error:", error);
				socket.emit("message_error", error.message);
			}
		});

		socket.on("disconnect", () => {
			const disconnectedUserId = socket.data.userId;

			if (disconnectedUserId) {
				const activeSocketId = userSockets.get(disconnectedUserId);
				if (activeSocketId === socket.id) {
					userSockets.delete(disconnectedUserId);
					userActivities.delete(disconnectedUserId);
					io.emit("user_disconnected", disconnectedUserId);
					io.emit("activities", Array.from(userActivities.entries()));
				}
			}
		});
	});
};
