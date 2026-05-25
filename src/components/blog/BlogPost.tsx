import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import Chip from "@mui/material/Chip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareButton from "./ShareButton";
import { parseFrontmatter, toPostMeta } from "./frontmatter";
import type { BlogPostMeta } from "./types";
import "../../assets/styles/Blog.scss";

marked.setOptions({ breaks: true });

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [meta, setMeta] = useState<BlogPostMeta | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const loadPost = async () => {
      try {
        // Load markdown file directly and parse frontmatter
        const mdRes = await fetch(
          `${process.env.PUBLIC_URL}/blog/posts/${slug}.md`
        );
        if (!mdRes.ok) {
          setError("Post not found.");
          setLoading(false);
          return;
        }

        const raw = await mdRes.text();
        const parsed = parseFrontmatter(raw);

        setMeta(toPostMeta(slug || "", parsed.attributes));
        setContent(
          parsed.body.replaceAll("%PUBLIC_URL%", process.env.PUBLIC_URL)
        );
        setLoading(false);
      } catch (err) {
        console.error("Error loading blog post:", err);
        setError("Something went wrong loading this post.");
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-container">
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !meta) {
    return (
      <div className="blog-container">
        <div className="blog-error">
          <h2>{error || "Post not found"}</h2>
          <Link to="/blog" className="blog-back-link">
            <ArrowBackIcon fontSize="small" /> Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(meta.date + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Strip the first H1 from markdown body (we render it from metadata)
  const contentWithoutTitle = content.replace(/^\s*#\s+.+\n/, "");
  const htmlContent = DOMPurify.sanitize(marked(contentWithoutTitle) as string);

  return (
    <div className="blog-container">
      <Link to="/blog" className="blog-back-link">
        <ArrowBackIcon fontSize="small" /> Back to Blogs
      </Link>

      <article className="blog-post">
        <header className="blog-post-header">
          <h1>{meta.title}</h1>
          <div className="blog-post-meta">
            <span className="blog-post-author">By {meta.author}</span>
            <time dateTime={meta.date}>{formattedDate}</time>
            <span className="blog-post-read-time">{meta.readTime}</span>
          </div>
          <div className="blog-post-tags">
            {meta.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" className="blog-tag-chip" />
            ))}
          </div>
          <ShareButton title={meta.title} slug={meta.slug} />
        </header>

        <div
          className="blog-post-content markdown-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  );
};

export default BlogPost;
