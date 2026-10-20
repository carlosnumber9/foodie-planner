import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (
      [
        "node_modules",
        ".git",
        ".agents",
        "dist",
        "dev-dist",
        ".wrangler",
        "coverage",
        "reports",
        "test-results",
        "playwright-report",
        ".stryker-tmp",
      ].includes(entry.name)
    )
      return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory()
      ? markdownFiles(path)
      : entry.name.endsWith(".md")
        ? [path]
        : [];
  });
}

const files = markdownFiles(process.cwd());
const broken: string[] = [];
for (const file of files) {
  const prose = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const match of prose.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const localPath = resolve(
      dirname(file),
      decodeURIComponent(target.split("#")[0]),
    );
    try {
      statSync(localPath);
    } catch {
      broken.push(`${file}: ${target}`);
    }
  }
}
if (broken.length)
  throw new Error(`Broken local documentation links:\n${broken.join("\n")}`);
console.log(`Documentation links valid: ${files.length} Markdown files.`);
