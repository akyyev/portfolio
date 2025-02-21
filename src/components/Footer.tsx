import React from "react";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import '../assets/styles/Footer.scss'
import { url } from "../constants/cons";

function Footer() {
  return (
    <footer>
      <div>
        <a href={url.GIT_URL} target="_blank" rel="noreferrer"><GitHubIcon/></a>
        <a href={url.LINKEDIN_URL} target="_blank" rel="noreferrer"><LinkedInIcon/></a>
      </div>
      <p>&copy; <span id="year">{new Date().getFullYear()} </span>Bagtyyar. All rights reserved</p>

    </footer>
  );
}

export default Footer;