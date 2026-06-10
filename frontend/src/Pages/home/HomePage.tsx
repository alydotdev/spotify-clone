import PageShell from "@/components/PageShell";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect } from "react";
import FeaturedSection from "./components/FeaturedSection";
import SectionGrid from "./components/SectionGrid";

const Home = () => {
	const {
		fetchHomeData,
		isHomeLoading,
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
	} = useMusicStore();
	const { initializeQueue } = usePlayerStore();

	useEffect(() => {
		fetchHomeData();
	}, [fetchHomeData]);

	useEffect(() => {
		if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0) {
			const allSongs = [...madeForYouSongs, ...featuredSongs, ...trendingSongs];
			initializeQueue(allSongs);
		}
	}, [initializeQueue, madeForYouSongs, featuredSongs, trendingSongs]);

	return (
		<PageShell>
			<ScrollArea className='h-full'>
				<div className='p-4 sm:p-6 pb-6'>
					<h1 className='text-2xl font-bold mb-6 sm:text-3xl'>Good Afternoon</h1>
					<FeaturedSection />

					<div className='space-y-8'>
						<SectionGrid title='Made For You' songs={madeForYouSongs} isLoading={isHomeLoading} />
						<SectionGrid title='Trending' songs={trendingSongs} isLoading={isHomeLoading} />
					</div>
				</div>
			</ScrollArea>
		</PageShell>
	);
};

export default Home;
