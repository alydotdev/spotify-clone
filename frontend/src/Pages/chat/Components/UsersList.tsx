import UsersListSkeleton from "@/components/skeletons/UserListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseListeningActivity } from "@/lib/activity";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { Music2, Users } from "lucide-react";

const UsersList = () => {
	const { users, selectedUser, isLoading, setSelectedUser, onlineUsers, userActivities } =
		useChatStore();

	const onlineCount = users.filter((user) => onlineUsers.has(user.clerkId)).length;

	return (
		<div className='flex flex-col h-full min-h-0 border-b sm:border-b-0 sm:border-r border-zinc-800 bg-zinc-900/60'>
			<div className='px-4 py-4 border-b border-zinc-800 hidden sm:block'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Users className='size-5 text-green-500' />
						<h2 className='font-semibold text-white'>Messages</h2>
					</div>
					<span className='text-xs text-zinc-500'>{onlineCount} online</span>
				</div>
			</div>

			<ScrollArea className='flex-1 min-h-0 max-h-[140px] sm:max-h-none'>
				<div className='p-2 sm:p-3 space-y-1'>
					{isLoading ? (
						<UsersListSkeleton />
					) : users.length === 0 ? (
						<p className='text-sm text-zinc-500 text-center py-8 px-4'>No other users yet</p>
					) : (
						users.map((user) => {
							const isOnline = onlineUsers.has(user.clerkId);
							const isSelected = selectedUser?.clerkId === user.clerkId;
							const listening = parseListeningActivity(userActivities.get(user.clerkId));

							return (
								<button
									key={user._id}
									type='button'
									onClick={() => setSelectedUser(user)}
									className={cn(
										"w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
										isSelected
											? "bg-zinc-800 shadow-sm ring-1 ring-zinc-700"
											: "hover:bg-zinc-800/60"
									)}
								>
									<div className='relative shrink-0'>
										<Avatar className='size-11 border border-zinc-700'>
											<AvatarImage src={user.imageUrl} />
											<AvatarFallback>{user.fullName[0]}</AvatarFallback>
										</Avatar>
										<div
											className={cn(
												"absolute bottom-0 right-0 size-3 rounded-full border-2 border-zinc-900",
												isOnline ? "bg-green-500" : "bg-zinc-500"
											)}
										/>
									</div>

									<div className='flex-1 min-w-0 hidden sm:block'>
										<div className='flex items-center gap-2'>
											<span className='font-medium truncate text-sm text-white'>
												{user.fullName}
											</span>
											{listening && isOnline && (
												<Music2 className='size-3.5 text-green-400 shrink-0' />
											)}
										</div>
										<p className='text-xs text-zinc-500 truncate mt-0.5'>
											{!isOnline
												? "Offline"
												: listening
													? `Listening to ${listening.title}`
													: "Online"}
										</p>
									</div>
								</button>
							);
						})
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default UsersList;
