import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Menu, Search } from "lucide-react";
import SignInOAuthButton from "./SignInOAuthButton";
import { Link } from "react-router-dom";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { Button } from "./ui/button";

const Topbar = () => {
	const toggleMobileSidebar = useLayoutStore((state) => state.toggleMobileSidebar);

	return (
		<div className='flex items-center justify-between gap-2 p-3 sm:p-4 sticky top-0 z-30 bg-zinc-900/75 backdrop-blur-md border-b border-zinc-800/50'>
			<div className='flex gap-2 items-center min-w-0'>
				<Button
					variant='ghost'
					size='icon'
					className='md:hidden shrink-0 text-white hover:bg-zinc-800'
					onClick={toggleMobileSidebar}
					aria-label='Open menu'
				>
					<Menu className='size-5' />
				</Button>
				<img src='/spotify.png' className='size-7 sm:size-8 shrink-0' alt='Spotify logo' />
				<span className='font-bold text-base sm:text-lg truncate'>Spotify</span>
			</div>
			<div className='flex items-center gap-2 sm:gap-4 shrink-0'>
				<Link
					to='/search'
					className={cn(buttonVariants({ variant: "outline" }), "gap-2 px-2 sm:px-4")}
				>
					<Search className='size-4' />
					<span className='hidden sm:inline'>Search</span>
				</Link>

				<Link to='/admin' className={cn(buttonVariants({ variant: "outline" }), "px-2 sm:px-4")}>
					<LayoutDashboardIcon className='size-4 sm:mr-2' />
					<span className='hidden lg:inline'>Admin Dashboard</span>
				</Link>

				<SignedIn>
					<SignedOut />
				</SignedIn>

				<SignedOut>
					<SignInOAuthButton />
				</SignedOut>

				<UserButton />
			</div>
		</div>
	);
};

export default Topbar;
