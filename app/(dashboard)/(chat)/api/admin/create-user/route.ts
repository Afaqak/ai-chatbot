import { supabase } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
  admin_key: z.string(),
  password:z.string()
});

export async function POST(request: Request) {
  try {
    const json = await request.json();

    const result = requestSchema.safeParse(json);

    console.log(result)
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.issues },
        { status: 400 }
      );
    }

    const { email, admin_key ,password} = result.data;

    // return NextResponse.json(result.data)
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
    if (admin_key !== ADMIN_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid admin key" },
        { status: 401 }
      );
    }

    const { data: signupData, error: signupError } = await supabase
      .from("signupdemo")
      .select("*")
      .eq("email", email)
      .single();

    if (signupError || !signupData) {
      return NextResponse.json(
        { error: "User signup data not found" },
        { status: 404 }
      );
    }

    // let temporaryPassword=generateTemporaryPassword()


    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: email,
      password,
      options: {
        data: {
          full_name: signupData.full_name, 
        },
      },
    });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: "Error signing up user" },
        { status: 500 }
      );
    }

    

    const { error: insertError } = await supabase.from("user_profiles").update({
      // id: authUser.user.id, 
      // email: signupData.email,
      // full_name: signupData.full_name,
      team_size: signupData.team_size,
      country_region: signupData.country_region,
      industry: signupData.industry,
      phone_number: signupData.phone_number,
      // created_at: new Date(),
    }).eq('id',authUser.user.id);

    if (insertError) {
      console.log(insertError)
      return NextResponse.json(
        { error: "Error inserting user data into users_table" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User created successfully",
      user: {
        password,
        id: authUser.user?.id,
        email: signupData.email,
        full_name: signupData.full_name,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateTemporaryPassword(): string {
  return (
    Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
  );
}
