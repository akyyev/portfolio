import React from "react";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import '../assets/styles/Main.scss';
import avatar from '../assets/images/pro.png';
import { url } from "../constants/cons";

function Main() {

  return (
    <div id='home' className="container">
      <div className="about-section">
        <div className="image-wrapper">
          <img src={avatar} alt="Avatar" />
        </div>
        <div className="content">
          <div className="social_icons">
            <a href={url.GIT_URL} target="_blank" rel="noreferrer" aria-label="GitHub Profile"><GitHubIcon/></a>
            <a href={url.LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn Profile"><LinkedInIcon/></a>
          </div>
          <h1>Hi, I'm Bagtyyar.</h1>
          <p>Software Development Engineer
          <br/>Avid Traveler 🌍, Tech Enthusiast 🤖, Cyclist 🚴, Former SDET 💻</p>

          <div className="mobile_social_icons">
            <a href={url.GIT_URL} target="_blank" rel="noreferrer" aria-label="GitHub Profile"><GitHubIcon/></a>
            <a href={url.LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn Profile"><LinkedInIcon/></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;