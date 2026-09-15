"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { AppError } from "@/lib/error";
import { createSafeAction } from "@/lib/utils/safe-action";
import type { SafeActionResult } from "@/lib/types/server-actions";

const signUpInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  preferred_unit: z.enum(["kg", "lb"]).default("kg"),
});

type SignUpInput = z.infer<typeof signUpInputSchema>;

type SignUpOutput = {
  id: string;
  email: string;
};

export const signUp = createSafeAction<SignUpInput, SignUpOutput>({
  name: "signUp",
  schema: signUpInputSchema,
  handler: async (input): Promise<SafeActionResult<SignUpOutput>> => {
    try {
      const existing = await db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });

      if (existing) {
        throw AppError.conflict(
          "Este email ya está registrado.",
          "email"
        );
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      const username = input.email.split("@")[0].toLowerCase();

      const user = await db.user.create({
        data: {
          email: input.email,
          password_hash: passwordHash,
          must_change_password: false,
          profile: {
            create: {
              username,
              preferred_unit: input.preferred_unit,
            },
          },
        },
        select: {
          id: true,
          email: true,
        },
      });

      return { data: user, error: null };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.message, code: error.code };
      }
      if (
        typeof error === "object" &&
        error !== null &&
        (error as any).code === "P2002"
      ) {
        const appError = AppError.conflict(
          "Este email ya está registrado.",
          "email"
        );
        return {
          data: null,
          error: appError.message,
          code: appError.code,
        };
      }
      return {
        data: null,
        error: "Ocurrió un error durante el registro.",
      };
    }
  },
});