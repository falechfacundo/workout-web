"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { getCurrentUser, requireAuth } from "@/lib/utils/server-auth";

// Example schema for a protected action
const ProtectedDataSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

export type ProtectedDataFormData = z.infer<typeof ProtectedDataSchema>;

// Example of a protected action that uses server-auth
export async function protectedAction(formData: ProtectedDataFormData) {
  return safeAction(async () => {
    // This will redirect to login if not authenticated
    const user = await requireAuth();

    // Validate form data
    const validatedFields = ProtectedDataSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        data: null,
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const { title, content } = validatedFields.data;

    // Your protected logic here
    // Example: saving data that requires authentication
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("protected_table")
      .insert([
        {
          user_id: user.id, // Use the authenticated user ID
          title,
          content: content || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Error: ${error.message}`,
      };
    }

    revalidatePath("/protected-route");

    return {
      data,
      error: null,
    };
  });
}

// Example of an action that needs to know the user but doesn't require auth
export async function conditionalAction(param: string) {
  return safeAction(async () => {
    // This does not redirect if not authenticated
    const user = await getCurrentUser();

    if (user) {
      // User is logged in, do authenticated operations
      return {
        data: { authenticated: true, userId: user.id, param },
        error: null,
      };
    } else {
      // User is not logged in, provide limited functionality
      return {
        data: { authenticated: false, param },
        error: null,
      };
    }
  });
}
