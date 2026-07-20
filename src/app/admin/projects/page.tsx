import { listProjects } from "@/app/actions/projects";
import { ProjectsManager } from "@/components/admin/ProjectsManager";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div>
      <h1 className="font-display-ar text-3xl font-semibold text-bone">معرض المشاريع</h1>
      <p className="mt-2 text-sm text-bone-muted">
        المشاريع اللي بتضيفها هنا بتظهر فورًا في صفحة «أعمالنا» على الموقع بمعرض احترافي.
      </p>
      <div className="mt-8">
        <ProjectsManager projects={projects} />
      </div>
    </div>
  );
}
