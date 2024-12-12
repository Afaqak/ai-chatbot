"use client";

import { useState } from "react";
import {
	ChevronRight,
	Bot,
	Settings2,
	Share2,
	Flag,
	Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
// import { Textarea } from '@/components/ui/Textarea'
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Editor } from "@/features/editor/block-editor";

function EditorPage() {
	const [activeSection, setActiveSection] = useState("parties");
	const [content, setContent] = useState("");

	const sections = [
		{ id: "parties", title: "PARTIES" },
		{ id: "shares", title: "SHARES AND VALUATION" },
		{ id: "meetings", title: "MEETINGS" },
		{ id: "transfer", title: "TRANSFER AND ISSUANCE OF SHARES" },
		{ id: "management", title: "MANAGEMENT" },
		{ id: "accounting", title: "ACCOUNTING INFORMATION" },
		{ id: "directors", title: "DIRECTORS" },
	];

	return (
		<div className="h-screen flex flex-col">
			{/* Header */}
			<header className="border-b px-4">
				<div className="flex h-14 items-center justify-between">
					<div className="flex items-center space-x-2 text-sm text-muted-foreground">
						<span>Dashboard</span>
						<ChevronRight className="size-4" />
						<span>Draft</span>
						<ChevronRight className="size-4" />
						<span className="text-foreground">
							Shareholders Agreement Summary
						</span>
					</div>
					<div className="flex items-center space-x-2">
						<Badge variant="secondary">GENERATING</Badge>
						<Button variant="outline">
							<Download className="size-4 mr-2" />
							Export
						</Button>
						<Button variant="outline">
							<Share2 className="size-4 mr-2" />
							Share
						</Button>
						<Button variant="outline">
							<Flag className="size-4 mr-2" />
							Report
						</Button>
					</div>
				</div>
			</header>

			<div className="flex-1 flex">
				{/* Main Content */}
				<div className="flex-1 py-0 px-4 max-w-screen-md mx-auto">
					<Editor content={""} />
					{/* <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <Textarea 
                  placeholder={`Enter ${section.title.toLowerCase()} details...`}
                  className="min-h-[200px]"
                />
              </div>
            ))}
          </div> */}
				</div>

				{/* Right Sidebar */}
				<div className="w-[400px] border-l">
					<Tabs defaultValue="copilot">
						<TabsList className="w-full justify-start border-b rounded-none h-12">
							<TabsTrigger value="copilot" className="flex items-center">
								<Bot className="mr-2 size-4" />
								Copilot
							</TabsTrigger>
							<TabsTrigger value="configuration" className="flex items-center">
								<Settings2 className="mr-2 size-4" />
								Configuration
							</TabsTrigger>
						</TabsList>

						<ScrollArea className="h-[calc(100vh-48px)]">
							<TabsContent value="copilot" className="p-4 m-0">
								<div className="space-y-4">
									<Card className="bg-primary/10">
										<CardContent className="p-4">
											<p className="text-sm">Hey there! 👋</p>
											<p className="text-sm">
												I'm your legal copilot ready to guide you through your
												legal documents.
											</p>
										</CardContent>
									</Card>

									<Card className="bg-primary/10">
										<CardContent className="p-4">
											<p className="text-sm">
												Change the amount of board members to 4, whereas for a
												list of reserved matters the vote of the board member
												from investor's side needs to be granted
											</p>
										</CardContent>
									</Card>

									<div className="flex gap-2">
										<Button variant="secondary">Apply</Button>
										<Button variant="outline">Re-draft</Button>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="configuration" className="p-4 m-0">
								<div className="space-y-6">
									<div className="space-y-4">
										<h3 className="text-sm font-medium">
											Document Information
										</h3>
										<div className="space-y-2">
											<label className="text-sm">Effective Date</label>
											<Input type="date" />
										</div>
										<div className="space-y-2">
											<label className="text-sm">
												Shareholder Name and Address
											</label>
											<Input placeholder="Shareholder 1: [Address], Shareholder 2: [Address]" />
										</div>
									</div>

									<div className="space-y-4">
										<h3 className="text-sm font-medium">
											Shares and Valuation
										</h3>
										<div className="space-y-2">
											<label className="text-sm">Initial Share Capital</label>
											<Input placeholder="100,000 USD" />
										</div>
										<div className="space-y-2">
											<label className="text-sm">Total Number of Shares</label>
											<Input placeholder="1000" />
										</div>
										<div className="space-y-2">
											<label className="text-sm">Par Value per Share</label>
											<Input placeholder="100 USD" />
										</div>
									</div>

									<div className="space-y-4">
										<h3 className="text-sm font-medium">Meeting Notices</h3>
										<div className="space-y-2">
											<label className="text-sm">
												Annual Meeting Notice Period (days)
											</label>
											<Input placeholder="30" />
										</div>
										<div className="space-y-2">
											<label className="text-sm">
												Specific Meeting Notice Period (days)
											</label>
											<Input placeholder="14" />
										</div>
										<div className="space-y-2">
											<label className="text-sm">
												Quorum Requirement Percentage
											</label>
											<Input placeholder="50" />
										</div>
									</div>
								</div>
							</TabsContent>
						</ScrollArea>
					</Tabs>
				</div>
			</div>
		</div>
	);
}

export default EditorPage;
