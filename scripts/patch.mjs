import fs from 'node:fs';
import path from 'node:path';

const sourceDir = process.argv[2];
const filename = process.argv[3];
const targetDir = process.argv[4] || '../../lib/pdfjs';

if (!sourceDir || !filename) {
	console.error('Usage: node patch.mjs <sourceDir> <filename> [targetDir]');
	console.error('Example: node patch.mjs ./build/generic-legacy/build pdf.mjs');
	process.exit(1);
}

const sourceFile = path.join(sourceDir, filename);
const targetFile = path.join(targetDir, filename);

try {
	const content = fs.readFileSync(sourceFile, 'utf8');
	const patched =
			content.replace(
					'let verbosity = VerbosityLevel.WARNINGS',
					'let verbosity = VerbosityLevel.ERRORS'
			);
	fs.writeFileSync(targetFile, `import DOMMatrix from 'dommatrix';\n${patched}`);
	console.log(`Patched ${filename}: VerbosityLevel.WARNINGS -> VerbosityLevel.ERRORS`);
} catch (err) {
	console.error(`Error patching ${filename}:`, err.message);
	process.exit(1);
}

