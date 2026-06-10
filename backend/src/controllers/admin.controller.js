import {Song} from '../models/song.model.js'
import {Album} from '../models/album.model.js'
import cloudinary from '../lib/cloudinary.js'

const uploadToCloudinary = async(file)=>{
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath,{
            resource_type: "auto"
        }
    )
    return result.secure_url;
    } catch (error) {
        console.log("Error in uploadToCloudinary", error)
        throw new Error("Error uploading to cloudinary", error);
    }
}

export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}

		const { title, artist, albumId, duration } = req.body;
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		const audioUrl = await uploadToCloudinary(audioFile);
		const imageUrl = await uploadToCloudinary(imageFile);

		const song = new Song({
			title,
			artist,
			audioUrl,
			imageUrl,
			duration,
			albumId: albumId || null,
		});

		await song.save();

		// if song belongs to an album, update the album's songs array
		if (albumId) {
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
		}
		res.status(201).json(song);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};
export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const song = await Song.findById(id);

		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
		}

		await Song.findByIdAndDelete(id);
		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleting song", error);
		next(error);
	}
};

const normalizeUploadedFiles = (files) => {
	if (!files) return [];
	return Array.isArray(files) ? files : [files];
};

export const createAlbum = async (req, res, next) => {
	try {
		const { title, artist, releaseYear, songs: songsJson } = req.body;

		if (!req.files?.imageFile) {
			return res.status(400).json({ message: "Please upload album artwork" });
		}

		const imageUrl = await uploadToCloudinary(req.files.imageFile);

		const album = new Album({
			title,
			artist,
			imageUrl,
			releaseYear,
			songs: [],
		});
		await album.save();

		let songsMeta = [];
		if (songsJson) {
			try {
				songsMeta = JSON.parse(songsJson);
			} catch {
				return res.status(400).json({ message: "Invalid songs data" });
			}
		}

		const audioFiles = normalizeUploadedFiles(req.files.audioFiles);
		const songImageFiles = normalizeUploadedFiles(req.files.songImageFiles);

		if (songsMeta.length > 0) {
			if (audioFiles.length !== songsMeta.length || songImageFiles.length !== songsMeta.length) {
				return res.status(400).json({
					message: "Each song must include both an audio file and an image file",
				});
			}

			const createdSongIds = [];

			for (let i = 0; i < songsMeta.length; i++) {
				const { title: songTitle, artist: songArtist, duration } = songsMeta[i];

				if (!songTitle?.trim()) {
					return res.status(400).json({ message: `Song ${i + 1} is missing a title` });
				}

				const audioUrl = await uploadToCloudinary(audioFiles[i]);
				const songImageUrl = await uploadToCloudinary(songImageFiles[i]);

				const song = new Song({
					title: songTitle.trim(),
					artist: (songArtist || artist).trim(),
					audioUrl,
					imageUrl: songImageUrl,
					duration: Number(duration) || 0,
					albumId: album._id,
				});

				await song.save();
				createdSongIds.push(song._id);
			}

			album.songs = createdSongIds;
			await album.save();
		}

		const populatedAlbum = await Album.findById(album._id).populate("songs");
		res.status(201).json(populatedAlbum);
	} catch (error) {
		console.log("Error in createAlbum", error);
		next(error);
	}
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		const album = await Album.findById(id);

		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		await Song.deleteMany({ albumId: id });
		await Album.findByIdAndDelete(id);
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};
export const checkAdmin = async (req,res,next) => {
    res.status(200).json({isAdmin: true})
}