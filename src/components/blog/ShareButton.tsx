import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import CheckIcon from "@mui/icons-material/Check";

interface ShareButtonProps {
  title: string;
  slug: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, slug }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const postUrl = `${window.location.origin}${window.location.pathname}#/blog/${slug}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = postUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
  };

  return (
    <div className="share-container">
      <Tooltip title="Share this post">
        <IconButton
          onClick={() => setOpen((prev) => !prev)}
          className="share-toggle-btn"
          aria-label="Share this post"
        >
          <ShareIcon />
        </IconButton>
      </Tooltip>

      {open && (
        <div className="share-options">
          <Tooltip title={copied ? "Copied!" : "Copy link"}>
            <IconButton onClick={handleCopy} aria-label="Copy link" size="small">
              {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Share on LinkedIn">
            <IconButton
              component="a"
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              size="small"
            >
              <LinkedInIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share on X">
            <IconButton
              component="a"
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
              size="small"
            >
              <XIcon />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
