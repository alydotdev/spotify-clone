import Topbar from "@/components/Topbar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageShellProps = {
	showBack?: boolean;
	className?: string;
	contentClassName?: string;
	children: ReactNode;
};

const PageShell = ({ showBack, className, contentClassName, children }: PageShellProps) => {
	return (
		<main
			className={cn(
				"h-full flex flex-col min-h-0 overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-800 md:rounded-md",
				className
			)}
		>
			<Topbar showBack={showBack} />
			<div className={cn("flex-1 min-h-0 overflow-hidden", contentClassName)}>{children}</div>
		</main>
	);
};

export default PageShell;
