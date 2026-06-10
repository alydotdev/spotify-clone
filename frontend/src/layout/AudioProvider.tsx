import { resolveAudioUrl } from "@/lib/audio";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";

const AudioRefContext = createContext<RefObject<HTMLAudioElement | null> | null>(null);

export const useAudioRef = () => {
	const ref = useContext(AudioRefContext);
	if (!ref) throw new Error("useAudioRef must be used within AudioProvider");
	return ref;
};

export const AudioProvider = ({ children }: { children: ReactNode }) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);
	const { currentSong, isPlaying, playNext } = usePlayerStore();

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.play().catch((error) => {
				console.error("Audio playback failed:", error);
			});
		} else {
			audio.pause();
		}
	}, [isPlaying]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleEnded = () => {
			if (usePlayerStore.getState().repeatMode === "one") {
				audio.currentTime = 0;
				audio.play().catch((error) => {
					console.error("Audio playback failed:", error);
				});
				return;
			}
			playNext();
		};

		audio.addEventListener("ended", handleEnded);
		return () => audio.removeEventListener("ended", handleEnded);
	}, [playNext]);

	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;
		const resolvedUrl = resolveAudioUrl(currentSong.audioUrl);
		const isSongChange = prevSongRef.current !== resolvedUrl;

		if (isSongChange) {
			audio.src = resolvedUrl;
			audio.currentTime = 0;
			prevSongRef.current = resolvedUrl;

			if (isPlaying) {
				audio.load();
				audio.play().catch((error) => {
					console.error("Audio playback failed:", error);
				});
			}
		}
	}, [currentSong, isPlaying]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = 0.75;
		}
	}, []);

	return (
		<AudioRefContext.Provider value={audioRef}>
			<audio ref={audioRef} preload='metadata' />
			{children}
		</AudioRefContext.Provider>
	);
};
