'use server'

import { z } from "zod";
import { hash, verify } from "argon2";
import { lucia, validateRequest } from "./lucia";
import { prisma } from "@/lib/config/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateId } from "lucia";

// Schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase and number"
  ),
  name: z.string().min(2),
  clubName: z.string().optional(),
  role: z.enum(["USER", "CLUB_OWNER"]).default("USER"),
});

// Login action
export async function loginAction(formData: FormData) {
  try {
    const validatedData = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (!user || !user.password) {
      return { error: "Invalid credentials" };
    }

    // Verify password
    const validPassword = await verify(user.password, validatedData.password);
    if (!validPassword) {
      return { error: "Invalid credentials" };
    }

    // Check if user is active
    if (!user.active) {
      return { error: "Account is disabled" };
    }

    // Create session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    // Redirect based on role
    if (user.role === "CLUB_OWNER" || user.role === "CLUB_STAFF") {
      redirect("/dashboard");
    } else {
      redirect("/bookings");
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid input" };
    }
    throw error; // Let Next.js handle redirects
  }
}

// Register action
export async function registerAction(formData: FormData) {
  try {
    const validatedData = registerSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      clubName: formData.get("clubName"),
      role: formData.get("role") || "USER",
    });

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "Email already registered" };
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password);

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create club if registering as owner
      let clubId = null;
      if (validatedData.role === "CLUB_OWNER" && validatedData.clubName) {
        const slug = validatedData.clubName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const club = await tx.club.create({
          data: {
            id: generateId(15),
            name: validatedData.clubName,
            slug: slug + "-" + generateId(6),
            email: validatedData.email.toLowerCase(),
            phone: "",
            address: "",
            city: "Puebla",
            state: "Puebla",
            country: "Mexico",
            status: "PENDING",
            active: false,
          },
        });
        clubId = club.id;
      }

      // Create user
      const user = await tx.user.create({
        data: {
          id: generateId(15),
          email: validatedData.email.toLowerCase(),
          password: hashedPassword,
          name: validatedData.name,
          role: validatedData.role,
          clubId: clubId,
          active: true,
        },
      });

      return { user, clubId };
    });

    // Create session
    const session = await lucia.createSession(result.user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    // Redirect to appropriate page
    if (result.clubId) {
      redirect("/dashboard/setup");
    } else {
      redirect("/bookings");
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    throw error;
  }
}

// Logout action
export async function logoutAction() {
  const { session } = await validateRequest();
  
  if (!session) {
    return { error: "No session" };
  }

  await lucia.invalidateSession(session.id);
  
  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/login");
}