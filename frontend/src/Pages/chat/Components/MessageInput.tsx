import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { Send } from "lucide-react";
import { useState } from "react";

const MessageInput = () => {
	const [newMessage, setNewMessage] = useState("");
	const { user } = useUser();
	const { selectedUser, sendMessage, isConnected } = useChatStore();

	const handleSend = () => {
		if (!selectedUser || !user || !newMessage.trim()) return;
		sendMessage(selectedUser.clerkId, user.id, newMessage.trim());
		setNewMessage("");
	};

	return (
		<div className='p-3 sm:p-4 mt-auto border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm'>
			<div className='flex gap-2 items-center max-w-4xl mx-auto'>
				<Input
					placeholder={isConnected ? "Write a message..." : "Connecting..."}
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					disabled={!isConnected}
					className='bg-zinc-800 border-zinc-700 rounded-full px-5 h-11 focus-visible:ring-green-500/40'
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSend();
						}
					}}
				/>

				<Button
					size='icon'
					onClick={handleSend}
					disabled={!newMessage.trim() || !isConnected}
					className='rounded-full size-11 bg-green-500 hover:bg-green-400 text-black shrink-0'
				>
					<Send className='size-4' />
				</Button>
			</div>
		</div>
	);
};

export default MessageInput;
