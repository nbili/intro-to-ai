import { select, intro, outro, isCancel, spinner, log } from '@clack/prompts';
import { readdir } from 'fs/promises';
import type { Dirent } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

export const devServer = () => {};

async function listExampleDirs(rootDir: string): Promise<Array<{ value: string; label: string }>> {
  const full = resolve(rootDir, 'examples');
  const entries: Dirent[] = await readdir(full, { withFileTypes: true });
  return entries
    .filter((entry: Dirent) => entry.isDirectory())
    .map((entry: Dirent) => ({ value: entry.name, label: entry.name }))
    .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
}

async function main() {
  intro('intro-to-ai dev');
  const options = await listExampleDirs(process.cwd());
  const projectType = await select({
    message: 'Pick a example.',
    options,
  });
  if (isCancel(projectType)) {
    outro('Cancelled');
    return;
  }
  const selection = String(projectType);
  const indexPath = resolve(process.cwd(), 'examples', selection, 'index.ts');
  const fileUrl = pathToFileURL(indexPath).href;
  console.log('You selected:', selection);

  const s = spinner();
  s.start(`Running ${selection}...`);

  // Capture console output from the example
  type LogItem = { level: 'log' | 'info' | 'warn' | 'error'; text: string };
  const buffer: LogItem[] = [];
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  } as const;

  try {
    console.log = (...args: unknown[]) => buffer.push({ level: 'log', text: args.map(String).join(' ') });
    console.info = (...args: unknown[]) => buffer.push({ level: 'info', text: args.map(String).join(' ') });
    console.warn = (...args: unknown[]) => buffer.push({ level: 'warn', text: args.map(String).join(' ') });
    console.error = (...args: unknown[]) => buffer.push({ level: 'error', text: args.map(String).join(' ') });

    await import(fileUrl);
    s.stop('Done');
  } catch (err) {
    s.stop('Failed');
    buffer.push({ level: 'error', text: (err instanceof Error ? err.stack || err.message : String(err)) });
  } finally {
    console.log = original.log;
    console.info = original.info;
    console.warn = original.warn;
    console.error = original.error;
  }

  // Nicely separated output section
  log.info(`Output from ${selection}`);
  for (const item of buffer) {
    if (item.level === 'error') log.error(item.text);
    else if (item.level === 'warn') log.warn(item.text);
    else log.message(item.text);
  }

  outro('Done');
}

// Run when invoked via `pnpm dev`
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
