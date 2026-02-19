import React from "react";
import wmh from '../assets/images/wmh.png';
import rye from '../assets/images/rye.png';
import '../assets/styles/Project.scss';

interface ProjectCardProps {
  image: string;
  title: string;
  description: string;
  link?: string;
  imageAlt: string;
  tags?: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ image, title, description, link, imageAlt, tags }) => (
  <article className="project-card">
    <div className="project-card__image-wrapper">
      {link ? (
        <a href={link} target="_blank" rel="noreferrer">
          <img src={image} className="project-card__image" alt={imageAlt} />
        </a>
      ) : (
        <img src={image} className="project-card__image" alt={imageAlt} />
      )}
    </div>
    <div className="project-card__content">
      {link ? (
        <a href={link} target="_blank" rel="noreferrer" className="project-card__title-link">
          <h2 className="project-card__title">{title}</h2>
        </a>
      ) : (
        <h2 className="project-card__title">{title}</h2>
      )}
      <p className="project-card__description">{description}</p>
      {tags && tags.length > 0 && (
        <div className="project-card__tags">
          {tags.map((tag, index) => (
            <span key={index} className="project-card__tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  </article>
);

const projectsData: ProjectCardProps[] = [
  {
    image: rye,
    title: "Reorder Your Essentials",
    description: `Worked on building a personalization platform for Sam's Club that allows customers 
to see personalized content based on their preferences. Especially reorder your essentials 
and other page features. Took active role on all phases of the project from design to deployment.`,
    link: "https://samsclub.com",
    imageAlt: "Reorder Your Essentials feature screenshot showing personalized product recommendations",
    tags: ["Java", "Spring Boot", "Personalization", "React"],
  },
  {
    image: wmh,
    title: "Scheduling Platform",
    description: `Worked on building a scheduling platform for Walmart Health that allowed patients 
to schedule appointments with doctors and other healthcare providers. The platform was built 
using Java, Spring Boot, MySQL and many other technologies.`,
    imageAlt: "Walmart Health scheduling platform screenshot showing appointment booking interface",
    tags: ["Java", "Spring Boot", "MySQL", "Healthcare"],
  },
];

const ProjectList: React.FC = () => {
  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
        <p className="projects-subtitle">
          A selection of projects I've worked on throughout my career.
        </p>
      </div>

      <div className="projects-grid">
        {projectsData.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
