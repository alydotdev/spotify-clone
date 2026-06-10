import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseListeningActivity } from "@/lib/activity";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { HeadphonesIcon, Music2, Users } from "lucide-react";
import { useEffect } from "react";

const FriendsActivity = () => {
	const { users, fetchUsers, onlineUsers, userActivities } = useChatStore();
	const { user } = useUser();

	useEffect(() => {
		if (user) fetchUsers();
	}, [fetchUsers, user]);

	return (
		<div className='h-full bg-zinc-900 rounded-lg flex flex-col overflow-hidden'>
			<div className='p-4 border-b border-zinc-800'>
				<div className='flex items-center gap-2'>
					<Users className='size-5 shrink-0 text-green-500' />
					<h2 className='font-semibold text-sm'>Friend Activity</h2>
				</div>
				<p className='text-xs text-zinc-500 mt-1'>Live listening updates</p>
			</div>

			{!user && <LoginPrompt />}

			<ScrollArea className='flex-1'>
				<div className='p-3 space-y-2'>
					{users.length === 0 ? (
						<p className='text-xs text-zinc-500 text-center py-8 px-2'>No friends to show yet</p>
					) : (
						users.map((friend) => {
							const isOnline = onlineUsers.has(friend.clerkId);
							const listening = parseListeningActivity(userActivities.get(friend.clerkId));

							return (
								<div
									key={friend._id}
									className='rounded-xl p-3 bg-zinc-800/40 hover:bg-zinc-800/70 transition-colors'
								>
									<div className='flex items-start gap-3'>
										<div className='relative shrink-0'>
											<Avatar className='size-10 border border-zinc-700'>
												<AvatarImage src={friend.imageUrl} alt={friend.fullName} />
												<AvatarFallback>{friend.fullName[0]}</AvatarFallback>
											</Avatar>
											<div
												className={cn(
													"absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-zinc-900",
													isOnline ? "bg-green-500" : "bg-zinc-500"
												)}
											/>
										</div>

										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-1.5'>
												<span className='font-medium text-sm text-white truncate'>
													{friend.fullName}
												</span>
												{listening && isOnline && (
													<Music2 className='size-3.5 text-green-400 shrink-0' />
												)}
											</div>

											{!isOnline ? (
												<p className='text-xs text-zinc-500 mt-1'>Offline</p>
											) : listening ? (
												<div className='mt-1'>
													<p className='text-xs text-green-400 font-medium truncate'>
														{listening.title}
													</p>
													{listening.artist && (
														<p className='text-[11px] text-zinc-500 truncate'>
															{listening.artist}
														</p>
													)}
												</div>
											) : (
												<p className='text-xs text-zinc-500 mt-1'>Idle</p>
											)}
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</ScrollArea>
		</div>
	);
};
export default FriendsActivity;

const LoginPrompt = () => (
	<div className='flex flex-col items-center justify-center p-6 text-center space-y-4'>
		<div className='relative'>
			<div
				className='absolute -inset-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full blur-lg opacity-75 animate-pulse'
				aria-hidden='true'
			/>
			<div className='relative bg-zinc-900 rounded-full p-4'>
				<HeadphonesIcon className='size-8 text-emerald-400' />
			</div>
		</div>

		<div className='space-y-2 max-w-[250px]'>
			<h3 className='text-lg font-semibold text-white'>See What Friends Are Playing</h3>
			<p className='text-sm text-zinc-400'>Login to discover what music your friends are enjoying right now</p>
		</div>
	</div>
);
