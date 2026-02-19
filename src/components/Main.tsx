import React from "react";
import '../assets/styles/Main.scss';
import avatar from '../assets/images/pro.png';
import SocialLinks from './SocialLinks';

function Main() {
  return (
    <section id="home" className="container" aria-labelledby="hero-title">
      <div className="about-section">
        <div className="image-wrapper">
          <img src={avatar} alt="Bagtyyar Akyyev - Software Engineer" />
        </div>
        <div className="content">
          <SocialLinks className="social_icons" />
          <h1 id="hero-title">Hi, I'm Bagtyyar.</h1>
          <p>
            Software Development Engineer
            <br />
            <span aria-label="Avid Traveler, Tech Enthusiast, Cyclist, Former SDET">
              Avid Traveler 🌍, Tech Enthusiast 🤖, Cyclist 🚴, Former SDET 💻
            </span>
          </p>
          <SocialLinks className="mobile_social_icons" />
        </div>
      </div>
    </section>
  );
}

export default Main;
