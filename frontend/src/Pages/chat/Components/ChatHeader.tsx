import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { parseListeningActivity } from "@/lib/activity";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { Music2 } from "lucide-react";

const ChatHeader = () => {
	const { selectedUser, onlineUsers, userActivities } = useChatStore();

	if (!selectedUser) return null;

	const isOnline = onlineUsers.has(selectedUser.clerkId);
	const listening = parseListeningActivity(userActivities.get(selectedUser.clerkId));

	return (
		<div className='px-4 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm'>
			<div className='flex items-center gap-3'>
				<div className='relative'>
					<Avatar className='size-11 border border-zinc-700'>
						<AvatarImage src={selectedUser.imageUrl} />
						<AvatarFallback>{selectedUser.fullName[0]}</AvatarFallback>
					</Avatar>
					<div
						className={cn(
							"absolute bottom-0 right-0 size-3 rounded-full border-2 border-zinc-900",
							isOnline ? "bg-green-500" : "bg-zinc-500"
						)}
					/>
				</div>

				<div className='min-w-0 flex-1'>
					<h2 className='font-semibold text-white truncate'>{selectedUser.fullName}</h2>
					{isOnline && listening ? (
						<div className='flex items-center gap-1.5 mt-0.5'>
							<Music2 className='size-3.5 text-green-400 shrink-0 animate-pulse' />
							<p className='text-xs text-zinc-400 truncate'>
								{listening.title}
								{listening.artist ? ` · ${listening.artist}` : ""}
							</p>
						</div>
					) : (
						<p className={cn("text-sm mt-0.5", isOnline ? "text-green-400" : "text-zinc-500")}>
							{isOnline ? "Online" : "Offline"}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ChatHeader;
