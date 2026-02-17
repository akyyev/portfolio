import React from "react";
import { Link } from "react-router-dom";
import Chip from "@mui/material/Chip";
import type { BlogPostMeta } from "./types";

interface BlogCardProps {
  post: BlogPostMeta;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link to={`/portfolio/blog/${post.slug}`} className="blog-card-link">
      <article className="blog-card">
        <div className="blog-card-header">
          <time dateTime={post.date}>{formattedDate}</time>
          <span className="blog-card-read-time">{post.readTime}</span>
        </div>
        <h2 className="blog-card-title">{post.title}</h2>
        <p className="blog-card-excerpt">{post.excerpt}</p>
        <div className="blog-card-tags">
          {post.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" className="blog-tag-chip" />
          ))}
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
