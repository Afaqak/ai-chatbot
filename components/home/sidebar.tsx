import {
	Home,
	Files,
	PenSquare,
	Lock,
	LayoutGrid,
	FileText,
	Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
	return (
		<div className="pb-12 min-h-screen">
			<div className="space-y-4 py-4">
				<div className="px-3 py-2">
					<div className="space-y-1">
						<Button variant="ghost" className="w-full justify-start">
							<Home className="mr-2 h-4 w-4" />
							Home
						</Button>
						<Button variant="ghost" className="w-full justify-start">
							<Files className="mr-2 h-4 w-4" />
							Documents
						</Button>
						<Button variant="ghost" className="w-full justify-start">
							<PenSquare className="mr-2 h-4 w-4" />
							Drafting
						</Button>
						<Button variant="ghost" className="w-full justify-start">
							<Lock className="mr-2 h-4 w-4" />
							Security
						</Button>
						<Button variant="ghost" className="w-full justify-start">
							<LayoutGrid className="mr-2 h-4 w-4" />
							Templates
						</Button>
						<Button variant="ghost" className="w-full justify-start">
							<FileText className="mr-2 h-4 w-4" />
							Reports
						</Button>
						<Button variant="ghost" className="w-full justify-start">
							<Settings className="mr-2 h-4 w-4" />
							Settings
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
