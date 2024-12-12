import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm font-medium">Stats</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<p className="text-sm font-medium text-muted-foreground">
								Review
							</p>
							<p className="text-2xl font-bold">38</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium text-muted-foreground">
								Drafting
							</p>
							<p className="text-2xl font-bold">15</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<p className="text-sm font-medium text-muted-foreground">
								Discovery
							</p>
							<p className="text-2xl font-bold">125</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium text-muted-foreground">
								Multi reviews
							</p>
							<p className="text-2xl font-bold">90</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<p className="text-sm font-medium text-muted-foreground">
								Anonymisation
							</p>
							<p className="text-2xl font-bold">77</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium text-muted-foreground">Total</p>
							<p className="text-2xl font-bold">345</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
