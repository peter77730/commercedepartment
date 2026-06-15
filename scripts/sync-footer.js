const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const templatePath = path.join(rootDir, "templates", "footer.html");

const skipDirs = new Set(["node_modules", ".git", ".claude", ".vscode", "templates", "scripts"]);

function walk(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    if (skipDirs.has(entry.name)) return;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, files);
      return;
    }

    if (entry.isFile() && entry.name === "index.html") {
      files.push(fullPath);
    }
  });
}

function syncFooter() {
  const template = fs.readFileSync(templatePath, "utf8").trimEnd();
  const files = [];
  walk(rootDir, files);

  const footerPattern = /([ \t]*)<footer class="site-footer" role="contentinfo">[\s\S]*?<\/footer>/;
  let updatedCount = 0;

  files.forEach((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    const match = source.match(footerPattern);

    if (!match) {
      return;
    }

    const indent = match[1] || "";
    const indentedTemplate = template
      .split("\n")
      .map((line) => (line ? indent + line : line))
      .join("\n");
    const nextSource = source.replace(footerPattern, indentedTemplate);

    if (nextSource !== source) {
      fs.writeFileSync(filePath, nextSource, "utf8");
      updatedCount += 1;
    }
  });

  console.log("footer synced:", updatedCount, "files");
}

syncFooter();
