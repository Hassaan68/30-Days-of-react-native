#!/usr/bin/env node

/**
 * Validates that all 30 daily folders exist with the required structure
 * and that every daily README contains all required tutorial sections.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DAYS_DIR = path.join(ROOT_DIR, 'days');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');

const EXPECTED_DAYS = [
  'day-01-introduction',
  'day-02-javascript-typescript',
  'day-03-react-fundamentals',
  'day-04-react-hooks',
  'day-05-styling-and-layout',
  'day-06-core-components',
  'day-07-first-mobile-app',
  'day-08-navigation-expo-router',
  'day-09-forms-and-validation',
  'day-10-state-management',
  'day-11-api-integration',
  'day-12-authentication',
  'day-13-device-features',
  'day-14-weather-app',
  'day-15-animations',
  'day-16-lists-and-performance',
  'day-17-local-storage-and-offline',
  'day-18-architecture-and-folder-structure',
  'day-19-native-modules-and-platform-differences',
  'day-20-testing',
  'day-21-task-manager',
  'day-22-accessibility',
  'day-23-security',
  'day-24-debugging-and-devtools',
  'day-25-notifications-and-background-tasks',
  'day-26-backend-and-realtime',
  'day-27-cicd-and-deployment',
  'day-28-production-readiness',
  'day-29-production-mobile-app',
  'day-30-career-and-open-source',
];

const EXPECTED_PROJECTS = [
  'project-01-profile-app',
  'project-02-weather-app',
  'project-03-task-manager',
  'project-04-authentication-app',
  'project-05-production-mobile-app',
];

const REQUIRED_DAY_SUBDIRS = ['examples', 'exercises', 'solutions'];

const REQUIRED_SECTIONS = [
  '## Learning Objectives',
  '## Prerequisites',
  '## Why This Concept Matters',
  '## Introduction',
  '## Concepts',
  '## Code Examples',
  '## Step-by-Step Explanation',
  '## Expected Output',
  '## Common Mistakes',
  '## Best Practices',
  '## Exercises',
  '## Solutions',
  '## Mini Project',
  '## Key Takeaways',
  '## Further Reading',
];

const errors = [];
let checkedDays = 0;
let checkedProjects = 0;

for (const dayFolder of EXPECTED_DAYS) {
  const dayPath = path.join(DAYS_DIR, dayFolder);
  if (!fs.existsSync(dayPath) || !fs.statSync(dayPath).isDirectory()) {
    errors.push(`Missing day folder: days/${dayFolder}`);
    continue;
  }

  checkedDays += 1;

  const readmePath = path.join(dayPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    errors.push(`Missing README.md in days/${dayFolder}`);
  } else {
    const content = fs.readFileSync(readmePath, 'utf8');
    if (content.trim().length < 500) {
      errors.push(`README.md in days/${dayFolder} looks too short (< 500 chars)`);
    }

    for (const section of REQUIRED_SECTIONS) {
      if (!content.includes(section)) {
        errors.push(`days/${dayFolder}/README.md is missing required section: "${section}"`);
      }
    }

    const isDay30 = dayFolder.startsWith('day-30');
    if (!isDay30 && !content.includes('## Next Day')) {
      errors.push(`days/${dayFolder}/README.md is missing required section: "## Next Day"`);
    }
  }

  for (const subdir of REQUIRED_DAY_SUBDIRS) {
    const subPath = path.join(dayPath, subdir);
    if (!fs.existsSync(subPath) || !fs.statSync(subPath).isDirectory()) {
      errors.push(`Missing subdirectory: days/${dayFolder}/${subdir}`);
      continue;
    }

    const files = fs.readdirSync(subPath).filter((f) => !f.startsWith('.'));
    if (files.length === 0) {
      errors.push(`Empty subdirectory: days/${dayFolder}/${subdir}`);
    }
  }
}

for (const projectFolder of EXPECTED_PROJECTS) {
  const projectPath = path.join(PROJECTS_DIR, projectFolder);
  if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
    errors.push(`Missing project folder: projects/${projectFolder}`);
    continue;
  }
  checkedProjects += 1;

  const readmePath = path.join(projectPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    errors.push(`Missing README.md in projects/${projectFolder}`);
  }
}

console.log(`Checked ${checkedDays}/${EXPECTED_DAYS.length} daily folders.`);
console.log(`Checked ${checkedProjects}/${EXPECTED_PROJECTS.length} featured project folders.`);

if (errors.length > 0) {
  console.error(`\nCurriculum validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log('\nAll 30 daily folders and 5 featured projects passed curriculum validation.');
