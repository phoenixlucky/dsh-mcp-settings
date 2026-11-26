/**
 * Release the version already recorded in `package.json`, in the four steps this repository uses.
 *
 * A release here is four separate actions, and only three of them leave a trace inside the
 * repository: push the commit, publish the npm tarball, and — in between — create a lightweight tag
 * and a GitHub Release. Skipping the tag or the Release is invisible afterwards: `git log` looks
 * complete, `npm view` looks complete, and only `gh release list` shows the hole. That hole appeared
 * twice (1.3.3 and 1.3.4) before this script existed, so every step is planned from observation
 * rather than assumed, and each is skipped when it is already done.
 *
 * The script never edits files and never bumps the version: it releases what the worktree says, so
 * the version bump and its commit stay a deliberate, reviewable edit.
 *
 * Usage:
 *   node scripts/release.mjs                 # do whatever is still missing
 *   node scripts/release.mjs --dry-run       # probe and print the plan, change nothing
 *   node scripts/release.mjs --verify        # only re-check the published artifact against this checkout
 *   node scripts/release.mjs --notes <file>  # Release body from a file (default: generated)
 *   node scripts/release.mjs --title <text>  # Release title (default: "v<version>")
 *   node scripts/release.mjs --skip-tests    # skip the suite (only for a docs-only version)
 *   node scripts/release.mjs --skip-audit    # skip the pre-release MCP audit
 *   node scripts/release.mjs --timeout 600   # seconds to wait for registry propagation
 *
 * Exit code: 0 when every step is complete (including "already complete"), 1 on any refusal or
 * failure. Read the last line to know whether the version is actually on the registry yet.
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repository root, resolved from this script's location. */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
/** Test files that must stay green before a runtime or UI change ships. */
const TEST_FILES = [
  'test-negotiation.mjs',
  'test-skills-manager.mjs',
  'test-typert-metadata.mjs',
  'test-skills-fixture.mjs',
  'test-client-bundle.mjs',
]

const argv = process.argv.slice(2)
const hasFlag = (name) => argv.includes(name)
const optionValue = (name, fallback) => {
  const index = argv.indexOf(name)
  const candidate = index >= 0 ? argv[index + 1] : undefined
  return candidate === undefined || candidate.startsWith('--') ? fallback : candidate
}

const dryRun = hasFlag('--dry-run')
const verifyOnly = hasFlag('--verify')
const skipTests = hasFlag('--skip-tests')
const skipAudit = hasFlag('--skip-audit')
const notesFile = optionValue('--notes', undefined)
const titleOverride = optionValue('--title', undefined)
const timeoutMs = Number(optionValue('--timeout', '600')) * 1000
/** Registry used for the read-back check; publishing goes through pnpm's own configuration. */
const registry = optionValue('--registry', 'https://registry.npmjs.org').replace(/\/$/, '')

const log = (message) => { console.log(message) }
const step = (message) => { console.log(`\n== ${message}`) }

/** Run a command line through the shell (Windows needs it for `pnpm`/`gh` shims) and capture output. */
const capture = (commandLine) => spawnSync(commandLine, { cwd: repoRoot, shell: true, encoding: 'utf8' })

/** Run a command line with output streamed to this terminal. */
const stream = (commandLine) => spawnSync(commandLine, { cwd: repoRoot, shell: true, stdio: 'inherit' })

/** Explain the failure and stop; every refusal names what to fix. */
const refuse = (message) => {
  console.error(`release: ${message}`)
  process.exit(1)
}

const packageJson = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))
const { name: packageName, version } = packageJson
const tagName = `v${version}`
/** pnpm keeps the scope in the filename: `@tinyforge/foo` becomes `tinyforge-foo-<version>.tgz`. */
const tarballName = `${packageName.replace('@', '').replace('/', '-')}-${version}.tgz`
const tarballPath = join(repoRoot, tarballName)

// ---------------------------------------------------------------------------------------------
// Observation: which of the four steps are still missing?
// ---------------------------------------------------------------------------------------------
step(`plan for ${packageName}@${version} (${tagName})`)

const status = capture('git status --porcelain')
if (status.status !== 0) refuse(`git status failed: ${(status.stderr ?? '').trim()}`)
const dirty = (status.stdout ?? '').split('\n').map((line) => line.trim()).filter((line) => line !== '')
// `--verify` writes nothing, so a dirty worktree is not its concern; the mutating steps do care.
if (!verifyOnly && dirty.length > 0) {
  refuse(`the worktree has uncommitted changes; commit them first so the tag matches what ships:\n  ${dirty.join('\n  ')}`)
}

const branch = (capture('git rev-parse --abbrev-ref HEAD').stdout ?? '').trim()
if (!verifyOnly && branch !== 'main') refuse(`releases are cut from main, not ${branch || '(unknown)'}`)

const head = (capture('git rev-parse HEAD').stdout ?? '').trim()
const remoteHead = (capture('git ls-remote origin refs/heads/main').stdout ?? '').trim().split(/\s+/)[0]
const localTag = (capture(`git rev-parse -q --verify refs/tags/${tagName}`).stdout ?? '').trim()
const remoteTag = (capture(`git ls-remote --tags origin refs/tags/${tagName}`).stdout ?? '').trim() !== ''
const releaseListing = capture(`gh release view ${tagName} --json tagName`)
const publishedVersion = capture(`npm view ${packageName}@${version} version`)

const needsPush = remoteHead !== head
const needsTag = localTag === ''
const needsTagPush = !remoteTag
const needsRelease = releaseListing.status !== 0
const needsPublish = publishedVersion.status !== 0
const plan = [
  needsPush ? `push ${head.slice(0, 7)} to origin/main` : `push: already at ${head.slice(0, 7)}`,
  needsTag ? `create tag ${tagName}` : `tag: ${tagName} already exists`,
  needsTagPush ? `push tag ${tagName}` : `tag push: already on origin`,
  needsRelease ? `create GitHub Release ${tagName}` : `release: ${tagName} already exists`,
  needsPublish ? `publish ${tarballName}` : `publish: ${packageName}@${version} already on the registry`,
]
for (const line of plan) log(`  - ${line}`)

const anythingToDo = needsPush || needsTag || needsTagPush || needsRelease || needsPublish
if (!anythingToDo && !verifyOnly) {
  log(`\nrelease: ${packageName}@${version} is already fully released — nothing to do`)
  process.exit(0)
}
if (dryRun) {
  log('\nrelease: dry run, nothing was changed')
  process.exit(0)
}
/** `--verify` never mutates: it re-checks the published artifact against this checkout. */
const execute = !verifyOnly
if (verifyOnly) log('\nrelease: --verify, checking the published artifact only')

// ---------------------------------------------------------------------------------------------
// Gates: the shipped code is tested, and the standing context cost is measured before a release.
// ---------------------------------------------------------------------------------------------
if (execute && needsPublish && !skipTests) {
  step('tests')
  for (const file of TEST_FILES) {
    const result = capture(`node scripts/${file}`)
    if (result.status !== 0) {
      refuse(`${file} failed; fix it before releasing:\n${(result.stdout ?? '') + (result.stderr ?? '')}`)
    }
    log(`  ${file}: passed`)
  }
}

if (execute && needsPublish && !skipAudit) {
  step('mcp audit (informational — a stopped local endpoint is not a release blocker)')
  const audit = capture('node scripts/mcp-audit.mjs')
  const tail = ((audit.stdout ?? '') + (audit.stderr ?? '')).trim().split('\n')
  for (const line of tail.slice(-4)) log(`  ${line}`)
}

// ---------------------------------------------------------------------------------------------
// Pack, then read the tarball back: this is the artifact that ships.
// ---------------------------------------------------------------------------------------------
if (execute && needsPublish) {
  step(`pack ${tarballName}`)
  const pack = stream('node scripts/pack.mjs')
  if (pack.status !== 0) refuse('pack failed')
  if (!existsSync(tarballPath)) refuse(`pack reported success but ${tarballName} is missing`)

  const scratch = mkdtempSync(join(tmpdir(), 'dsh-mcp-release-'))
  try {
    const untar = capture(`tar -xzf "${tarballPath}" -C "${scratch}"`)
    if (untar.status !== 0) refuse(`could not read the tarball: ${(untar.stderr ?? '').trim()}`)
    const shippedPackage = JSON.parse(readFileSync(join(scratch, 'package', 'package.json'), 'utf8'))
    if (shippedPackage.version !== version) refuse(`tarball says ${shippedPackage.version}, package.json says ${version}`)
    if (existsSync(join(scratch, 'package', 'README.i18n.yaml'))) refuse('the tarball contains README.i18n.yaml; pack.mjs should have removed it')

    const digest = (file) => createHash('md5').update(readFileSync(file)).digest('hex')
    const shippedClient = join(scratch, 'package', 'vendor', 'dsh-client-ui-settings-mcp', 'lib', 'client.js')
    const localClient = join(repoRoot, 'vendor', 'dsh-client-ui-settings-mcp', 'lib', 'client.js')
    if (existsSync(shippedClient) && digest(shippedClient) !== digest(localClient)) {
      refuse('the tarball ships a different client.js than the worktree; rebuild the bundle, commit it, and pack again')
    }
    log(`  version ${shippedPackage.version}, no README.i18n.yaml, client.js matches the worktree`)
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
}

// ---------------------------------------------------------------------------------------------
// Execute the missing steps in dependency order.
// ---------------------------------------------------------------------------------------------

/** Ask the registry whether it serves this version yet; undefined while it still does not. */
const waitForVersion = async (budgetMs) => {
  const versionUrl = `${registry}/${packageName.replace('/', '%2F')}/${version}`
  const deadlineAt = Date.now() + budgetMs
  while (Date.now() < deadlineAt) {
    try {
      const response = await fetch(`${versionUrl}?cb=${Date.now()}`, { headers: { 'cache-control': 'no-cache' } })
      if (response.ok) return await response.json()
    } catch {
      /* the CDN does not serve the version yet; keep polling */
    }
    await new Promise((done) => { setTimeout(done, 15000) })
  }
  return undefined
}

if (execute && needsPush) {
  step('push origin main')
  if (stream('git push origin main').status !== 0) refuse('push failed')
}

if (execute && needsTag) {
  step(`tag ${tagName}`)
  if (stream(`git tag ${tagName}`).status !== 0) refuse('could not create the tag')
}
if (execute && needsTagPush) {
  step(`push tag ${tagName}`)
  if (stream(`git push origin ${tagName}`).status !== 0) refuse('could not push the tag')
}

if (execute && needsRelease) {
  step(`GitHub Release ${tagName}`)
  const title = titleOverride ?? tagName
  const notes = notesFile === undefined ? '--generate-notes' : `--notes-file "${notesFile}"`
  if (stream(`gh release create ${tagName} --title "${title}" ${notes} --verify-tag`).status !== 0) {
    refuse('gh release create failed')
  }
}

if (execute && needsPublish) {
  step(`publish ${tarballName}`)
  const publish = stream(`pnpm publish ./${tarballName} --no-git-checks --access public`)
  if (publish.status !== 0) {
    // A 403 for an already-published version and the CDN lag right after a successful upload both
    // look like failure here, so ask the registry itself before calling this step broken.
    const served = await waitForVersion(60000)
    if (served === undefined) refuse('pnpm publish failed and the registry does not serve the version')
    log(`  the registry already serves ${version}; treating the rejection as done`)
  }
}

// ---------------------------------------------------------------------------------------------
// Read back: the version endpoint lags the publish by minutes, so poll instead of judging once.
// ---------------------------------------------------------------------------------------------
step(`wait for ${registry} to serve ${packageName}@${version} (up to ${Math.round(timeoutMs / 1000)} s)`)
const served = await waitForVersion(timeoutMs)

if (served === undefined) {
  log(`release: ${tagName} is pushed/tagged/released, but the registry still answers 404 for ${version}.`)
  log('  This is normal propagation lag (minutes). Re-run this script later to confirm; it will skip every finished step.')
  process.exit(1)
}

if (existsSync(tarballPath)) {
  const localShasum = createHash('sha1').update(readFileSync(tarballPath)).digest('hex')
  log(`  registry shasum ${served.dist?.shasum ?? '(none)'}`)
  log(`  local tarball   ${localShasum}`)
  if (served.dist?.shasum !== localShasum) {
    log(`release: the registry serves a tarball that differs from ${tarballName}; investigate before announcing.`)
    process.exit(1)
  }
} else {
  log(`  ${tarballName} is not in this checkout, so the shasum could not be compared`)
}

const latest = (capture(`npm view ${packageName} dist-tags.latest`).stdout ?? '').trim()
log(`  dist-tags.latest: ${latest}`)
log(`\nrelease: ${packageName}@${version} is released — pushed, tagged, Released on GitHub, and served by the registry.`)
