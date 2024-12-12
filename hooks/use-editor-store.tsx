import { Editor } from "@tiptap/core";
import { create } from "zustand";

interface EditorProps {
	editor: Editor | null;
	setEditor: (editor: Editor | null) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
}

const useEditorStore = create<EditorProps>((set) => ({
	editor: null,
	setEditor(editor) {
		set({ editor });
	},
	setLoading(loading) {
		set({ loading });
	},
	loading: false,
}));

export default useEditorStore;
