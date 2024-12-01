import { textblockTypeInputRule } from "@tiptap/pm/inputrules";
import { Schema } from "@tiptap/pm/model";
import { schema } from "@tiptap/pm/schema-basic";
import { addListNodes } from "@tiptap/pm/schema-list";
import type { Transaction } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import type { MutableRefObject } from "react";


export const documentSchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks,

});

export function headingRule(level: number) {
  return textblockTypeInputRule(
    new RegExp(`^(#{1,${level}})\\s$`),
    documentSchema.nodes.heading,
    () => ({ level })
  );
}

export const handleTransaction = ({
  transaction,
  editorRef,
  saveContent,
  content,
  isCurrentVersion,
}: {
  transaction: Transaction;
  editorRef: MutableRefObject<EditorView | null>;
  saveContent: (updatedContent: string, debounce: boolean) => void;
  content: string;
  isCurrentVersion: boolean;
}) => {
  if (!editorRef || !editorRef.current) return;

  if (isCurrentVersion && transaction.docChanged && !transaction.getMeta("no-save")) {
    setTimeout(() => {
      if (transaction.getMeta("no-debounce")) {
        saveContent(content, false);
      } else {
        saveContent(content, true);
      }
    }, 0);
  }
};
