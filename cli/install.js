#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Command } from "commander";
import fetch from "node-fetch";

const program = new Command();

function normalizeBaseUrl(input) {
  return input.endsWith("/") ? input.slice(0, -1) : input;
}

program
  .name("cursor-rules-library")
  .description("Install curated .cursorrules files into any project")
  .version("1.0.0");

program
  .command("install")
  .description("Install a rule pack by slug")
  .argument("<slug>", "rule slug, e.g. nextjs")
  .option("--api <url>", "library base URL", "https://cursor-rules-library.com")
  .option("--project <dir>", "project directory", process.cwd())
  .option("--filename <name>", "output filename", ".cursorrules")
  .option("--access-token <token>", "subscriber access token")
  .action(async (slug, options) => {
    const apiBase = normalizeBaseUrl(options.api);
    const requestUrl = `${apiBase}/api/rules?slug=${encodeURIComponent(slug)}&format=raw`;

    const response = await fetch(requestUrl, {
      headers: options.accessToken
        ? {
            "x-access-token": options.accessToken
          }
        : undefined
    });

    if (response.status === 402) {
      console.error(
        "This rule is premium. Purchase access and pass --access-token from your authenticated browser session."
      );
      process.exit(1);
    }

    if (!response.ok) {
      const body = await response.text();
      console.error(`Unable to fetch rule (${response.status}). ${body}`);
      process.exit(1);
    }

    const ruleContent = await response.text();
    const projectDir = path.resolve(options.project);
    const outputPath = path.join(projectDir, options.filename);

    await mkdir(projectDir, { recursive: true });
    await writeFile(outputPath, ruleContent, "utf-8");

    console.log(`Installed ${slug} to ${outputPath}`);
    console.log("Next: commit .cursorrules and run your normal lint/test workflow.");
  });

program.parse(process.argv);
