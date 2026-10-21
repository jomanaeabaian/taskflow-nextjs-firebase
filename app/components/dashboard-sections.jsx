import Link from "next/link";
import { CircleCheck as CircleCheckIcon, Plus as PlusIcon } from "lucide-react";
import { PRIORITY_LABELS, STATUS_LABELS, formatDate, pluralize } from "@/app/lib/task-utils";

const ROW =
  "flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-4 transition-colors " +
  "hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca]";

function SectionHeading({ children }) {
  return <h2 className="text-lg font-semibold leading-7 tracking-tight text-slate-900">{children}</h2>;
}

function EmptyState({ icon: Icon = CircleCheckIcon, title, description, children }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-[#dbdee5] px-4 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-[#e7eeff] text-[#19285f]">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 text-base font-semibold leading-6 text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      {children}
    </div>
  );
}

function SkeletonRows({ count = 1 }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[58px] animate-pulse rounded-xl border border-[#dbdee5] bg-white" />
      ))}
    </div>
  );
}

/** Tasks assigned to the signed-in user that are not done yet. */
export function AssignedTasks({ tasks, loading }) {
  return (
    <section className="mt-8" aria-labelledby="assigned-heading">
      <div id="assigned-heading" className="mb-3">
        <SectionHeading>Assigned to you</SectionHeading>
      </div>
      {loading ? (
        <SkeletonRows />
      ) : tasks.length === 0 ? (
        <EmptyState title="Nothing assigned to you" description="Tasks assigned to you will show up here." />
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={`${task.projectId}/${task.id}`}>
              <Link href={`/projects/${task.projectId}`} className={`${ROW} border-[#dbdee5]`}>
                <span className="min-w-0">
                  <span className="block truncate text-base text-slate-900">{task.title}</span>
                  <span className="block truncate text-xs text-gray-600">{task.projectName}</span>
                </span>
                <span className="flex shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs text-gray-600">
                  <span className="rounded-full border border-slate-300 px-2 py-0.5 font-medium text-slate-700">
                    {STATUS_LABELS[task.status] ?? task.status}
                  </span>
                  <span className="rounded-full border border-slate-300 px-2 py-0.5 font-medium text-slate-700">
                    {PRIORITY_LABELS[task.priority] ?? task.priority}
                  </span>
                  {task.dueDate && <span className="text-sm">Due {formatDate(task.dueDate)}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Tasks past their due date that are not done (any assignee, any accessible project). */
export function OverdueTasks({ tasks, loading }) {
  return (
    <section className="mt-8" aria-labelledby="overdue-heading">
      <div id="overdue-heading" className="mb-3">
        <SectionHeading>Overdue tasks</SectionHeading>
      </div>
      {loading ? (
        <SkeletonRows />
      ) : tasks.length === 0 ? (
        <EmptyState title="No overdue tasks" description="You're all caught up." />
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={`${task.projectId}/${task.id}`}>
              <Link href={`/projects/${task.projectId}`} className={`${ROW} border-red-200`}>
                <span className="min-w-0">
                  <span className="block truncate text-base text-slate-900">{task.title}</span>
                  <span className="block truncate text-xs text-gray-600 sm:hidden">{task.projectName}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="hidden truncate text-xs text-gray-600 sm:block">{task.projectName}</span>
                  <span className="text-sm font-medium text-red-800">Due {formatDate(task.dueDate)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Accessible projects (FR-14) with a role badge and task counts. */
export function ProjectsSection({ projects, loading, uid }) {
  return (
    <section id="projects" className="mt-8 scroll-mt-8" aria-labelledby="projects-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div id="projects-heading">
          <SectionHeading>Your projects</SectionHeading>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2943ca] px-3 text-sm font-medium text-white transition-colors hover:bg-[#2339b0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca] focus-visible:ring-offset-2"
        >
          <PlusIcon /> New project
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading">
          <div className="h-[96px] animate-pulse rounded-xl border border-[#dbdee5] bg-white" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create your first project to start organizing tasks.">
          <Link href="/projects/new" className="mt-4 text-sm font-medium text-[#2943ca] underline underline-offset-4">
            Create a project
          </Link>
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="block rounded-xl border border-[#dbdee5] bg-white p-4 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca]"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate text-base font-semibold text-slate-900">{project.name}</span>
                  <span className="shrink-0 rounded-full border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {project.ownerId === uid ? "Owner" : "Member"}
                  </span>
                </span>
                <span className="mt-2 block text-sm text-gray-600">
                  {pluralize(project.taskCount, "task")}
                  {project.overdueCount > 0 && <span className="text-red-800"> · {project.overdueCount} overdue</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
