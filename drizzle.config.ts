import { defineConfig } from "drizzle-kit";

// The live database is the source of truth. `pnpm db:pull` regenerates
// db/schema.ts from it; never edit that file by hand.
export default defineConfig({
  dialect: "turso",
  out: "./db",
  // Shipyard's own metadata (column display types for the Database view).
  tablesFilter: ["!_shipyard_*"],
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
