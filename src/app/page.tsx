import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProjectList from "./features/projects/ProjectList";
import TaskList from "./features/tasks/TaskList";
import Notification from "./components/Notification";

export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Dashboard Area */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Notifications */}
          <Notification message="Welcome to myTeamCamp 🚀" type="success" />

          {/* Projects */}
          <ProjectList projects={[]} />

          {/* Tasks */}
          <TaskList tasks={[]} />
        </main>
      </div>
    </div>
  );
}
