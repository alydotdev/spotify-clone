import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSideBar";
import FriendsActivity from "./components/FriendsActivity";
import { AudioProvider } from "./AudioProvider";
import PlayerActivitySync from "./components/PlayerActivitySync";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const isMobileSidebarOpen = useLayoutStore((state) => state.isMobileSidebarOpen);
	const closeMobileSidebar = useLayoutStore((state) => state.closeMobileSidebar);

	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			if (!mobile) {
				closeMobileSidebar();
			}
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, [closeMobileSidebar]);

	useEffect(() => {
		if (!isMobile) return;

		document.body.style.overflow = isMobileSidebarOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobile, isMobileSidebarOpen]);

	return (
		<AudioProvider>
			<PlayerActivitySync />
			<div className='h-[100dvh] bg-black text-white flex flex-col overflow-hidden'>
				<div className='flex-1 min-h-0 overflow-hidden max-md:pb-[calc(var(--player-height)+env(safe-area-inset-bottom,0px))] md:p-2'>
					<ResizablePanelGroup
						direction='horizontal'
						className='flex h-full min-h-0 overflow-hidden md:rounded-lg'
					>
						{!isMobile && (
							<>
								<ResizablePanel defaultSize={20} minSize={10} maxSize={30}>
									<LeftSidebar />
								</ResizablePanel>

								<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />
							</>
						)}

						<ResizablePanel defaultSize={isMobile ? 100 : 60} className='min-h-0'>
							<div className='h-full min-h-0 overflow-hidden'>
								<Outlet />
							</div>
						</ResizablePanel>

						{!isMobile && (
							<>
								<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

								<ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
									<FriendsActivity />
								</ResizablePanel>
							</>
						)}
					</ResizablePanelGroup>
				</div>

				{isMobile && (
					<>
						<div
							className={cn(
								"fixed inset-0 z-40 bg-black/70 transition-opacity duration-300",
								isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
							)}
							onClick={closeMobileSidebar}
							aria-hidden='true'
						/>
						<div
							className={cn(
								"fixed left-0 top-0 z-50 w-[min(88vw,320px)] bg-black transition-transform duration-300 ease-out",
								"bottom-[var(--player-height)] pb-[env(safe-area-inset-bottom)]",
								isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
							)}
						>
							<div className='h-full p-2'>
								<LeftSidebar showLabels />
							</div>
						</div>
					</>
				)}

				<PlaybackControls />
			</div>
		</AudioProvider>
	);
};
export default MainLayout;
