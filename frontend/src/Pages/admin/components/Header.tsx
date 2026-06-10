
import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
	return (
		<div className='flex items-center justify-between gap-4 mb-6 sm:mb-8'>
			<div className='flex items-center gap-3 min-w-0'>
				<Link to='/' className='rounded-lg shrink-0'>
					<img src='/spotify.png' className='size-8 sm:size-10' alt='Spotify' />
				</Link>
				<div className='min-w-0'>
					<h1 className='text-xl sm:text-3xl font-bold truncate'>Music Manager</h1>
					<p className='text-zinc-400 mt-1 text-sm sm:text-base'>Manage your music catalog</p>
				</div>
			</div>
			<UserButton />
		</div>
	);
};
export default Header;
