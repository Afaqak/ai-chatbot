import { useState } from "react";
import { Editor } from "@tiptap/react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Toolbar } from "@/components/ui/toolbar";
import {
	DropdownButton,
	DropdownCategoryTitle,
} from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import {
	Wand2,
	SpellCheck,
	PenLine,
	FileText,
	Expand,
	FileSearch,
	Languages,
	MessageSquare,
	Sparkles,
	BookOpen,
	ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { Surface } from "@/components/ui/surface";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
	process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY!,
);

interface AIDropdownProps {
	editor: Editor;
}

const LANGUAGES = [
	{ code: "es", name: "Spanish" },
	{ code: "fr", name: "French" },
	{ code: "de", name: "German" },
	{ code: "it", name: "Italian" },
	{ code: "pt", name: "Portuguese" },
	{ code: "zh", name: "Chinese" },
	{ code: "ja", name: "Japanese" },
	{ code: "ko", name: "Korean" },
];

export function AIDropdown({ editor }: any) {
	const [isLoading, setIsLoading] = useState(false);

	const getSelectedText = () => {
		return editor.state.doc.textBetween(
			editor.state.selection.from,
			editor.state.selection.to,
		);
	};

	const handleAIOperation = async (operation: string, language?: string) => {
		const selectedText = getSelectedText();

		if (!selectedText) {
			toast.error("Please select some text first");
			return;
		}

		setIsLoading(true);

		try {
			const model = genAI.getGenerativeModel({ model: "gemini-pro" });

			let prompt = "";

			switch (operation) {
				case "fix":
					prompt = `Fix the grammar and spelling in this text: "${selectedText}"`;
					break;
				case "improve":
					prompt = `Improve this text while maintaining its meaning: "${selectedText}"`;
					break;
				case "summarize":
					prompt = `Summarize this text concisely: "${selectedText}"`;
					break;
				case "expand":
					prompt = `Expand this text with more details while maintaining the same style: "${selectedText}"`;
					break;
				case "simplify":
					prompt = `Simplify this text to make it easier to understand: "${selectedText}"`;
					break;
				case "translate":
					prompt = `Translate this text to ${language}: "${selectedText}"`;
					break;
				case "tone-professional":
					prompt = `Rewrite this text in a professional tone: "${selectedText}"`;
					break;
				case "tone-casual":
					prompt = `Rewrite this text in a casual, friendly tone: "${selectedText}"`;
					break;
				case "bullets":
					prompt = `Convert this text into bullet points: "${selectedText}"`;
					break;
				case "explain":
					prompt = `Explain this text in simpler terms: "${selectedText}"`;
					break;
				default:
					throw new Error("Unknown operation");
			}

			const result = await model.generateContent(
				`${prompt} provide the answer in plain text.`,
			);
			const response = result.response;
			const text = response.text();

			console.log(text, "TEXT");

			editor
				.chain()
				.focus()
				.setTextSelection({
					from: editor.state.selection.from,
					to: editor.state.selection.to,
				})
				.insertContent(text)
				.run();

			toast.success(`Text ${operation}ed successfully`);
		} catch (error) {
			console.error("AI operation failed:", error);
			toast.error("Failed to process text. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dropdown.Root>
			<Dropdown.Trigger asChild>
				<Toolbar.Button
					variant="ghost"
					// buttonSize="sm"
					className="flex h-8 w-8 items-center justify-center p-0 data-[state=open]:bg-muted"
					disabled={isLoading}
				>
					<Wand2 className="h-4 w-4" />
				</Toolbar.Button>
			</Dropdown.Trigger>
			<Dropdown.Content asChild>
				<Surface>
					<DropdownButton
						className="flex cursor-pointer items-center gap-2"
						onClick={() => handleAIOperation("fix")}
						disabled={isLoading}
					>
						<SpellCheck className="h-4 w-4" />
						Fix Grammar & Spelling
					</DropdownButton>
					<DropdownButton
						className="flex cursor-pointer items-center gap-2"
						onClick={() => handleAIOperation("improve")}
						disabled={isLoading}
					>
						<PenLine className="h-4 w-4" />
						Improve Writing
					</DropdownButton>
					<DropdownButton
						className="flex cursor-pointer items-center gap-2"
						onClick={() => handleAIOperation("summarize")}
						disabled={isLoading}
					>
						<FileText className="h-4 w-4" />
						Summarize
					</DropdownButton>
					<DropdownButton
						className="flex cursor-pointer items-center gap-2"
						onClick={() => handleAIOperation("expand")}
						disabled={isLoading}
					>
						<Expand className="h-4 w-4" />
						Expand
					</DropdownButton>
					<DropdownButton
						className="flex cursor-pointer items-center gap-2"
						onClick={() => handleAIOperation("simplify")}
						disabled={isLoading}
					>
						<FileSearch className="h-4 w-4" />
						Simplify
					</DropdownButton>

					{/* <DropdownMenuSeparator />
					 */}
					<DropdownButton
						className="flex cursor-pointer items-center gap-2"
						onClick={() => handleAIOperation("tone-professional")}
						disabled={isLoading}
					>
						<MessageSquare className="h-4 w-4" />
						Professional Tone
					</DropdownButton>
					<DropdownButton
						className="flex cursor-pointer items-center gap-2"
						onClick={() => handleAIOperation("tone-casual")}
						disabled={isLoading}
					>
						<Sparkles className="h-4 w-4" />
						Casual Tone
					</DropdownButton>

					{/* <DropdownMenuSeparator /> */}

					<DropdownButton
						className="flex cursor-pointer items-center gap-2"
						onClick={() => handleAIOperation("bullets")}
						disabled={isLoading}
					>
						<ListChecks className="h-4 w-4" />
						Convert to Bullets
					</DropdownButton>
					<DropdownButton
						className="flex cursor-pointer items-center gap-2"
						onClick={() => handleAIOperation("explain")}
						disabled={isLoading}
					>
						<BookOpen className="h-4 w-4" />
						Explain This
					</DropdownButton>

					{/* <DropdownMenuSeparator /> */}

					<Dropdown.Root>
						<Dropdown.Trigger className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 hover:bg-accent">
							<Languages className="h-4 w-4" />
							Translate To
						</Dropdown.Trigger>
						<Dropdown.Content asChild>
							<Surface>
								{LANGUAGES.map((lang) => (
									<DropdownButton
										key={lang.code}
										className="cursor-pointer"
										onClick={() => handleAIOperation("translate", lang.name)}
										disabled={isLoading}
									>
										{lang.name}
									</DropdownButton>
								))}
							</Surface>
						</Dropdown.Content>
					</Dropdown.Root>
				</Surface>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
