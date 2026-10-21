"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CircleAlert,
  ArrowLeft,
  CalendarDays,
  CircleCheck,
  ChevronDown,
  CircleDashed,
  CircleDot,
  ListChecks,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { AppShell } from "@/app/components/app-shell";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import { EmptyState } from "@/app/components/empty-state";
import { Modal } from "@/app/components/modal";
import { TaskFormDialog } from "@/app/components/task-form-dialog";
import { addMemberByEmail, deleteProject, getProject, getUsersByIds, removeMember, updateProject, validateProjectInput } from "@/app/services/projects";
import { createTask, deleteTask, subscribeToProjectTasks, updateTask } from "@/app/services/tasks";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  byNewest,
  filterTasks,
  formatDate,
  getInitials,
  getTaskPermissions,
  isOverdue,
} from "@/app/lib/task-utils";
import { btnDanger, btnPrimary, btnSecondary, card, fieldErrorText, fieldInput, fieldInvalid, fieldLabel, fieldTextarea } from "@/app/lib/ui-classes";

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

const EMPTY_FILTERS = { search: "", status: "", priority: "", assignee: "", overdueOnly: false };
const hasActiveFilters = (f) => Object.keys(EMPTY_FILTERS).some((k) => f[k] !== EMPTY_FILTERS[k]);

const pill = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium";
const STATUS_STYLES = {
  todo: { icon: CircleDashed, cls: "border-slate-300 bg-slate-50 text-slate-700" },
  in_progress: { icon: CircleDot, cls: "border-blue-300 bg-blue-50 text-blue-700" },
  done: { icon: CircleCheck, cls: "border-green-300 bg-green-50 text-green-700" },
};
const PRIORITY_STYLES = {
  high: "border-red-300 bg-red-50 text-red-700",
  medium: "border-amber-300 bg-amber-50 text-amber-800",
  low: "border-sky-300 bg-sky-50 text-sky-700",
};

function Avatar({ name, size = "size-6 text-[10px]" }) {
  return (
    <span aria-hidden="true" className={`grid ${size} shrink-0 place-items-center rounded-full border border-[#dbdee5] bg-[#e7eeff] font-semibold text-[#19285f]`}>
      {getInitials(name)}
    </span>
  );
}

function BackLink() {
  return (
    <Link href="/projects" className="inline-flex items-center gap-1.5 rounded text-sm text-gray-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca]">
      <ArrowLeft className="size-4" aria-hidden="true" /> All projects
    </Link>
  );
}

function SelectField({ id, label, value, onChange, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={fieldLabel}>{label}</label>
      <div className="relative">
        <select id={id} value={value} onChange={onChange} className={`${fieldInput} appearance-none pr-9`}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-600" aria-hidden="true" />
      </div>
    </div>
  );
}

function TaskRow({ task, assigneeName, perms, onEdit, onDelete }) {
  const overdue = isOverdue(task);
  const status = STATUS_STYLES[task.status] ?? STATUS_STYLES.todo;
  const StatusIcon = status.icon;

  return (
    <li className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${overdue ? "border-red-300 bg-red-50/60" : "border-[#dbdee5] bg-white"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`wrap-break-word text-base font-medium ${task.status === "done" ? "text-slate-700 line-through" : "text-slate-900"}`}>{task.title}</h3>
          {overdue && (
            <span className={`${pill} border-red-700 bg-red-700 font-semibold text-white`}>
              <CircleAlert className="size-3" aria-hidden="true" /> Overdue
            </span>
          )}
        </div>
        {task.description && <p className="mt-1.5 wrap-break-word text-sm text-gray-600">{task.description}</p>}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`${pill} ${status.cls}`}>
            <StatusIcon className="size-3" aria-hidden="true" /> {STATUS_LABELS[task.status] ?? task.status}
          </span>
          <span className={`${pill} ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium}`}>{PRIORITY_LABELS[task.priority] ?? task.priority} priority</span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600">
          <span className={`inline-flex items-center gap-1.5 ${overdue ? "font-semibold text-red-800" : ""}`}>
            <CalendarDays className="size-4" aria-hidden="true" />
            {task.dueDate ? formatDate(task.dueDate) : "No due date"}
          </span>
          {assigneeName ? (
            <span className="inline-flex items-center gap-1.5 text-slate-900">
              <Avatar name={assigneeName} /> {assigneeName}
            </span>
          ) : (
            <span>Unassigned</span>
          )}
        </div>
      </div>

      {(perms.canEdit || perms.canDelete) && (
        <div className="flex w-21.75 shrink-0 flex-col gap-2">
          {perms.canEdit && (
            <button type="button" className={`${btnSecondary} w-full`} onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>
              <Pencil className="size-4" aria-hidden="true" /> Edit
            </button>
          )}
          {perms.canDelete && (
            <button type="button" className={`${btnDanger} w-full`} onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}>
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function TaskFilterPanel({ filters, onChange, members }) {
  const set = (field) => (event) => onChange({ ...filters, [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value });
  return (
    <div role="search" aria-label="Filter tasks" className={`${card} space-y-4 p-4`}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="task-search" className={fieldLabel}>Search tasks</label>
          {hasActiveFilters(filters) && (
            <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="rounded text-sm font-medium text-[#2943ca] underline underline-offset-4 hover:text-[#2339b0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca]">
              Clear filters
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-600" aria-hidden="true" />
          <input id="task-search" type="search" placeholder="Search by title" value={filters.search} onChange={set("search")} className={`${fieldInput} pl-9`} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField id="filter-status" label="Status" value={filters.status} onChange={set("status")}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </SelectField>
        <SelectField id="filter-priority" label="Priority" value={filters.priority} onChange={set("priority")}>
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </SelectField>
        <SelectField id="filter-assignee" label="Assignee" value={filters.assignee} onChange={set("assignee")}>
          <option value="">Everyone</option>
          <option value="unassigned">Unassigned</option>
          {members.map((m) => <option key={m.uid} value={m.uid}>{m.displayName}</option>)}
        </SelectField>
        <div className="flex items-end">
          <label className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-black/15 bg-white px-3 text-sm text-slate-900">
            <input type="checkbox" checked={filters.overdueOnly} onChange={set("overdueOnly")} className="size-4 accent-[#2943ca]" />
            Overdue only
          </label>
        </div>
      </div>
    </div>
  );
}

function MembersPanel({ project, members, isOwner, onRemove, onAdded }) {
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleAdd(event) {
    event.preventDefault();
    if (adding) return;
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setError("Enter the email of the person to add.");
      return;
    }
    setAdding(true);
    try {
      const added = await addMemberByEmail(project, email);
      onAdded(added);
      setEmail("");
      setSuccess(`${added.displayName} was added to the project.`);
    } catch (err) {
      console.error(err);
      setError(err?.userFacing ? err.message : "Failed to add the member. Check your connection and try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <aside aria-labelledby="members-heading" className={`${card} p-5`}>
      <h2 id="members-heading" className="text-lg font-semibold leading-7 tracking-tight text-slate-900">Members</h2>

      <ul className="mt-4 divide-y divide-[#dbdee5]">
        {members.map((member) => (
          <li key={member.uid} className="flex items-center gap-3 py-3 first:pt-0">
            <Avatar name={member.displayName} size="size-8 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{member.displayName}</p>
              {member.email && <p className="truncate text-xs text-gray-600">{member.email}</p>}
            </div>
            {member.uid === project.ownerId ? (
              <span className="shrink-0 rounded-full bg-[#2943ca] px-2.5 py-0.5 text-xs font-semibold text-white">Owner</span>
            ) : (
              isOwner && (
                <button type="button" onClick={() => onRemove(member)} aria-label={`Remove ${member.displayName}`} className={`${btnSecondary} h-8 shrink-0 px-2.5 text-xs`}>
                  <UserMinus className="size-3.5" aria-hidden="true" /> Remove
                </button>
              )
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form onSubmit={handleAdd} noValidate className="mt-2 space-y-1.5 border-t border-[#dbdee5] pt-5">
          <label htmlFor="member-email" className={fieldLabel}>Add member by email</label>
          <input
            id="member-email"
            type="email"
            autoComplete="off"
            placeholder="dana@example.test"
            value={email}
            disabled={adding}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? "true" : undefined}
            aria-describedby="member-email-hint"
            className={`${fieldInput} ${error ? fieldInvalid : ""}`}
          />
          <p id="member-email-hint" className="text-xs text-gray-600">The person must already have an account.</p>
          {error && <p role="alert" className={fieldErrorText}>{error}</p>}
          {success && <p role="status" className="text-xs font-medium text-green-700">{success}</p>}
          <button type="submit" disabled={adding} className={`${btnPrimary} mt-2`}>
            <UserPlus className="size-4" aria-hidden="true" /> {adding ? "Adding..." : "Add member"}
          </button>
        </form>
      )}
    </aside>
  );
}

function EditProjectForm({ project, onSave, onClose }) {
  const [values, setValues] = useState({ name: project.name ?? "", description: project.description ?? "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validateProjectInput(values) ?? {};
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    try {
      await onSave(values);
      onClose();
    } catch (error) {
      console.error(error);
      setSubmitError("Failed to save the project. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6">
      <h2 id="edit-project-title" className="text-lg font-semibold text-slate-900">Edit project</h2>
      {submitError && (
        <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" /> {submitError}
        </div>
      )}
      <div className="mt-4 space-y-4">
        <div className="space-y-1">
          <label htmlFor="edit-project-name" className={fieldLabel}>Project name <span className="ml-1 text-red-600" aria-hidden="true">*</span></label>
          <input id="edit-project-name" value={values.name} disabled={saving} onChange={set("name")} aria-invalid={errors.name ? "true" : undefined} aria-describedby={errors.name ? "edit-project-name-error" : undefined} className={`${fieldInput} ${errors.name ? fieldInvalid : ""}`} />
          {errors.name && <p id="edit-project-name-error" className={fieldErrorText}>{errors.name}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="edit-project-description" className={fieldLabel}>Description (optional)</label>
          <textarea id="edit-project-description" value={values.description} disabled={saving} onChange={set("description")} aria-invalid={errors.description ? "true" : undefined} className={`${fieldTextarea} ${errors.description ? fieldInvalid : ""}`} />
          {errors.description && <p className={fieldErrorText}>{errors.description}</p>}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className={btnSecondary} onClick={onClose} disabled={saving}>Cancel</button>
        <button type="submit" className={btnPrimary} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
      </div>
    </form>
  );
}


export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const uid = user?.uid;
  const leaving = useRef(false); // set while deleting the project so late listener errors are ignored

  const [projectState, setProjectState] = useState({ status: "loading", project: null }); // loading | ready | notfound | denied | error
  const [reloadKey, setReloadKey] = useState(0);
  const [tasksState, setTasksState] = useState({ loading: true, error: null, tasks: [] });
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [taskDialog, setTaskDialog] = useState(null); // { mode: "create" } | { mode: "edit", task }
  const [deleteTask_, setDeleteTask] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [confirm, setConfirm] = useState({ busy: false, error: null }); // shared by the three confirm dialogs (only one is open at a time)

  // 1) Load the project and decide: ready / not found / access denied (a non-member must never see data).
  useEffect(() => {
    if (!uid || !id) return;
    let cancelled = false;
    setProjectState({ status: "loading", project: null });
    (async () => {
      try {
        const project = await getProject(id);
        if (cancelled) return;
        if (!project) setProjectState({ status: "notfound", project: null });
        else if (!project.memberIds?.includes(uid)) setProjectState({ status: "denied", project: null });
        else setProjectState({ status: "ready", project });
      } catch (error) {
        console.error("Failed to load project:", error);
        if (!cancelled) setProjectState({ status: error?.code === "permission-denied" ? "denied" : "error", project: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, id, reloadKey]);

  const project = projectState.project;
  const memberKey = project?.memberIds?.join(",") ?? "";

  // 2) Member display names (owner first).
  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    getUsersByIds(project.memberIds).then((list) => {
      if (cancelled) return;
      setMembers([...list].sort((a, b) => (b.uid === project.ownerId) - (a.uid === project.ownerId)));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberKey]);

  // 3) Live task list.
  useEffect(() => {
    if (projectState.status !== "ready") return;
    setTasksState({ loading: true, error: null, tasks: [] });
    return subscribeToProjectTasks(
      id,
      (tasks) => setTasksState({ loading: false, error: null, tasks }),
      (error) => {
        if (leaving.current) return;
        console.error("Failed to load tasks:", error);
        setTasksState({ loading: false, error: "We couldn't load the tasks. Check your connection and try again.", tasks: [] });
      }
    );
  }, [projectState.status, id, reloadKey]);

  const isOwner = !!project && project.ownerId === uid;
  const membersById = useMemo(() => Object.fromEntries(members.map((m) => [m.uid, m])), [members]);
  const sorted = useMemo(() => [...tasksState.tasks].sort(byNewest), [tasksState.tasks]);
  const visible = useMemo(() => filterTasks(sorted, filters), [sorted, filters]);

  const patchProject = (changes) => setProjectState((s) => ({ ...s, project: { ...s.project, ...changes } }));

  async function runConfirmed(action, failureMessage, onDone) {
    setConfirm({ busy: true, error: null });
    try {
      await action();
      setConfirm({ busy: false, error: null });
      onDone();
      return true;
    } catch (error) {
      console.error(error);
      setConfirm({ busy: false, error: error?.userFacing ? error.message : failureMessage });
      return false;
    }
  }

  const confirmDeleteTask = () =>
    runConfirmed(() => deleteTask(id, deleteTask_.id), "The task could not be deleted. Check your connection and try again.", () => setDeleteTask(null));

  const confirmRemoveMember = () =>
    runConfirmed(
      () => removeMember(project, removeTarget.uid),
      "The member could not be removed. Check your connection and try again.",
      () => {
        patchProject({ memberIds: project.memberIds.filter((m) => m !== removeTarget.uid) });
        setRemoveTarget(null);
      }
    );

  const confirmDeleteProject = async () => {
    leaving.current = true; // ignore listener errors that appear once the project is gone
    const ok = await runConfirmed(
      () => deleteProject(id),
      "The project could not be deleted. Check your connection and try again.",
      () => router.push("/projects")
    );
    if (!ok) leaving.current = false;
  };

  // ---- non-ready states -------------------------------------------------
  if (projectState.status !== "ready") {
    const states = {
      loading: null,
      notfound: { title: "Project not found", description: "This project doesn't exist or was deleted." },
      denied: { title: "Access denied", description: "You are not a member of this project, so you can't view it.", icon: ShieldAlert },
      error: { title: "Something went wrong", description: "We couldn't load this project. Check your connection and try again.", retry: true },
    };
    const state = states[projectState.status];
    return (
      <AppShell>
        <BackLink />
        {state ? (
          <EmptyState icon={state.icon ?? CircleAlert} title={state.title} description={state.description} className="mt-6">
            {state.retry ? (
              <button type="button" className={`${btnSecondary} mt-4`} onClick={() => setReloadKey((k) => k + 1)}>Retry</button>
            ) : (
              <Link href="/dashboard" className={`${btnSecondary} mt-4`}>Go to dashboard</Link>
            )}
          </EmptyState>
        ) : (
          <div role="status" aria-label="Loading project" className="mt-6 space-y-4">
            <div className="h-9 w-64 animate-pulse rounded bg-slate-200" />
            <div className={`${card} h-24 animate-pulse`} />
            <div className={`${card} h-24 animate-pulse`} />
          </div>
        )}
      </AppShell>
    );
  }

  // ---- ready ------------------------------------------------------------
  const editing = taskDialog?.mode === "edit" ? taskDialog.task : null;
  const editingPerms = editing ? getTaskPermissions(editing, uid, isOwner) : null;

  return (
    <AppShell>
      <BackLink />

     <header className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 pb-4">
  
  <div className="min-w-0 flex-1">
    <h1 className="wrap-break-word text-2xl sm:text-3xl font-bold leading-9 tracking-tight text-slate-900">
      {project.name}
    </h1>
    {project.description && (
      <p className="mt-1.5 max-w-3xl wrap-break-word text-sm sm:text-base text-gray-600">
        {project.description}
      </p>
    )}
  </div>

  {/* قسم الأزرار والشارات */}
  <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
    <span className={isOwner ? "rounded-full bg-[#2943ca] px-3 py-1 text-xs font-semibold text-white" : "rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"}>
      {isOwner ? "Owner" : "Member"}
    </span>
    {isOwner && (
      <>
        <button type="button" className={`${btnSecondary} text-sm px-3 py-1.5`} onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" aria-hidden="true" /> Edit
        </button>
        <button type="button" className={`${btnDanger} text-sm px-3 py-1.5`} onClick={() => { setConfirm({ busy: false, error: null }); setDeleteProjectOpen(true); }}>
          <Trash2 className="size-4" aria-hidden="true" /> Delete
        </button>
      </>
    )}
  </div>
</header>


      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Tasks */}
        <section aria-labelledby="tasks-heading" className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="tasks-heading" className="text-lg font-semibold leading-7 tracking-tight text-slate-900">
              Tasks <span className="text-sm font-normal text-gray-600">({visible.length} of {tasksState.tasks.length})</span>
            </h2>
            <button type="button" className={btnPrimary} onClick={() => setTaskDialog({ mode: "create" })}>
              <Plus className="size-4" aria-hidden="true" /> New task
            </button>
          </div>

          <TaskFilterPanel filters={filters} onChange={setFilters} members={members} />

          <div aria-live="polite">
            {tasksState.error ? (
              <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900">
                <span>{tasksState.error}</span>
                <button type="button" className={btnSecondary} onClick={() => setReloadKey((k) => k + 1)}>Retry</button>
              </div>
            ) : tasksState.loading ? (
              <div role="status" aria-label="Loading tasks" className="space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className={`${card} h-28 animate-pulse`} />)}
              </div>
            ) : tasksState.tasks.length === 0 ? (
              <EmptyState icon={ListChecks} title="No tasks yet" description="Create the first task for this project.">
                <button type="button" className={`${btnPrimary} mt-4`} onClick={() => setTaskDialog({ mode: "create" })}>
                  <Plus className="size-4" aria-hidden="true" /> New task
                </button>
              </EmptyState>
            ) : visible.length === 0 ? (
              <EmptyState icon={ListChecks} title="No tasks match your filters" description="Try a different search or clear the filters.">
                <button type="button" className={`${btnSecondary} mt-4`} onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>
              </EmptyState>
            ) : (
              <ul className="space-y-3">
                {visible.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    assigneeName={task.assigneeId ? membersById[task.assigneeId]?.displayName ?? "Former member" : null}
                    perms={getTaskPermissions(task, uid, isOwner)}
                    onEdit={(t) => setTaskDialog({ mode: "edit", task: t })}
                    onDelete={(t) => { setConfirm({ busy: false, error: null }); setDeleteTask(t); }}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Members */}
        <MembersPanel
          project={project}
          members={members}
          isOwner={isOwner}
          onRemove={(member) => { setConfirm({ busy: false, error: null }); setRemoveTarget(member); }}
          onAdded={(added) => {
            patchProject({ memberIds: [...project.memberIds, added.uid] });
            setMembers((prev) => [...prev, added]);
          }}
        />
      </div>

      {/* Dialogs */}
      <TaskFormDialog
        open={!!taskDialog}
        mode={taskDialog?.mode ?? "create"}
        task={editing}
        members={members}
        canChangeStatus={editingPerms ? editingPerms.canChangeStatus : true}
        onClose={() => setTaskDialog(null)}
        onSubmit={(payload) => (editing ? updateTask(id, editing.id, payload) : createTask(id, payload, uid))}
      />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} labelledBy="edit-project-title">
        <EditProjectForm
          project={project}
          onClose={() => setEditOpen(false)}
          onSave={async (values) => {
            await updateProject(id, values);
            patchProject({ name: values.name.trim(), description: values.description.trim() });
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTask_}
        title="Delete this task?"
        description={deleteTask_ ? `"${deleteTask_.title}" will be permanently deleted. This can't be undone.` : ""}
        busy={confirm.busy}
        error={confirm.error}
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteTask(null)}
      />

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove this member?"
        description={removeTarget ? `${removeTarget.displayName} will lose access to this project, and their assigned tasks will become unassigned.` : ""}
        confirmLabel="Remove"
        busyLabel="Removing..."
        busy={confirm.busy}
        error={confirm.error}
        onConfirm={confirmRemoveMember}
        onCancel={() => setRemoveTarget(null)}
      />

      <ConfirmDialog
        open={deleteProjectOpen}
        title="Delete this project?"
        description={`"${project.name}" and all of its tasks will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete project"
        busy={confirm.busy}
        error={confirm.error}
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteProjectOpen(false)}
      />
    </AppShell>
  );
}
