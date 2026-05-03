import { readFileSync } from "node:fs";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import pg from "pg";

function loadEnvFile(path) {
  const raw = readFileSync(path, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1).replace(/^"|"$/g, "");
    process.env[key] ??= value;
  }
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

async function checkDatabase() {
  const client = new pg.Client({
    connectionString: requireEnv("DATABASE_URL"),
  });

  await client.connect();
  const result = await client.query("select current_database() as database_name, current_user as user_name");
  await client.end();

  return result.rows[0];
}

async function checkR2() {
  const bucket = requireEnv("CLOUDFLARE_R2_BUCKET");
  const client = new S3Client({
    region: "auto",
    endpoint: requireEnv("CLOUDFLARE_R2_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    },
  });

  await client.send(new HeadBucketCommand({ Bucket: bucket }));

  return { bucket };
}

loadEnvFile(".env.local");

const database = await checkDatabase();
const r2 = await checkR2();

console.log(`Neon connection ok: database=${database.database_name}, user=${database.user_name}`);
console.log(`R2 connection ok: bucket=${r2.bucket}`);
