import { useCallback, useState } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";

const SearchPage = () => {
	const { fetchSearchResults, searchResults, isSearchLoading } = useMusicStore();
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = useCallback(
		(query: string) => {
			setSearchQuery(query);
			if (query.trim()) {
				fetchSearchResults(query);
			} else {
				setSearchQuery("");
			}
		},
		[fetchSearchResults]
	);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-900 to-zinc-800'>
			<Topbar />
			<ScrollArea className='h-[calc(100dvh-168px)] sm:h-[calc(100dvh-192px)]'>
				<div className='p-4 sm:p-6 md:p-8'>
					<div className='max-w-6xl mx-auto'>
						<div className='mb-6 sm:mb-8'>
							<h1 className='text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2'>
								Search Music
							</h1>
							<p className='text-zinc-400 text-base sm:text-lg'>Discover your favorite songs and artists</p>
						</div>

						<SearchBar onSearch={handleSearch} isLoading={isSearchLoading} />

						<SearchResults
							songs={searchResults}
							isLoading={isSearchLoading}
							query={searchQuery}
						/>
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};

export default SearchPage;
