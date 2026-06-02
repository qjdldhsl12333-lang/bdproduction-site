const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcDir = path.join(root, 'frontend/src');
const styleDir = path.join(root, 'frontend/src/styles');

const ignoredClassFragments = [
  'is-',
  'status-',
  'active',
  'open',
  'current',
  'danger',
  'linked',
  'guest',
  'hover',
  'focus',
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(item)) {
        continue;
      }

      walk(full, files);
      continue;
    }

    files.push(full);
  }

  return files;
}

const sourceFiles = walk(srcDir).filter((file) => /\.(jsx|js|tsx|ts|html)$/.test(file));
const cssFiles = walk(styleDir).filter((file) => /\.css$/.test(file));

const sourceText = sourceFiles
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');

const reportDir = path.join(root, 'tools/reports');
fs.mkdirSync(reportDir, { recursive: true });

const allReports = [];

for (const cssFile of cssFiles) {
  const css = fs.readFileSync(cssFile, 'utf8');
  const classMatches = [...css.matchAll(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g)];
  const classNames = [...new Set(classMatches.map((match) => match[1]))].sort();

  const likelyUnused = [];
  const likelyUsed = [];

  for (const className of classNames) {
    const isDynamicLike = ignoredClassFragments.some((fragment) => className.includes(fragment));

    if (isDynamicLike) {
      likelyUsed.push({ className, reason: 'dynamic-like' });
      continue;
    }

    if (sourceText.includes(className)) {
      likelyUsed.push({ className, reason: 'found-in-source' });
    } else {
      likelyUnused.push(className);
    }
  }

  allReports.push({
    file: path.relative(root, cssFile),
    classCount: classNames.length,
    likelyUsed: likelyUsed.length,
    likelyUnused: likelyUnused.length,
    unusedClasses: likelyUnused,
  });
}

fs.writeFileSync(
  path.join(reportDir, 'css-audit-report.json'),
  JSON.stringify(allReports, null, 2),
  'utf8'
);

for (const report of allReports) {
  const safeName = report.file.replace(/[\\/]/g, '__');
  fs.writeFileSync(
    path.join(reportDir, `${safeName}.likely-unused.txt`),
    report.unusedClasses.join('\n'),
    'utf8'
  );
}

for (const report of allReports) {
  console.log(`${report.file}`);
  console.log(`  class count: ${report.classCount}`);
  console.log(`  likely used: ${report.likelyUsed}`);
  console.log(`  likely unused: ${report.likelyUnused}`);
}

console.log('Report written: tools/reports/css-audit-report.json');
