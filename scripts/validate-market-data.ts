import {
  collectMarketRecords,
  getImportDir,
  getImportFiles,
  loadLocalEnv,
  repoRootFromScript,
  writeImportErrors,
} from "./market-data-utils.ts";

const repoRoot = repoRootFromScript();
loadLocalEnv(repoRoot);

const importDir = getImportDir(repoRoot);
const files = getImportFiles(importDir);
const { records, errors } = collectMarketRecords(files);
const errorFile = writeImportErrors(repoRoot, errors);

console.log(
  JSON.stringify(
    {
      success: errors.length === 0,
      importDir,
      files: files.length,
      validRecords: records.length,
      errors: errors.length,
      errorFile,
    },
    null,
    2,
  ),
);

if (errors.length > 0) process.exit(1);
