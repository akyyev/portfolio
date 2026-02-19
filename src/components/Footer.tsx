import React from "react";
import '../assets/styles/Footer.scss';
import SocialLinks from './SocialLinks';

function Footer() {
  return (
    <footer role="contentinfo">
      <SocialLinks />
      <p>
        &copy; <span id="year">{new Date().getFullYear()}</span> Bagtyyar. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
