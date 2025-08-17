import React from "react";
import '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJava, faDocker, faPhoenixFramework } from '@fortawesome/free-brands-svg-icons';
import { faMicrochip } from "@fortawesome/free-solid-svg-icons";
import Chip from '@mui/material/Chip';
import '../assets/styles/Expertise.scss';

type Skill = {
    icon: any; 
    title: string;
    description: string;
    techStack: string[];
};

const skillsData: Skill[] = [
    {
        icon: faMicrochip,
        title: "AI & Generative Systems",
        description: "Hands-on experience in building intelligent applications using large language models and modern AI frameworks. Focus on designing solutions that combine reasoning, retrieval, and automation to deliver smarter outcomes.",
        techStack: [
            "Prompt Engineering",
            "Generative AI (GenAI)",
            "LLMs",
            "Agentic AI",
            "MCP",
            "RAG",
            "Tool Use / Function Calling",
            "Ollama",
            "Hugging Face"
        ]
    },
    {
        icon: faJava,
        title: "Microservices Development",
        description: "With a strong foundation in microservices architecture, I have built scalable and maintainable applications that can be easily extended and integrated with other services.",
        techStack: [
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
        ]
    },
    {
        icon: faDocker,
        title: "DevOps & Automation",
        description: "DevOps is a key part of my development process. I have experience setting up CI/CD pipelines, deployment automation, and monitoring for microservices applications.",
        techStack: [
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
            "Grafana",
            "Prometheus"
        ]
    },
    {
        icon: faPhoenixFramework,
        title: "Frameworks Approaches",
        description: "I leverage modern frameworks for scalable applications, employ event-driven architecture for real-time responsiveness, and utilize BDD and TDD to ensure high-quality, user-centric, and reliable software development.",
        techStack: [
            "Test Driven Development",
            "Behavior-Driven Development",
            "Event-Driven Development",
            "Scalable Applications",
            "Cucumber",
            "Karate",
            "Agile",
            "Scrum"
        ]
    }
];

const SkillSection = ({ icon, title, description, techStack }: Skill) => (
    <div className="skill">
        <FontAwesomeIcon icon={icon} size="3x" />
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="flex-chips">
            <span className="chip-title">Tech stack:</span>
            {techStack.map((label, index) => (
                <Chip key={index} className='chip' label={label} />
            ))}
        </div>
    </div>
);

function Expertise() {
    return (
        <div className="container" id="expertise">
            <div className="skills-container">
                <h1>Expertise</h1>
                <div className="skills-grid">
                    {skillsData.map((skill, index) => (
                        <SkillSection key={index} {...skill} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Expertise;
