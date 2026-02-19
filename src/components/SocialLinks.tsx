import React from "react";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { url } from "../constants/cons";

interface SocialLinksProps {
  className?: string;
}

/**
 * Reusable social media links component.
 * Used in Main hero section, Footer, and mobile navigation.
 * DRY: Single source of truth for social links.
 */
const SocialLinks: React.FC<SocialLinksProps> = ({ className }) => (
  <div className={className}>
    <a 
      href={url.GIT_URL} 
      target="_blank" 
      rel="noreferrer" 
      aria-label="Visit my GitHub Profile (opens in new tab)"
    >
      <GitHubIcon />
    </a>
    <a 
      href={url.LINKEDIN_URL} 
      target="_blank" 
      rel="noreferrer" 
      aria-label="Visit my LinkedIn Profile (opens in new tab)"
    >
      <LinkedInIcon />
    </a>
  </div>
);

export default SocialLinks;
