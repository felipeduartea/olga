import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const runMigrations = async () => {
  console.log("⏳ Running migrations...");

  const migrationClient = postgres(process.env.DIRECT_URL!, { max: 1 });
  const db = drizzle(migrationClient);

  await migrate(db, { migrationsFolder: "./drizzle" });

  await migrationClient.end();

  console.log("✅ Migrations completed!");
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error("❌ Migration failed!");
  console.error(err);
  process.exit(1);
});

