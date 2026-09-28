// Run one SQL statement against this site's database and print any rows.
// Usage: pnpm db:sql "ALTER TABLE leads ADD COLUMN source TEXT"
import { createClient } from "@libsql/client";

const sql = process.argv.slice(2).join(" ").trim();
if (!sql) {
  console.error('Usage: pnpm db:sql "<SQL statement>"');
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const result = await client.execute(sql);
if (result.columns.length) console.log(JSON.stringify(result.rows, null, 2));
else console.log(`OK (${result.rowsAffected} rows affected)`);
