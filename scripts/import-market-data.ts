import {
  collectMarketRecords,
  generateSeoLocations,
  getImportDir,
  getImportFiles,
  getSql,
  loadLocalEnv,
  repoRootFromScript,
  upsertMarketRecords,
  upsertPriceHistory,
  writeImportErrors,
} from "./market-data-utils.ts";

async function main() {
  const repoRoot = repoRootFromScript();
  loadLocalEnv(repoRoot);

  const importDir = getImportDir(repoRoot);
  const files = getImportFiles(importDir);
  if (files.length === 0) {
    throw new Error(`Keine .xlsx-Dateien im Importordner gefunden: ${importDir}`);
  }

  const { records, errors } = collectMarketRecords(files);
  const errorFile = writeImportErrors(repoRoot, errors);

  if (errors.length > 0) {
    console.warn(`${errors.length} fehlerhafte Zeilen wurden protokolliert: ${errorFile}`);
  }

  const sql = getSql();
  await upsertMarketRecords(sql, records);
  await upsertPriceHistory(sql, records);
  await generateSeoLocations(sql);

  console.log(
    JSON.stringify(
      {
        success: true,
        importDir,
        files: files.length,
        importedRecords: records.length,
        errors: errors.length,
        errorFile,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
