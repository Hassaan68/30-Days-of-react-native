#!/usr/bin/env node

/**
 * Displays a quick terminal overview of the 30-day curriculum and
 * reads checked progress items from the root README.md checklist.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const README_PATH = path.join(ROOT_DIR, 'README.md');

if (!fs.existsSync(README_PATH)) {
  console.error('README.md not found in repository root.');
  process.exit(1);
}

const content = fs.readFileSync(README_PATH, 'utf8');
const checklistRegex = /^- \[([ xX])\] Day (\d{2}):\s*(.+)$/gm;

const items = [];
let match;
while ((match = checklistRegex.exec(content)) !== null) {
  items.push({
    done: match[1].toLowerCase() === 'x',
    day: Number(match[2]),
    title: match[3].trim(),
  });
}

if (items.length === 0) {
  console.log('No checklist items found in README.md.');
  process.exit(0);
}

const completed = items.filter((item) => item.done).length;
const percent = Math.round((completed / items.length) * 100);
const barWidth = 30;
const filled = Math.round((completed / items.length) * barWidth);
const bar = `${'#'.repeat(filled)}${'-'.repeat(barWidth - filled)}`;

console.log('\n30 Days of React Native — Learning Progress\n');
console.log(`Progress: [${bar}] ${completed}/${items.length} (${percent}%)\n`);

const nextDay = items.find((item) => !item.done);
if (nextDay) {
  console.log(
    `Next up: Day ${String(nextDay.day).padStart(2, '0')} — ${nextDay.title}`,
  );
} else {
  console.log('Congratulations! You have completed all 30 days!');
}
console.log('');
