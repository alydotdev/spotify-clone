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
import { axiosInstance } from "@/lib/axios";
import { formatDuration, getAudioMetadata, guessTitleFromFilename } from "@/lib/audio";
import { useMusicStore } from "@/stores/useMusicStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader2, Music, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

type AlbumSongDraft = {
	id: string;
	title: string;
	artist: string;
	duration: string;
	audioFile: File | null;
	imageFile: File | null;
};

const createEmptySong = (defaultArtist = ""): AlbumSongDraft => ({
	id: crypto.randomUUID(),
	title: "",
	artist: defaultArtist,
	duration: "0",
	audioFile: null,
	imageFile: null,
});

const AddAlbumDialog = () => {
	const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const albumImageInputRef = useRef<HTMLInputElement>(null);
	const { getToken, isSignedIn } = useAuth();
	const fetchAlbums = useMusicStore((state) => state.fetchAlbums);
	const fetchSongs = useMusicStore((state) => state.fetchSongs);

	const [newAlbum, setNewAlbum] = useState({
		title: "",
		artist: "",
		releaseYear: new Date().getFullYear(),
	});

	const [imageFile, setImageFile] = useState<File | null>(null);
	const [songs, setSongs] = useState<AlbumSongDraft[]>([]);

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) setImageFile(file);
	};

	const addSongRow = () => {
		setSongs((prev) => [...prev, createEmptySong(newAlbum.artist)]);
	};

	const removeSongRow = (id: string) => {
		setSongs((prev) => prev.filter((song) => song.id !== id));
	};

	const updateSong = (id: string, updates: Partial<AlbumSongDraft>) => {
		setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, ...updates } : song)));
	};

	const validateSongs = () => {
		for (let i = 0; i < songs.length; i++) {
			const song = songs[i];
			const title = song.title.trim() || (song.audioFile ? guessTitleFromFilename(song.audioFile.name) : "");
			if (!title) {
				toast.error(`Song ${i + 1} is missing a title — pick an audio file first`);
				return false;
			}
			if (!song.audioFile) {
				toast.error(`Song ${i + 1} is missing an audio file`);
				return false;
			}
			if (!song.imageFile) {
				toast.error(`Song ${i + 1} is missing cover art`);
				return false;
			}
		}
		return true;
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			if (!isSignedIn) {
				toast.error("Please sign in to add albums");
				return;
			}

			if (!newAlbum.title.trim()) {
				toast.error("Please enter an album title");
				return;
			}

			if (!newAlbum.artist.trim()) {
				toast.error("Please enter an artist name");
				return;
			}

			if (!imageFile) {
				toast.error("Please upload an album image");
				return;
			}

			if (!validateSongs()) return;

			const token = await getToken();
			if (!token) {
				toast.error("Authentication failed. Please sign in again.");
				return;
			}

			const formData = new FormData();
			formData.append("title", newAlbum.title.trim());
			formData.append("artist", newAlbum.artist.trim());
			formData.append("releaseYear", newAlbum.releaseYear.toString());
			formData.append("imageFile", imageFile);

			if (songs.length > 0) {
				formData.append(
					"songs",
					JSON.stringify(
						songs.map((song) => ({
							title: song.title.trim() || guessTitleFromFilename(song.audioFile?.name || ""),
							artist: (song.artist || newAlbum.artist).trim(),
							duration: song.duration || "0",
						}))
					)
				);

				songs.forEach((song) => {
					if (song.audioFile) formData.append("audioFiles", song.audioFile);
					if (song.imageFile) formData.append("songImageFiles", song.imageFile);
				});
			}

			await axiosInstance.post("/admin/albums", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${token}`,
				},
			});

			toast.success(
				songs.length > 0
					? `Album created with ${songs.length} song${songs.length > 1 ? "s" : ""}`
					: "Album created successfully"
			);

			await Promise.all([fetchAlbums(), fetchSongs()]);
			resetForm();
			setAlbumDialogOpen(false);
		} catch (error: any) {
			console.error("Error creating album:", error);
			if (error.response?.status === 401) {
				toast.error("Authentication failed. Please sign in again.");
			} else if (error.response?.status === 403) {
				toast.error("Admin access required. You don't have permission to add albums.");
			} else {
				toast.error("Failed to create album: " + (error.response?.data?.message || error.message));
			}
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setNewAlbum({
			title: "",
			artist: "",
			releaseYear: new Date().getFullYear(),
		});
		setImageFile(null);
		setSongs([]);
	};

	const handleDialogClose = (open: boolean) => {
		setAlbumDialogOpen(open);
		if (!open && !isLoading) {
			resetForm();
		}
	};

	return (
		<Dialog open={albumDialogOpen} onOpenChange={handleDialogClose}>
			<DialogTrigger asChild>
				<Button className='bg-violet-500 hover:bg-violet-600 text-white'>
					<Plus className='mr-2 h-4 w-4' />
					Add Album
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700 max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Add New Album</DialogTitle>
					<DialogDescription>Create an album and optionally add multiple songs at once</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						ref={albumImageInputRef}
						onChange={handleImageSelect}
						accept='image/*'
						className='hidden'
					/>
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors'
						onClick={() => albumImageInputRef.current?.click()}
					>
						<div className='text-center'>
							{imageFile ? (
								<div className='space-y-2'>
									<div className='text-sm text-violet-500'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{imageFile.name.slice(0, 30)}</div>
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Upload album artwork</div>
									<Button variant='outline' size='sm' className='text-xs'>
										Choose File
									</Button>
								</>
							)}
						</div>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Album Title *</label>
							<Input
								value={newAlbum.title}
								onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
								className='bg-zinc-800 border-zinc-700'
								placeholder='Enter album title'
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Artist *</label>
							<Input
								value={newAlbum.artist}
								onChange={(e) => setNewAlbum({ ...newAlbum, artist: e.target.value })}
								className='bg-zinc-800 border-zinc-700'
								placeholder='Enter artist name'
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Release Year</label>
						<Input
							type='number'
							value={newAlbum.releaseYear}
							onChange={(e) =>
								setNewAlbum({
									...newAlbum,
									releaseYear: parseInt(e.target.value) || new Date().getFullYear(),
								})
							}
							className='bg-zinc-800 border-zinc-700'
							min={1900}
							max={new Date().getFullYear() + 1}
						/>
					</div>

					<div className='border-t border-zinc-700 pt-4 space-y-3'>
						<div className='flex items-center justify-between gap-4'>
							<div>
								<h3 className='text-sm font-semibold flex items-center gap-2'>
									<Music className='size-4 text-violet-400' />
									Album Songs
								</h3>
								<p className='text-xs text-zinc-400 mt-1'>Optional — add one or more songs to this album</p>
							</div>
							<Button type='button' variant='outline' size='sm' onClick={addSongRow}>
								<Plus className='size-4 mr-1' />
								Add Song
							</Button>
						</div>

						{songs.length === 0 && (
							<div className='text-center py-6 border border-dashed border-zinc-700 rounded-lg text-sm text-zinc-500'>
								No songs added yet. Click &quot;Add Song&quot; to include tracks in this album.
							</div>
						)}

						{songs.map((song, index) => (
							<AlbumSongForm
								key={song.id}
								index={index}
								song={song}
								defaultArtist={newAlbum.artist}
								onUpdate={(updates) => updateSong(song.id, updates)}
								onRemove={() => removeSongRow(song.id)}
							/>
						))}
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => handleDialogClose(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-violet-500 hover:bg-violet-600'
						disabled={isLoading || !imageFile || !newAlbum.title.trim() || !newAlbum.artist.trim()}
					>
						{isLoading
							? "Creating..."
							: songs.length > 0
								? `Create Album (${songs.length} song${songs.length > 1 ? "s" : ""})`
								: "Add Album"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

type AlbumSongFormProps = {
	index: number;
	song: AlbumSongDraft;
	defaultArtist: string;
	onUpdate: (updates: Partial<AlbumSongDraft>) => void;
	onRemove: () => void;
};

const AlbumSongForm = ({ index, song, defaultArtist, onUpdate, onRemove }: AlbumSongFormProps) => {
	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const [isReadingMetadata, setIsReadingMetadata] = useState(false);

	const handleAudioSelect = async (file: File | null) => {
		if (!file) {
			onUpdate({ audioFile: null, duration: "0", title: "" });
			return;
		}

		onUpdate({ audioFile: file });
		setIsReadingMetadata(true);

		try {
			const { duration, title } = await getAudioMetadata(file);
			onUpdate({ duration: String(duration), title });
		} catch {
			toast.error(`Could not read audio file for song ${index + 1}`);
			onUpdate({
				duration: "0",
				title: guessTitleFromFilename(file.name),
			});
		} finally {
			setIsReadingMetadata(false);
		}
	};

	const durationSeconds = Number(song.duration) || 0;

	return (
		<div className='rounded-lg border border-zinc-700 bg-zinc-800/40 p-4 space-y-3'>
			<div className='flex items-center justify-between'>
				<span className='text-sm font-medium text-violet-300'>Song {index + 1}</span>
				<Button type='button' variant='ghost' size='sm' onClick={onRemove} className='text-red-400 hover:text-red-300'>
					<Trash2 className='size-4 mr-1' />
					Remove
				</Button>
			</div>

			<input
				type='file'
				accept='audio/*'
				ref={audioInputRef}
				hidden
				onChange={(e) => handleAudioSelect(e.target.files?.[0] || null)}
			/>
			<input
				type='file'
				accept='image/*'
				ref={imageInputRef}
				hidden
				onChange={(e) => onUpdate({ imageFile: e.target.files?.[0] || null })}
			/>

			<Button
				type='button'
				variant='outline'
				className='w-full justify-start truncate'
				onClick={() => audioInputRef.current?.click()}
			>
				{song.audioFile ? song.audioFile.name : "Choose audio file *"}
			</Button>

			{song.audioFile && (
				<div className='rounded-md bg-zinc-800/80 border border-zinc-700 px-3 py-2 text-xs text-zinc-300'>
					{isReadingMetadata ? (
						<span className='flex items-center gap-2'>
							<Loader2 className='size-3 animate-spin text-violet-400' />
							Reading file info...
						</span>
					) : (
						<div className='space-y-1'>
							<p>
								<span className='text-zinc-500'>Title:</span> {song.title || "—"}
							</p>
							<p>
								<span className='text-zinc-500'>Duration:</span>{" "}
								{durationSeconds > 0 ? formatDuration(durationSeconds) : "Could not detect"}
							</p>
						</div>
					)}
				</div>
			)}

			<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
				<div className='space-y-2'>
					<label className='text-xs font-medium text-zinc-400'>Title</label>
					<Input
						value={song.title}
						onChange={(e) => onUpdate({ title: e.target.value })}
						className='bg-zinc-800 border-zinc-700'
						placeholder='Auto-detected from file name'
						disabled={!song.audioFile || isReadingMetadata}
					/>
				</div>
				<div className='space-y-2'>
					<label className='text-xs font-medium text-zinc-400'>Artist</label>
					<Input
						value={song.artist}
						onChange={(e) => onUpdate({ artist: e.target.value })}
						className='bg-zinc-800 border-zinc-700'
						placeholder={defaultArtist || "Uses album artist"}
					/>
				</div>
			</div>

			<Button
				type='button'
				variant='outline'
				className='w-full justify-start truncate'
				onClick={() => imageInputRef.current?.click()}
			>
				{song.imageFile ? song.imageFile.name : "Choose cover art *"}
			</Button>
		</div>
	);
};

export default AddAlbumDialog;
