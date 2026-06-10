import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import { Album, Loader2, Music, ShieldX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
	const { isSignedIn } = useAuth();
	const { isAdmin, isLoading, checkAdminStatus } = useAuthStore();

	const fetchAlbums = useMusicStore((state) => state.fetchAlbums);
	const fetchSongs = useMusicStore((state) => state.fetchSongs);
	const fetchStats = useMusicStore((state) => state.fetchStats);

	useEffect(() => {
		if (isSignedIn) checkAdminStatus();
	}, [isSignedIn, checkAdminStatus]);

	useEffect(() => {
		if (!isAdmin) return;

		fetchAlbums();
		fetchSongs();
		fetchStats();
	}, [isAdmin, fetchAlbums, fetchSongs, fetchStats]);

	if (!isSignedIn) {
		return (
			<div className='min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center justify-center gap-4 p-8'>
				<ShieldX className='size-12 text-zinc-500' />
				<h1 className='text-xl font-semibold'>Sign in required</h1>
				<p className='text-zinc-400 text-sm text-center max-w-sm'>
					You need to be signed in to access the admin dashboard.
				</p>
				<div className='flex gap-3'>
					<SignInButton mode='modal'>
						<Button>Sign in</Button>
					</SignInButton>
					<Button variant='outline' asChild>
						<Link to='/'>Go home</Link>
					</Button>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-zinc-900 flex items-center justify-center'>
				<Loader2 className='size-8 text-green-500 animate-spin' />
			</div>
		);
	}

	if (!isAdmin) {
		return (
			<div className='min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center justify-center gap-4 p-8'>
				<ShieldX className='size-12 text-red-500' />
				<h1 className='text-xl font-semibold'>Unauthorized</h1>
				<p className='text-zinc-400 text-sm text-center max-w-sm'>
					Your account does not have admin permissions.
				</p>
				<Button variant='outline' asChild>
					<Link to='/'>Go home</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100 p-4 sm:p-6 md:p-8'>
			<Header />

			<DashboardStats />

			<Tabs defaultValue='songs' className='space-y-4 sm:space-y-6'>
				<TabsList className='p-1 bg-zinc-800/50 w-full sm:w-auto'>
					<TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none'>
						<Music className='mr-2 size-4' />
						Songs
					</TabsTrigger>
					<TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none'>
						<Album className='mr-2 size-4' />
						Albums
					</TabsTrigger>
				</TabsList>

				<TabsContent value='songs'>
					<SongsTabContent />
				</TabsContent>
				<TabsContent value='albums'>
					<AlbumsTabContent />
				</TabsContent>
			</Tabs>
		</div>
	);
};
export default AdminPage;
