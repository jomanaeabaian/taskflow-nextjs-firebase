import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { guardedWrite } from "@/app/lib/guarded-write";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/app/lib/task-utils";

// Tasks live in projects/{projectId}/tasks/{taskId}. Authorization is enforced by Firestore rules;
// the checks here only give friendly messages and keep bad data out.

const EDITABLE_FIELDS = ["title", "description", "status", "priority", "assigneeId", "dueDate"];
const tasksCol = (projectId) => collection(db, "projects", projectId, "tasks");
const taskRef = (projectId, taskId) => doc(db, "projects", projectId, "tasks", taskId);

function toTimestamp(value) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid due date.");
  return Timestamp.fromDate(date);
}

/** Returns { field: message } or null. `partial` validates only the fields that are present. */
export function validateTaskInput(data, { partial = false } = {}) {
  const has = (k) => Object.prototype.hasOwnProperty.call(data, k);
  const errors = {};
  if (!partial || has("title")) {
    const len = (data.title ?? "").trim().length;
    if (len < 3 || len > 120) errors.title = "Title is required (3-120 characters).";
  }
  if (has("description") && (data.description ?? "").length > 1000) errors.description = "Description must be at most 1000 characters.";
  if (has("status") && !TASK_STATUSES.includes(data.status)) errors.status = "Invalid status.";
  if (has("priority") && !TASK_PRIORITIES.includes(data.priority)) errors.priority = "Invalid priority.";
  return Object.keys(errors).length ? errors : null;
}

/** FR-08 / FR-11: new tasks always start as "todo". Returns the new task id. */
export async function createTask(projectId, data, creatorUid) {
  if (!projectId || !creatorUid) throw new Error("Missing project or user.");
  const errors = validateTaskInput(data);
  if (errors) throw new Error(Object.values(errors)[0]);

  const ref = await guardedWrite(() => addDoc(tasksCol(projectId), {
    title: data.title.trim(),
    description: (data.description ?? "").trim(),
    status: "todo",
    priority: data.priority ?? "medium",
    assigneeId: data.assigneeId || null,
    dueDate: toTimestamp(data.dueDate),
    createdBy: creatorUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return ref.id;
}

/** FR-09: only whitelisted fields can change; createdBy / createdAt are immutable from the client. */
export async function updateTask(projectId, taskId, changes) {
  const clean = {};
  for (const key of EDITABLE_FIELDS) if (Object.prototype.hasOwnProperty.call(changes, key)) clean[key] = changes[key];
  if (Object.keys(clean).length === 0) throw new Error("No editable fields provided.");

  const errors = validateTaskInput(clean, { partial: true });
  if (errors) throw new Error(Object.values(errors)[0]);
  if (typeof clean.title === "string") clean.title = clean.title.trim();
  if (typeof clean.description === "string") clean.description = clean.description.trim();
  if ("assigneeId" in clean) clean.assigneeId = clean.assigneeId || null;
  if ("dueDate" in clean) clean.dueDate = toTimestamp(clean.dueDate);

  await guardedWrite(() => updateDoc(taskRef(projectId, taskId), { ...clean, updatedAt: serverTimestamp() }));
}

/** FR-10 */
export async function deleteTask(projectId, taskId) {
  await guardedWrite(() => deleteDoc(taskRef(projectId, taskId)));
}

/** Live task list. Returns the unsubscribe function (call it in the effect cleanup). */
export function subscribeToProjectTasks(projectId, onData, onError) {
  return onSnapshot(
    tasksCol(projectId),
    (snap) => onData(snap.docs.map((d) => ({ ...d.data(), id: d.id, projectId }))),
    (error) => onError?.(error)
  );
}
