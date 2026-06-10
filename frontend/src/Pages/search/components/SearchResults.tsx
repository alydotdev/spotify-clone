import type { Song } from "@/types";
import PlayButton from "../../home/components/PlayButton";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Music } from "lucide-react";

type SearchResultsProps = {
	songs: Song[];
	isLoading: boolean;
	query: string;
};

const SearchResults = ({ songs, isLoading, query }: SearchResultsProps) => {
	const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);

	if (isLoading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='animate-spin'>
					<Music className='size-8 text-green-500' />
				</div>
			</div>
		);
	}

	if (!query) {
		return (
			<div className='text-center py-16'>
				<Music className='size-16 text-zinc-600 mx-auto mb-4' />
				<p className='text-zinc-400 text-lg'>Search for songs and artists</p>
			</div>
		);
	}

	if (songs.length === 0) {
		return (
			<div className='text-center py-16'>
				<Music className='size-16 text-zinc-600 mx-auto mb-4' />
				<p className='text-zinc-400 text-lg'>No songs found for "{query}"</p>
				<p className='text-zinc-500 text-sm mt-2'>Try searching for different keywords</p>
			</div>
		);
	}

	return (
		<div>
			<div className='mb-6'>
				<h2 className='text-2xl font-bold'>
					Search Results <span className='text-green-500'>({songs.length})</span>
				</h2>
				<p className='text-zinc-400 text-sm mt-1'>Found {songs.length} song{songs.length !== 1 ? "s" : ""}</p>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
				{songs.map((song) => (
					<div
						key={song._id}
						onClick={() => setCurrentSong(song)}
						className='bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 p-4 rounded-lg hover:from-zinc-700/60 hover:to-zinc-800/60 transition-all group cursor-pointer backdrop-blur-sm border border-zinc-700/50'
					>
						<div className='relative mb-4'>
							<div className='aspect-square rounded-md shadow-lg overflow-hidden bg-zinc-800'>
								<img
									src={song.imageUrl}
									alt={song.title}
									className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
									onError={(e) => {
										const img = e.target as HTMLImageElement;
										img.src = "https://via.placeholder.com/300?text=No+Image";
									}}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
							</div>
							<PlayButton song={song} />
						</div>
						<div className='min-h-[60px]'>
							<h3 className='font-semibold mb-1 truncate text-white group-hover:text-green-400 transition-colors line-clamp-2'>
								{song.title}
							</h3>
							<p className='text-sm text-zinc-400 truncate group-hover:text-zinc-300 transition-colors'>
								{song.artist}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SearchResults;
