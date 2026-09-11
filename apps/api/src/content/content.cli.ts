import { getContentStats, validateContent } from './content-validation';

const command = process.argv[2];

if (command === 'validate') {
  const issues = validateContent();
  if (issues.length > 0) {
    console.error(`CONTENT INVALID: ${issues.length} issue(s)`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.info('CONTENT VALID: all hierarchy, schema, answer, hint and visual checks passed');
  }
} else if (command === 'stats') {
  console.info(JSON.stringify(getContentStats(), null, 2));
} else {
  console.error('Usage: content.cli.ts <validate|stats>');
  process.exitCode = 1;
}
