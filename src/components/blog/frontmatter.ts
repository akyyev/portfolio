import type { BlogPostMeta } from "./types";

interface ParsedFrontmatter {
  attributes: Record<string, unknown>;
  body: string;
}

/**
 * Lightweight frontmatter parser for the browser.
 * Parses YAML-like key: value pairs between --- delimiters.
 * No Node.js dependencies needed.
 */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    return { attributes: {}, body: raw };
  }

  const yamlBlock = match[1];
  const body = match[2];
  const attributes: Record<string, unknown> = {};

  for (const line of yamlBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();

    // Remove surrounding quotes
    if (
      typeof value === "string" &&
      value.startsWith('"') &&
      value.endsWith('"')
    ) {
      value = value.slice(1, -1);
    }

    // Parse arrays: [item1, item2]
    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim());
    }

    attributes[key] = value;
  }

  return { attributes, body };
}

/** Extract BlogPostMeta from parsed frontmatter attributes */
export function toPostMeta(
  slug: string,
  attributes: Record<string, unknown>
): BlogPostMeta {
  const rawDate = attributes.date as string;
  const date = rawDate
    ? new Date(rawDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    slug,
    title: (attributes.title as string) || slug,
    date,
    author: (attributes.author as string) || "Bagtyyar",
    tags: (attributes.tags as string[]) || [],
    excerpt: (attributes.excerpt as string) || "",
    readTime: (attributes.readTime as string) || "5 min read",
  };
}
