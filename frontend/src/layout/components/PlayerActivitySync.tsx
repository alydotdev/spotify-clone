import { formatListeningActivity } from "@/lib/activity";
import { useChatStore } from "@/stores/useChatStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

const PlayerActivitySync = () => {
	const { user } = useUser();
	const { currentSong, isPlaying } = usePlayerStore();
	const isConnected = useChatStore((state) => state.isConnected);
	const emitActivity = useChatStore((state) => state.emitActivity);

	useEffect(() => {
		if (!user?.id || !isConnected) return;

		const activity =
			isPlaying && currentSong
				? formatListeningActivity(currentSong.title, currentSong.artist)
				: "Idle";

		emitActivity(activity);
	}, [user?.id, isConnected, currentSong?._id, currentSong?.title, currentSong?.artist, isPlaying, emitActivity]);

	return null;
};

export default PlayerActivitySync;
