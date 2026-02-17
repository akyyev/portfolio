import React from "react";
import wmh from '../assets/images/wmh.png';
import rye from '../assets/images/rye.png';
import '../assets/styles/Project.scss';

function Project() {
    return(
    <div className="projects-container" id="projects">
        <h1>Projects</h1>
        <div className="projects-grid">
            <div className="project">
                <a href="https://samsclub.com" target="_blank" rel="noreferrer"><img src={rye} className="zoom" alt="Reorder Your Essentials feature screenshot" width="100%"/></a>
                <a href="https://samsclub.com" target="_blank" rel="noreferrer"><h2>Reorder Your Essentials</h2></a>
                <p>Worked on building a personalization platform for Sams Club
                that allows customers to see personalized content based on
                their preferences. Especially reorder your essentials and other page features.
                Took active role on all phases of the project from design to deployment.</p>
            </div>
            <div className="project">
                <img src={wmh} className="zoom" alt="Walmart Health scheduling platform screenshot" width="100%"/>
                <h2>Scheduling Platform</h2>
                <p>Worked on building a scheduling platform for Walmart Health
                that allowed patients to schedule appointments with doctors
                and other healthcare providers. The platform was built using
                Java, Spring Boot, MySQL and many other technologies.</p>
            </div>
        </div>
    </div>
    );
}

export default Project;