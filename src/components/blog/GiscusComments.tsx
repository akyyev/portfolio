import React, { useEffect, useRef } from "react";

interface GiscusCommentsProps {
  term: string;
}

const GISCUS_CONFIG = {
  repo: "akyyev/portfolio",
  repoId: "R_kgDON9FITA",           // Fill after enabling Discussions
  category: "Blog comments",
  categoryId: "DIC_kwDON9FITM4C2mRT",       // Fill after creating category
  mapping: "specific",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "top",
  lang: "en",
  loading: "lazy",
};

const GiscusComments: React.FC<GiscusCommentsProps> = ({ term }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous instance
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", GISCUS_CONFIG.repo);
    script.setAttribute("data-repo-id", GISCUS_CONFIG.repoId);
    script.setAttribute("data-category", GISCUS_CONFIG.category);
    script.setAttribute("data-category-id", GISCUS_CONFIG.categoryId);
    script.setAttribute("data-mapping", GISCUS_CONFIG.mapping);
    script.setAttribute("data-term", term);
    script.setAttribute("data-reactions-enabled", GISCUS_CONFIG.reactionsEnabled);
    script.setAttribute("data-emit-metadata", GISCUS_CONFIG.emitMetadata);
    script.setAttribute("data-input-position", GISCUS_CONFIG.inputPosition);
    script.setAttribute("data-lang", GISCUS_CONFIG.lang);
    script.setAttribute("data-loading", GISCUS_CONFIG.loading);
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    containerRef.current.appendChild(script);
  }, [term]);

  const isConfigured = GISCUS_CONFIG.repoId && GISCUS_CONFIG.categoryId;

  if (!isConfigured) {
    return (
      <div className="giscus-placeholder">
        <h3>Comments</h3>
        <p>
          Comments are powered by{" "}
          <a
            href="https://giscus.app"
            target="_blank"
            rel="noreferrer"
            aria-label="Giscus - GitHub Discussions powered comments"
          >
            Giscus
          </a>
          . To enable them, configure your GitHub repo's Discussion settings and
          update the Giscus config in{" "}
          <code>src/components/blog/GiscusComments.tsx</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="giscus-wrapper">
      <h3>Comments</h3>
      <div ref={containerRef} />
    </div>
  );
};

export default GiscusComments;
