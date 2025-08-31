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
            <a href={url.GIT_URL} target="_blank" rel="noreferrer"><GitHubIcon/></a>
            <a href={url.LINKEDIN_URL} target="_blank" rel="noreferrer"><LinkedInIcon/></a>
          </div>
          <h1>Hi, I'm Bagtyyar A.</h1>
          <p>Senior Software Engineer
          <br/>Avid Traveler 🌍, Tech Enthusiast 🤖, Cyclist 🚴, SDET 💻</p>

          <div className="mobile_social_icons">
            <a href={url.GIT_URL} target="_blank" rel="noreferrer"><GitHubIcon/></a>
            <a href={url.LINKEDIN_URL} target="_blank" rel="noreferrer"><LinkedInIcon/></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;