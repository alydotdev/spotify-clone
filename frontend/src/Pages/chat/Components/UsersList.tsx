import UsersListSkeleton from "@/components/skeletons/UserListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { parseListeningActivity } from "@/lib/activity";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { Music2, Users } from "lucide-react";

const UsersList = () => {
	const { users, selectedUser, isLoading, setSelectedUser, onlineUsers, userActivities } =
		useChatStore();

	const onlineCount = users.filter((user) => onlineUsers.has(user.clerkId)).length;

	return (
		<div className='flex flex-col shrink-0 sm:h-full sm:min-h-0 border-b sm:border-b-0 sm:border-r border-zinc-800 bg-zinc-900/60'>
			<div className='px-3 sm:px-4 py-2 sm:py-4 border-b border-zinc-800'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Users className='size-4 sm:size-5 text-green-500' />
						<h2 className='font-semibold text-white text-sm sm:text-base'>Messages</h2>
					</div>
					<span className='text-xs text-zinc-500'>{onlineCount} online</span>
				</div>
			</div>

			<div className='overflow-x-auto sm:overflow-x-hidden overflow-y-hidden sm:overflow-y-auto mobile-scroll flex-1 min-h-0'>
				<div className='flex sm:flex-col gap-2 p-2 sm:p-3 sm:space-y-1 min-w-max sm:min-w-0'>
					{isLoading ? (
						<UsersListSkeleton />
					) : users.length === 0 ? (
						<p className='text-sm text-zinc-500 text-center py-6 px-4 sm:py-8 w-full min-w-0'>
							No other users yet
						</p>
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
										"flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all text-left touch-manipulation w-[4.5rem] sm:w-full shrink-0 sm:shrink",
										isSelected
											? "bg-zinc-800 shadow-sm ring-1 ring-zinc-700"
											: "hover:bg-zinc-800/60 active:bg-zinc-800"
									)}
								>
									<div className='relative shrink-0'>
										<Avatar className='size-11 sm:size-11 border border-zinc-700'>
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

									<div className='flex-1 min-w-0 text-center sm:text-left w-full'>
										<div className='flex items-center justify-center sm:justify-start gap-1 sm:gap-2'>
											<span className='font-medium truncate text-[11px] sm:text-sm text-white max-w-[4rem] sm:max-w-none'>
												{user.fullName.split(" ")[0]}
											</span>
											{listening && isOnline && (
												<Music2 className='size-3 text-green-400 shrink-0 hidden sm:block' />
											)}
										</div>
										<p className='text-[10px] sm:text-xs text-zinc-500 truncate mt-0.5 hidden sm:block'>
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
			</div>
		</div>
	);
};

export default UsersList;
