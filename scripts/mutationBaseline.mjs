#!/usr/bin/env node
/**
 * Per-file mutation score floors.
 *
 * A single global percentage lets a well-tested file carry a weak one: add a
 * hundred trivially-killed mutants in one file and the average hides a module
 * nothing asserts against. Every file therefore holds its own floor, and the
 * floor only ever moves up.
 *
 * Run `npm run test:mutation` first; this reads the report it leaves behind.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const reportPath = path.resolve(repoRoot, 'reports/mutation/mutation.json');
const baselinePath = path.resolve(repoRoot, 'mutation-baseline.json');

/** Scores are compared at two decimals; anything finer is scheduling noise. */
const round = (value) => Math.round(value * 100) / 100;
const EPSILON = 0.01;

if (!existsSync(reportPath)) {
  process.stderr.write(
    `no mutation report at ${reportPath}\nrun \`npm run test:mutation\` first\n`
  );
  process.exit(1);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));

/** Stryker statuses, grouped the way the mutation-testing spec defines the scores. */
const summarise = (mutants) => {
  const count = (...statuses) => mutants.filter((m) => statuses.includes(m.status)).length;
  const detected = count('Killed', 'Timeout');
  const survived = count('Survived');
  const noCoverage = count('NoCoverage');
  const valid = detected + survived + noCoverage;
  const covered = detected + survived;
  return {
    detected,
    survived,
    noCoverage,
    total: valid,
    covered,
    // "score" counts mutants no test even reaches; "coveredScore" ignores them.
    // The gap between the two is what says which kind of work a file needs.
    score: valid === 0 ? 100 : round((detected / valid) * 100),
    coveredScore: covered === 0 ? 100 : round((detected / covered) * 100),
  };
};

const current = Object.fromEntries(
  Object.entries(report.files)
    .map(([file, { mutants }]) => [file.replaceAll('\\', '/'), summarise(mutants)])
    .toSorted(([a], [b]) => a.localeCompare(b))
);

const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, 'utf8'))
  : { files: {} };

const regressions = [];
const improvements = [];
const added = [];

for (const [file, stats] of Object.entries(current)) {
  const floor = baseline.files[file]?.score;
  if (floor === undefined) added.push([file, stats]);
  else if (stats.score < floor - EPSILON) regressions.push([file, stats, floor]);
  else if (stats.score > floor + EPSILON) improvements.push([file, stats, floor]);
}

const removed = Object.keys(baseline.files).filter((file) => !(file in current));

/**
 * `total` far below `covered` means no test executes the code: the fix is a new
 * test that runs it. Both low and close together means tests do run it without
 * checking the result: the fix is a sharper assertion in a test that exists.
 * They are different work, so the report names which one applies.
 */
const diagnose = ({ survived, noCoverage }) => {
  const notes = [];
  if (noCoverage > 0) notes.push(`${String(noCoverage)} unreached (write a test that executes it)`);
  if (survived > 0) notes.push(`${String(survived)} run but unasserted (sharpen an existing test)`);
  return notes.length > 0 ? ` — ${notes.join(', ')}` : '';
};

const line = (file, stats) =>
  `${file}  ${String(stats.score)}% of ${String(stats.total)} (covered ${String(stats.coveredScore)}%)${diagnose(stats)}`;

process.stdout.write('per-file mutation scores\n');
for (const [file, stats] of Object.entries(current)) process.stdout.write(`  ${line(file, stats)}\n`);

if (regressions.length > 0) {
  process.stderr.write('\nmutation score regressed\n');
  for (const [file, stats, floor] of regressions)
    process.stderr.write(
      `  ${file}: ${String(stats.score)}% is below its floor of ${String(floor)}%${diagnose(stats)}\n`
    );
  process.stderr.write(
    '\nThe floors are not rewritten. Raise the score back, or make the deliberate\n' +
      'case for lowering the floor in the same commit that lowers it.\n'
  );
  process.exit(1);
}

if (improvements.length === 0 && added.length === 0 && removed.length === 0) {
  process.stdout.write('\nevery file holds its floor\n');
  process.exit(0);
}

for (const [file, stats] of [...improvements.map(([f, s]) => [f, s]), ...added])
  baseline.files[file] = { score: stats.score, mutants: stats.total };
baseline.files = Object.fromEntries(
  Object.entries(baseline.files)
    .filter(([file]) => !removed.includes(file))
    .toSorted(([a], [b]) => a.localeCompare(b))
);
baseline['//'] =
  'Per-file mutation score floors, written by scripts/mutationBaseline.mjs. ' +
  'A file may only ever be recorded higher; a drop fails the check instead.';

mkdirSync(path.dirname(baselinePath), { recursive: true });
writeFileSync(baselinePath, `${JSON.stringify(baseline, undefined, 2)}\n`);

process.stdout.write('\nbaseline updated\n');
for (const [file, stats, floor] of improvements)
  process.stdout.write(`  ${file}: ${String(floor)}% -> ${String(stats.score)}%\n`);
for (const [file, stats] of added)
  process.stdout.write(`  ${file}: new, recorded at ${String(stats.score)}%${diagnose(stats)}\n`);
for (const file of removed) process.stdout.write(`  ${file}: gone, floor dropped\n`);
