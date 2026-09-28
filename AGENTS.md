<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Site database

This site has its own database (Turso, which is SQLite). Shipyard sets `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in the preview and in production. The live database is the source of truth: people can also add tables, columns, and rows in Shipyard's Database view.

- Read and write data with `db` from `@/lib/db` (Drizzle). Don't add another database client, ORM, or store.
- Change tables with SQL: `pnpm db:sql "CREATE TABLE leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))"`. Then run `pnpm db:pull`, which regenerates `db/schema.ts` and `db/relations.ts` from the database.
- Run `pnpm db:pull` before you use a table, in case its columns changed. Never edit `db/schema.ts` by hand, and never run `drizzle-kit push`: it would drop tables and columns that were added outside the code.
- Only make additive changes (new tables, or new columns that are nullable or have a default) unless the user asks for something else. The preview and production share the database.
- Leave `_shipyard_*` tables alone. They hold the Database view's settings.
- Don't keep data that must persist in module memory, `localStorage`, or files.
