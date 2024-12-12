import { Chat } from "@/components/chat";
import { DEFAULT_MODEL_NAME, models } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
	const id = generateUUID();
	const { auth } = await createClient();
	console.log((await auth.getSession()).data);
	const cookieStore = await cookies();
	const modelIdFromCookie = cookieStore.get("model-id")?.value;

	const selectedModelId =
		models.find((model) => model.id === modelIdFromCookie)?.id ||
		DEFAULT_MODEL_NAME;

	return (
		<Chat
			key={id}
			id={id}
			initialMessages={[]}
			selectedModelId={selectedModelId}
		/>
	);
}
