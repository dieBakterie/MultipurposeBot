const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);

const excludedDirs = ['.git', 'node_modules'];
const excludedFiles = ['migrate.cjs', 'package.json', 'package-lock.json', 'tsconfig.json'];

const targetDir = path.resolve(__dirname, args[1] || './typescript');

/**
 * Copies the directory structure and migrates JavaScript files to TypeScript.
 * @param {string} sourceDir - The source directory containing JavaScript files.
 * @param {string} targetDir - The target directory for TypeScript files.
 */
function migrateDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);

  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      // Skip excluded directories and the target directory
      if (excludedDirs.includes(file) || path.resolve(sourcePath) === targetDir) {
        console.log(`Skipped directory: ${sourcePath}`);
        return;
      }
      migrateDirectory(sourcePath, targetPath);
    } else if (excludedFiles.includes(file)) {
      // Skip excluded files
      console.log(`Skipped file: ${sourcePath}`);
    } else if (path.extname(file) === '.js') {
      const targetFile = path.join(targetDir, path.basename(file, '.js') + '.ts'); // Migrate .js to .ts
      migrateFileToTypeScript(sourcePath, targetFile);
    } else {
      fs.copyFileSync(sourcePath, targetPath); // Copy non-JS files directly
    }
  });
}

/**
 * Migrates a single JavaScript file to TypeScript.
 * @param {string} sourceFile - The source JavaScript file path.
 * @param {string} targetFile - The target TypeScript file path.
 */
function migrateFileToTypeScript(sourceFile, targetFile) {
  const content = fs.readFileSync(sourceFile, 'utf8');

  // Replace basic JavaScript syntax with TypeScript where applicable.
  let migratedContent = content
    .replace(/(const|let|var)\s+(\w+)\s*=\s*require\((['"])(.+?)\3\);/g, 'import $2 from $3$4$3;')
    .replace(/module\.exports\s*=\s*/g, 'export default ');

  fs.writeFileSync(targetFile, migratedContent, 'utf8');
  console.log(`Migrated: ${sourceFile} -> ${targetFile}`);
}

// Define source and target directories.
const sourceDir = path.resolve(__dirname, args[0] || './');

// Start migration.
console.log(`Starting migration from ${sourceDir} to ${targetDir}`);
migrateDirectory(sourceDir, targetDir);
console.log('Migration complete.');
