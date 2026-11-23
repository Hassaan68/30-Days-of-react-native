#!/usr/bin/env node

/**
 * Validates all internal relative Markdown links across the repository.
 * Skips external links (http/https/mailto) and fenced code blocks.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const IGNORED_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', 'coverage']);

function collectMarkdownFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function stripFencedCodeBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      output.push('');
      continue;
    }
    output.push(inCodeBlock ? '' : line);
  }
  return output.join('\n');
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractHeadingSlugs(markdown) {
  const cleaned = stripFencedCodeBlocks(markdown);
  const slugs = new Set();
  const counts = new Map();
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(cleaned)) !== null) {
    const raw = match[1].replace(/\s+#+\s*$/, '').trim();
    const base = slugifyHeading(raw);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }
  return slugs;
}

const markdownFiles = collectMarkdownFiles(ROOT_DIR);
const headingCache = new Map();

function getHeadingsForFile(filePath) {
  if (!headingCache.has(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    headingCache.set(filePath, extractHeadingSlugs(content));
  }
  return headingCache.get(filePath);
}

const errors = [];
let totalLinksChecked = 0;

const linkRegex = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

for (const mdFile of markdownFiles) {
  const raw = fs.readFileSync(mdFile, 'utf8');
  const content = stripFencedCodeBlocks(raw);
  const relSource = path.relative(ROOT_DIR, mdFile);

  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const target = match[1].trim();
    if (
      !target ||
      target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:') ||
      target.startsWith('tel:')
    ) {
      continue;
    }

    totalLinksChecked += 1;

    const [filePart, anchorPart] = target.split('#');
    const resolvedTarget = filePart
      ? path.resolve(path.dirname(mdFile), decodeURIComponent(filePart))
      : mdFile;

    if (!fs.existsSync(resolvedTarget)) {
      errors.push(`${relSource}: broken link "${target}" (target not found)`);
      continue;
    }

    if (anchorPart) {
      let targetMdFile = resolvedTarget;
      if (fs.statSync(resolvedTarget).isDirectory()) {
        targetMdFile = path.join(resolvedTarget, 'README.md');
      }
      if (fs.existsSync(targetMdFile) && targetMdFile.endsWith('.md')) {
        const headings = getHeadingsForFile(targetMdFile);
        if (!headings.has(anchorPart.toLowerCase())) {
          errors.push(
            `${relSource}: broken anchor "#${anchorPart}" in link "${target}"`,
          );
        }
      }
    }
  }
}

console.log(
  `Scanned ${markdownFiles.length} Markdown files and verified ${totalLinksChecked} internal links.`,
);

if (errors.length > 0) {
  console.error(`\nFound ${errors.length} broken internal link(s):`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log('All internal Markdown links are valid.');
