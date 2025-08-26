"use client";

import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard";
import useAdminData from "../hooks/useAdminData";

export default function ProjectsGrid() {
  const { projects } = useAdminData();

  // Add a local loading state for skeletons
  const loadingProjects = !projects || projects.length === 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence initial={false}>
          {loadingProjects ? (
            [...Array(6)].map((_, i) => (
              <motion.div
                key={`s-${i}`}
                className="h-40 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            ))
          ) : (
            projects.map((p, idx) => (
              <ProjectCard key={p.id} project={p} index={idx} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
