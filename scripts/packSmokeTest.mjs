#!/usr/bin/env node
/**
 * Packaging smoke test.
 *
 * Builds the package exactly as `npm publish` would, installs the resulting
 * tarball into a throwaway project, and imports it from both module systems.
 *
 * This is the only layer that sees the package the way a consumer does. Every
 * unit test in this repo imports `src/` directly, so a wrong `types` path, a
 * missing `files` entry or a build that never ran all stay green right up to
 * the moment somebody installs the published version.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

/** Every runtime export, as the barrel advertises it. */
const EXPECTED_EXPORTS = [
  'scrollClass',
  'setIntersection',
  'activateIntersection',
  'activateIntersectionOnce',
  'setLazyload',
  'setLazyAttributes',
  'applyLazyVideo',
  'applyLazyPicture',
  'applyLazyImage',
  'activateLazyload',
  'shyel',
  'stickyel',
];

const run = (command, parameters, cwd) =>
  execFileSync(command, parameters, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const workspace = mkdtempSync(path.join(tmpdir(), 'pack-smoke-'));
const failures = [];
const note = (message) => {
  process.stdout.write(`  ${message}\n`);
};

try {
  process.stdout.write('packaging smoke test\n');

  // 1. Build, so the tarball carries what a publish would carry.
  run('npm', ['run', 'build'], repoRoot);
  note('build ok');

  // 2. Pack. The last line of npm pack's output is the tarball filename.
  const packOutput = run('npm', ['pack', '--pack-destination', workspace], repoRoot);
  const tarball = path.join(workspace, packOutput.trim().split('\n').at(-1).trim());
  note(`packed ${tarball.split('/').at(-1)}`);

  // 3. Install it into a project that knows nothing about this repo.
  const consumer = path.join(workspace, 'consumer');
  mkdirSync(consumer);
  writeFileSync(
    path.join(consumer, 'package.json'),
    JSON.stringify({ name: 'consumer', version: '1.0.0', private: true }, undefined, 2)
  );
  run('npm', ['install', tarball, '--no-audit', '--no-fund', '--silent'], consumer);
  note('installed into a clean project');

  const installed = path.join(consumer, 'node_modules', manifest.name);

  // 4. The declared types entry has to exist inside the tarball, not just in
  //    the working tree. A wrong path here leaves TypeScript consumers with no
  //    types at all and no error to explain why.
  const typesEntry = path.join(installed, manifest.types);
  if (existsSync(typesEntry)) note(`types entry resolves (${manifest.types})`);
  else failures.push(`declared types entry is missing from the package: ${manifest.types}`);

  const mainEntry = path.join(installed, manifest.main);
  if (existsSync(mainEntry)) note(`main entry resolves (${manifest.main})`);
  else failures.push(`declared main entry is missing from the package: ${manifest.main}`);

  // 5. Import it for real, from both module systems, and call something.
  const probeBody = (importLine) => `
${importLine}

const missing = ${JSON.stringify(EXPECTED_EXPORTS)}.filter(
  (name) => typeof api[name] !== 'function'
);
if (missing.length > 0) {
  console.error('MISSING_EXPORTS ' + missing.join(','));
  process.exit(1);
}

// A real call, on the one path that needs no DOM: no elements to observe.
if (api.setIntersection(null) !== false) {
  console.error('setIntersection(null) did not return false');
  process.exit(1);
}
// A real call that returns a teardown, exercising the null-element guard.
if (typeof api.scrollClass(null, []) !== 'function') {
  console.error('scrollClass(null, []) did not return a teardown');
  process.exit(1);
}
console.log('OK');
`;

  writeFileSync(
    path.join(consumer, 'probe.mjs'),
    probeBody(`import * as api from ${JSON.stringify(manifest.name)};`)
  );
  writeFileSync(
    path.join(consumer, 'probe.cjs'),
    probeBody(`const api = require(${JSON.stringify(manifest.name)});`)
  );

  for (const [label, file] of [
    ['ESM', 'probe.mjs'],
    ['CJS', 'probe.cjs'],
  ]) {
    try {
      run('node', [file], consumer);
      note(`${label} import ok, ${String(EXPECTED_EXPORTS.length)} exports callable`);
    } catch (error) {
      const detail = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim().split('\n').at(-1);
      failures.push(`${label} import failed: ${detail}`);
    }
  }

  // 6. Named ESM imports are the shape consumers actually write. They rely on
  //    Node statically detecting the named exports of a CommonJS build, which
  //    is not guaranteed, so they get their own check rather than riding on the
  //    namespace import above.
  writeFileSync(
    path.join(consumer, 'named.mjs'),
    `import { setIntersection, shyel } from ${JSON.stringify(manifest.name)};
if (typeof setIntersection !== 'function' || typeof shyel !== 'function')
  { console.error('named imports did not resolve to functions'); process.exit(1); }
console.log('OK');
`
  );
  try {
    run('node', ['named.mjs'], consumer);
    note('ESM named imports ok');
  } catch (error) {
    const detail = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim().split('\n').at(-1);
    failures.push(`ESM named imports failed: ${detail}`);
  }
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

if (failures.length > 0) {
  process.stderr.write('\npackaging smoke test FAILED\n');
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`);
  process.exit(1);
}

process.stdout.write('packaging smoke test passed\n');
