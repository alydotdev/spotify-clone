import { create } from "zustand";
import type { Song } from "@/types";

type RepeatMode = "off" | "all" | "one";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;
	isShuffle: boolean;
	repeatMode: RepeatMode;
	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	playNext: () => void;
	togglePlay: () => void;
	playPrevious: () => void;
	toggleShuffle: () => void;
	toggleRepeat: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	isShuffle: false,
	repeatMode: "off",

	initializeQueue: (songs: Song[]) => {
		if (songs.length === 0) return;

		const { currentSong, currentIndex } = get();
		set({
			queue: songs,
			currentSong: currentSong || songs[0],
			currentIndex: currentIndex === -1 ? 0 : currentIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;
		const song = songs[startIndex];
		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;

		const { queue } = get();
		const songIndex = queue.findIndex((s) => s._id === song._id);

		if (songIndex === -1) {
			const newQueue = queue.length > 0 ? [...queue, song] : [song];
			set({
				queue: newQueue,
				currentSong: song,
				currentIndex: newQueue.length - 1,
				isPlaying: true,
			});
			return;
		}

		set({
			currentSong: song,
			currentIndex: songIndex,
			isPlaying: true,
		});
	},

	playNext: () => {
		const { currentIndex, queue, isShuffle, repeatMode } = get();

		if (queue.length === 0) {
			set({ isPlaying: false });
			return;
		}

		if (isShuffle && queue.length > 1) {
			const otherSongs = queue.filter((_, index) => index !== currentIndex);
			const nextSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
			const nextIndex = queue.findIndex((s) => s._id === nextSong._id);
			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
			return;
		}

		const nextIndex = currentIndex + 1;

		if (nextIndex < queue.length) {
			set({
				currentSong: queue[nextIndex],
				currentIndex: nextIndex,
				isPlaying: true,
			});
		} else if (repeatMode === "all") {
			set({
				currentSong: queue[0],
				currentIndex: 0,
				isPlaying: true,
			});
		} else {
			set({ isPlaying: false });
		}
	},

	togglePlay: () => {
		set({ isPlaying: !get().isPlaying });
	},

	playPrevious: () => {
		const { currentIndex, queue, repeatMode } = get();

		if (queue.length === 0) {
			set({ isPlaying: false });
			return;
		}

		const prevIndex = currentIndex - 1;

		if (prevIndex >= 0) {
			set({
				currentSong: queue[prevIndex],
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else if (repeatMode === "all") {
			const lastIndex = queue.length - 1;
			set({
				currentSong: queue[lastIndex],
				currentIndex: lastIndex,
				isPlaying: true,
			});
		} else {
			set({ isPlaying: false });
		}
	},

	toggleShuffle: () => {
		set({ isShuffle: !get().isShuffle });
	},

	toggleRepeat: () => {
		const modes: RepeatMode[] = ["off", "all", "one"];
		const currentIndex = modes.indexOf(get().repeatMode);
		set({ repeatMode: modes[(currentIndex + 1) % modes.length] });
	},
}));
