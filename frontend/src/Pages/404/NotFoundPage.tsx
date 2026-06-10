import PageShell from "@/components/PageShell";
import { Home, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<PageShell>
			<div className='h-full flex items-center justify-center overflow-y-auto mobile-scroll'>
				<div className='text-center space-y-8 px-4 py-8'>
					<div className='flex justify-center animate-bounce'>
						<Music2 className='h-20 w-20 sm:h-24 sm:w-24 text-emerald-500' />
					</div>

					<div className='space-y-4'>
						<h1 className='text-5xl sm:text-7xl font-bold text-white'>404</h1>
						<h2 className='text-xl sm:text-2xl font-semibold text-white'>Page not found</h2>
						<p className='text-neutral-400 max-w-md mx-auto text-sm sm:text-base'>
							Looks like this track got lost in the shuffle. Let&apos;s get you back to the music.
						</p>
					</div>

					<div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center'>
						<Button
							onClick={() => navigate(-1)}
							variant='outline'
							className='bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700 w-full sm:w-auto'
						>
							Go Back
						</Button>
						<Button
							onClick={() => navigate("/")}
							className='bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto'
						>
							<Home className='mr-2 h-4 w-4' />
							Back to Home
						</Button>
					</div>
				</div>
			</div>
		</PageShell>
	);
}
