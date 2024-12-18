import cx from "classnames";
import { formatDistance } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import {
	useCopyToClipboard,
	useDebounceCallback,
	useWindowSize,
} from "usehooks-ts";

import type { Document, Suggestion, Vote } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";

import { DiffView } from "./diffview";
import { DocumentSkeleton } from "./document-skeleton";
import { CopyIcon, CrossIcon, DeltaIcon, RedoIcon, UndoIcon } from "./icons";
import { PreviewMessage } from "./message";
import { MultimodalInput } from "./multimodal-input";
import { Toolbar } from "./toolbar";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { VersionFooter } from "./version-footer";
import { Editor } from "@/features/editor/block-editor";
export interface UIBlock {
	title: string;
	documentId: string;
	content: string;
	isVisible: boolean;
	status: "streaming" | "idle";
	boundingBox: {
		top: number;
		left: number;
		width: number;
		height: number;
	};
}

export function Block({
	chatId,
	input,
	setInput,
	handleSubmit,
	isLoading,
	stop,
	attachments,
	setAttachments,
	append,
	block,
	setBlock,
	messages,
	setMessages,
	votes,
}: {
	chatId: string;
	input: string;
	setInput: (input: string) => void;
	isLoading: boolean;
	stop: () => void;
	attachments: Array<any>;
	setAttachments: Dispatch<SetStateAction<Array<any>>>;
	block: UIBlock;
	setBlock: any;
	messages: Array<any>;
	setMessages: Dispatch<SetStateAction<Array<any>>>;
	votes: Array<Vote> | undefined;
	append: any;
	handleSubmit: any;
}) {
	const [messagesContainerRef, messagesEndRef] =
		useScrollToBottom<HTMLDivElement>();

	const {
		data: documents,
		isLoading: isDocumentsFetching,
		mutate: mutateDocuments,
	} = useSWR<Array<any>>(
		`/api/document?id=${block.documentId}&conversationId=${chatId}`,
		fetcher,
	);

	const { data: suggestions } = useSWR<Array<any>>(
		documents && block && block.status !== "streaming"
			? `/api/suggestions?documentId=${block.documentId}`
			: null,
		fetcher,
		{
			dedupingInterval: 5000,
		},
	);

	const [mode, setMode] = useState<"edit" | "diff">("edit");
	const [document, setDocument] = useState<any | null>(null);
	const [isLatest, setIsLatest] = useState(true);
	const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);
	const { mutate } = useSWRConfig();
	const [isContentDirty, setIsContentDirty] = useState(false);
	const [isToolbarVisible, setIsToolbarVisible] = useState(false);

	const { width: windowWidth, height: windowHeight } = useWindowSize();
	const isMobile = windowWidth ? windowWidth < 768 : false;

	const [_, copyToClipboard] = useCopyToClipboard();
	const canSaveRef = useRef(true);

	console.log(documents, "DOCS");

	useEffect(() => {
		if (documents) {
			const isCurrentLatest = currentVersionIndex === documents.length - 1;
			setIsLatest(isCurrentLatest);

			canSaveRef.current = isCurrentLatest;

			if (documents.length > 0) {
				const mostRecentDocument = documents.at(-1);

				if (mostRecentDocument) {
					setDocument(mostRecentDocument);
					setCurrentVersionIndex(documents.length - 1);

					setBlock((currentBlock: any) => ({
						...currentBlock,
						content: mostRecentDocument.content ?? "",
					}));
				}
			}
		}
	}, [documents, setBlock]);

	const handleContentChange = useCallback(
		async (updatedContent: string) => {
			// Add more logging to diagnose the issue
			console.log("Block:", block);
			console.log("Current Documents:", documents);
			console.log("Can Save Ref:", canSaveRef.current);

			// Early return checks
			if (!block) {
				console.error("No block available");
				return;
			}
			if (!canSaveRef.current) {
				console.error("Cannot save - not latest version");
				return;
			}

			await mutate<Array<Document>>(
				`/api/document?id=${block.documentId}&conversationId=${chatId}`,
				async (currentDocuments) => {
					// More detailed logging
					console.log("Current Documents in Mutate:", currentDocuments);

					if (!currentDocuments) {
						console.error("No current documents found");
						return undefined;
					}

					// Robust document retrieval
					const currentDocument = currentDocuments[currentDocuments.length - 1];

					if (!currentDocument) {
						console.error("No current document found in the array");
						return currentDocuments;
					}

					// Check if content actually changed
					if (currentDocument.content !== updatedContent) {
						try {
							setIsContentDirty(true);

							const response = await fetch(`/api/document`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									title: block.title,
									documentId: block.documentId,
									conversationId: chatId,
									content: updatedContent,
								}),
							});

							// Optional: Add error handling for the fetch
							if (!response.ok) {
								console.error("Failed to save document", await response.text());
								throw new Error("Document save failed");
							}

							const newDocument = {
								...currentDocument,
								content: updatedContent,
								created_at: new Date(),
							};

							return [...currentDocuments, newDocument];
						} catch (error) {
							console.error("Error in handleContentChange:", error);
							return currentDocuments;
						} finally {
							setIsContentDirty(false);
						}
					}

					return currentDocuments;
				},
				{ revalidate: false },
			);
		},
		[block, mutate, chatId], // Added chatId to dependency array
	);
	const debouncedHandleContentChange = useDebounceCallback(
		handleContentChange,
		2000,
	);

	const saveContent = useCallback(
		(updatedContent: string, debounce: boolean) => {
			if (!canSaveRef.current || !document) return;

			if (updatedContent !== document.content) {
				if (debounce) {
					debouncedHandleContentChange(updatedContent);
				} else {
					handleContentChange(updatedContent);
				}
			}
		},
		[document, handleContentChange, debouncedHandleContentChange],
	);

	const handleVersionChange = (type: "next" | "prev" | "toggle" | "latest") => {
		if (!documents) return;

		if (type === "latest") {
			setCurrentVersionIndex(documents.length - 1);
			setMode("edit");
			canSaveRef.current = true;
		}

		if (type === "toggle") {
			setMode((mode) => (mode === "edit" ? "diff" : "edit"));
		}

		if (type === "prev") {
			if (currentVersionIndex > 0) {
				setCurrentVersionIndex((prev) => prev - 1);
				canSaveRef.current = false;
			}
		} else if (type === "next") {
			if (currentVersionIndex < documents.length - 1) {
				setCurrentVersionIndex((prev) => prev + 1);
				canSaveRef.current = false;
			}
		}

		setIsContentDirty(false);
	};
	function getDocumentContentById(index: number) {
		if (!documents) return "";
		if (!documents[index]) return "";
		return documents[index].content ?? "";
	}
	useEffect(() => {
		if (documents) {
			const latestVersion = documents.length - 1;
			setIsLatest(currentVersionIndex === latestVersion);
			canSaveRef.current = currentVersionIndex === latestVersion;
		}
	}, [documents, currentVersionIndex]);

	return (
		<motion.div
			className="flex flex-row h-dvh w-dvw z fixed top-0 left-0 z-[9999999] bg-muted"
			initial={{ opacity: 1 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0, transition: { delay: 0.4 } }}
		>
			{!isMobile && (
				<motion.div
					className="relative w-[400px] bg-muted dark:bg-background h-dvh shrink-0"
					initial={{ opacity: 0, x: 10, scale: 1 }}
					animate={{
						opacity: 1,
						x: 0,
						scale: 1,
						transition: {
							delay: 0.2,
							type: "spring",
							stiffness: 200,
							damping: 30,
						},
					}}
					exit={{
						opacity: 0,
						x: 0,
						scale: 0.95,
						transition: { delay: 0 },
					}}
				>
					<AnimatePresence>
						{!isLatest && (
							<motion.div
								className="left-0 absolute h-dvh w-[400px] top-0 bg-zinc-900/50 z-50"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							/>
						)}
					</AnimatePresence>

					<div className="flex flex-col h-full justify-between items-center gap-4">
						<div
							ref={messagesContainerRef}
							className="flex flex-col gap-4 h-full items-center overflow-y-scroll px-4 pt-20"
						>
							{messages.map((message, index) => (
								<PreviewMessage
									chatId={chatId}
									key={message.id}
									message={message}
									block={block}
									setBlock={setBlock}
									isLoading={isLoading && index === messages.length - 1}
									vote={
										votes
											? votes.find((vote) => vote.messageId === message.id)
											: undefined
									}
								/>
							))}

							<div
								ref={messagesEndRef}
								className="shrink-0 min-w-[24px] min-h-[24px]"
							/>
						</div>

						<form className="flex flex-row gap-2 relative items-end w-full px-4 pb-4">
							<MultimodalInput
								chatId={chatId}
								input={input}
								setInput={setInput}
								handleSubmit={handleSubmit}
								isLoading={isLoading}
								stop={stop}
								attachments={attachments}
								setAttachments={setAttachments}
								messages={messages}
								append={append}
								className="bg-background dark:bg-muted"
								setMessages={setMessages}
							/>
						</form>
					</div>
				</motion.div>
			)}

			<motion.div
				className="fixed dark:bg-muted bg-background h-dvh flex flex-col shadow-xl overflow-y-scroll"
				initial={
					isMobile
						? {
								opacity: 0,
								x: 0,
								y: 0,
								width: windowWidth,
								height: windowHeight,
							}
						: {
								opacity: 0,
								x: block.boundingBox.left,
								y: block.boundingBox.top,
								height: block.boundingBox.height,
								width: block.boundingBox.width,
							}
				}
				animate={
					isMobile
						? {
								opacity: 1,
								x: 0,
								y: 0,
								width: windowWidth,
								height: "100dvh",

								transition: {
									delay: 0,
									type: "spring",
									stiffness: 200,
									damping: 30,
								},
							}
						: {
								opacity: 1,
								x: 400,
								y: 0,
								height: windowHeight,
								width: windowWidth ? windowWidth - 400 : "calc(100dvw-400px)",

								transition: {
									delay: 0,
									type: "spring",
									stiffness: 200,
									damping: 30,
								},
							}
				}
				exit={{
					opacity: 0,
					scale: 0.5,
					transition: {
						delay: 0.1,
						type: "spring",
						stiffness: 600,
						damping: 30,
					},
				}}
			>
				<div className="p-2 flex flex-row justify-between items-start">
					<div className="flex flex-row gap-4 items-start">
						<Button
							variant="outline"
							className="h-fit p-2 dark:hover:bg-zinc-700"
							onClick={() => {
								setBlock((currentBlock: any) => ({
									...currentBlock,
									isVisible: false,
								}));
							}}
						>
							<CrossIcon size={18} />
						</Button>

						<div className="flex flex-col">
							<div className="font-medium">
								{document?.title ?? block.title}
							</div>

							{isContentDirty ? (
								<div className="text-sm text-muted-foreground">
									Saving changes...
								</div>
							) : document ? (
								<div className="text-sm text-muted-foreground">
									{`Updated ${formatDistance(
										new Date(document?.created_at),
										new Date(),
										{
											addSuffix: true,
										},
									)}`}
								</div>
							) : (
								<div className="w-32 h-3 mt-2 bg-muted-foreground/20 rounded-md animate-pulse" />
							)}
						</div>
					</div>

					<div className="flex flex-row gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									className="p-2 h-fit dark:hover:bg-zinc-700"
									onClick={() => {
										copyToClipboard(block.content);
										toast.success("Copied to clipboard!");
									}}
									disabled={block.status === "streaming"}
								>
									<CopyIcon size={18} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Copy to clipboard</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									className="p-2 h-fit dark:hover:bg-zinc-700 !pointer-events-auto"
									onClick={() => {
										handleVersionChange("prev");
									}}
									disabled={
										currentVersionIndex === 0 || block.status === "streaming"
									}
								>
									<UndoIcon size={18} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>View Previous version</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									className="p-2 h-fit dark:hover:bg-zinc-700 !pointer-events-auto"
									onClick={() => {
										handleVersionChange("next");
									}}
									disabled={isLatest || block.status === "streaming"}
								>
									<RedoIcon size={18} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>View Next version</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									className={cx(
										"p-2 h-fit !pointer-events-auto dark:hover:bg-zinc-700",
										{
											"bg-muted": mode === "diff",
										},
									)}
									onClick={() => {
										handleVersionChange("toggle");
									}}
									disabled={
										block.status === "streaming" || currentVersionIndex === 0
									}
								>
									<DeltaIcon size={18} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>View changes</TooltipContent>
						</Tooltip>
					</div>
				</div>

				<div className="prose dark:prose-invert dark:bg-muted bg-background h-full overflow-y-scroll px-4 py-8 md:p-20 !max-w-full pb-40 items-center">
					<div className="">
						{isDocumentsFetching && !block.content ? (
							<DocumentSkeleton />
						) : mode === "edit" ? (
							<Editor
								mode={"conversation"}
								content={
									isLatest
										? block.content
										: getDocumentContentById(currentVersionIndex)
								}
								isCurrentVersion={isLatest}
								currentVersionIndex={currentVersionIndex}
								status={block.status}
								saveContent={saveContent}
								suggestions={isLatest ? (suggestions ?? []) : []}
							/>
						) : (
							<DiffView
								oldContent={getDocumentContentById(currentVersionIndex - 1)}
								newContent={getDocumentContentById(currentVersionIndex)}
							/>
						)}

						{suggestions ? (
							<div className="md:hidden h-dvh w-12 shrink-0" />
						) : null}

						<AnimatePresence>
							{isLatest && (
								<Toolbar
									documentId={document?.id}
									isToolbarVisible={isToolbarVisible}
									setIsToolbarVisible={setIsToolbarVisible}
									append={append}
									isLoading={isLoading}
									stop={stop}
									setMessages={setMessages}
								/>
							)}
						</AnimatePresence>
					</div>
				</div>

				<AnimatePresence>
					{!isLatest && (
						<VersionFooter
							block={block}
							currentVersionIndex={currentVersionIndex}
							documents={documents}
							handleVersionChange={handleVersionChange}
						/>
					)}
				</AnimatePresence>
			</motion.div>
		</motion.div>
	);
}
