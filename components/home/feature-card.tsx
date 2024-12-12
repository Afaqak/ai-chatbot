import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	action: {
		label: string;
		onClick: () => void;
		icon: React.ReactNode;
	};
}

export function FeatureCard({
	title,
	description,
	icon,
	action,
}: FeatureCardProps) {
	return (
		<Card className="bg-card/50 backdrop-blur transition-colors hover:bg-card">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<div className="rounded-lg bg-primary/10 p-2 text-primary">
						{icon}
					</div>
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4">
				<p className="text-sm text-muted-foreground">{description}</p>
				<Button
					onClick={action.onClick}
					variant="secondary"
					className="w-full text-base font-medium justify-start px-4 py-6 h-auto"
				>
					{action.icon}
					<span className="flex-1">{action.label}</span>
				</Button>
			</CardContent>
		</Card>
	);
}
