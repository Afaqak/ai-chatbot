"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const templates = [
	{
		id: 1,
		name: "Non-compete agreement",
		tags: ["Employment", "Legal"],
		jurisdiction: "United States",
		language: "English",
	},
	{
		id: 2,
		name: "Employment Contract",
		tags: ["HR", "Legal"],
		jurisdiction: "United Kingdom",
		language: "English",
	},
	{
		id: 3,
		name: "Lease Agreement",
		tags: ["Real Estate", "Legal"],
		jurisdiction: "European Union",
		language: "English",
	},
	{
		id: 4,
		name: "Supplier Agreement",
		tags: ["Business", "Procurement"],
		jurisdiction: "International",
		language: "English",
	},
	{
		id: 5,
		name: "Joint Venture Agreement",
		tags: ["Business", "Partnership"],
		jurisdiction: "Belgium",
		language: "English",
	},
];

function HomePage() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");

	const filteredTemplates = templates.filter(
		(template) =>
			template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			template.tags.some((tag) =>
				tag.toLowerCase().includes(searchTerm.toLowerCase()),
			),
	);

	return (
		<div className="container mx-auto py-8 max-w-5xl">
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
						Pick from existing templates or draft from scratch
					</h1>
					<Button onClick={() => router.push("/drafts/create")}>
						<PlusCircle className="mr-2 h-4 w-4" />
						Draft New Document
					</Button>
				</div>

				<div className="flex items-center space-x-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search templates or tags..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>

				<div className="border rounded-lg">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[30%]">Name</TableHead>
								<TableHead className="w-[30%]">Tags</TableHead>
								<TableHead className="w-[20%]">Jurisdiction</TableHead>
								<TableHead className="w-[15%]">Language</TableHead>
								<TableHead className="w-[50px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredTemplates.map((template) => (
								<TableRow key={template.id}>
									<TableCell className="font-medium">{template.name}</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-2">
											{template.tags.map((tag, index) => (
												<Badge key={index} variant="secondary">
													{tag}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell>{template.jurisdiction}</TableCell>
									<TableCell>{template.language}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem>Edit</DropdownMenuItem>
												<DropdownMenuItem>Duplicate</DropdownMenuItem>
												<DropdownMenuItem>Delete</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}

export default HomePage;
