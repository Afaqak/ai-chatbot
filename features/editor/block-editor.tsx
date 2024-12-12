import { createDocument, EditorContent } from "@tiptap/react";
import React, { memo, useEffect, useRef } from "react";

// eslint-disable-next-line import/default, import/no-duplicates
import { LinkMenu } from "./menus";

import { useBlockEditor } from "./hooks/use-block-editor";

// import { Sidebar } from "@/components/Sidebar";
import { ImageBlockMenu } from "./extensions/ImageBlock/components/ImageBlockMenu";
import { ColumnsMenu } from "./extensions/MultiColumn/menus";
import { TableColumnMenu, TableRowMenu } from "./extensions/Table/menus";
// import { EditorHeader } from "./components/EditorHeader";
import { TextMenu } from "./menus/TextMenu";
// eslint-disable-next-line import/no-duplicates
import { ContentItemMenu } from "./menus";
import { useSidebar } from "@/components/ui/sidebar";
import {
	buildContentFromDocument,
	buildDocumentFromContent,
	createDecorations,
} from "@/lib/editor/functions";
import {
	projectWithPositions,
	suggestionsPluginKey,
} from "@/lib/editor/suggestions";
import { handleTransaction } from "@/lib/editor/config";
import { Markdown } from "@/components/markdown";
import { renderToString } from "react-dom/server";
import { DOMParser, Schema, type Node } from "@tiptap/pm/model";

interface BlockEditorProps {
	content: string;
	suggestions?: any;
	isCurrentVersion?: boolean;
	currentVersionIndex?: number;
	status?: string;
	saveContent?: any;
	mode?: "conversation" | "draft";
}

const BlockEditor = ({
	content,
	suggestions,
	isCurrentVersion,
	currentVersionIndex,
	status,
	mode,
	saveContent,
}: BlockEditorProps) => {
	const menuContainerRef = useRef(null);

	const { editor } = useBlockEditor();
	const initialContentSet = useRef(false);

	let checkIsStringified = (content: string) => {
		try {
			return JSON.parse(content);
		} catch (error) {
			return content;
		}
	};

	function setEditorContent() {
		let docContent = checkIsStringified(content);
		if (typeof docContent === "string") {
			const document = buildDocumentFromContent(content, editor.schema);
			editor.commands.setContent(document.toJSON());
		} else {
			editor.commands.setContent(JSON.parse(content));
		}
	}

	useEffect(() => {
		if (mode === "conversation" && editor && content) {
			try {
				setEditorContent();
				initialContentSet.current = true;
			} catch (error) {
				console.error("Error setting initial content:", error);
			}
		}
	}, [editor, content, mode]);

	useEffect(() => {
		if (editor?.view && mode === "conversation" && isCurrentVersion) {
			editor.view.setProps({
				dispatchTransaction: (transaction) => {
					const newState = editor.view.state.apply(transaction);
					editor.view.updateState(newState);
					if (isCurrentVersion) {
						const updatedContent = JSON.stringify(editor.getJSON());
						handleTransaction({
							transaction,
							editorRef: { current: editor.view },
							saveContent: saveContent || (() => {}),
							content: updatedContent,
							isCurrentVersion,
						});
					} else {
						console.log("Not saving - not current version");
					}
				},
			});
		}
	}, [editor?.view, saveContent, isCurrentVersion]);

	useEffect(() => {
		if (editor.view?.state.doc && content) {
			const projectedSuggestions = projectWithPositions(
				editor.view.state.doc,
				suggestions,
			).filter(
				(suggestion) => suggestion.selectionStart && suggestion.selectionEnd,
			);
			console.log(projectedSuggestions, "PROJ");

			const decorations = createDecorations(projectedSuggestions, editor.view);

			const transaction = editor.view.state.tr;
			transaction.setMeta(suggestionsPluginKey, { decorations });
			editor.view.dispatch(transaction);
		}
	}, [suggestions, content]);

	return (
		<div className="flex h-full" ref={menuContainerRef}>
			<div className="relative flex flex-col flex-1 h-full">
				<EditorContent
					// disabled={!isCurrentVersion}
					editor={editor}
					className="flex-1 overflow-y-auto"
				/>

				<ContentItemMenu editor={editor} />
				<LinkMenu editor={editor} appendTo={menuContainerRef} />
				<TextMenu editor={editor} />
				<ColumnsMenu editor={editor} appendTo={menuContainerRef} />
				<TableRowMenu editor={editor} appendTo={menuContainerRef} />
				<TableColumnMenu editor={editor} appendTo={menuContainerRef} />
				<ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
			</div>
		</div>
	);
};

interface EditorProps extends BlockEditorProps {}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
	if (prevProps.mode !== nextProps.mode) {
		return false;
	}

	if (nextProps.mode === "conversation") {
		return (
			prevProps.suggestions === nextProps.suggestions &&
			prevProps.currentVersionIndex === nextProps.currentVersionIndex &&
			prevProps.isCurrentVersion === nextProps.isCurrentVersion &&
			prevProps.content === nextProps.content &&
			prevProps.saveContent === nextProps.saveContent
		);
	}

	if (nextProps.mode === "draft") {
		// Compare props relevant for "draft" mode
		return true;
	}

	// Default comparison if mode doesn't match expected values
	return true;
}

export const Editor = memo(BlockEditor, areEqual);
