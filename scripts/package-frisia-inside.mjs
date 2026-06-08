import {createHash} from 'node:crypto'
import {existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'inside', 'out')
const databaseDir = path.join(repoRoot, 'inside', 'database')
const runtimeMarketData = path.join(repoRoot, 'data', 'market', 'runtime', 'leadgen_market_data.json')
const websiteLocationsData = path.join(repoRoot, 'data', 'market', 'runtime', 'website_locations.json')
const seoLocationEnrichmentsData = path.join(repoRoot, 'data', 'market', 'runtime', 'seo_location_enrichments.json')
const packageDir = path.join(repoRoot, 'inside', 'deploy', 'package')

function walk(dir, base = dir) {
  const entries = []
  for (const name of readdirSync(dir)) {
    const fullPath = path.join(dir, name)
    const relativePath = path.relative(base, fullPath)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      entries.push(...walk(fullPath, base))
    } else {
      entries.push({fullPath, relativePath, size: stat.size})
    }
  }
  return entries
}

if (!existsSync(outDir)) {
  throw new Error('inside/out fehlt. Erst ausfuehren: npm run build:inside')
}

mkdirSync(packageDir, {recursive: true})

const files = [
  ...walk(outDir),
  ...(existsSync(databaseDir)
    ? walk(databaseDir).map((file) => ({
        ...file,
        relativePath: path.join('private', 'database', file.relativePath),
      }))
    : []),
  ...(existsSync(runtimeMarketData)
    ? [
        {
          fullPath: runtimeMarketData,
          relativePath: path.join('private', 'import', 'leadgen_market_data.json'),
          size: statSync(runtimeMarketData).size,
        },
      ]
    : []),
  ...(existsSync(websiteLocationsData)
    ? [
        {
          fullPath: websiteLocationsData,
          relativePath: path.join('private', 'import', 'website_locations.json'),
          size: statSync(websiteLocationsData).size,
        },
      ]
    : []),
  ...(existsSync(seoLocationEnrichmentsData)
    ? [
        {
          fullPath: seoLocationEnrichmentsData,
          relativePath: path.join('private', 'import', 'seo_location_enrichments.json'),
          size: statSync(seoLocationEnrichmentsData).size,
        },
      ]
    : []),
]
const manifest = files.map((file) => {
  const sha256 = createHash('sha256').update(readFileSync(file.fullPath)).digest('hex')
  return `${sha256}  ${file.relativePath}  ${file.size}`
})

const manifestPath = path.join(packageDir, 'frisia-inside-manifest.sha256.txt')
writeFileSync(
  manifestPath,
  [
    'Frisia Inside deployment manifest',
    `Created: ${new Date().toISOString()}`,
    `Files: ${files.length}`,
    '',
    ...manifest,
    '',
  ].join('\n')
)

console.log(`Frisia Inside package manifest written: ${manifestPath}`)
console.log(`Files: ${files.length}`)
