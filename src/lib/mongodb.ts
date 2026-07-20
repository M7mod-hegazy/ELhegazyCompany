import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

/** Returns a connected client promise, or null when MONGODB_URI is unset
 *  (so the lead flow still works via WhatsApp without a database). */
export function getMongo(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }
  return clientPromise;
}
