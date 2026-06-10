import PageShell from "@/components/PageShell";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import UsersList from "./Components/UsersList";
import ChatHeader from "./Components/ChatHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageInput from "./Components/MessageInput";

const formatTime = (date: string) => {
	return new Date(date).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

const ChatPage = () => {
	const { user } = useUser();
	const { messages, selectedUser, fetchUsers, fetchMessages, isMessagesLoading } = useChatStore();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (user) fetchUsers();
	}, [fetchUsers, user]);

	useEffect(() => {
		if (selectedUser) fetchMessages(selectedUser.clerkId);
	}, [selectedUser, fetchMessages]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, selectedUser]);

	return (
		<PageShell className='bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950'>
			<div className='h-full flex flex-col min-h-0 sm:grid sm:grid-cols-[minmax(0,280px)_1fr]'>
				<UsersList />

				<div className='flex flex-col flex-1 min-h-0 bg-zinc-950/50'>
					{selectedUser ? (
						<>
							<ChatHeader />

							<div
								ref={messagesContainerRef}
								className='flex-1 min-h-0 overflow-y-auto mobile-scroll p-4 sm:p-6 space-y-3'
							>
								{isMessagesLoading ? (
									<div className='flex items-center justify-center h-40 text-sm text-zinc-500'>
										Loading messages...
									</div>
								) : messages.length === 0 ? (
									<div className='flex flex-col items-center justify-center h-40 text-center'>
										<MessageCircle className='size-10 text-zinc-600 mb-3' />
										<p className='text-zinc-400 text-sm'>No messages yet</p>
										<p className='text-zinc-500 text-xs mt-1'>Say hello to {selectedUser.fullName}</p>
									</div>
								) : (
									messages.map((message, index) => {
										const isOwn = message.senderId === user?.id;
										const prevMessage = messages[index - 1];
										const showAvatar =
											!prevMessage || prevMessage.senderId !== message.senderId;

										return (
											<div
												key={message._id}
												className={cn(
													"flex items-end gap-2",
													isOwn ? "flex-row-reverse" : "flex-row"
												)}
											>
												{showAvatar ? (
													<Avatar className='size-8 shrink-0 mb-1'>
														<AvatarImage
															src={isOwn ? user?.imageUrl : selectedUser.imageUrl}
														/>
														<AvatarFallback>
															{(isOwn ? user?.firstName : selectedUser.fullName)?.[0]}
														</AvatarFallback>
													</Avatar>
												) : (
													<div className='size-8 shrink-0' />
												)}

												<div
													className={cn(
														"max-w-[82%] sm:max-w-[68%] px-4 py-2.5 shadow-sm",
														isOwn
															? "bg-green-500 text-black rounded-2xl rounded-br-md"
															: "bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-md",
														message._id.startsWith("temp-") && "opacity-70"
													)}
												>
													<p className='text-sm leading-relaxed break-words'>{message.content}</p>
													<span
														className={cn(
															"text-[10px] mt-1 block tabular-nums",
															isOwn ? "text-black/60" : "text-zinc-400"
														)}
													>
														{formatTime(message.createdAt)}
													</span>
												</div>
											</div>
										);
									})
								)}
								<div ref={messagesEndRef} />
							</div>

							<MessageInput />
						</>
					) : (
						<NoConversationPlaceholder />
					)}
				</div>
			</div>
		</PageShell>
	);
};
export default ChatPage;

const NoConversationPlaceholder = () => (
	<div className='flex flex-col items-center justify-center flex-1 space-y-5 p-6'>
		<div className='relative'>
			<div className='absolute -inset-2 bg-gradient-to-r from-green-500/30 to-emerald-400/20 rounded-full blur-xl' />
			<div className='relative bg-zinc-900 border border-zinc-800 rounded-full p-5'>
				<MessageCircle className='size-10 text-green-500' />
			</div>
		</div>
		<div className='text-center max-w-sm'>
			<h3 className='text-zinc-200 text-xl font-semibold mb-2'>Your Messages</h3>
			<p className='text-zinc-500 text-sm leading-relaxed'>
				Pick a friend from the list to chat and see what they&apos;re listening to in real time.
			</p>
		</div>
	</div>
);
