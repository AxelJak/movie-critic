import PocketBase from "pocketbase";
import { cookies } from "next/headers";
import { User } from "./types";

/**
 * Get a server-side PocketBase instance with auth from cookies
 * This should only be used in Server Components or Server Actions
 */
export async function getPocketBaseServer() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');

  if (authCookie) {
    pb.authStore.loadFromCookie(`pb_auth=${authCookie.value}`);
  }

  return pb;
}

/**
 * Get current authenticated user from server-side
 */
export async function getCurrentUserServer(): Promise<User | null> {
  const pb = await getPocketBaseServer();

  if (!pb.authStore.isValid) {
    return null;
  }

  return pb.authStore.record as unknown as User;
}

/**
 * Check if user is authenticated server-side
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  const pb = await getPocketBaseServer();
  return pb.authStore.isValid;
}
