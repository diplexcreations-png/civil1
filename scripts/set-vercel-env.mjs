import fs from 'fs';
import { execFileSync } from 'child_process';

const raw = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
  const i = line.indexOf('=');
  const key = line.slice(0, i).trim();
  const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  env[key] = val;
}

const openrouterKey = env.OPENROUTER_API_KEY || '';
if (!openrouterKey) {
  console.error('MISSING_OPENROUTER_KEY');
  process.exit(1);
}

function run(args) {
  // Do not print secret values
  console.log(`Running: vercel ${args.filter((a, i) => !(args[i - 1] === 'add' && args[i - 2] === 'env')).join(' ').replace(openrouterKey, '[REDACTED]')}`);
  execFileSync('npx', ['vercel', ...args], { stdio: 'inherit', shell: true });
}

// Production + Preview env
for (const target of ['production', 'preview']) {
  // vercel env add NAME environment < value via stdin
  console.log(`Setting OPENROUTER_API_KEY for ${target}...`);
  execFileSync('npx', ['vercel', 'env', 'add', 'OPENROUTER_API_KEY', target, '--force'], {
    input: openrouterKey + '\n',
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true,
  });
}

console.log('ENV_SET_PARTIAL_DONE');
