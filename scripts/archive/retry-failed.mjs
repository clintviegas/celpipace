#!/usr/bin/env node
// Retry the 73 files that failed during the initial upload
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const BUCKET = process.argv[2] || 'celpipace';
const PUBLIC_DIR = path.resolve('public');
const CONCURRENCY = 5; // lower concurrency for retries

const failed = [
  'audio/L1/set-01/line-03.mp3',
  'audio/L1/set-01/line-05.mp3',
  'audio/L1/set-02/line-12.mp3',
  'audio/L1/set-04/line-12.mp3',
  'audio/L1/set-05/line-08.mp3',
  'audio/L1/set-07/line-00.mp3',
  'audio/L1/set-07/line-03.mp3',
  'audio/L1/set-07/line-05.mp3',
  'audio/L1/set-07/line-06.mp3',
  'audio/L1/set-11/line-04.mp3',
  'audio/L1/set-13/line-12.mp3',
  'audio/L1/set-14/line-01.mp3',
  'audio/L1/set-15/line-00.mp3',
  'audio/L1/set-15/line-01.mp3',
  'audio/L1/set-15/line-05.mp3',
  'audio/L1/set-15/line-06.mp3',
  'audio/L1/set-17/line-08.mp3',
  'audio/L1/set-18/line-06.mp3',
  'audio/L1/set-19/line-05.mp3',
  'audio/L1/set-19/line-12.mp3',
  'audio/L1/set-20/line-06.mp3',
  'audio/L1/set-20/line-09.mp3',
  'audio/L1/set-20/line-10.mp3',
  'audio/L2/set-02/line-01.mp3',
  'audio/L2/set-05/line-03.mp3',
  'audio/L2/set-06/line-06.mp3',
  'audio/L2/set-08/line-04.mp3',
  'audio/L2/set-10/line-01.mp3',
  'audio/L2/set-11/line-06.mp3',
  'audio/L2/set-12/line-01.mp3',
  'audio/L2/set-13/line-06.mp3',
  'audio/L2/set-17/line-11.mp3',
  'audio/L2/set-18/line-09.mp3',
  'audio/L2/set-19/line-03.mp3',
  'audio/L3/set-02/line-02.mp3',
  'audio/L3/set-11/line-00.mp3',
  'audio/L3/set-11/line-04.mp3',
  'audio/L3/set-12/line-03.mp3',
  'audio/L3/set-14/line-06.mp3',
  'audio/L3/set-15/line-02.mp3',
  'audio/L3/set-17/line-03.mp3',
  'audio/L4/set-05/line-00.mp3',
  'audio/L4/set-08/line-00.mp3',
  'audio/L5/set-01/line-05.mp3',
  'audio/L5/set-02/line-08.mp3',
  'audio/L5/set-03/line-03.mp3',
  'audio/L5/set-04/line-10.mp3',
  'audio/L5/set-05/line-08.mp3',
  'audio/L5/set-07/line-03.mp3',
  'audio/L5/set-09/line-05.mp3',
  'audio/L5/set-09/line-10.mp3',
  'audio/L5/set-10/line-09.mp3',
  'audio/L5/set-11/line-02.mp3',
  'audio/L5/set-11/line-03.mp3',
  'audio/L5/set-12/line-01.mp3',
  'audio/L5/set-13/line-04.mp3',
  'audio/L5/set-13/line-07.mp3',
  'audio/L5/set-14/line-05.mp3',
  'audio/L5/set-15/line-03.mp3',
  'audio/L5/set-17/line-01.mp3',
  'audio/L5/set-18/line-07.mp3',
  'audio/L5/set-19/line-00.mp3',
  'audio/L6/set-05/line-06.mp3',
  'audio/L6/set-07/line-09.mp3',
  'audio/L6/set-11/line-07.mp3',
  'audio/L6/set-14/line-09.mp3',
  'audio/L6/set-15/line-00.mp3',
  'audio/L6/set-17/line-04.mp3',
  'audio/L6/set-17/line-09.mp3',
  'audio/L6/set-19/line-06.mp3',
  'audio/L6/set-19/line-09.mp3',
  'audio/L6/set-20/line-04.mp3',
  'images/S4/9.png',
];

function upload(relPath) {
  const local = path.join(PUBLIC_DIR, relPath);
  if (!existsSync(local)) { console.log(`  ⚠ missing: ${relPath}`); return false; }
  try {
    execSync(`wrangler r2 object put "${BUCKET}/${relPath}" --file="${local}" --remote`, {
      stdio: 'pipe', timeout: 30000,
    });
    return true;
  } catch { return false; }
}

async function run() {
  let ok = 0, fail = 0;
  const stillFailed = [];

  // Process in batches
  for (let i = 0; i < failed.length; i += CONCURRENCY) {
    const batch = failed.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(f => new Promise(resolve => {
        const success = upload(f);
        resolve({ file: f, success });
      }))
    );
    for (const r of results) {
      if (r.success) { ok++; process.stdout.write(`  ✓ ${r.file}\n`); }
      else { fail++; stillFailed.push(r.file); process.stdout.write(`  ✗ ${r.file}\n`); }
    }
    process.stdout.write(`  Progress: ${ok + fail}/${failed.length}\n`);
  }

  console.log(`\n✅ Retry done — ${ok} uploaded, ${fail} still failed`);
  if (stillFailed.length) {
    console.log('Still failed:');
    stillFailed.forEach(f => console.log(`  ${f}`));
  }
}

run();
