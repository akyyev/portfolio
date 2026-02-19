import React, { useState, useEffect, useMemo } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Chip from "@mui/material/Chip";
import BlogCard from "./BlogCard";
import type { BlogPostMeta } from "./types";
import "../../assets/styles/Blog.scss";

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/blog/index.json`)
      .then((res) => res.json())
      .then((data: BlogPostMeta[]) => {
        const sorted = data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setPosts(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load blog index:", err);
        setLoading(false);
      });
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = search.toLowerCase();
    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));
      const matchesTag = !activeTag || post.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [posts, search, activeTag]);

  const handleTagClick = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
  };

  if (loading) {
    return (
      <div className="blog-container">
        <p>Loading blog posts...</p>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blogs</h1>
        <p className="blog-subtitle">
          Thoughts on software engineering, AI, and career growth.
        </p>
      </div>

      <div className="blog-controls">
        <TextField
          id="blog-search"
          placeholder="Search posts..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="blog-search-field"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <div className="blog-tag-filters">
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              className={`blog-filter-chip ${
                activeTag === tag ? "active" : ""
              }`}
              onClick={() => handleTagClick(tag)}
            />
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <p className="blog-no-results">No posts found matching your search.</p>
      ) : (
        <div className="blog-grid">
          {filteredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
