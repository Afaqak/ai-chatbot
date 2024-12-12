// "use client";

// import type { User } from "next-auth";
// import { useRouter } from "next/navigation";

// import { PlusIcon } from "@/components/icons";
// import { SidebarHistory } from "@/components/sidebar-history";
// import { SidebarUserNav } from "@/components/sidebar-user-nav";
// import { Button } from "@/components/ui/button";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarHeader,
//   SidebarMenu,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import { BetterTooltip } from "@/components/ui/tooltip";
// import Link from "next/link";
// import { Bot } from "lucide-react";
// import { useSidebarStore } from "@/features/main/hooks";
// import { useEffect } from "react";

// export function ChatSidebar({ user }: { user: User | undefined }) {
//   const router = useRouter();
//   const { setOpenMobile ,open} = useSidebar();

//   return (
//     <Sidebar className="group-data-[side=left]:border-r-0">
//       <SidebarHeader>
//         <SidebarMenu>
//           <div className="flex flex-row justify-between items-center">
//             <Link
//               href="/"
//               onClick={() => {
//                 setOpenMobile(false);
//               }}
//               className="flex flex-row gap-3 items-center"
//             >
//               <span className="text-lg font-semibold flex gap-2  px-2 hover:bg-muted rounded-md cursor-pointer">
//                 <Bot /> Chat
//               </span>
//             </Link>
//             <BetterTooltip content="New Chat" align="end">
//               <Button
//                 variant="ghost"
//                 type="button"
//                 className="p-2 h-fit"
//                 onClick={() => {
//                   setOpenMobile(false);
//                   router.push("/chat");
//                   router.refresh();
//                 }}
//               >
//                 <PlusIcon />
//               </Button>
//             </BetterTooltip>
//           </div>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent>
//         <SidebarGroup className="-mx-2">
//           <SidebarHistory user={user} />
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// }

"use client";

import { useState } from "react";
import type { User } from "next-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BetterTooltip } from "@/components/ui/tooltip";
import { SidebarHistory } from "@/components/sidebar-history";
import { useSidebar } from "@/components/ui/sidebar";

export function ChatSidebar({ user }: { user: User | undefined }) {
	const router = useRouter();
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	return (
		<div
			className={`bg-background border-r border-border flex flex-col h-screen ${isMobileOpen ? "fixed inset-y-0 left-0 z-50 w-64" : "hidden md:flex md:w-64"}`}
		>
			<div className="p-4 border-b border-border">
				<div className="flex justify-between items-center">
					<Link
						href="/"
						onClick={() => setIsMobileOpen(false)}
						className="flex items-center gap-2"
					>
						<Bot className="size-5" />
						<span className="text-lg font-semibold">Chat</span>
					</Link>
					<BetterTooltip content="New Chat" align="end">
						<Button
							variant="ghost"
							onClick={() => {
								setIsMobileOpen(false);
								router.push("/chat");
								router.refresh();
							}}
						>
							<Plus className="size-5" />
						</Button>
					</BetterTooltip>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto p-4">
				<SidebarHistory user={user} />
			</div>
			<div className="p-4 border-t border-border"></div>
		</div>
	);
}
