import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CompanySettings() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Company Settings</CardTitle>
				<CardDescription>Manage your company information.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="company-name">Company Name</Label>
					<Input id="company-name" defaultValue="LegalFly Inc." />
				</div>
				<div className="space-y-2">
					<Label htmlFor="company-address">Company Address</Label>
					<Input
						id="company-address"
						defaultValue="123 Legal Street, Lawville, LW 12345"
					/>
				</div>
				<Button>Save Changes</Button>
			</CardContent>
		</Card>
	);
}
