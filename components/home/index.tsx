import {
	Bell,
	HelpCircle,
	MessageSquare,
	LayoutDashboard,
	FileText,
	Search,
	Files,
	ShieldCheck,
	FolderOpen,
	BookOpen,
	UserPlus,
	PlusCircle,
	Upload,
	Check,
	Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { StatsPanel } from "./stats-panel";
import { FeatureCard } from "./feature-card";

export function DashboardPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-background/95">
			<header className="border-b">
				<div className="flex h-16 items-center px-6">
					<div className="ml-auto flex items-center space-x-4">
						<Button variant="ghost">
							<HelpCircle className="size-5" />
						</Button>
						<Button variant="ghost">
							<MessageSquare className="size-5" />
						</Button>
						<Button variant="ghost">
							<Bell className="size-5" />
						</Button>
						<Link href="/settings">
							<Button variant="ghost">
								<Settings className="size-5" />
							</Button>
						</Link>
						<Avatar>
							<AvatarImage src="/placeholder-user.jpg" alt="User" />
							<AvatarFallback>A</AvatarFallback>
						</Avatar>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-8 pb-8">
				<div className="bg-gradient-to-b from-primary/10 to-background py-16 mb-12">
					<div className="container mx-auto px-8">
						<section className="max-w-3xl mx-auto text-center">
							<h1 className=" text-7xl font-bold tracking-tight mb-6">
								HELLO, ALEX!
							</h1>
							<p className="text-2xl text-muted-foreground leading-relaxed">
								Quickly access your legal agents to conduct thorough legal
								research, automate document review, generate insightful reports
								and more—all in one place.
							</p>
						</section>
					</div>
				</div>

				<div className="grid gap-8 md:grid-cols-4 md:auto-rows-max">
					<div className="md:col-span-1">
						<StatsPanel />
					</div>
					<div className="md:col-span-3 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<FeatureCard
							title="Review"
							description="Instantly analyze contracts for compliance, risks, and non-standard terms."
							icon={<FileText className="size-6" />}
							action={{
								label: "Start review",
								onClick: () => {},
								icon: <Check className="mr-3 size-5" />,
							}}
						/>
						<FeatureCard
							title="Drafting"
							description="Draft documents based on your own templates, inheriting your unique legal style"
							icon={<LayoutDashboard className="size-6" />}
							action={{
								label: "Create template",
								onClick: () => {},
								icon: <PlusCircle className="mr-2 size-4" />,
							}}
						/>
						<FeatureCard
							title="Discovery"
							description="Select documents, deep dive into your content, and quickly find legal answers."
							icon={<Search className="size-6" />}
							action={{
								label: "Start a new conversation",
								onClick: () => {},
								icon: <MessageSquare className="mr-2 size-4" />,
							}}
						/>
						<FeatureCard
							title="Multi document review"
							description="Review multiple documents simultaneously, with results in a structured table view."
							icon={<Files className="size-6" />}
							action={{
								label: "Start",
								onClick: () => {},
								icon: <Check className="mr-3 size-5" />,
							}}
						/>
						<FeatureCard
							title="Anonymisation"
							description="Anonymise any sensitive data in your legal and financial documents. Maximum security."
							icon={<ShieldCheck className="size-6" />}
							action={{
								label: "Upload or drop documents",
								onClick: () => {},
								icon: <Upload className="mr-2 size-4" />,
							}}
						/>
						<Card className="bg-card/50 backdrop-blur">
							<CardHeader>
								<CardTitle className="text-lg font-semibold">
									Management
								</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-2">
								<Button variant="secondary" className="w-full justify-start">
									<FolderOpen className="mr-2 size-4" />
									Documents
								</Button>
								<Button variant="secondary" className="w-full justify-start">
									<BookOpen className="mr-2 size-4" />
									Playbooks
								</Button>
								<Link href="/settings?tab=team" className="w-full">
									<Button variant="secondary" className="w-full justify-start">
										<UserPlus className="mr-2 size-4" />
										Invite Team
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
