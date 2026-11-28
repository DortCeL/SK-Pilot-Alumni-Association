import dns from "node:dns";
import mongoose from "mongoose";

const uri = () => process.env.MONGODB_URI?.trim() ?? "";
const dbName = () => process.env.MONGODB_DB_NAME?.trim() || "alumni_registration";

declare global {
  var mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

function usePublicDnsForAtlas(mongoUri: string) {
  if (!mongoUri.startsWith("mongodb+srv://")) return;
  const servers = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

export async function connectDB() {
  const mongoUri = uri();
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  usePublicDnsForAtlas(mongoUri);

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        dbName: dbName(),
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  const { ensureAdmin } = await import("@/lib/seed-admin");
  await ensureAdmin();
  const { ensureRegistrationNumbers } = await import("@/lib/registration-number");
  await ensureRegistrationNumbers();
  return cached.conn;
}