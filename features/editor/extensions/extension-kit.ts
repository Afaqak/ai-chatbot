"use client";

import { API } from "@/lib/api";
// eslint-disable-next-line import/no-named-as-default
import Bold from "@tiptap/extension-bold";

import {
  BlockquoteFigure,
  CharacterCount,
  CodeBlock,
  Color,
  Details,
  DetailsContent,
  DetailsSummary,
  Document,
  Dropcursor,
  Emoji,
  Figcaption,
  FileHandler,
  Focus,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalRule,
  ImageBlock,
  Link,
  Placeholder,
  Selection,
  SlashCommand,
  StarterKit,
  Subscript,
  Superscript,
  Table,
  TableOfContents,
  TableCell,
  TableHeader,
  TableRow,
  TextAlign,
  TextStyle,
  TrailingNode,
  Typography,
  Underline,
  emojiSuggestion,
  Columns,
  Column,
  TaskItem,
  History,
  TaskList,
  ImageUpload,
  ListItem,
  BulletList,
  DataField,
} from ".";
import Image from "@tiptap/extension-image";
import { SuggestionsExtension } from "@/lib/editor/suggestions";

const strong = Bold.extend({
  name: "strong",
});

export const ExtensionKit = () => {
  // const isCollaborationEnabled = !!provider;

  return [
    History,
    Document,
    Columns,
    SuggestionsExtension,
    strong,
    ListItem,
    ImageUpload,
    TaskList,
    TaskItem.configure({ nested: true }),
    Column,
    Selection,
    Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    HorizontalRule,
    StarterKit.configure({
      document: false,
      dropcursor: false,
      heading: false,
      horizontalRule: false,
      // blockquote: true,
      history: false,
      codeBlock: false,
    }),
    Details.configure({
      persist: true,
      HTMLAttributes: { class: "details" },
    }),
    DetailsContent,
    DetailsSummary,
    CodeBlock,
    TextStyle,
    FontSize,
    FontFamily,
    Color,
    TrailingNode,
    Link.configure({ openOnClick: false }),
    Highlight.configure({ multicolor: true }),
    Underline,
    CharacterCount.configure({ limit: 50000 }),
    TableOfContents,
    ImageBlock,
    FileHandler.configure({
      allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      onDrop: async (currentEditor, files, pos) => {
        try {
          for (const file of files) {
            const url = await API.uploadImage(file);
            currentEditor
              .chain()
              .setImageBlockAt({ pos, src: url })
              .focus()
              .run();
          }
        } catch (error) {
          console.error("Image upload failed:", error);
        }
      },
      onPaste: async (currentEditor, files) => {
        try {
          for (const file of files) {
            const url = await API.uploadImage(file);
            currentEditor
              .chain()
              .setImageBlockAt({
                pos: currentEditor.state.selection.anchor,
                src: url,
              })
              .focus()
              .run();
          }
        } catch (error) {
          console.error("Image upload failed:", error);
        }
      },
    }),
    Emoji.configure({
      enableEmoticons: true,
      suggestion: emojiSuggestion,
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Subscript,
    Superscript,
    Table,
    TableCell,
    TableHeader,

    TableRow,
    Typography,
    Placeholder.configure({
      includeChildren: true,
      showOnlyCurrent: false,
      placeholder: ({ node }) =>
        node.type.name === "paragraph" ? "Type something here..." : "",
    }),
    SlashCommand,
    Focus,
    Figcaption,
    BlockquoteFigure,
    DataField,
    // BulletList
    Dropcursor.configure({
      width: 2,
      class: "ProseMirror-dropcursor border-black",
    }),
  ].filter(Boolean); // Remove undefined extensions
};

export default ExtensionKit;
