const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const templatePath = path.join(rootDir, "templates", "subnav.html");

const skipDirs = new Set(["node_modules", ".git", ".claude", ".vscode", "templates", "scripts"]);
const sectionKeys = ["innovation", "green", "brand", "district", "insight"];
const toggleTexts = {
  innovation: "數位轉型與創新研發",
  green: "節能減碳與永續發展",
  brand: "品牌成長與國際拓展",
  district: "商圈市場與街區特色",
  insight: "國際商情觀測站",
};

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

function getSectionKey(filePath) {
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/");

  if (relativePath.startsWith("innovation/")) return "innovation";
  if (relativePath.startsWith("green/")) return "green";
  if (relativePath.startsWith("brand/")) return "brand";
  if (relativePath.startsWith("district/")) return "district";
  if (relativePath.startsWith("insight/")) return "insight";

  return null;
}

function renderSubnav(template, activeKey) {
  let rendered = template.replaceAll("{{TOGGLE_TEXT}}", toggleTexts[activeKey] || "");

  sectionKeys.forEach((key) => {
    const isActive = key === activeKey;
    const itemClass = isActive ? "innov-subnav__item innov-subnav__item--active" : "innov-subnav__item";
    const currentAttr = isActive ? ' aria-current="page"' : "";
    const upperKey = key.toUpperCase();

    rendered = rendered.replaceAll(`{{${upperKey}_ITEM_CLASS}}`, itemClass);
    rendered = rendered.replaceAll(`{{${upperKey}_CURRENT}}`, currentAttr);
  });

  return rendered;
}

function syncSubnav() {
  const template = fs.readFileSync(templatePath, "utf8").trimEnd();
  const files = [];
  walk(rootDir, files);

  const subnavPattern =
    /([ \t]*)(?:<!-- 由模板產生，請勿直接修改。執行：npm run sync:subnav -->\n\1)?<nav class="innov-subnav" aria-label="計畫分類選單">[\s\S]*?<\/nav>/;
  let updatedCount = 0;

  files.forEach((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    const match = source.match(subnavPattern);

    if (!match) {
      return;
    }

    const activeKey = getSectionKey(filePath);

    if (!activeKey) {
      return;
    }

    const indent = match[1] || "";
    const renderedTemplate = renderSubnav(template, activeKey);
    const indentedTemplate = renderedTemplate
      .split("\n")
      .map((line) => (line ? indent + line : line))
      .join("\n");
    const nextSource = source.replace(subnavPattern, indentedTemplate);

    if (nextSource !== source) {
      fs.writeFileSync(filePath, nextSource, "utf8");
      updatedCount += 1;
    }
  });

  console.log("subnav synced:", updatedCount, "files");
}

syncSubnav();
