// import { Fragment, Mark, Node } from '@remirror/core';
import { MarkdownSerializer } from "prosemirror-markdown";
import { Mark, Fragment, type Node } from "@tiptap/pm/model";

// function isPlainURL(link: Mark, parent: Fragment, index: number, side: any) {
//   if (link.attrs.title) {
//     return false;
//   }

//   const content = parent.child(index + (side < 0 ? -1 : 0));
//   if (
//     !content.isText ||
//     content.text !== link.attrs.href ||
//     content.marks[content.marks.length - 1] !== link
//   ) {
//     return false;
//   }
//   if (index === (side < 0 ? 1 : parent.childCount - 1)) {
//     return true;
//   }
//   const next = parent.child(index + (side < 0 ? -2 : 1));
//   return !link.isInSet(next.marks);
// }

function backticksFor(node: Node, side: any) {
	const ticks = /`+/g;
	let m;
	let len = 0;
	if (node.isText) {
		while ((m = ticks.exec(node.text ?? ""))) {
			len = Math.max(len, m[0].length);
		}
	}
	let result = len > 0 && side > 0 ? " `" : "`";
	for (let i = 0; i < len; i++) {
		result += "`";
	}
	if (len > 0 && side < 0) {
		result += " ";
	}
	return result;
}

/**
 * A serializer for converting between markdown and regular text
 */
export const toMarkdown = (content: Node) =>
	new MarkdownSerializer(
		{
			blockquote(state, node) {
				state.wrapBlock("> ", null, node, () => state.renderContent(node));
			},
			codeBlock(state, node) {
				const language: string | undefined = node.attrs.language;
				state.write(`\`\`\`${language ?? ""}\n`);
				state.text(node.textContent, false);
				state.ensureNewLine();
				state.write("```");
				state.closeBlock(node);
			},
			heading(state, node) {
				state.write(`${state.repeat("#", node.attrs.level)} `);
				state.renderInline(node);
				state.closeBlock(node);
			},
			horizontalRule(state, node) {
				state.write(node.attrs.markup || "---");
				state.closeBlock(node);
			},
			bulletList(state, node) {
				const bullet: string | undefined = node.attrs.bullet;
				state.renderList(node, "  ", () => `${bullet ?? "*"} `);
			},
			orderedList(state, node) {
				const start: number = node.attrs.order || 1;
				const maxW = String(start + node.childCount - 1).length;
				const space = state.repeat(" ", maxW + 2);
				state.renderList(node, space, (i) => {
					const nStr = String(start + i);
					return `${state.repeat(" ", maxW - nStr.length) + nStr}. `;
				});
			},

			listItem(state, node) {
				state.renderContent(node);
			},
			paragraph(state, node) {
				state.renderInline(node);
				state.closeBlock(node);
			},

			hardBreak(state, node, parent, index) {
				for (let i = index + 1; i < parent.childCount; i++) {
					if (parent.child(i).type !== node.type) {
						state.write("\\\n");
						return;
					}
				}
			},
			text(state, node) {
				if (!node.text) {
					return;
				}
				state.text(node.text);
			},
		},

		{
			em: {
				open: "*",
				close: "*",
				mixable: true,
				expelEnclosingWhitespace: true,
			},
			strong: {
				open: "**",
				close: "**",
				mixable: true,
				expelEnclosingWhitespace: true,
			},
			italic: {
				open: "_",
				close: "_",
				mixable: true,
				expelEnclosingWhitespace: true,
			},
			bold: {
				open: "**",
				close: "**",
				mixable: true,
				expelEnclosingWhitespace: true,
			},
			underline: {
				open: "<u>",
				close: "</u>",
				mixable: true,
				expelEnclosingWhitespace: true,
			},

			// link: {
			//   open(_state, mark, parent, index) {
			//     return isPlainURL(mark, parent, index, 1) ? "<" : "[";
			//   },
			//   close(state, mark, parent, index) {
			//     return isPlainURL(mark, parent, index, -1)
			//       ? ">"
			//       : `](${state.esc(mark.attrs.href)}${
			//           mark.attrs.title ? ` ${state.quote(mark.attrs.title)}` : ""
			//         })`;
			//   },
			// },
			code: {
				open(_state, _mark, parent, index) {
					return backticksFor(parent.child(index), -1);
				},
				close(_state, _mark, parent, index) {
					return backticksFor(parent.child(index - 1), 1);
				},
				escape: false,
			},
		},
	).serialize(content);
