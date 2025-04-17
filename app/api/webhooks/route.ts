import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { WebhookEvent } from "@clerk/nextjs/webhooks";
import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";

// Only import the types we need
import type { UserWebhookEvent } from "@clerk/nextjs/webhooks";

// Define specific webhook event types we care about
type UserCreatedEvent = UserWebhookEvent & {
  type: "user.created";
  data: UserWebhookEvent["data"];
};

type UserDeletedEvent = WebhookEvent & {
  type: "user.deleted";
  data: UserWebhookEvent["data"];
};

// Union type of events we handle
type SupportedWebhookEvent = UserCreatedEvent | UserDeletedEvent;

export async function POST(req: Request) {
  try {
    const evt = (await verifyWebhook(req)) as SupportedWebhookEvent;

    // Type narrowing for the event
    if (evt.type === "user.created") {
      await createUser(evt.data.id);
    } else if (evt.type === "user.deleted" && evt.data.id) {
      await deleteUser(evt.data.id);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Error processing webhook", { status: 400 });
  }
}

// Create a new user in the database - only storing the ID
async function createUser(userId: string) {
  try {
    await db.insert(users).values({ id: userId });
    console.log(`User created: ${userId}`);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Delete a user from the database
async function deleteUser(userId: string) {
  try {
    await db.delete(users).where(eq(users.id, userId));
    console.log(`User deleted: ${userId}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
