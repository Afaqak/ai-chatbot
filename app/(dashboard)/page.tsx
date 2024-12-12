"use client";
import { DashboardPage } from "@/components/home";
import React, { useEffect, useState } from "react";

const Page = () => {
	// async function readStreamFromBackend() {
	//   try {
	//     const response = await fetch("/api/chat", {
	//       method: "POST",
	//     });

	//     const reader = response.body?.getReader();

	//     if (!reader) {
	//       console.error("ReadableStream is not supported");
	//       return;
	//     }

	//     const decoder = new TextDecoder("utf-8");

	//     while (true) {
	//       const { value, done } = await reader.read();
	//       if (done) break;
	//       console.log(decoder.decode(value, { stream: true }));
	//       // Decode the chunk and append it to the buffer
	//       setText((prev) => (prev += decoder.decode(value, { stream: true })));
	//     }

	//     console.log("Stream completed");
	//   } catch (error) {
	//     console.error("Error reading streamed response:", error);
	//   }
	// }

	// Call the function

	// useEffect(() => {
	//   readStreamFromBackend();
	//   // readStreamedResponse();
	// }, []);
	return (
		<div>
			<DashboardPage />
		</div>
	);
};

export default Page;
