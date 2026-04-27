import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "../web/node_modules/@neondatabase/serverless/index.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = path.join(rootDir, "web", ".env.local");
  const raw = readFileSync(envPath, "utf8");

  for (const line of raw.split(/\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

function readDollarTag(sql, index) {
  const match = sql.slice(index).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
  return match?.[0] ?? null;
}

function splitSql(sql) {
  const statements = [];
  let current = "";
  let singleQuoted = false;
  let doubleQuoted = false;
  let lineComment = false;
  let blockComment = false;
  let dollarTag = null;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      current += char;
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      current += char;
      if (char === "*" && next === "/") {
        current += next;
        index += 1;
        blockComment = false;
      }
      continue;
    }

    if (singleQuoted) {
      current += char;
      if (char === "'" && next === "'") {
        current += next;
        index += 1;
      } else if (char === "'") {
        singleQuoted = false;
      }
      continue;
    }

    if (doubleQuoted) {
      current += char;
      if (char === '"' && next === '"') {
        current += next;
        index += 1;
      } else if (char === '"') {
        doubleQuoted = false;
      }
      continue;
    }

    if (dollarTag) {
      if (sql.startsWith(dollarTag, index)) {
        current += dollarTag;
        index += dollarTag.length - 1;
        dollarTag = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "-" && next === "-") {
      current += char + next;
      index += 1;
      lineComment = true;
      continue;
    }

    if (char === "/" && next === "*") {
      current += char + next;
      index += 1;
      blockComment = true;
      continue;
    }

    if (char === "'") {
      current += char;
      singleQuoted = true;
      continue;
    }

    if (char === '"') {
      current += char;
      doubleQuoted = true;
      continue;
    }

    const tag = char === "$" ? readDollarTag(sql, index) : null;
    if (tag) {
      current += tag;
      index += tag.length - 1;
      dollarTag = tag;
      continue;
    }

    if (char === ";") {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

loadEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL ist nicht gesetzt.");
}

const migrationPath = process.argv[2] || path.join(rootDir, "web", "supabase", "migrations", "20260426000000_leadgen_seo_schema.sql");
const migration = readFileSync(migrationPath, "utf8");
const statements = splitSql(migration);
const sql = neon(process.env.DATABASE_URL);

for (const [index, statement] of statements.entries()) {
  await sql.query(statement, []);
  console.log(`ok ${index + 1}/${statements.length}`);
}

console.log("migration_ok");
