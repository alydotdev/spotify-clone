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

	return (
		<AudioProvider>
			<PlayerActivitySync />
			<div className='h-screen bg-black text-white flex flex-col overflow-hidden'>
				<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
					{!isMobile && (
						<>
							<ResizablePanel defaultSize={20} minSize={10} maxSize={30}>
								<LeftSidebar />
							</ResizablePanel>

							<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />
						</>
					)}

					<ResizablePanel defaultSize={isMobile ? 100 : 60}>
						<Outlet />
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

				{isMobile && (
					<>
						<div
							className={cn(
								"fixed inset-0 z-40 bg-black/60 transition-opacity duration-300",
								isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
							)}
							onClick={closeMobileSidebar}
							aria-hidden='true'
						/>
						<div
							className={cn(
								"fixed left-0 top-0 bottom-28 z-50 w-[min(85vw,320px)] p-2 transition-transform duration-300 ease-out",
								isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
							)}
						>
							<LeftSidebar showLabels />
						</div>
					</>
				)}

				<PlaybackControls />
			</div>
		</AudioProvider>
	);
};
export default MainLayout;
