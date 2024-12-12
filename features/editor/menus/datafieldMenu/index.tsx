import { Icon } from "@/components/ui/icon";
import { Surface } from "@/components/ui/surface";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useCallback, useEffect } from "react";
import { useBlockEditor } from "../../hooks/use-block-editor";
import { Hash, icons } from "lucide-react";
import {
	DropdownButton,
	DropdownCategoryTitle,
} from "@/components/ui/dropdown";
import { Editor } from "@tiptap/core";

// Define data field configuration with clear, descriptive types
interface DataFieldOption {
	label: string;
	icon: string;
	fieldId: string;
	action: (editor: any, selectedText: string) => void;
}

// Centralized data field configuration
const DATA_FIELD_GROUPS = [
	{
		label: "Data Fields",
		options: [
			{
				label: "Person",
				icon: "User",
				fieldId: "Person",
				action: (editor: any, selectedText: string) =>
					editor
						.chain()
						.focus()
						.insertDataField({
							fieldId: "Person",
							fieldName: selectedText || "Person",
						}),
			},
			{
				label: "Email",
				icon: "Mail",
				fieldId: "Email",
				action: (editor: any, selectedText: any) =>
					editor.commands.insertDataField({
						fieldId: "Email",
						fieldName: selectedText || "Email",
					}),
			},
			{
				label: "Address",
				icon: "Map",
				fieldId: "Address",
				action: (editor: any, selectedText: any) =>
					editor.commands.insertDataField({
						fieldId: "Address",
						fieldName: selectedText || "Address",
					}),
			},
		],
	},
];

// Flatten data field options for easier lookup
const DATA_FIELD_OPTIONS = DATA_FIELD_GROUPS.flatMap((group) => group.options);

interface DataFieldPickerProps {
	onChange?: (value: string) => void;
	value?: string;
	editor: Editor;
}

export const DataFieldPicker: React.FC<DataFieldPickerProps> = ({
	value,
	editor,
}) => {
	// Extract selected text from current editor selection
	const getSelectedText = useCallback(() => {
		if (!editor) return "";

		const { state } = editor.view;
		const { selection } = state;

		if (selection.from === selection.to) {
			return ""; // No text selected
		}

		return state.doc.textBetween(selection.from, selection.to, " ");
	}, [editor]);

	// useEffect(() => {
	//   editor.on("selectionUpdate", (editor) => {
	//     console.log(editor, "SELECTION FROM EDITOR");
	//   });
	// }, [editor.view.state]);

	// Handle data field insertion
	const handleDataFieldInsertion = useCallback(
		(option: DataFieldOption) => {
			if (!editor) return;

			const selectedText = getSelectedText();

			option.action(editor, selectedText);
		},
		[editor, getSelectedText],
	);

	// Determine current selected field (if any)
	const currentField = DATA_FIELD_OPTIONS.find(
		(field) => field.label.toLowerCase() === value?.toLowerCase(),
	);

	return (
		<Dropdown.Root>
			<Dropdown.Trigger asChild>
				<Surface>
					<DropdownButton>
						<div className="flex items-center gap-2">
							{currentField ? (
								<Icon name={currentField.icon as keyof typeof icons} />
							) : (
								<Hash className="size-4" />
							)}
							<span>{currentField?.label || "Field"}</span>
						</div>
					</DropdownButton>
				</Surface>
			</Dropdown.Trigger>

			<Dropdown.Content className="dropdown-content" sideOffset={5}>
				<Surface className="flex  flex-col gap-1 px-2 py-4">
					<div className="pt-2">
						<DropdownCategoryTitle>Data fields</DropdownCategoryTitle>
					</div>

					{DATA_FIELD_GROUPS.map((group) => (
						<div key={group.label}>
							{group.options.map((option) => (
								<DropdownButton
									key={option.label}
									className="dropdown-item"
									onClick={() => handleDataFieldInsertion(option)}
								>
									<Icon name={option.icon as keyof typeof icons} />
									<span>{option.label}</span>
								</DropdownButton>
							))}
						</div>
					))}
				</Surface>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
