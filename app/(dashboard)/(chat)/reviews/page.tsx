"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
	Home,
	FileText,
	Book,
	Users,
	Settings,
	Clock,
	Eye,
	CircleDot,
} from "lucide-react";

function LegalDocumentReview() {
	const [selectedSection, setSelectedSection] = useState(null);
	const [progress, setProgress] = useState(40); // 2/5 steps completed

	const [documentContent, setDocumentContent] = useState({
		1: "NOW, THEREFORE, in consideration of the covenants and agreements set forth in this Agreement, and for other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, Organisation 1 and Organisation 2 hereby agree as follows:",
		2: "1.0 Purpose. The purpose of the Joint Venture shall be to submit a proposal in response to RFP # [insert RFP number] (hereinafter the resultant award of such RFP will be referred to as 'the Contract'), and, if successful, to enter into and deliver [insert description of supplies/services] to [insert Agency] for the term of the Contract and any option which might be tendered.",
		3: "2.0 Managing Venturer. Organisation 1, the small business participant, is the Managing Venturer of the Joint Venture.",
		4: "3.0 Percentage Ownership. Each Venturer's respective interest in the Joint Venture (hereinafter called 'Percentage Ownership Interest') is indicated below:",
		5: "4.0 Distributive Share. The net operating income and net operating loss of the Joint Venture shall be allocated and shared between and shared by the Joint Venture Parties in proportion to their performance of work.",
	});

	const reviewItems = [
		{
			id: 1,
			title: "Non-solicitation terms assessment",
			description:
				"The Joint Venture Agreement does not explicitly mention non-solicitation terms.",
			details:
				"Therefore, it is not possible to assess their fairness or reasonableness based on the provided document snippets.",
			status: "warning",
			highlighted: false,
			section: 1,
		},
		{
			id: 2,
			title: "Equitable Profit and Loss Distribution Formula",
			description:
				"The Joint Venture Agreement specifies that the net operating income and net operating loss shall be allocated and shared between the Joint Venture Parties in proportion to their performance of work.",
			details:
				"This formula ensures that profits and losses are distributed based on the actual contribution of each party, which is a fair approach to allocation. However, the agreement does not specify how performance of work is measured, which could lead to disputes if not clearly defined.",
			status: "success",
			highlighted: false,
			section: 5,
		},
		{
			id: 3,
			title: "Lack of Explicit Mutual Objectives Balance",
			description:
				"The Joint Venture Agreement does not explicitly outline how the mutual objectives will be balanced to ensure equitable benefits for both parties involved.",
			details:
				"While the agreement specifies percentage ownership and responsibilities, it lacks a clear statement on how the joint venture's goals will be aligned to benefit both parties equally. This could lead to potential conflicts or dissatisfaction if one party feels their interests are not adequately represented or prioritized.",
			status: "error",
			highlighted: false,
			section: 2,
		},
	];

	const handleHighlight = (itemId:string) => {
		// setSelectedSection(selectedSection === itemId ? null : itemId);
		// setReview(
		// 	reviewItems.map((item) =>
		// 		item.id === itemId ? { ...item, highlighted: !item.highlighted } : item,
		// 	),
		// );
	};

	const handleRedraft = (itemId:number) => {
		const item = reviewItems.find((item) => item.id === itemId);
		if (item) {
			let newContent = "";
			switch (itemId) {
				case 1:
					newContent =
						"NOW, THEREFORE, in consideration of the covenants and agreements set forth in this Agreement, including non-solicitation terms, and for other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, Organisation 1 and Organisation 2 hereby agree as follows:";
					break;
				case 2:
					newContent =
						"4.0 Distributive Share. The net operating income and net operating loss of the Joint Venture shall be allocated and shared between and shared by the Joint Venture Parties in proportion to their performance of work, as measured by agreed-upon key performance indicators (KPIs) to be reviewed quarterly.";
					break;
				case 3:
					newContent =
						"1.0 Purpose. The purpose of the Joint Venture shall be to submit a proposal in response to RFP # [insert RFP number] (hereinafter the resultant award of such RFP will be referred to as 'the Contract'), and, if successful, to enter into and deliver [insert description of supplies/services] to [insert Agency] for the term of the Contract and any option which might be tendered. Both parties commit to balancing mutual objectives to ensure equitable benefits and align goals for the success of the joint venture.";
					break;
				default:
					break;
			}
			setDocumentContent({ ...documentContent, [item.section]: newContent });
		}
	};

	const getStatusColor = (status:string) => {
		switch (status) {
			case "success":
				return "text-green-500";
			case "warning":
				return "text-yellow-500";
			case "error":
				return "text-red-500";
			default:
				return "text-gray-500";
		}
	};

	return (
		<div className="flex h-screen bg-white">
			{/* Sidebar */}
			{/* <div className="w-16 border-r p-4 flex flex-col items-center">
        <nav className="space-y-4">
          <Button variant="ghost" size="icon">
            <Home className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <FileText className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Book className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
          </Button>
        </nav>
        <Button variant="ghost" size="icon" className="mt-auto">
          <Settings className="h-5 w-5" />
        </Button>
      </div> */}

			{/* Main Content */}
			<div className="flex-1 flex flex-col">
				{/* Top Bar */}
				<div className="border-b p-4 flex justify-between items-center">
					<div className="flex items-center space-x-4">
						<Button variant="ghost" >
							<FileText className="h-5 w-5" />
						</Button>
						<span className="text-lg font-semibold">
							Joint Venture Agreement
						</span>
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
							<Clock className="h-4 w-4 mr-2" />
							Time Saved: 1 hour 55min
						</div>
						<Button variant="outline">
							<Eye className="h-4 w-4 mr-2" />
							Anonymisation
						</Button>
					</div>
				</div>

				{/* Content Area */}
				<div className="flex-1 flex">
					{/* Document Content */}
					<div className="flex-1 p-6 overflow-auto">
						<div className="p-4 rounded-lg transition-colors duration-200">
							<h2 className="text-xl font-semibold mb-4">
								Joint Venture Agreement
							</h2>
							{Object.entries(documentContent).map(([key, content]) => (
								<p
									key={key}
									className={`mb-4 p-2 rounded ${
										selectedSection === parseInt(key) ? "bg-yellow-100" : ""
									}`}
								>
									{content}
								</p>
							))}
						</div>
					</div>

					{/* Review Panel */}
					<div className="w-96 border-l flex flex-col">
						<div className="p-4 border-b">
							<h2 className="text-lg font-semibold">
								Joint Venture Agreement Business Checks
							</h2>
							<div className="text-sm text-gray-500">4 items</div>
						</div>
						<ScrollArea className="flex-1">
							<div className="p-4 space-y-4">
								{reviewItems.map((item:any) => (
									<div
										key={item.id}
										className={`p-4 rounded-lg border ${
											item.highlighted
												? "bg-gray-50 border-gray-300"
												: "border-gray-200"
										}`}
									>
										<div className="flex items-start gap-2 mb-2">
											<CircleDot
												className={`h-4 w-4 mt-1 ${getStatusColor(item.status)}`}
											/>
											<div>
												<h3 className="font-medium">{item.title}</h3>
												<p className="text-sm text-gray-600 mt-1">
													{item.description}
												</p>
												<p className="text-sm text-gray-500 mt-2">
													{item.details}
												</p>
											</div>
										</div>
										<div className="flex gap-2 mt-4">
											<Button
												variant="outline"
											
												onClick={() => handleHighlight(item.id)}
											>
												Highlight
											</Button>
											<Button variant="outline" >
												Explain
											</Button>
											<Button
												variant="outline"
												
												onClick={() => handleRedraft(item.id)}
											>
												Re-draft
											</Button>
										</div>
									</div>
								))}
							</div>
						</ScrollArea>
						{/* Progress Bar */}
						<div className="p-4 border-t bg-gray-50">
							<div className="flex justify-between text-sm text-gray-600 mb-2">
								<span>PROGRESS</span>
								<span>2/5 steps completed</span>
							</div>
							<Progress value={progress} className="h-2" />
							<p className="text-sm text-gray-500 mt-2">
								Reviewing contract for compliance...
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default LegalDocumentReview;
