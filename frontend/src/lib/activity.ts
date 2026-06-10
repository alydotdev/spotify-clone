export const formatListeningActivity = (title: string, artist: string) =>
	`Playing ${title} by ${artist}`;

export const parseListeningActivity = (activity?: string) => {
	if (!activity || activity === "Idle") return null;

	const match = activity.match(/^Playing (.+) by (.+)$/);
	if (match) {
		return { title: match[1], artist: match[2] };
	}

	return { title: activity.replace(/^Playing\s*/, ""), artist: "" };
};
