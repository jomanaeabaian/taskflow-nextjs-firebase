"use client";

import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { Modal } from "@/app/components/modal";
import { PRIORITY_LABELS, STATUS_LABELS, TASK_PRIORITIES, TASK_STATUSES, fromDateInputValue, toDateInputValue } from "@/app/lib/task-utils";
import { btnPrimary, btnSecondary, fieldErrorText, fieldInput, fieldInvalid, fieldLabel, fieldTextarea } from "@/app/lib/ui-classes";

function validate(values) {
  const errors = {};
  const titleLength = values.title.trim().length;
  if (titleLength < 3 || titleLength > 120) errors.title = "Title is required (3-120 characters).";
  if (values.description.length > 1000) errors.description = "Description must be at most 1000 characters.";
  return errors;
}

function TaskForm({ mode, task, members, canChangeStatus, onSubmit, onClose }) {
  const [values, setValues] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    dueDate: toDateInputValue(task?.dueDate),
    assigneeId: task?.assigneeId ?? "",
    status: task?.status ?? "todo",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));
  // A task whose assignee is no longer a member must still render its current value in the select.
  const assigneeMissing = values.assigneeId && !members.some((m) => m.uid === values.assigneeId);

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      dueDate: fromDateInputValue(values.dueDate),
      assigneeId: values.assigneeId || null,
    };
    if (mode === "edit" && canChangeStatus) payload.status = values.status;

    setSaving(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error(error);
      setSubmitError("Failed to save the task. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6">
      <h2 id="task-form-title" className="text-lg font-semibold text-slate-900">
        {mode === "edit" ? "Edit task" : "New task"}
      </h2>

      {submitError && (
        <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
          {submitError}
        </div>
      )}

      <div className="mt-4 space-y-4">
        <div className="space-y-1">
          <label htmlFor="task-title" className={fieldLabel}>
            Title <span className="ml-1 text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            required
            disabled={saving}
            value={values.title}
            onChange={set("title")}
            aria-invalid={errors.title ? "true" : undefined}
            aria-describedby={errors.title ? "task-title-error" : undefined}
            className={`${fieldInput} ${errors.title ? fieldInvalid : ""}`}
          />
          {errors.title && <p id="task-title-error" className={fieldErrorText}>{errors.title}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="task-description" className={fieldLabel}>Description</label>
          <textarea
            id="task-description"
            disabled={saving}
            value={values.description}
            onChange={set("description")}
            aria-invalid={errors.description ? "true" : undefined}
            aria-describedby="task-description-hint"
            className={`${fieldTextarea} ${errors.description ? fieldInvalid : ""}`}
          />
          <p id="task-description-hint" className={errors.description ? fieldErrorText : "text-xs text-gray-600"}>
            {errors.description ?? `${values.description.length}/1000 characters`}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="task-priority" className={fieldLabel}>Priority</label>
            <select id="task-priority" disabled={saving} value={values.priority} onChange={set("priority")} className={fieldInput}>
              {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="task-due" className={fieldLabel}>Due date</label>
            <input id="task-due" type="date" disabled={saving} value={values.dueDate} onChange={set("dueDate")} className={fieldInput} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="task-assignee" className={fieldLabel}>Assignee</label>
            <select id="task-assignee" disabled={saving} value={values.assigneeId} onChange={set("assigneeId")} className={fieldInput}>
              <option value="">Unassigned</option>
              {assigneeMissing && <option value={values.assigneeId}>Former member</option>}
              {members.map((m) => <option key={m.uid} value={m.uid}>{m.displayName}</option>)}
            </select>
          </div>
          {mode === "edit" && (
            <div className="space-y-1">
              <label htmlFor="task-status" className={fieldLabel}>Status</label>
              <select id="task-status" disabled={saving || !canChangeStatus} value={values.status} onChange={set("status")} className={fieldInput}>
                {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              {!canChangeStatus && <p className="text-xs text-gray-600">Only the owner or the assignee can change the status.</p>}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className={btnSecondary} onClick={onClose} disabled={saving}>Cancel</button>
        <button type="submit" className={btnPrimary} disabled={saving}>
          {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}

/**
 * Create / edit task dialog.
 * onSubmit(payload) must return a promise; rejecting shows an error and keeps the dialog open (FR-15).
 */
export function TaskFormDialog({ open, mode = "create", task = null, members, canChangeStatus = true, onSubmit, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="task-form-title">
      <TaskForm mode={mode} task={task} members={members} canChangeStatus={canChangeStatus} onSubmit={onSubmit} onClose={onClose} />
    </Modal>
  );
}
