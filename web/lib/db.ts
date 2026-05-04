import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env";

type SqlClient = ReturnType<typeof neon>;

let cachedSql: SqlClient | null = null;

function getSql() {
  cachedSql ??= neon(env.DATABASE_URL);
  return cachedSql;
}

export const sql = new Proxy(
  ((strings: TemplateStringsArray, ...params: unknown[]) => getSql()(strings, ...params)) as SqlClient,
  {
    get(_target, property) {
      const value = Reflect.get(getSql(), property);
      return typeof value === "function" ? value.bind(getSql()) : value;
    },
  },
);
