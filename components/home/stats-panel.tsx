import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function StatsPanel() {
	const stats = [
		{ label: "Review", value: 38 },
		{ label: "Drafting", value: 15 },
		{ label: "Discovery", value: 125 },
		{ label: "Multi reviews", value: 90 },
		{ label: "Anonymisation", value: 77 },
		{ label: "Total", value: 345 },
	];

	return (
		<Card className="p-6 h-full flex flex-col">
			<div className="flex items-center mb-6">
				<Badge
					variant="outline"
					className="bg-primary/10 text-primary border-0 text-lg py-1 px-3"
				>
					Stats
				</Badge>
			</div>
			<h2 className="text-2xl font-semibold mb-6">Total Activity</h2>
			<div className="grow flex flex-col justify-between">
				{stats.map((stat, index) => (
					<div key={stat.label} className="flex justify-between items-center">
						<span className="text-lg text-muted-foreground">{stat.label}</span>
						<span className="font-mono text-xl font-medium">{stat.value}</span>
					</div>
				))}
			</div>
		</Card>
	);
}
