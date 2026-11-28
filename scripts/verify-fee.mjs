import dns from "node:dns";
import { readFileSync } from "node:fs";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match && !process.env[match[1].trim()]) {
    process.env[match[1].trim()] = match[2];
  }
}

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB_NAME?.trim() || "alumni_registration";
if (!uri) {
  console.error("missing uri");
  process.exit(1);
}

await mongoose.connect(uri, { dbName });
const col = mongoose.connection.db.collection("alumniprofiles");
const user = await col.findOne({ role: "user" }, { projection: { feePaid: 1, fullName: 1 } });
if (!user) {
  console.log(JSON.stringify({ ok: true, note: "no-user" }));
  await mongoose.disconnect();
  process.exit(0);
}

const before = Boolean(user.feePaid);
const next = !before;
await col.updateOne({ _id: user._id }, { $set: { feePaid: next } });
const after = await col.findOne({ _id: user._id }, { projection: { feePaid: 1 } });
const confirmed = after?.feePaid === next;
await col.updateOne({ _id: user._id }, { $set: { feePaid: before } });
console.log(
  JSON.stringify({
    before,
    next,
    stored: after?.feePaid,
    confirmed,
  }),
);
await mongoose.disconnect();
process.exit(confirmed ? 0 : 1);
