// test/config/test.ts
import dotenv from "dotenv";
dotenv.config();

import * as alias from "../../src/alias.js";

// Funktion zum Testen und Anzeigen der Alias-Werte
function testAliases() {
  console.log("### Testing Aliases ###");
  for (const [key, value] of Object.entries(alias)) {
    console.log(`${key}:`, value === undefined ? "MISSING" : value);
  }
}

testAliases();
