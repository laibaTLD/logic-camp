<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
  {loadingProjects ? (
    [...Array(6)].map((_, i) => (
      <div
        key={`s-${i}`}
        className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
      />
    ))
  ) : (
    projects.map((p, idx) => (
      <ProjectCard key={p.id} project={p} index={idx} onOpenProject={openProject} />
    ))
  )}
</div>
