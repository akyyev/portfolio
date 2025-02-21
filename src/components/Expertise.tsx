import React from "react";
import '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJava, faDocker, faPhoenixFramework } from '@fortawesome/free-brands-svg-icons';
import Chip from '@mui/material/Chip';
import '../assets/styles/Expertise.scss';

const labelsFirst = [
    "Java",
    "Python",
    "JS",
    "TS",
    "Spring Boot 3x/4x",
    "Spring MVC",
    "SQL/NoSQL",    
    "Restful WebServices",
    "JPA",
    "Kafka",
    "PostgreSQL",
    "Caching",
    "Swagger",
    "Git",
    "Jmeter",
    "Test Containers",
    "Karate/BDD"
];

const labelsSecond = [
    "Git",
    "GitHub Actions",
    "Docker",
    "Azure",
    "Google Cloud Platform",
    "Kubernetes",
    "Jenkins",
    "Junit/Mockito",
    "Splunk",
    "SonarQube",
    "Concord",
    "Snyk",
    "Graphana",
    "Prometheus"
];

const labelsThird = [
    "Behavior-Driven Development",
    "Cucumber",
    "Karate",
    "Test Driven Development",
    "Event-Driven Architecture",
    "Agile",
    "Scrum",
    "Scalable Applications"
];

function Expertise() {
    return (
    <div className="container" id="expertise">
        <div className="skills-container">
            <h1>Expertise</h1>
            <div className="skills-grid">
                <div className="skill">
                    <FontAwesomeIcon icon={faJava} size="3x"/>
                    <h3>Microservices Development</h3>
                    <p>With a strong foundation in microservices architecture, I have built scalable and maintainable applications that can be easily extended and integrated with other services.</p>
                    <div className="flex-chips">
                        <span className="chip-title">Tech stack:</span>
                        {labelsFirst.map((label, index) => (
                            <Chip key={index} className='chip' label={label} />
                        ))}
                    </div>
                </div>

                <div className="skill">
                    <FontAwesomeIcon icon={faDocker} size="3x"/>
                    <h3>DevOps & Automation</h3>
                    <p>DevOps is a key part of my development process. I have experience setting up CI/CD pipelines, deployment automation, and monitoring for microservices applications.</p>
                    <div className="flex-chips">
                        <span className="chip-title">Tech stack:</span>
                        {labelsSecond.map((label, index) => (
                            <Chip key={index} className='chip' label={label} />
                        ))}
                    </div>
                </div>

                <div className="skill">
                    <FontAwesomeIcon icon={faPhoenixFramework} size="3x"/>
                    <h3>Frameworks Approaches</h3>
                    <p>I leverage modern frameworks for scalable applications, employ event-driven architecture for real-time responsiveness, and utilize BDD and TDD to ensure high-quality, user-centric, and reliable software development.</p>
                    
                    <div className="flex-chips">
                        <span className="chip-title">Tech stack:</span>
                        {labelsThird.map((label, index) => (
                            <Chip key={index} className='chip' label={label} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Expertise;