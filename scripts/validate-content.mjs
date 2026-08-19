import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.resolve(__dirname, '../src/content/mawaqif');
const poolFile = path.resolve(__dirname, '../src/content/pool.ts');

const validAxes = [
  "spouses_family", "companions", "children", "servants",
  "neighbors_guests", "those_who_erred", "afflicted_weak",
  "elders_public", "adversaries"
];

const validBridgeCollections = ["bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah"];
const allowedBridgeRefs = [
  { collection: "muslim", reference: "202" },
  { collection: "muslim", reference: "249" },
  { collection: "muslim", reference: "199" },
  { collection: "muslim", reference: "2832" },
  { collection: "bukhari", reference: "6171" },
  { collection: "tirmidhi", reference: "1956" }
];

let hasError = false;
function error(msg) {
  console.error(`❌ ${msg}`);
  hasError = true;
}

const poolContent = fs.readFileSync(poolFile, 'utf-8');
const poolMatches = [...poolContent.matchAll(/"mawqif_\d{4}"/g)].map(m => m[0].replace(/"/g, ''));
const poolSet = new Set(poolMatches);
if (poolSet.size !== poolMatches.length) {
  error(`Duplicate IDs in pool.ts`);
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.json')) {
      validateFile(fullPath);
    }
  }
}

function wordCount(str) {
  return str.trim().split(/\s+/).length;
}

function validateFile(filePath) {
  const fileName = path.basename(filePath, '.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (data.id !== fileName) error(`${fileName}: ID mismatch (${data.id})`);
    if (!poolSet.has(data.id)) error(`${fileName}: Not in pool.ts`);
    if (!validAxes.includes(data.axis)) error(`${fileName}: Invalid axis ${data.axis}`);
    
    if (!data.openingLine || wordCount(data.openingLine) > 12) {
      error(`${fileName}: openingLine missing or > 12 words`);
    }

    const wc = wordCount(data.situation.text);
    if (wc < 170 || wc > 240) error(`${fileName}: situation.text word count ${wc} not in 170-240`);
    if (data.situation.attributionType !== "paraphrase") error(`${fileName}: situation attributionType must be paraphrase`);
    if (data.situation.verifiedVerbatim !== false) error(`${fileName}: situation verifiedVerbatim must be false`);
    
    const allSources = [...(data.primarySources || []), ...(data.bridgeRefs || [])];
    for (const src of allSources) {
      if (src.matn !== "") error(`${fileName}: matn must be empty string`);
      if (src.matnVerified !== false) error(`${fileName}: matnVerified must be false`);
      if (src.referenceVerified !== false) error(`${fileName}: referenceVerified must be false`);
      if (!src.sourceUrl.includes('sunnah.com') && !src.sourceUrl.includes('dorar.net')) {
        error(`${fileName}: sourceUrl must be sunnah.com or dorar.net`);
      }
    }

    if (data.bridgeRefs) {
      if (data.bridgeRefs.length > 1 && fileName !== 'mawqif_0006') error(`${fileName}: max 1 bridgeRef allowed`);
      for (const ref of data.bridgeRefs) {
        const isAllowed = allowedBridgeRefs.some(a => a.collection === ref.collection && a.reference === ref.reference);
        if (!isAllowed) error(`${fileName}: Bridge ref ${ref.collection}:${ref.reference} not in allowed list`);
      }
    }

    if (data.sharhNote) {
      if (data.sharhNote.attributionType !== "paraphrase") error(`${fileName}: sharhNote attributionType must be paraphrase`);
      if (data.sharhNote.verifiedVerbatim !== false) error(`${fileName}: sharhNote verifiedVerbatim must be false`);
    }

    if (!data.closingReflection) error(`${fileName}: Missing closingReflection`);
    if (!data.applications || data.applications.length < 1 || data.applications.length > 3) {
      error(`${fileName}: Must have 1-3 applications`);
    }
    if (data.reviewStatus !== "pending_review") error(`${fileName}: reviewStatus must be pending_review`);

  } catch (e) {
    error(`${fileName}: Parse/read error - ${e.message}`);
  }
}

walk(contentDir);

if (hasError) {
  process.exit(1);
} else {
  console.log('✅ Content validation passed');
}
