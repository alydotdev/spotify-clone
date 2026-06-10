const API_ORIGIN = import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ?? "http://localhost:5000";

export const resolveAudioUrl = (url: string) => {
	if (!url) return url;
	if (url.startsWith("http://") || url.startsWith("https://")) return url;
	return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};

export const formatDuration = (seconds: number) => {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const guessTitleFromFilename = (filename: string) => {
	return filename
		.replace(/\.[^/.]+$/, "")
		.replace(/^\d+[\s._-]*/, "")
		.replace(/[-_]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

export const getAudioMetadata = async (file: File) => {
	const duration = await getAudioDuration(file);
	return {
		duration,
		title: guessTitleFromFilename(file.name),
	};
};

export const getAudioDuration = (file: File): Promise<number> => {
	return new Promise((resolve, reject) => {
		const audio = new Audio();
		const objectUrl = URL.createObjectURL(file);

		const cleanup = () => URL.revokeObjectURL(objectUrl);

		audio.addEventListener("loadedmetadata", () => {
			cleanup();
			if (!Number.isFinite(audio.duration)) {
				reject(new Error("Invalid audio duration"));
				return;
			}
			resolve(Math.round(audio.duration));
		});

		audio.addEventListener("error", () => {
			cleanup();
			reject(new Error("Failed to read audio file"));
		});

		audio.src = objectUrl;
	});
};
