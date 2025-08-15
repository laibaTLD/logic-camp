"use client";

import React from "react";
import ProjectCard from "../../components/ProjectCard";

interface Project {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  membersCount: number;
}

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-6">
        No projects found. Create your first one!
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          title={project.title}
          description={project.description}
          dueDate={project.dueDate}
          membersCount={project.membersCount}
        />
      ))}
    </div>
  );
};

export default ProjectList;
