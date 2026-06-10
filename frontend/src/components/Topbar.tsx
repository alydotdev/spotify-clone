import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { ChevronLeft, LayoutDashboardIcon, Menu, Search } from "lucide-react";
import SignInOAuthButton from "./SignInOAuthButton";
import { Link, useNavigate } from "react-router-dom";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { Button } from "./ui/button";

type TopbarProps = {
	showBack?: boolean;
};

const Topbar = ({ showBack = false }: TopbarProps) => {
	const navigate = useNavigate();
	const isAdmin = useAuthStore((state) => state.isAdmin);
	const toggleMobileSidebar = useLayoutStore((state) => state.toggleMobileSidebar);

	return (
		<div className='flex items-center justify-between gap-2 p-3 sm:p-4 sticky top-0 z-30 bg-zinc-900/75 backdrop-blur-md border-b border-zinc-800/50'>
			<div className='flex gap-1 sm:gap-2 items-center min-w-0'>
				<Button
					variant='ghost'
					size='icon'
					className='md:hidden shrink-0 text-white hover:bg-zinc-800'
					onClick={toggleMobileSidebar}
					aria-label='Open menu'
				>
					<Menu className='size-5' />
				</Button>
				{showBack && (
					<Button
						variant='ghost'
						size='icon'
						className='shrink-0 text-white hover:bg-zinc-800'
						onClick={() => navigate(-1)}
						aria-label='Go back'
					>
						<ChevronLeft className='size-5' />
					</Button>
				)}
				<Link to='/' className='flex gap-2 items-center min-w-0'>
					<img src='/spotify.png' className='size-7 sm:size-8 shrink-0' alt='Spotify logo' />
					<span className='font-bold text-base sm:text-lg truncate'>Spotify</span>
				</Link>
			</div>
			<div className='flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3 shrink-0'>
				<Link
					to='/search'
					className={cn(
						buttonVariants({ variant: "outline", size: "sm" }),
						"gap-2 px-2 sm:px-3 border-zinc-700 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white"
					)}
				>
					<Search className='size-4 shrink-0' />
					<span className='hidden sm:inline'>Search</span>
				</Link>

				{isAdmin && (
					<Link
						to='/admin'
						className={cn(
							buttonVariants({ variant: "outline", size: "sm" }),
							"gap-2 px-2 sm:px-3 border-zinc-700 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white"
						)}
					>
						<LayoutDashboardIcon className='size-4 shrink-0' />
						<span className='hidden lg:inline'>Admin Dashboard</span>
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButton />
				</SignedOut>

				<SignedIn>
					<UserButton
						appearance={{
							elements: {
								avatarBox: "size-8 sm:size-9",
							},
						}}
					/>
				</SignedIn>
			</div>
		</div>
	);
};

export default Topbar;
