import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAudioRef } from "@/layout/AudioProvider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume1, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const formatTime = (seconds: number) => {
	if (!Number.isFinite(seconds)) return "0:00";
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	const {
		currentSong,
		isPlaying,
		isShuffle,
		repeatMode,
		togglePlay,
		playNext,
		playPrevious,
		toggleShuffle,
		toggleRepeat,
	} = usePlayerStore();
	const audioRef = useAudioRef();

	const [volume, setVolume] = useState(75);
	const [isMuted, setIsMuted] = useState(false);
	const volumeBeforeMute = useRef(75);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration || 0);
		const resetTime = () => {
			setCurrentTime(0);
			setDuration(audio.duration || 0);
		};

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);
		audio.addEventListener("durationchange", updateDuration);
		audio.addEventListener("loadeddata", resetTime);

		updateDuration();

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("durationchange", updateDuration);
			audio.removeEventListener("loadeddata", resetTime);
		};
	}, [audioRef, currentSong]);

	useEffect(() => {
		setCurrentTime(0);
		setDuration(0);
	}, [currentSong?._id]);

	const handleSeek = (value: number[]) => {
		const audio = audioRef.current;
		if (audio) {
			audio.currentTime = value[0];
			setCurrentTime(value[0]);
		}
	};

	const handleVolumeChange = (value: number[]) => {
		const nextVolume = value[0];
		setVolume(nextVolume);
		setIsMuted(nextVolume === 0);

		if (audioRef.current) {
			audioRef.current.volume = nextVolume / 100;
		}

		if (nextVolume > 0) {
			volumeBeforeMute.current = nextVolume;
		}
	};

	const toggleMute = () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isMuted) {
			const restored = volumeBeforeMute.current || 75;
			setVolume(restored);
			setIsMuted(false);
			audio.volume = restored / 100;
		} else {
			volumeBeforeMute.current = volume || 75;
			setVolume(0);
			setIsMuted(true);
			audio.volume = 0;
		}
	};

	return (
		<footer className='fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 shrink-0 pb-[env(safe-area-inset-bottom)] md:static md:z-auto md:bg-zinc-900 md:backdrop-blur-none'>
			<div className='flex justify-between items-center gap-2 px-2 sm:px-4 pt-2 sm:pt-0 sm:h-20 md:h-24 max-w-[1800px] mx-auto'>
				<div className='flex items-center gap-2 sm:gap-4 min-w-0 flex-1 sm:flex-none sm:min-w-[180px] sm:w-[30%]'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-10 h-10 sm:w-14 sm:h-14 object-cover rounded-md shrink-0'
							/>
							<div className='flex-1 min-w-0'>
								<div className='font-medium truncate text-sm sm:text-base'>{currentSong.title}</div>
								<div className='text-xs sm:text-sm text-zinc-400 truncate'>{currentSong.artist}</div>
							</div>
						</>
					)}
				</div>

				<div className='flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0 sm:flex-1 sm:justify-center sm:max-w-[45%]'>
					<Button
						size='icon'
						variant='ghost'
						className={cn(
							"hidden sm:inline-flex h-8 w-8 sm:h-10 sm:w-10",
							isShuffle ? "text-green-500 hover:text-green-400" : "text-zinc-400 hover:text-white"
						)}
						onClick={toggleShuffle}
						disabled={!currentSong}
						aria-label='Toggle shuffle'
					>
						<Shuffle className='h-4 w-4' />
					</Button>

					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400 h-8 w-8 sm:h-10 sm:w-10'
						onClick={playPrevious}
						disabled={!currentSong}
						aria-label='Previous song'
					>
						<SkipBack className='h-4 w-4' />
					</Button>

					<Button
						size='icon'
						className='bg-white hover:bg-white/80 text-black rounded-full h-8 w-8 sm:h-9 sm:w-9'
						onClick={togglePlay}
						disabled={!currentSong}
						aria-label={isPlaying ? "Pause" : "Play"}
					>
						{isPlaying ? <Pause className='h-4 w-4 sm:h-5 sm:w-5' /> : <Play className='h-4 w-4 sm:h-5 sm:w-5' />}
					</Button>

					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400 h-8 w-8 sm:h-10 sm:w-10'
						onClick={playNext}
						disabled={!currentSong}
						aria-label='Next song'
					>
						<SkipForward className='h-4 w-4' />
					</Button>

					<Button
						size='icon'
						variant='ghost'
						className={cn(
							"hidden sm:inline-flex h-8 w-8 sm:h-10 sm:w-10",
							repeatMode !== "off" ? "text-green-500 hover:text-green-400" : "text-zinc-400 hover:text-white"
						)}
						onClick={toggleRepeat}
						disabled={!currentSong}
						aria-label='Toggle repeat'
					>
						{repeatMode === "one" ? <Repeat1 className='h-4 w-4' /> : <Repeat className='h-4 w-4' />}
					</Button>
				</div>

				<div className='hidden sm:flex items-center gap-2 min-w-[120px] md:min-w-[180px] md:w-[30%] justify-end'>
					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400 shrink-0'
						onClick={toggleMute}
						aria-label={isMuted ? "Unmute" : "Mute"}
					>
						{isMuted || volume === 0 ? <VolumeX className='h-4 w-4' /> : <Volume1 className='h-4 w-4' />}
					</Button>

					<Slider
						value={[isMuted ? 0 : volume]}
						max={100}
						step={1}
						className='w-16 md:w-24 hover:cursor-grab active:cursor-grabbing'
						onValueChange={handleVolumeChange}
					/>
				</div>
			</div>

			<div className='flex items-center gap-2 px-3 sm:px-4 pb-2 sm:pb-3 max-w-[1800px] mx-auto'>
				<div className='text-[10px] sm:text-xs text-zinc-400 w-8 sm:w-10 text-right tabular-nums'>
					{formatTime(currentTime)}
				</div>
				<Slider
					value={[currentTime]}
					max={duration || 100}
					step={0.1}
					className='flex-1 hover:cursor-grab active:cursor-grabbing'
					onValueChange={handleSeek}
					disabled={!currentSong}
				/>
				<div className='text-[10px] sm:text-xs text-zinc-400 w-8 sm:w-10 tabular-nums'>
					{formatTime(duration)}
				</div>
			</div>
		</footer>
	);
};
