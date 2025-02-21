import React from "react";
import '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import '../assets/styles/Timeline.scss'
import { timelineElements } from "../constants/cons";

interface TimelineElementProps {
  date: string;
  title: string;
  location: string;
  description: string;
}

const TimelineElement: React.FC<TimelineElementProps> = ({ date, title, location, description }) => (
  <VerticalTimelineElement
    className="vertical-timeline-element--work"
    contentStyle={{ background: 'white', color: 'rgb(39, 40, 34)' }}
    contentArrowStyle={{ borderRight: '7px solid white' }}
    date={date}
    iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
    icon={<FontAwesomeIcon icon={faBriefcase} />}
  >
    <h3 className="vertical-timeline-element-title">{title}</h3>
    <h4 className="vertical-timeline-element-subtitle">{location}</h4>
    <p>{description}</p>
  </VerticalTimelineElement>
);

function Timeline() {
  return (
    <div id="history">
      <div className="items-container">
        <h1>Career History</h1>
        <VerticalTimeline>
          {timelineElements.map((element, index) => (
            <TimelineElement
              key={index}
              date={element.date}
              title={element.title}
              location={element.location}
              description={element.description}
            />
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
}

export default Timeline;