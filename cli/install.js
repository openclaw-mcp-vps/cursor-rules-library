#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { Command } = require('commander');

const DEFAULT_BASE_URL = 'https://cursor-rules-library.com';

function normalizeBaseUrl(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/plain',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  return response.text();
}

const program = new Command();

program
  .name('cursor-rules-install')
  .description('Install curated .cursorrules files from Cursor Rules Library')
  .version('1.0.0');

program
  .command('list')
  .description('List available rules')
  .option('-b, --base-url <url>', 'Library base URL', DEFAULT_BASE_URL)
  .option('-f, --framework <framework>', 'Filter by framework')
  .option('-l, --limit <count>', 'Limit results', '50')
  .option('--order-id <id>', 'Paid Lemon Squeezy order id for full access')
  .action(async (options) => {
    const baseUrl = normalizeBaseUrl(options.baseUrl);
    const params = new URLSearchParams();
    if (options.framework) {
      params.set('framework', options.framework);
    }
    params.set('limit', options.limit);
    if (options.orderId) {
      params.set('order_id', options.orderId);
    }

    const data = await fetchJson(`${baseUrl}/api/rules?${params.toString()}`);

    if (!Array.isArray(data.rules) || data.rules.length === 0) {
      console.log('No rules found for your filters.');
      return;
    }

    for (const rule of data.rules) {
      console.log(`${rule.slug.padEnd(36)} ${rule.framework}  ${rule.name}`);
    }

    console.log(`\nTotal: ${data.total}`);
  });

program
  .command('install')
  .description('Install a rule into your project')
  .argument('<slug>', 'Rule slug, for example: nextjs-core-architecture')
  .option('-b, --base-url <url>', 'Library base URL', DEFAULT_BASE_URL)
  .option('-o, --output <path>', 'Output file path', '.cursorrules')
  .option('--order-id <id>', 'Paid Lemon Squeezy order id for full access')
  .option('--force', 'Overwrite output file if it exists', false)
  .option('--print', 'Print the resolved rule content metadata', false)
  .action(async (slug, options) => {
    const baseUrl = normalizeBaseUrl(options.baseUrl);
    const outputPath = path.resolve(process.cwd(), options.output);

    if (fs.existsSync(outputPath) && !options.force) {
      throw new Error(
        `Output file already exists at ${outputPath}. Re-run with --force to overwrite.`
      );
    }

    const metaParams = new URLSearchParams();
    metaParams.set('slug', slug);
    if (options.orderId) {
      metaParams.set('order_id', options.orderId);
    }

    const metaData = await fetchJson(`${baseUrl}/api/rules?${metaParams.toString()}`);

    if (!metaData.rule || !metaData.rule.slug) {
      throw new Error(`Rule ${slug} was not found at ${baseUrl}`);
    }

    if (metaData.previewOnly) {
      throw new Error(
        'This rule requires a paid subscription. Re-run with --order-id <paid_order_id>.'
      );
    }

    const contentParams = new URLSearchParams();
    contentParams.set('slug', slug);
    contentParams.set('format', 'raw');
    if (options.orderId) {
      contentParams.set('order_id', options.orderId);
    }

    const content = await fetchText(`${baseUrl}/api/rules?${contentParams.toString()}`);

    fs.writeFileSync(outputPath, `${content.trimEnd()}\n`, 'utf8');

    const parsed = matter(content);

    if (options.print) {
      console.log('Installed rule metadata:');
      console.log(`- slug: ${metaData.rule.slug}`);
      console.log(`- name: ${metaData.rule.name}`);
      console.log(`- framework: ${metaData.rule.framework}`);
      console.log(`- frontmatter keys: ${Object.keys(parsed.data).length}`);
    }

    console.log(`Installed ${metaData.rule.name}`);
    console.log(`Output: ${outputPath}`);
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
