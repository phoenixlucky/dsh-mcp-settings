/**
 * Pack the publishable tarball from a clean staging copy.
 *
 * npm and pnpm always include files whose name starts with `readme`, so the local pairing record
 * `README.i18n.yaml` cannot be excluded through `files` or `.npmignore` (verified 2026-11-23: a
 * `!README.i18n.yaml` entry and an `.npmignore` rule both leave it in the tarball). Moving or
 * renaming it is not an option either: the bilingual pairing tool derives the record path from
 * the README it verifies, so the record has to stay where it is.
 *
 * This script stages every git-tracked file except that record and packs inside the staging copy,
 * so the tarball keeps matching `files` without shipping the local record. Publish the resulting
 * tarball with:
 *
 *   pnpm publish ./tinyforge-dsh-mcp-settings-<version>.tgz --no-git-checks --access public
 *
 * Usage:
 *   node scripts/pack.mjs             # write the tarball into the repository root
 *   node scripts/pack.mjs --dry-run   # list the tarball contents without writing it
 *
 * Exit code: the packer's own status. The staging directory is removed either way.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repository root, resolved from this script's location. */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
/** Local records that must stay out of the published tarball. */
const LOCAL_RECORDS = new Set(['README.i18n.yaml']);
/** Staging directory, inside the workspace so the OS temp area is not involved. */
const staging = join(repoRoot, '.pack-staging');
const dryRun = process.argv.includes('--dry-run');

/** List git-tracked paths; untracked and ignored files never reach the tarball anyway. */
const tracked = spawnSync('git', ['ls-files', '-z'], { cwd: repoRoot, encoding: 'utf8' });
if (tracked.status !== 0) {
  console.error(`pack: git ls-files failed: ${tracked.stderr?.trim() || tracked.status}`);
  process.exit(1);
}
const files = tracked.stdout.split('\0').filter((file) => file !== '' && !LOCAL_RECORDS.has(file));

rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });
for (const file of files) {
  const source = join(repoRoot, file);
  if (!existsSync(source)) continue;
  const target = join(staging, file);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target);
}

// A single command string keeps Windows' `pnpm.cmd` resolution working without passing an
// argument list through a shell; every part below is a constant or a repository-local path.
const packCommand = ['pnpm', 'pack', ...(dryRun ? ['--dry-run'] : []), '--pack-destination', `"${repoRoot}"`].join(' ');
const pack = spawnSync(packCommand, { cwd: staging, stdio: 'inherit', shell: true });
rmSync(staging, { recursive: true, force: true });
if (pack.status !== 0) {
  console.error(`pack: pnpm pack exited with ${pack.status}`);
  process.exit(pack.status ?? 1);
}

if (!dryRun) {
  const fresh = readdirSync(repoRoot)
    .filter((file) => file.endsWith('.tgz'))
    .map((file) => ({ file, stats: statSync(join(repoRoot, file)) }))
    .sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs);
  const newest = fresh[0];
  console.log(newest === undefined
    ? '\npack: no tarball appeared in the repository root'
    : `\npack: ${join(repoRoot, newest.file)} (${newest.stats.size} B, ${newest.stats.mtime.toISOString()})`);
}
