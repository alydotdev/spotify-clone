import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { useMusicStore } from "../../stores/useMusicStore";
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";

type LeftSidebarProps = {
	showLabels?: boolean;
};

const LeftSidebar = ({ showLabels = false }: LeftSidebarProps) => {
	const { albums, fetchAlbums, isAlbumsLoading } = useMusicStore();
	const closeMobileSidebar = useLayoutStore((state) => state.closeMobileSidebar);

	useEffect(() => {
		if (albums.length === 0) {
			fetchAlbums();
		}
	}, [albums.length, fetchAlbums]);

	const handleNavigate = () => {
		closeMobileSidebar();
	};

	const navLinkClass = ({ isActive }: { isActive: boolean }) =>
		cn(
			buttonVariants({
				variant: "ghost",
				className: cn(
					"w-full justify-start text-white hover:bg-zinc-800",
					isActive && "bg-zinc-800"
				),
			})
		);

	const showText = showLabels;

	return (
		<div className='h-full flex flex-col gap-2'>
			<div className='rounded-lg bg-zinc-900 p-4'>
				<div className='space-y-2'>
					<NavLink to='/' className={navLinkClass} onClick={handleNavigate}>
						<HomeIcon className='mr-2 size-5 shrink-0' />
						<span className={cn(!showText && "hidden md:inline")}>Home</span>
					</NavLink>

					<SignedIn>
						<NavLink to='/chat' className={navLinkClass} onClick={handleNavigate}>
							<MessageCircle className='mr-2 size-5 shrink-0' />
							<span className={cn(!showText && "hidden md:inline")}>Messages</span>
						</NavLink>
					</SignedIn>
				</div>
			</div>

			<div className='flex-1 rounded-lg bg-zinc-900 p-4 min-h-0'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center text-white px-2'>
						<Library className='size-5 mr-2 shrink-0' />
						<span className={cn(!showText && "hidden md:inline")}>Playlists</span>
					</div>
				</div>

				<ScrollArea className='h-[calc(100vh-300px)] md:h-[calc(100vh-300px)]'>
					<div className='space-y-2'>
						{isAlbumsLoading && albums.length === 0 ? (
							<PlaylistSkeleton />
						) : (
							albums.map((album) => (
								<NavLink
									to={`/albums/${album._id}`}
									key={album._id}
									onClick={handleNavigate}
									className={({ isActive }) =>
										cn(
											"p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer",
											isActive && "bg-zinc-800"
										)
									}
								>
									<img
										src={album.imageUrl}
										alt='Playlist img'
										className='size-12 rounded-md flex-shrink-0 object-cover'
									/>

									<div className={cn("flex-1 min-w-0", !showText && "hidden md:block")}>
										<p className='font-medium truncate'>{album.title}</p>
										<p className='text-sm text-zinc-400 truncate'>Album • {album.artist}</p>
									</div>
								</NavLink>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
export default LeftSidebar;
