import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchBarProps = {
	onSearch: (query: string) => void;
	isLoading: boolean;
};

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
	const [query, setQuery] = useState("");

	const handleSearch = useCallback(() => {
		if (query.trim()) {
			onSearch(query.trim());
		}
	}, [query, onSearch]);

	const handleClear = () => {
		setQuery("");
		onSearch("");
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<div className='w-full mb-6 sm:mb-8'>
			<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
				<div className='relative flex-1'>
					<Search className='absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 pointer-events-none' />
					<Input
						type='text'
						placeholder='Search songs, artists...'
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyPress={handleKeyPress}
						disabled={isLoading}
						className='pl-12 pr-12 py-3 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-green-500 focus:ring-green-500/50 rounded-full text-base'
					/>
					{query && (
						<button
							onClick={handleClear}
							className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors'
						>
							<X className='size-4' />
						</button>
					)}
				</div>
				<Button
					onClick={handleSearch}
					disabled={!query.trim() || isLoading}
					className='bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 sm:shrink-0'
				>
					{isLoading ? "Searching..." : "Search"}
				</Button>
			</div>
		</div>
	);
};

export default SearchBar;
