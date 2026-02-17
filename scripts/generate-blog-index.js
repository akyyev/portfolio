#!/usr/bin/env node

/**
 * Scans public/blog/posts/*.md for frontmatter and generates
 * public/blog/index.json automatically.
 *
 * Usage: node scripts/generate-blog-index.js
 * Runs automatically via prestart / prebuild.
 */

const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(__dirname, "..", "public", "blog", "posts");
const INDEX_PATH = path.join(__dirname, "..", "public", "blog", "index.json");

/**
 * Simple frontmatter parser — extracts key: value pairs between --- delimiters.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { attributes: {}, body: raw };

  const attributes = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Remove quotes
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    // Parse arrays: [item1, item2]
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1).split(",").map((s) => s.trim());
    }

    attributes[key] = value;
  }

  return { attributes, body: match[2] };
}

function generateIndex() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.warn("[blog-index] No posts directory found, skipping.");
    return;
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const posts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { attributes } = parseFrontmatter(raw);

    if (!attributes.title || !attributes.date) {
      console.warn(`[blog-index] Skipping ${file} \u2014 missing title or date in frontmatter.`);
      continue;
    }

    posts.push({
      slug: file.replace(/\.md$/, ""),
      title: attributes.title,
      date: new Date(attributes.date).toISOString().split("T")[0],
      author: attributes.author || "Bagtyyar",
      tags: attributes.tags || [],
      excerpt: attributes.excerpt || "",
      readTime: attributes.readTime || "5 min read",
    });
  }

  // Sort by date descending (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.writeFileSync(INDEX_PATH, JSON.stringify(posts, null, 2) + "\n");
  console.log(`[blog-index] Generated index with ${posts.length} post(s).`);
}

generateIndex();
