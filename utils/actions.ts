"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import z from "zod";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6).max(12),
});

export async function login(formData: { email: string; password: string }) {
	const supabase = await createClient();

	let result = loginSchema.safeParse({
		email: formData.email as string,
		password: formData.password as string,
	});

	if (!result.success) {
		throw new Error("Invalid login data");
	}

	const { data, error } = await supabase.auth.signInWithPassword(result.data);
	console.log(data, "DATA", error);
	if (error) {
		throw new Error("Supabase login error");
	}

	revalidatePath("/", "layout");
	redirect("/chats");
}

export async function signup(formData: FormData) {
	const supabase = await createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};

	const { error } = await supabase.auth.signUp(data);

	if (error) {
		redirect("/error");
	}

	revalidatePath("/", "layout");
	redirect("/");
}
