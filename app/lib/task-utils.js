export const TASK_STATUSES = ["todo", "in_progress", "done"];
export const TASK_PRIORITIES = ["low", "medium", "high"];
export const STATUS_LABELS = { todo: "To Do", in_progress: "In Progress", done: "Done" };
export const PRIORITY_LABELS = { low: "Low", medium: "Medium", high: "High" };


export function toDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  return date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
}

export function toDateInputValue(value) {
  const date = toDate(value);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateInputValue(text) {
  if (!text) return null;
  const [y, m, d] = text.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isOverdue(task, now = new Date()) {
  const due = toDate(task.dueDate);
  if (!due || task.status === "done") return false;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return due < startOfToday;
}

export function byDueDate(a, b) {
  const da = toDate(a.dueDate)?.getTime() ?? Infinity;
  const db = toDate(b.dueDate)?.getTime() ?? Infinity;
  return da - db;
}

export function byNewest(a, b) {
  const ta = toDate(a.createdAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const tb = toDate(b.createdAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return tb - ta;
}

export function computeStats(tasks, now = new Date()) {
  return {
    open: tasks.filter((t) => t.status !== "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => isOverdue(t, now)).length,
  };
}

export function filterTasks(tasks, { search = "", status = "", priority = "", assignee = "", overdueOnly = false } = {}, now = new Date()) {
  const term = search.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      (!status || t.status === status) &&
      (!priority || t.priority === priority) &&
      (!assignee || (assignee === "unassigned" ? !t.assigneeId : t.assigneeId === assignee)) &&
      (!overdueOnly || isOverdue(t, now)) &&
      (!term || (t.title ?? "").toLowerCase().includes(term))
  );
}

export function getTaskPermissions(task, uid, isOwner) {
  const isCreator = !!uid && task.createdBy === uid;
  const isAssignee = !!uid && task.assigneeId === uid;
  return {
    canEdit: isOwner || isCreator || isAssignee,
    canDelete: isOwner || isCreator,
    canChangeStatus: isOwner || isAssignee,
  };
}

export function getFirstName(displayName) {
  return (displayName ?? "").trim().split(/\s+/)[0] ?? "";
}

export function getInitials(displayName) {
  const parts = (displayName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
