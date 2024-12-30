// dump.ts
import fs from "fs";
import path from "path";

const dumpFile = "dumped.js";
const excludedDirs = [".git", "node_modules"];
const excludedFiles = ["dumped.js", ".env"];

const files: string[] = [];

function collectFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !excludedDirs.includes(entry.name)) {
      collectFiles(entryPath);
    } else if (entry.isFile() && !excludedFiles.includes(entry.name)) {
      files.push(entryPath);
    }
  }
}

collectFiles(".");
fs.writeFileSync(dumpFile, "");
for (const file of files) {
  const fileContent = fs.readFileSync(file, "utf8");
  fs.appendFileSync(dumpFile, fileContent + "\n\n\n\n\n\n");
}
