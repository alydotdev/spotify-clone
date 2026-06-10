import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios";
import { formatDuration, getAudioMetadata, guessTitleFromFilename } from "@/lib/audio";
import { useMusicStore } from "@/stores/useMusicStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader2, Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface NewSong {
	title: string;
	artist: string;
	album: string;
	duration: string;
}

const AddSongDialog = () => {
	const { albums } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { getToken, isSignedIn } = useAuth();

	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		artist: "",
		album: "",
		duration: "0",
	});

	const [files, setFiles] = useState<{ audio: File | null; image: File | null }>({
		audio: null,
		image: null,
	});

	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const [isReadingMetadata, setIsReadingMetadata] = useState(false);

	const handleAudioSelect = async (file: File | null) => {
		if (!file) {
			setFiles((prev) => ({ ...prev, audio: null }));
			setNewSong((prev) => ({ ...prev, duration: "0", title: "" }));
			return;
		}

		setFiles((prev) => ({ ...prev, audio: file }));
		setIsReadingMetadata(true);

		try {
			const { duration, title } = await getAudioMetadata(file);
			setNewSong((prev) => ({
				...prev,
				duration: String(duration),
				title,
			}));
		} catch {
			toast.error("Could not read audio file");
			setNewSong((prev) => ({
				...prev,
				duration: "0",
				title: guessTitleFromFilename(file.name),
			}));
		} finally {
			setIsReadingMetadata(false);
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			if (!isSignedIn) {
				toast.error("Please sign in to add songs");
				return;
			}

			if (!files.audio || !files.image) {
				toast.error("Please upload both audio and image files");
				return;
			}

			const title = newSong.title.trim() || guessTitleFromFilename(files.audio.name);
			if (!title) {
				toast.error("Could not detect a song title from the audio file");
				return;
			}

			if (!newSong.artist.trim()) {
				toast.error("Please enter an artist name");
				return;
			}

			const token = await getToken();
			if (!token) {
				toast.error("Authentication failed. Please sign in again.");
				return;
			}

			const formData = new FormData();
			formData.append("title", title);
			formData.append("artist", newSong.artist.trim());
			formData.append("duration", newSong.duration);
			if (newSong.album && newSong.album !== "none") {
				formData.append("albumId", newSong.album);
			}

			formData.append("audioFile", files.audio);
			formData.append("imageFile", files.image);

			await axiosInstance.post("/admin/songs", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${token}`,
				},
			});

			setNewSong({ title: "", artist: "", album: "", duration: "0" });
			setFiles({ audio: null, image: null });
			setSongDialogOpen(false);
			toast.success("Song added successfully");
		} catch (error: any) {
			console.error("Error adding song:", error);
			if (error.response?.status === 401) {
				toast.error("Authentication failed. Please sign in again.");
			} else if (error.response?.status === 403) {
				toast.error("Admin access required. You don't have permission to add songs.");
			} else {
				toast.error("Failed to add song: " + (error.response?.data?.message || error.message));
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
					<Plus className='mr-2 h-4 w-4' />
					Add Song
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Add New Song</DialogTitle>
					<DialogDescription>Pick an audio file — title and duration are detected automatically</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='audio/*'
						ref={audioInputRef}
						hidden
						onChange={(e) => handleAudioSelect(e.target.files?.[0] || null)}
					/>
					<input
						type='file'
						ref={imageInputRef}
						className='hidden'
						accept='image/*'
						onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
					/>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Audio File *</label>
						<Button
							variant='outline'
							onClick={() => audioInputRef.current?.click()}
							className='w-full justify-start truncate'
						>
							{files.audio ? files.audio.name : "Choose audio file"}
						</Button>

						{files.audio && (
							<div className='rounded-md bg-zinc-800/80 border border-zinc-700 px-3 py-2 text-xs text-zinc-300'>
								{isReadingMetadata ? (
									<span className='flex items-center gap-2'>
										<Loader2 className='size-3 animate-spin text-emerald-400' />
										Reading file info...
									</span>
								) : (
									<div className='space-y-1'>
										<p>
											<span className='text-zinc-500'>Title:</span> {newSong.title || "—"}
										</p>
										<p>
											<span className='text-zinc-500'>Duration:</span>{" "}
											{Number(newSong.duration) > 0
												? formatDuration(Number(newSong.duration))
												: "Could not detect"}
										</p>
									</div>
								)}
							</div>
						)}
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Title</label>
						<Input
							value={newSong.title}
							onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Auto-detected from file name'
							disabled={!files.audio || isReadingMetadata}
						/>
						<p className='text-xs text-zinc-500'>Filled automatically — edit only if you want a different name</p>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist *</label>
						<Input
							value={newSong.artist}
							onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter artist name'
						/>
					</div>

					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{files.image ? (
								<div className='space-y-2'>
									<div className='text-sm text-emerald-500'>Cover art selected</div>
									<div className='text-xs text-zinc-400'>{files.image.name}</div>
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Upload cover art *</div>
									<Button variant='outline' size='sm' className='text-xs' type='button'>
										Choose File
									</Button>
								</>
							)}
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album (Optional)</label>
						<Select value={newSong.album} onValueChange={(value) => setNewSong({ ...newSong, album: value })}>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select album' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='none'>No Album (Single)</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setSongDialogOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || !files.audio || !files.image || isReadingMetadata}
					>
						{isLoading ? "Uploading..." : "Add Song"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddSongDialog;
