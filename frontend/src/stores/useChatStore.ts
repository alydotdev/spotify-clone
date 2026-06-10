import { axiosInstance } from "@/lib/axios";
import type { Message, User } from "@/types";
import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface ChatStore {
	users: User[];
	isLoading: boolean;
	isMessagesLoading: boolean;
	error: string | null;
	socket: Socket;
	isConnected: boolean;
	currentUserId: string | null;
	onlineUsers: Set<string>;
	userActivities: Map<string, string>;
	messages: Message[];
	selectedUser: User | null;

	fetchUsers: () => Promise<void>;
	initSocket: (userId: string) => void;
	disconnectSocket: () => void;
	sendMessage: (receiverId: string, senderId: string, content: string) => void;
	fetchMessages: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;
	emitActivity: (activity: string) => void;
}

const baseURL = import.meta.env.SOCKET_URL;

const socket = io(baseURL, {
	autoConnect: false,
	withCredentials: true,
	transports: ["websocket", "polling"],
	reconnection: true,
	reconnectionAttempts: 10,
	reconnectionDelay: 500,
});

let listenersReady = false;

const belongsToConversation = (
	message: Message,
	selectedUser: User | null,
	currentUserId: string | null
) => {
	if (!selectedUser || !currentUserId) return false;

	const partnerId = selectedUser.clerkId;
	return (
		(message.senderId === partnerId && message.receiverId === currentUserId) ||
		(message.senderId === currentUserId && message.receiverId === partnerId)
	);
};

const appendUniqueMessage = (messages: Message[], message: Message) => {
	if (messages.some((existing) => existing._id === message._id)) {
		return messages;
	}
	return [...messages, message];
};

const attachSocketListeners = (
	set: (partial: Partial<ChatStore> | ((state: ChatStore) => Partial<ChatStore>)) => void,
	get: () => ChatStore
) => {
	if (listenersReady) return;
	listenersReady = true;

	socket.on("connect", () => {
		set({ isConnected: true });

		const userId = get().currentUserId;
		if (userId) {
			socket.emit("user_connected", userId);
		}
	});

	socket.on("disconnect", () => {
		set({ isConnected: false });
	});

	socket.on("users_online", (users: string[]) => {
		set({ onlineUsers: new Set(users) });
	});

	socket.on("activities", (activities: [string, string][]) => {
		set({ userActivities: new Map(activities) });
	});

	socket.on("user_connected", (userId: string) => {
		set((state) => ({
			onlineUsers: new Set([...state.onlineUsers, userId]),
		}));
	});

	socket.on("user_disconnected", (userId: string) => {
		set((state) => {
			const newOnlineUsers = new Set(state.onlineUsers);
			newOnlineUsers.delete(userId);

			const newActivities = new Map(state.userActivities);
			newActivities.delete(userId);

			return { onlineUsers: newOnlineUsers, userActivities: newActivities };
		});
	});

	socket.on("receive_message", (message: Message) => {
		const { selectedUser, currentUserId, messages } = get();
		if (!belongsToConversation(message, selectedUser, currentUserId)) return;

		set({ messages: appendUniqueMessage(messages, message) });
	});

	socket.on("message_sent", (message: Message) => {
		const { selectedUser, currentUserId, messages } = get();
		if (!belongsToConversation(message, selectedUser, currentUserId)) return;

		const withoutTemp = messages.filter((item) => !item._id.startsWith("temp-"));
		set({ messages: appendUniqueMessage(withoutTemp, message) });
	});

	socket.on("activity_updated", ({ userId, activity }: { userId: string; activity: string }) => {
		set((state) => {
			const newActivities = new Map(state.userActivities);
			newActivities.set(userId, activity);
			return { userActivities: newActivities };
		});
	});
};

export const useChatStore = create<ChatStore>((set, get) => {
	attachSocketListeners(set, get);

	return {
		users: [],
		isLoading: false,
		isMessagesLoading: false,
		error: null,
		socket,
		isConnected: false,
		currentUserId: null,
		onlineUsers: new Set(),
		userActivities: new Map(),
		messages: [],
		selectedUser: null,

		setSelectedUser: (user) =>
			set((state) => ({
				selectedUser: user,
				messages: state.selectedUser?.clerkId === user?.clerkId ? state.messages : [],
			})),

		fetchUsers: async () => {
			set({ isLoading: true, error: null });
			try {
				const response = await axiosInstance.get("/users");
				set({ users: response.data });
			} catch (error: unknown) {
				const err = error as { response?: { data?: { message?: string } }; message?: string };
				set({ error: err.response?.data?.message ?? err.message ?? "Failed to load users" });
			} finally {
				set({ isLoading: false });
			}
		},

		initSocket: (userId) => {
			set({ currentUserId: userId });
			socket.auth = { userId };

			if (socket.connected) {
				socket.emit("user_connected", userId);
			} else {
				socket.connect();
			}
		},

		disconnectSocket: () => {
			if (socket.connected) {
				socket.disconnect();
			}
			set({
				isConnected: false,
				currentUserId: null,
				onlineUsers: new Set(),
				userActivities: new Map(),
				users: [],
				messages: [],
				selectedUser: null,
				error: null,
			});
		},

		emitActivity: (activity) => {
			const userId = get().currentUserId;
			if (!userId || !socket.connected) return;

			socket.emit("update_activity", { userId, activity });

			set((state) => {
				const newActivities = new Map(state.userActivities);
				newActivities.set(userId, activity);
				return { userActivities: newActivities };
			});
		},

		sendMessage: (receiverId, senderId, content) => {
			if (!socket.connected) return;

			const trimmed = content.trim();
			if (!trimmed) return;

			const optimisticMessage: Message = {
				_id: `temp-${Date.now()}`,
				senderId,
				receiverId,
				content: trimmed,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			set((state) => ({
				messages: [...state.messages, optimisticMessage],
			}));

			socket.emit("send_message", { receiverId, senderId, content: trimmed });
		},

		fetchMessages: async (userId: string) => {
			set({ isMessagesLoading: true, error: null });
			try {
				const response = await axiosInstance.get(`/users/messages/${userId}`);
				set({ messages: response.data });
			} catch (error: unknown) {
				const err = error as { response?: { data?: { message?: string } }; message?: string };
				set({ error: err.response?.data?.message ?? err.message ?? "Failed to load messages" });
			} finally {
				set({ isMessagesLoading: false });
			}
		},
	};
});
