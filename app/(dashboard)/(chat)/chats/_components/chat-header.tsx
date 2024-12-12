"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWindowSize } from "usehooks-ts";

import { ModelSelector } from "@/components/model-selector";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { BetterTooltip } from "@/components/ui/tooltip";
import { PlusIcon, VercelIcon } from "@/components/icons";
import { useSidebar } from "@/components/ui/sidebar";
import { useSidebarStore } from "@/features/main/hooks";
import { useEffect } from "react";

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
	const router = useRouter();

	const { width: windowWidth } = useWindowSize();
	const { setOpenMobile, open, toggleSidebar } = useSidebar();
	const { chat_sidebar_state } = useSidebarStore();

	console.log(open, "OPEN");

	return (
		<header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
			<SidebarToggle align="start" />
			{(!open || windowWidth < 768) && (
				<BetterTooltip content="New Chat">
					<Button
						// variant="outline"
						className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
						onClick={() => {
							router.push("/");
							router.refresh();
						}}
					>
						<PlusIcon />
						<span className="md:sr-only">New Chat</span>
					</Button>
				</BetterTooltip>
			)}
			{/* <ModelSelector
        selectedModelId={selectedModelId}
        className="order-1 md:order-2"
      /> */}
		</header>
	);
}
