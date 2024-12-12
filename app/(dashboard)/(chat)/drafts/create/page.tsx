"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textcontainer";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateDocument() {
	const router = useRouter();
	const [file, setFile] = useState<File | null>(null);
	const [isAnalyzed, setIsAnalyzed] = useState(false);
	const [purpose, setPurpose] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files[0]) {
			setFile(files[0]);
			// Simulate document analysis
			setTimeout(() => {
				setIsAnalyzed(true);
			}, 1500);
		}
	};

	const handleStartDrafting = async () => {
		setIsLoading(true);
		// Simulate processing time
		await new Promise((resolve) => setTimeout(resolve, 3000));
		router.push("/editor");
	};

	if (isLoading) {
		return <LoadingScreen />;
	}

	return (
		<div className="container max-w-3xl mx-auto py-8 px-4">
			<h1 className="text-2xl font-bold text-center mb-8">Create Document</h1>

			<Card>
				<CardContent className="space-y-6 pt-6">
					<div className="space-y-4">
						<label className="text-sm font-medium">Upload a precedent</label>
						<div className="border-2 border-dashed rounded-lg p-4">
							{file ? (
								<div className="flex items-center justify-between">
									<span className="text-sm">{file.name}</span>
									<Button variant="ghost" onClick={() => setFile(null)}>
										<Trash2 className="size-4" />
									</Button>
								</div>
							) : (
								<div className="text-center">
									<input
										type="file"
										id="file-upload"
										className="hidden"
										onChange={handleFileUpload}
										accept=".pdf,.doc,.docx"
									/>
									<label
										htmlFor="file-upload"
										className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex flex-col items-center"
									>
										<Upload className="size-8 mb-2" />
										Click to upload or drag and drop
									</label>
								</div>
							)}
						</div>
						{file && (
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span>Document analyzed</span>
									{isAnalyzed && <Check className="size-4 text-green-500" />}
								</div>
								<Progress value={isAnalyzed ? 100 : 60} className="h-1" />
							</div>
						)}
					</div>

					<div className="space-y-4">
						<label className="text-sm font-medium">
							Describe the purpose of your document
						</label>
						<Textarea
							value={purpose}
							onChange={(e) => setPurpose(e.target.value)}
							placeholder="E.g., Draft a shareholders agreement for company LegalFly, we have 5 shareholders..."
							className="min-h-[100px]"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Jurisdiction</label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder="Select jurisdiction" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="belgium">Belgium</SelectItem>
									<SelectItem value="france">France</SelectItem>
									<SelectItem value="germany">Germany</SelectItem>
									<SelectItem value="netherlands">Netherlands</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Language</label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder="Select language" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="english">English</SelectItem>
									<SelectItem value="french">French</SelectItem>
									<SelectItem value="dutch">Dutch</SelectItem>
									<SelectItem value="german">German</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<Button className="w-full" onClick={handleStartDrafting}>
						Start Drafting Workflow
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

// import { FileText } from 'lucide-react'

function LoadingScreen() {
	return (
		<div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
			<FileText className="size-16 mb-6" />
			<h1 className="text-2xl font-semibold mb-4">Drafting your document</h1>
			<p className="text-muted-foreground text-center max-w-md">
				Our Legal AI is now processing your input and generating a tailored
				contract draft
			</p>
		</div>
	);
}
