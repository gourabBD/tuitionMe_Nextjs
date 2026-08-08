import "server-only";
import { MongoClient, ServerApiVersion } from "mongodb";
import { mongoDbName, mongoUri } from "./env";

/**
 * A single MongoClient is memoised on `globalThis` so that Next's dev-mode
 * module reloading — and a warm serverless instance handling many requests —
 * both reuse one connection pool instead of opening a new one each time.
 */

function createClient() {
  return new MongoClient(mongoUri(), {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: false,
    },
    // Fail fast rather than hanging past a serverless function's timeout.
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 20000,
    retryWrites: true,
  });
}

export function getClient() {
  if (!globalThis.__tuitionMeMongo) {
    const client = createClient();
    const promise = client.connect().catch((err) => {
      // Drop the memo so the next request gets a fresh connection attempt
      // instead of permanently reusing a rejected promise.
      globalThis.__tuitionMeMongo = undefined;
      throw err;
    });
    globalThis.__tuitionMeMongo = { client, promise };
  }
  return globalThis.__tuitionMeMongo.promise;
}

export async function getDb() {
  const client = await getClient();
  return client.db(mongoDbName());
}

export async function services() {
  return (await getDb()).collection("services");
}

export async function reviews() {
  // Kept as "review" (singular) to stay compatible with the data written by
  // the previous Express server.
  return (await getDb()).collection("review");
}

export async function enrollments() {
  return (await getDb()).collection("enrollments");
}

/**
 * Shared with the Auth.js MongoDB adapter: Google sign-ins land here as
 * adapter-managed documents, and credentials accounts are the same documents
 * with an added `passwordHash`.
 */
export async function users() {
  return (await getDb()).collection("users");
}

export async function rateLimits() {
  return (await getDb()).collection("ratelimits");
}
