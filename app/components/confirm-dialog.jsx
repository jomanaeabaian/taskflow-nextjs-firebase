"use client";

import { CircleAlert } from "lucide-react";
import { Modal } from "@/app/components/modal";
import { btnDangerSolid, btnSecondary } from "@/app/lib/ui-classes";

/** Confirmation for destructive actions (SRS section 8). */
export function ConfirmDialog({ open, title, description, confirmLabel = "Delete", busyLabel = "Deleting...", busy = false, error = null, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={busy ? () => {} : onCancel} labelledBy="confirm-title" size="max-w-md">
      <div className="p-6">
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        {error && (
          <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            {error}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={btnDangerSolid} onClick={onConfirm} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
