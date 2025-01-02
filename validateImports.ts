// validateImports.ts
import fs from "fs";
import path from "path";

// Wurzelverzeichnis
const rootDir = "./"; // Aktuelles Verzeichnis

// Ausschlusskriterien
const excludedDirs = [".git", "node_modules"];
const excludedFiles = [".git"];
const excludedExtensions = [".lock", ".json", ".git", ".log"];

// Kommentarzeichen für verschiedene Dateitypen
const commentFormats = {
  ".js": "//",
  ".ts": "//",
  ".jsx": "//",
  ".tsx": "//",
  ".yaml": "#",
  ".yml": "#",
  ".env": "#",
  ".env.example": "#",
  ".gitignore": "#",
  ".dockerignore": "#",
  ".txt": "#",
  ".sh": "#",
  ".sql": "--",
  ".pgsql": "--",
};

// Regex für Import-Statements (nur für JavaScript-Dateien relevant)
const importRegex = /import\s+.*\s+from\s+["'](.+?)["'];/g;

// Funktion zur Erkennung des Kommentarformats basierend auf dem Dateityp
function getCommentFormat(filePath) {
  const ext = path.extname(filePath);
  const base = path.basename(filePath);

  // Prüfe Erweiterung oder spezielle Dateinamen
  if (commentFormats[ext]) return commentFormats[ext];
  if (commentFormats[base]) return commentFormats[base];

  return null; // Kein unterstütztes Kommentarformat
}

// Funktion zum Finden des nächsten gültigen Pfades
function findClosestMatch(fileDir, importPath) {
  const importSegments = importPath.split("/");
  const fileName = importSegments.pop(); // Datei oder Verzeichnisname
  const dirToSearch = path.resolve(fileDir, importSegments.join("/"));

  if (!fs.existsSync(dirToSearch)) {
    return null;
  }

  const items = fs.readdirSync(dirToSearch);

  // Suche nach einer Datei oder einem Verzeichnis, das dem Namen entspricht
  for (const item of items) {
    if (item.startsWith(fileName)) {
      const resolved = path
        .relative(fileDir, path.join(dirToSearch, item))
        .replace(/\\/g, "/");
      return resolved.startsWith(".") ? resolved : `./${resolved}`;
    }
  }

  return null; // Keine Übereinstimmung gefunden
}

// Funktion zum Überprüfen und Fixen der Import-Pfade
function fixImports(filePath, fileContent) {
  const fileDir = path.dirname(filePath); // Verzeichnis der aktuellen Datei
  let updatedContent = fileContent;
  let match;
  let importFixed = false;

  while ((match = importRegex.exec(fileContent)) !== null) {
    const importPath = match[1]; // Der relative Importpfad
    if (!importPath.startsWith(".")) {
      // Überspringe nicht-relative Importe
      continue;
    }

    const resolvedPath = path.resolve(fileDir, importPath);

    // Überprüfe, ob die referenzierte Datei existiert
    if (!fs.existsSync(resolvedPath) && !fs.existsSync(`${resolvedPath}.js`)) {
      const fixedPath = findClosestMatch(fileDir, importPath);
      if (fixedPath) {
        console.log(`Fix Import in ${filePath}: ${importPath} → ${fixedPath}`);
        updatedContent = updatedContent.replace(importPath, fixedPath);
        importFixed = true;
      } else {
        console.error(`Ungültiger Import in ${filePath}: ${importPath}`);
      }
    }
  }

  // Speichere die Datei nur, wenn Importe aktualisiert wurden
  if (importFixed) {
    fs.writeFileSync(filePath, updatedContent, "utf8");
    console.log(`Importe in ${filePath} wurden aktualisiert.`);
  }

  return updatedContent;
}

// Funktion zum Hinzufügen von Kommentaren und Validieren/Fixen von Importen
function processFile(filePath) {
  const relativePath = path
    .relative(process.cwd(), filePath)
    .replace(/\\/g, "/"); // Relativer Pfad
  const commentSymbol = getCommentFormat(filePath); // Kommentarzeichen für den Dateityp

  // Überspringe Dateien ohne unterstütztes Kommentarformat
  if (!commentSymbol) {
    console.log(`Kein Kommentarformat unterstützt für: ${filePath}`);
    return;
  }

  try {
    // Dateiinhalt lesen
    let fileContent = fs.readFileSync(filePath, "utf8");

    // Prüfe, ob der Kommentar bereits vorhanden ist
    const firstLine = fileContent.split("\n")[0];
    if (firstLine.trim() !== `${commentSymbol} ${relativePath}`) {
      const comment = `${commentSymbol} ${relativePath}\n`;
      fileContent = comment + fileContent;
      console.log(`Kommentar hinzugefügt: ${relativePath}`);
    }

    // Import-Pfade validieren und fixen (nur für JavaScript-Dateien)
    if ([".js", ".ts", ".jsx", ".tsx"].includes(path.extname(filePath))) {
      fileContent = fixImports(filePath, fileContent);
    }

    // Dateiinhalt speichern
    fs.writeFileSync(filePath, fileContent, "utf8");
  } catch (error) {
    console.error(`Fehler beim Bearbeiten von ${filePath}:`, error.message);
  }
}

// Rekursive Funktion zum Bearbeiten von Dateien
function processDirectory(directory) {
  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(directory, item.name);

    // Überspringe ausgeschlossene Ordner
    if (item.isDirectory() && excludedDirs.includes(item.name)) {
      continue;
    }

    if (item.isDirectory()) {
      // Verzeichnis: Rekursiv bearbeiten
      processDirectory(itemPath);
    } else {
      const ext = path.extname(item.name);
      const base = path.basename(item.name);

      // Überspringe ausgeschlossene Dateien und Erweiterungen
      if (excludedFiles.includes(base) || excludedExtensions.includes(ext)) {
        continue;
      }

      // Kommentar hinzufügen und Importe validieren/fixen
      processFile(itemPath);
    }
  }
}

// Starte die Verarbeitung
processDirectory(rootDir);

