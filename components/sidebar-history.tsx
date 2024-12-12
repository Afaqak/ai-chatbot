"use client";

import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { MoreHorizontalIcon, TrashIcon } from "@/components/icons";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	sidebarMenuButtonVariants,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import type { Chat } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";
import {
	ChevronDown,
	Copy,
	MessageSquare,
	MoreHorizontal,
	Trash,
} from "lucide-react";

import { createClient } from "@supabase/supabase-js";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./ui/collapsible";

type GroupedChats = {
	today: any[];
	yesterday: any[];
	lastWeek: any[];
	lastMonth: any[];
	older: any[];
};

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const ChatItem = ({
	chat,
	isActive,
	onDelete,
	setOpenMobile,
}: {
	chat: any;
	isActive: boolean;
	onDelete: (chatId: string) => void;
	setOpenMobile: (open: boolean) => void;
}) => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	return (
		<SidebarMenuItem as={"div"}>
			<Collapsible
				open={isOpen}
				// onOpenChange={setIsOpen}
				className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
				// defaultOpen={name === "components" || name === "ui"}
			>
				<CollapsibleTrigger asChild>
					<div
						className={sidebarMenuButtonVariants({
							className: "cursor-pointer",
						})}
						onClick={() => router.push(`/chats/${chat.id}`)}
					>
						<span className="line-clamp-1">{chat.title}</span>
						{chat?.subConversations && chat?.subConversations.length > 0 && (
							<ChevronDown
								onClick={(e) => {
									e.stopPropagation();
									setIsOpen(!isOpen);
								}}
								className={`ml-auto size-4 transition-transform ${
									isOpen ? "rotate-180" : ""
								}`}
							/>
						)}
						<DropdownMenu modal={true}>
							<DropdownMenuTrigger asChild>
								<SidebarMenuAction
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
									showOnHover={!isActive}
								>
									<MoreHorizontal className="size-4" />
									<span className="sr-only">More</span>
								</SidebarMenuAction>
							</DropdownMenuTrigger>
							<DropdownMenuContent side="bottom" align="end">
								<DropdownMenuItem
									className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
									onSelect={() => onDelete(chat.id)}
								>
									<Trash className="mr-2 size-4" />
									<span>Delete</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer"
									onSelect={() => router.push(`/chats?parent_id=${chat.id}`)}
								>
									<Copy className="mr-2 size-4" />
									<span>Add Subchat</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CollapsibleTrigger>
				{chat?.subConversations && chat?.subConversations.length > 0 && (
					<CollapsibleContent>
						<div className="ml-2 mt-1 space-y-1">
							{chat?.subConversations?.map((subchat: any) => (
								<ChatItem
									isActive={isActive}
									key={subchat.id}
									chat={subchat}
									onDelete={onDelete}
									setOpenMobile={setOpenMobile}
								/>
							))}
						</div>
					</CollapsibleContent>
				)}
			</Collapsible>
		</SidebarMenuItem>
	);
};

export function SidebarHistory({ user }: { user: User | undefined }) {
	const { setOpenMobile } = useSidebar();
	const { id } = useParams();
	const pathname = usePathname();
	const {
		data: history = [],
		isLoading,
		mutate,
	} = useSWR<Array<any>>("/api/conversation", fetcher, {
		fallback: { conversations: [] },
	});

	// useEffect(() => {
	//   mutate();
	// }, [pathname, mutate]);

	useEffect(() => {
		if (!id) return;

		const messagesChannel = supabase
			.channel(`conversation:${id}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "conversations",
					filter: `conversation_id=eq.${id}`,
				},
				async (payload) => {
					console.log("Change detected:", payload);
					mutate();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(messagesChannel);
		};
	}, [id, mutate]);

	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
			method: "DELETE",
		});

		toast.promise(deletePromise, {
			loading: "Deleting chat...",
			success: () => {
				mutate((history) => {
					if (history) {
						return history.filter((h) => h.id !== id);
					}
				});
				return "Chat deleted successfully";
			},
			error: "Failed to delete chat",
		});

		setShowDeleteDialog(false);

		if (deleteId === id) {
			router.push("/");
		}
	};

	if (isLoading) {
		return (
			<SidebarGroup>
				<div className="px-2 py-1 text-xs text-sidebar-foreground/50">
					Today
				</div>
				<SidebarGroupContent>
					<div className="flex flex-col">
						{[44, 32, 28, 64, 52].map((item) => (
							<div
								key={item}
								className="rounded-md h-8 flex gap-2 px-2 items-center"
							>
								<div
									className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
									style={
										{
											"--skeleton-width": `${item}%`,
										} as React.CSSProperties
									}
								/>
							</div>
						))}
					</div>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	}

	if (history?.length === 0) {
		return (
			<SidebarGroup>
				<SidebarGroupContent>
					<div className="text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
						<div>
							Your conversations will appear here once you start chatting!
						</div>
					</div>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	}

	const groupChatsByDate = (chats: Chat[]): GroupedChats => {
		const now = new Date();
		const oneWeekAgo = subWeeks(now, 1);
		const oneMonthAgo = subMonths(now, 1);

		return chats.reduce(
			(groups, chat) => {
				const chatDate = new Date(chat.createdAt);

				if (isToday(chatDate)) {
					groups.today.push(chat);
				} else if (isYesterday(chatDate)) {
					groups.yesterday.push(chat);
				} else if (chatDate > oneWeekAgo) {
					groups.lastWeek.push(chat);
				} else if (chatDate > oneMonthAgo) {
					groups.lastMonth.push(chat);
				} else {
					groups.older.push(chat);
				}

				return groups;
			},
			{
				today: [],
				yesterday: [],
				lastWeek: [],
				lastMonth: [],
				older: [],
			} as GroupedChats,
		);
	};

	return (
		<>
			<SidebarGroup>
				<SidebarGroupContent>
					<SidebarMenu>
						{history &&
							(() => {
								const groupedChats = groupChatsByDate(history);

								return (
									<>
										{groupedChats.today.length > 0 && (
											<>
												<div className="px-2 py-1 text-xs text-sidebar-foreground/50">
													Today
												</div>
												{groupedChats.today.map((chat) => (
													<ChatItem
														key={chat.id}
														chat={chat}
														isActive={chat.id === id}
														onDelete={(chatId) => {
															setDeleteId(chatId);
															setShowDeleteDialog(true);
														}}
														setOpenMobile={setOpenMobile}
													/>
												))}
											</>
										)}

										{groupedChats.yesterday.length > 0 && (
											<>
												<div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
													Yesterday
												</div>
												{groupedChats.yesterday.map((chat) => (
													<ChatItem
														key={chat.id}
														chat={chat}
														isActive={chat.id === id}
														onDelete={(chatId) => {
															setDeleteId(chatId);
															setShowDeleteDialog(true);
														}}
														setOpenMobile={setOpenMobile}
													/>
												))}
											</>
										)}

										{groupedChats.lastWeek.length > 0 && (
											<>
												<div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
													Last 7 days
												</div>
												{groupedChats.lastWeek.map((chat) => (
													<ChatItem
														key={chat.id}
														chat={chat}
														isActive={chat.id === id}
														onDelete={(chatId) => {
															setDeleteId(chatId);
															setShowDeleteDialog(true);
														}}
														setOpenMobile={setOpenMobile}
													/>
												))}
											</>
										)}

										{groupedChats.lastMonth.length > 0 && (
											<>
												<div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
													Last 30 days
												</div>
												{groupedChats.lastMonth.map((chat) => (
													<ChatItem
														key={chat.id}
														chat={chat}
														isActive={chat.id === id}
														onDelete={(chatId) => {
															setDeleteId(chatId);
															setShowDeleteDialog(true);
														}}
														setOpenMobile={setOpenMobile}
													/>
												))}
											</>
										)}

										{groupedChats.older.length > 0 && (
											<>
												<div className="text-xs text-sidebar-foreground/50 ">
													Older
												</div>
												{groupedChats.older.map((chat) => (
													<ChatItem
														key={chat.id}
														chat={chat}
														isActive={chat.id === id}
														onDelete={(chatId) => {
															setDeleteId(chatId);
															setShowDeleteDialog(true);
														}}
														setOpenMobile={setOpenMobile}
													/>
												))}
											</>
										)}
									</>
								);
							})()}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your
							chat and remove it from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
