import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, cpSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const url = 'https://github.com/jhm9595/KSool_Gemini.git';
const manifestPath = join(root, 'upstream.json');
const snapshot = join(root, 'vendor/KSool_Gemini');
const git = (args, options = {}) => execFileSync('git', args, { cwd: root, encoding: 'utf8', ...options }).trim();
function hashes(dir, base = dir, result = {}) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) hashes(file, base, result);
    else result[file.slice(base.length + 1).replaceAll('\\', '/')] = createHash('sha256').update(readFileSync(file)).digest('hex');
  }
  return result;
}
const previous = JSON.parse(readFileSync(manifestPath, 'utf8'));
const latest = git(['ls-remote', url, 'HEAD']).split(/\s/)[0];
if (!/^[a-f0-9]{40}$/.test(latest)) throw new Error('Invalid upstream HEAD');
console.log(JSON.stringify({ source: url, current: previous.commit, latest, changed: previous.commit !== latest }, null, 2));
if (!process.argv.includes('--sync') || previous.commit === latest) process.exit(0);
const actual = hashes(snapshot);
if (JSON.stringify(Object.entries(actual).sort()) !== JSON.stringify(Object.entries(previous.files).sort())) {
  throw new Error('Snapshot has local modifications. Preserve and review them before syncing.');
}
const temp = mkdtempSync(join(tmpdir(), 'ksool-upstream-'));
try {
  // Explicit URL fetch only. No writable upstream remote is ever configured.
  git(['fetch', '--no-tags', '--depth=1', url, latest]);
  const archive = join(temp, 'source.tar');
  execFileSync('git', ['archive', '--format=tar', '-o', archive, 'FETCH_HEAD'], { cwd: root });
  execFileSync('tar', ['-xf', archive, '-C', temp]);
  for (const name of ['index.html', 'project.json', 'src', 'assets', 'data', 'docs']) {
    if (!existsSync(join(temp, name))) throw new Error(`Missing source path: ${name}`);
  }
  // Verified literal destination, always contained in this workspace.
  if (snapshot !== join(root, 'vendor', 'KSool_Gemini')) throw new Error('Unsafe snapshot path');
  rmSync(snapshot, { recursive: true, force: true });
  for (const name of ['index.html', 'project.json', 'src', 'assets', 'data', 'docs']) cpSync(join(temp, name), join(snapshot, name), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify({ ...previous, commit: latest, files: hashes(snapshot) }, null, 2) + '\n');
  console.log('Snapshot updated. Review diff, build and test before committing.');
} finally {
  if (temp.startsWith(join(tmpdir(), 'ksool-upstream-'))) rmSync(temp, { recursive: true, force: true });
}
