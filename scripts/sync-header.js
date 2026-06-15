const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const templatePath = path.join(rootDir, "templates", "header.html");

const skipDirs = new Set(["node_modules", ".git", ".claude", ".vscode", "templates", "scripts"]);
const navKeys = ["home", "innovation", "video", "download", "sitemap"];

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

function getActiveKey(filePath) {
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/");

  if (relativePath === "index.html") return "home";
  if (relativePath.startsWith("innovation/")) return "innovation";
  if (relativePath.startsWith("brand/")) return "innovation";
  if (relativePath.startsWith("district/")) return "innovation";
  if (relativePath.startsWith("green/")) return "innovation";
  if (relativePath.startsWith("insight/")) return "innovation";
  if (relativePath.startsWith("video/")) return "video";
  if (relativePath.startsWith("download/")) return "download";
  if (relativePath.startsWith("sitemap/")) return "sitemap";

  return null;
}

function renderHeader(template, activeKey) {
  let rendered = template;

  navKeys.forEach((key) => {
    const isActive = key === activeKey;
    const desktopClass = isActive ? "nav-link nav-link--active" : "nav-link";
    const mobileClass = isActive ? "mobile-nav-link mobile-nav-link--active" : "mobile-nav-link";
    const currentAttr = isActive ? ' aria-current="page"' : "";
    const upperKey = key.toUpperCase();

    rendered = rendered.replaceAll(`{{${upperKey}_DESKTOP_CLASS}}`, desktopClass);
    rendered = rendered.replaceAll(`{{${upperKey}_DESKTOP_CURRENT}}`, currentAttr);
    rendered = rendered.replaceAll(`{{${upperKey}_MOBILE_CLASS}}`, mobileClass);
    rendered = rendered.replaceAll(`{{${upperKey}_MOBILE_CURRENT}}`, currentAttr);
  });

  return rendered;
}

function syncHeader() {
  const template = fs.readFileSync(templatePath, "utf8").trimEnd();
  const files = [];
  walk(rootDir, files);

  const headerPattern =
    /([ \t]*)(?:<!-- 由模板產生，請勿直接修改。執行：npm run sync:header -->\n\1)?<header class="site-header py-5" role="banner">[\s\S]*?<div class="nav-backdrop" id="navBackdrop" aria-hidden="true"><\/div>/;
  let updatedCount = 0;

  files.forEach((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    const match = source.match(headerPattern);

    if (!match) {
      return;
    }

    const indent = match[1] || "";
    const renderedTemplate = renderHeader(template, getActiveKey(filePath));
    const indentedTemplate = renderedTemplate
      .split("\n")
      .map((line) => (line ? indent + line : line))
      .join("\n");
    const nextSource = source.replace(headerPattern, indentedTemplate);

    if (nextSource !== source) {
      fs.writeFileSync(filePath, nextSource, "utf8");
      updatedCount += 1;
    }
  });

  console.log("header synced:", updatedCount, "files");
}

syncHeader();
