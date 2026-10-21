"use client";

import { useEffect, useRef } from "react";

/**
 * Accessible modal built on the native <dialog> element:
 * focus is trapped, Esc closes it, and the page behind is inert while it is open.
 * Children are only mounted while open, so forms reset every time.
 */
export function Modal({ open, onClose, labelledBy, children, size = "max-w-lg" }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={() => open && onClose()}
      onClick={(event) => {
        if (event.target === ref.current) onClose(); // click on the backdrop
      }}
      className={`m-auto max-h-[90vh] w-[calc(100%-2rem)] ${size} overflow-y-auto rounded-xl border border-[#dbdee5] bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50`}
    >
      {open && children}
    </dialog>
  );
}
