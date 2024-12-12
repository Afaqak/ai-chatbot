"use client";

import { DOMParser, Schema, type Node } from "@tiptap/pm/model";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";
import { renderToString } from "react-dom/server";

import { Markdown } from "@/components/markdown";

// import { documentSchema } from "./config";
import { createSuggestionWidget, type UISuggestion } from "./suggestions";

import { documentSchema } from "./config";
import { toMarkdown } from "./editor-markdown";

export const buildDocumentFromContent = (content: string, editorSchema:any) => {
	const parser = DOMParser.fromSchema(editorSchema);
	const stringFromMarkdown = renderToString(<Markdown>{content}</Markdown>);

	const tempContainer = document.createElement("div");
	tempContainer.innerHTML = stringFromMarkdown;

	return parser.parse(tempContainer);
};

export const buildContentFromDocument = (document: Node) => {
	return toMarkdown(document);
};

export const createDecorations = (
	suggestions: Array<UISuggestion>,
	view: EditorView,
) => {
	const decorations: Array<Decoration> = [];

	for (const suggestion of suggestions) {
		decorations.push(
			Decoration.inline(
				suggestion.selectionStart,
				suggestion.selectionEnd,
				{
					class: "suggestion-highlight",
				},
				{
					suggestionId: suggestion.id,
					type: "highlight",
				},
			),
		);

		decorations.push(
			Decoration.widget(
				suggestion.selectionStart,
				(view) => {
					const { dom } = createSuggestionWidget(suggestion, view);
					return dom;
				},
				{
					suggestionId: suggestion.id,
					type: "widget",
				},
			),
		);
	}

	console.log(decorations, "DECS");
	return DecorationSet.create(view.state.doc, decorations);
};
