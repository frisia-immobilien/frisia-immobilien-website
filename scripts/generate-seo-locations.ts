import { generateSeoLocations, getSql, loadLocalEnv, repoRootFromScript } from "./market-data-utils.ts";

async function main() {
  const repoRoot = repoRootFromScript();
  loadLocalEnv(repoRoot);
  const sql = getSql();
  await generateSeoLocations(sql);
  console.log(JSON.stringify({ success: true }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
