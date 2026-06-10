import { axiosInstance } from "@/lib/axios";
import type { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface MusicStore {
	songs: Song[];
	albums: Album[];
	error: string | null;
	currentAlbum: Album | null;
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	searchResults: Song[];
	stats: Stats;

	isAlbumsLoading: boolean;
	isCurrentAlbumLoading: boolean;
	isHomeLoading: boolean;
	isSearchLoading: boolean;
	isSongsLoading: boolean;
	isStatsLoading: boolean;

	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchHomeData: () => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	fetchSearchResults: (query: string) => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
	albums: [],
	songs: [],
	error: null,
	currentAlbum: null,
	madeForYouSongs: [],
	featuredSongs: [],
	trendingSongs: [],
	searchResults: [],
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
	},

	isAlbumsLoading: false,
	isCurrentAlbumLoading: false,
	isHomeLoading: false,
	isSearchLoading: false,
	isSongsLoading: false,
	isStatsLoading: false,

	deleteSong: async (id) => {
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
				featuredSongs: state.featuredSongs.filter((song) => song._id !== id),
				madeForYouSongs: state.madeForYouSongs.filter((song) => song._id !== id),
				trendingSongs: state.trendingSongs.filter((song) => song._id !== id),
				searchResults: state.searchResults.filter((song) => song._id !== id),
			}));

			await Promise.all([get().fetchAlbums(), get().fetchStats()]);
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error(error.response?.data?.message || "Error deleting song");
		}
	},

	deleteAlbum: async (id) => {
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);

			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.filter((song) => song.albumId !== id),
				currentAlbum: state.currentAlbum?._id === id ? null : state.currentAlbum,
			}));

			await Promise.all([get().fetchSongs(), get().fetchStats()]);
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to delete album");
		}
	},

	fetchSongs: async () => {
		set({ isSongsLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			set({ songs: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isSongsLoading: false });
		}
	},

	fetchStats: async () => {
		set({ isStatsLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isStatsLoading: false });
		}
	},

	fetchAlbums: async () => {
		set({ isAlbumsLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/albums");
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isAlbumsLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		set({ isCurrentAlbumLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/${id}`);
			set({ currentAlbum: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isCurrentAlbumLoading: false });
		}
	},

	fetchHomeData: async () => {
		set({ isHomeLoading: true, error: null });
		try {
			const [featured, madeForYou, trending] = await Promise.all([
				axiosInstance.get("/songs/featured"),
				axiosInstance.get("/songs/made-for-you"),
				axiosInstance.get("/songs/trending"),
			]);
			set({
				featuredSongs: featured.data,
				madeForYouSongs: madeForYou.data,
				trendingSongs: trending.data,
			});
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isHomeLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		set({ isHomeLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			set({ featuredSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isHomeLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		set({ isHomeLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/made-for-you");
			set({ madeForYouSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isHomeLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		set({ isHomeLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			set({ trendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isHomeLoading: false });
		}
	},

	fetchSearchResults: async (query: string) => {
		set({ isSearchLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/search", {
				params: { q: query },
			});
			set({ searchResults: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to search songs" });
			set({ searchResults: [] });
		} finally {
			set({ isSearchLoading: false });
		}
	},
}));
