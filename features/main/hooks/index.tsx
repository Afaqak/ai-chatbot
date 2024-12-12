import { create } from "zustand";
interface SidebarStoreProps {
	chat_sidebar_state: boolean;
	main_sidebar_state: boolean;
	toggle_main_sidebar: () => void;
	toggle_chat_sidebar: () => void;
}

export const useSidebarStore = create<SidebarStoreProps>()((set) => ({
	chat_sidebar_state: true,
	main_sidebar_state: true,

	toggle_main_sidebar: () =>
		set((state) => ({
			main_sidebar_state: !state.main_sidebar_state,
		})),
	toggle_chat_sidebar: () =>
		set((state) => ({
			chat_sidebar_state: !state.chat_sidebar_state,
		})),
}));
