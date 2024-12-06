import { useEffect } from "react";
import { useEditor } from "@tiptap/react";
import type { AnyExtension, Editor } from "@tiptap/core";

import { Extension } from "@tiptap/core";
import { ExtensionKit } from "../extensions/extension-kit";
import { Markdown } from "tiptap-markdown";
import { suggestionsPlugin } from "@/lib/editor/suggestions";
import { buildContentFromDocument } from "@/lib/editor/functions";
// eslint-disable-next-line import/no-named-as-default
import Bold from "@tiptap/extension-bold";
// import { initialContent } from '@/lib/data/initialContent'

declare global {
  interface Window {
    editor: Editor | null;
  }
}



export const useBlockEditor = () => {
  
  const editor = useEditor(
    {
      immediatelyRender: true,
      enableCoreExtensions: true,
      autofocus: true,
      onCreate: ({ editor }) => {
        if (editor.isEmpty) {
          editor.commands.focus("start");
        }
        
      },

      onSelectionUpdate(props) {
        console.log('selection')
      },

      extensions: [
        ...ExtensionKit(),
      ].filter((e): e is AnyExtension => e !== undefined),
      editorProps: {
        attributes: {
          class:
            "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
        },
      },
    },
    []
  );

  return { editor };
};
